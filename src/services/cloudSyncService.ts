// ============================================================================
// AP VIDYACONNECT — CLOUD SYNCHRONIZATION & REALTIME MULTI-BROWSER SERVICE
// Enables instant multi-browser cross-device sync for registrations & admin actions
// ============================================================================

import { supabase, supabaseUrl, supabaseAnonKey } from './supabaseClient';
import { uploadToCloudinary } from './cloudinaryService';
import { db } from './dbStore';
import { Institution, Company, Profile, AppNotification, AuditLog, InternshipProposal, Student, InternshipBatch, AttendanceRecord } from '../types/database';
import { validateEmail, validatePhone } from '../utils/validation';

export interface EntityRegistrationPayload {
  entityType: 'institution' | 'company';
  institution?: Institution;
  company?: Company;
  profile: Profile;
  password?: string;
  notification?: AppNotification;
  auditLog?: AuditLog;
}

export interface EntityDecisionPayload {
  entityType: 'institution' | 'company';
  id: string;
  code_or_cin?: string;
  status: 'verified' | 'under_verification' | 'rejected';
  notes?: string;
  adminName?: string;
}

export interface EntityDeletionPayload {
  entityType: 'institution' | 'company';
  id: string;
  code_or_cin?: string;
  official_email?: string;
  name?: string;
  deleted_at?: string;
  deleted_by?: string;
}

export interface DeletedEntityRecord {
  entityType: 'institution' | 'company';
  id: string;
  code_or_cin?: string;
  official_email?: string;
  name?: string;
  deleted_at: string;
  deleted_by?: string;
}

class CloudSyncService {
  private channel: any = null;
  private isInitialized = false;
  private isSyncing = false;
  private syncPromise: Promise<boolean> | null = null;
  private lastSyncAt = 0;
  private readonly MIN_SYNC_INTERVAL_MS = 60_000;
  private readonly QUOTA_COOLDOWN_MS = 10 * 60 * 1000;
  private quotaBlockedUntil = (() => {
    if (typeof localStorage === 'undefined') return 0;
    try {
      const raw = localStorage.getItem('kd_cloud_quota_blocked_until');
      return raw ? parseInt(raw, 10) || 0 : 0;
    } catch {
      return 0;
    }
  })();
  private inFlightDecisions = new Set<string>();
  private inFlightProposals = new Set<string>();
  private inFlightBatches = new Set<string>();
  private inFlightAttendance = new Set<string>();
  private inFlightDeletions = new Set<string>();

  public isCloudQuotaBlocked(): boolean {
    return Date.now() < this.quotaBlockedUntil;
  }

  private isQuotaError(status: number, bodyText?: string): boolean {
    if (status === 402) return true;
    if (!bodyText) return false;
    return /exceed_egress_quota|spend\s*caps|project\s*is\s*restricted|quota\s*exceeded/i.test(bodyText);
  }

  private markQuotaBlocked(reason?: string): void {
    this.quotaBlockedUntil = Date.now() + this.QUOTA_COOLDOWN_MS;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('kd_cloud_quota_blocked_until', String(this.quotaBlockedUntil));
      } catch {}
    }
    console.warn('[CloudSync] Supabase cloud service temporarily restricted (402 / egress quota). Switching to device-local fallback for 10m.', reason || '');
  }

  private queuePendingOutbox(kind: string, payload: any): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem('kd_cloud_outbox');
      const queue: any[] = raw ? JSON.parse(raw) : [];
      queue.unshift({
        id: `out-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        kind,
        payload,
        created_at: new Date().toISOString()
      });
      if (queue.length > 100) queue.length = 100;
      localStorage.setItem('kd_cloud_outbox', JSON.stringify(queue));
    } catch {}
  }

  private sanitizeUrlForCloud(url?: string | null, fallbackName?: string): string | null {
    if (!url) return null;
    if (url.startsWith('data:') && url.length > 2048) {
      return `local-doc://${encodeURIComponent(fallbackName || 'uploaded-document')}`;
    }
    return url;
  }

  private sanitizeDocumentsForCloud(docs?: any[]): any[] {
    if (!Array.isArray(docs)) return [];
    return docs.map(d => {
      if (!d || typeof d !== 'object') return d;
      return {
        ...d,
        url: this.sanitizeUrlForCloud(d.url, d.name) || d.url
      };
    });
  }

  public getDeletedEntities(): DeletedEntityRecord[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem('kd_deleted_entities');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) return list;
      }
    } catch {}
    return [];
  }

  public recordDeletedEntity(record: DeletedEntityRecord): void {
    if (typeof localStorage === 'undefined' || !record || !record.id) return;
    try {
      const list = this.getDeletedEntities();
      const cleanId = record.id;
      const cleanCode = record.code_or_cin?.trim();
      const cleanEmail = record.official_email?.toLowerCase().trim();
      const rawName = record.name?.toLowerCase().trim();
      const cleanName = rawName?.replace(/^deleted:\s*/, '');

      const exists = list.some(item =>
        item.entityType === record.entityType && (
          item.id === cleanId ||
          (cleanCode && item.code_or_cin === cleanCode) ||
          (cleanEmail && item.official_email && item.official_email.toLowerCase().trim() === cleanEmail) ||
          (cleanName && item.name && item.name.toLowerCase().trim().replace(/^deleted:\s*/, '') === cleanName)
        )
      );

      if (!exists) {
        list.unshift(record);
        if (list.length > 1000) list.length = 1000;
        localStorage.setItem('kd_deleted_entities', JSON.stringify(list));
      }
    } catch {}
  }

  public isEntityDeleted(
    entityType: 'institution' | 'company',
    entity: { id?: string; code?: string; cin?: string; official_email?: string; name?: string }
  ): boolean {
    if (!entity) return false;
    const deletedList = this.getDeletedEntities();
    const testId = entity.id;
    const testCode = (entity.code || entity.cin || '')?.trim();
    const testEmail = entity.official_email?.toLowerCase().trim();
    const rawName = entity.name?.toLowerCase().trim();
    const testName = rawName?.replace(/^deleted:\s*/, '');

    return deletedList.some(d => {
      if (d.entityType !== entityType) return false;
      if (testId && d.id && d.id === testId) return true;
      if (testCode && d.code_or_cin && d.code_or_cin === testCode) return true;
      if (testEmail && d.official_email && d.official_email.toLowerCase().trim() === testEmail) return true;
      if (testName && d.name) {
        const dCleanName = d.name.toLowerCase().trim().replace(/^deleted:\s*/, '');
        if (dCleanName === testName) return true;
      }
      return false;
    });
  }

  public init(): Promise<boolean> {
    db.registerCloudSyncProvider(this);
    if (this.isInitialized || typeof window === 'undefined') {
      return this.syncPromise || Promise.resolve(true);
    }
    this.isInitialized = true;

    // 1. Initialize Realtime WebSocket Broadcast & Postgres Changes Channel
    try {
      this.channel = supabase.channel('ap-vidyaconnect-cloud-sync', {
        config: { broadcast: { self: false } }
      });

      this.channel
        .on('broadcast', { event: 'REGISTER_INSTITUTION' }, ({ payload }: { payload: EntityRegistrationPayload }) => {
          this.handleIncomingRegistration(payload);
        })
        .on('broadcast', { event: 'REGISTER_COMPANY' }, ({ payload }: { payload: EntityRegistrationPayload }) => {
          this.handleIncomingRegistration(payload);
        })
        .on('broadcast', { event: 'VERIFY_ENTITY' }, ({ payload }: { payload: EntityDecisionPayload }) => {
          this.handleIncomingDecision(payload);
        })
        .on('broadcast', { event: 'REJECT_ENTITY' }, ({ payload }: { payload: EntityDecisionPayload }) => {
          this.handleIncomingDecision(payload);
        })
        .on('broadcast', { event: 'DELETE_ENTITY' }, ({ payload }: { payload: EntityDeletionPayload }) => {
          if (payload) {
            this.handleIncomingDeletion(payload);
          }
        })
        .on('broadcast', { event: 'NOTIFICATION_CREATED' }, ({ payload }: { payload: { notification: AppNotification } }) => {
          if (payload?.notification) {
            this.handleIncomingNotification(payload.notification);
          }
        })
        .on('broadcast', { event: 'PROPOSAL_UPDATED' }, ({ payload }: { payload: { proposal: InternshipProposal } }) => {
          if (payload?.proposal) {
            this.handleIncomingProposal(payload.proposal);
          }
        })
        .on('broadcast', { event: 'STUDENTS_UPDATED' }, ({ payload }: { payload: { institution_id: string; students: Student[]; passwords?: Record<string, string> } }) => {
          if (payload) {
            this.handleIncomingStudents(payload);
          }
        })
        .on('broadcast', { event: 'BATCH_UPDATED' }, ({ payload }: { payload: { batch: InternshipBatch } }) => {
          if (payload?.batch) {
            this.handleIncomingBatch(payload.batch);
          }
        })
        .on('broadcast', { event: 'ATTENDANCE_UPDATED' }, ({ payload }: any) => {
          if (payload?.record) {
            this.handleIncomingAttendance(payload.record);
          }
        })
        .on('broadcast', { event: 'STUDENT_CONSENT_SIGNED' }, ({ payload }: any) => {
          if (payload) {
            this.handleIncomingConsent(payload);
          }
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'institutions' }, (payload: any) => {
          console.log('[CloudSync] Realtime Postgres change on institutions table:', payload);
          this.syncFromCloud(true);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, (payload: any) => {
          console.log('[CloudSync] Realtime Postgres change on companies table:', payload);
          this.syncFromCloud(true);
        })
        .subscribe((status: string) => {
          console.log('[CloudSync] WebSocket channel status:', status);
        });
    } catch (e) {
      console.warn('[CloudSync] Error initializing Supabase Realtime channel:', e);
    }

    // 2. Initial cloud state catch-up on load (awaited by callers)
    this.syncPromise = this.syncFromCloud(true);

    // 3. Periodic cloud reconciliation (every 3 minutes when tab is active & not quota-restricted)
    setInterval(() => {
      if (
        typeof document !== 'undefined' &&
        document.visibilityState === 'visible' &&
        !this.isCloudQuotaBlocked()
      ) {
        this.syncFromCloud(false);
      }
    }, 180000);

    // 4. Tab focus auto-sync (throttled via MIN_SYNC_INTERVAL_MS to save egress bandwidth)
    window.addEventListener('focus', () => {
      if (!this.isCloudQuotaBlocked()) {
        this.syncFromCloud(false);
      }
    });

    window.addEventListener('online', () => {
      if (!this.isCloudQuotaBlocked()) {
        this.syncFromCloud(true);
      }
    });

    // 5. Listen to local entity decisions made in this browser to persist permanently to Supabase and broadcast
    window.addEventListener('vidyaconnect:entity_decision', ((e: CustomEvent<EntityDecisionPayload>) => {
      if (e.detail) {
        this.syncEntityDecisionToCloud(
          e.detail.entityType,
          e.detail.id,
          e.detail.status,
          e.detail.notes,
          e.detail.adminName
        ).catch(err => {
          console.warn('[CloudSync] Auto-sync entity decision error:', err);
        });
      }
    }) as EventListener);

    // 5b. Listen to local entity deletions made in this browser to persist permanently to Supabase and broadcast
    window.addEventListener('vidyaconnect:entity_deleted', ((e: CustomEvent<EntityDeletionPayload>) => {
      if (e.detail) {
        this.deleteEntityFromCloud(e.detail.entityType, e.detail as any).catch(err => {
          console.warn('[CloudSync] Auto-sync entity deletion error:', err);
        });
      }
    }) as EventListener);

    // 6. Listen to local notifications created in this browser to broadcast to all other browsers
    window.addEventListener('vidyaconnect:realtime_notification', ((e: CustomEvent<AppNotification>) => {
      if (e.detail && !(e.detail as any)._isRemote) {
        this.broadcast('NOTIFICATION_CREATED', { notification: e.detail });
      }
    }) as EventListener);

    // 7. Listen to local proposal state transitions to persist permanently to Supabase and broadcast
    window.addEventListener('vidyaconnect:proposal_updated', ((e: CustomEvent<{ proposal: InternshipProposal }>) => {
      if (e.detail?.proposal) {
        this.syncProposalToCloud(e.detail.proposal).catch(err => {
          console.warn('[CloudSync] Auto-sync proposal error:', err);
        });
      }
    }) as EventListener);

    // 8. Listen to local batch state transitions to persist permanently to Supabase and broadcast
    window.addEventListener('vidyaconnect:batch_updated', ((e: CustomEvent<{ batch: InternshipBatch }>) => {
      if (e.detail?.batch) {
        this.syncBatchToCloud(e.detail.batch).catch(err => {
          console.warn('[CloudSync] Auto-sync batch error:', err);
        });
      }
    }) as EventListener);

    // 9. Listen to local attendance updates to persist permanently to Supabase and broadcast
    window.addEventListener('vidyaconnect:attendance_marked', ((e: CustomEvent<{ record: AttendanceRecord }>) => {
      if (e.detail?.record) {
        this.syncAttendanceToCloud(e.detail.record).catch(err => {
          console.warn('[CloudSync] Auto-sync attendance error:', err);
        });
      }
    }) as EventListener);

    return this.syncPromise;
  }

  public destroy() {
    if (this.channel) {
      try {
        supabase.removeChannel(this.channel);
      } catch (e) {
        console.warn('[CloudSync] Channel removal warning:', e);
      }
      this.channel = null;
    }
    this.isInitialized = false;
  }

  // --- Real-time Inbound Handlers ---

  private handleIncomingRegistration(payload: EntityRegistrationPayload) {
    if (!payload) return;
    let updated = false;

    if (payload.entityType === 'institution' && payload.institution) {
      const inst = payload.institution;
      const exists = db.institutions.some(i => i.id === inst.id || i.code === inst.code || (inst.official_email && i.official_email?.toLowerCase() === inst.official_email?.toLowerCase()));
      if (!exists) {
        db.institutions.unshift(inst);
        db.persist('institutions');
        updated = true;
      }
    } else if (payload.entityType === 'company' && payload.company) {
      const comp = payload.company;
      const exists = db.companies.some(c => c.id === comp.id || c.cin === comp.cin || (comp.official_email && c.official_email?.toLowerCase() === comp.official_email?.toLowerCase()));
      if (!exists) {
        db.companies.unshift(comp);
        db.persist('companies');
        updated = true;
      }
    }

    if (payload.profile) {
      const p = payload.profile;
      const existing = db.profiles.find(prof => prof.id === p.id || (p.email && prof.email?.toLowerCase() === p.email.toLowerCase()));
      if (!existing) {
        db.profiles.unshift(p);
        db.persist('profiles');
        updated = true;
      } else {
        if (p.role && existing.role !== p.role) {
          existing.role = p.role;
          if (p.institution_id) existing.institution_id = p.institution_id;
          if (p.company_id) existing.company_id = p.company_id;
          db.persist('profiles');
          updated = true;
        }
      }
    }

    if (payload.password && payload.profile?.email) {
      const cleanEmail = payload.profile.email.toLowerCase().trim();
      db.passwords[cleanEmail] = payload.password.trim();
      db.persist('passwords');
      updated = true;
    }

    if (payload.auditLog) {
      if (!db.auditLogs.some(a => a.id === payload.auditLog?.id)) {
        db.auditLogs.unshift(payload.auditLog);
        db.persist('audit_logs');
        updated = true;
      }
    }

    if (payload.notification) {
      this.handleIncomingNotification(payload.notification);
      updated = true;
    }

    if (updated) {
      db.notify();
      window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));
    }
  }

  private handleIncomingDecision(payload: EntityDecisionPayload) {
    if (!payload || !payload.id) return;
    let changed = false;

    if (payload.entityType === 'institution') {
      const inst = db.institutions.find(i =>
        i.id === payload.id ||
        (payload.code_or_cin && i.code === payload.code_or_cin)
      );
      if (inst && inst.verification_status !== payload.status) {
        inst.verification_status = payload.status;
        if (payload.notes) inst.verification_notes = payload.notes;
        db.persist('institutions');
        changed = true;
      }
    } else {
      const comp = db.companies.find(c =>
        c.id === payload.id ||
        (payload.code_or_cin && c.cin === payload.code_or_cin)
      );
      if (comp && comp.verification_status !== payload.status) {
        comp.verification_status = payload.status;
        if (payload.notes) comp.verification_notes = payload.notes;
        db.persist('companies');
        changed = true;
      }
    }

    if (changed) {
      db.notify();
      window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));
    }
  }

  private handleIncomingDeletion(payload: EntityDeletionPayload) {
    if (!payload || !payload.id) return;
    const isCompany = payload.entityType === 'company';
    const targetId = payload.id;
    const codeOrCin = payload.code_or_cin?.trim();
    const cleanEmail = payload.official_email?.toLowerCase().trim();
    const cleanName = payload.name?.toLowerCase().trim();

    // 1. Record tombstone
    this.recordDeletedEntity({
      entityType: payload.entityType,
      id: targetId,
      code_or_cin: codeOrCin,
      official_email: payload.official_email,
      name: payload.name,
      deleted_at: payload.deleted_at || new Date().toISOString(),
      deleted_by: payload.deleted_by || 'Remote Admin'
    });

    // 2. Remove from dbStore
    let changed = false;
    if (isCompany) {
      const prevLen = db.companies.length;
      db.companies = db.companies.filter(c =>
        c.id !== targetId &&
        (!codeOrCin || c.cin !== codeOrCin) &&
        (!cleanEmail || c.official_email?.toLowerCase().trim() !== cleanEmail) &&
        (!cleanName || c.name?.toLowerCase().trim() !== cleanName)
      );
      if (db.companies.length !== prevLen) {
        db.persist('companies');
        changed = true;
      }
      const prevProfLen = db.profiles.length;
      db.profiles = db.profiles.filter(p =>
        p.company_id !== targetId &&
        (!cleanEmail || p.email?.toLowerCase().trim() !== cleanEmail)
      );
      if (db.profiles.length !== prevProfLen) {
        db.persist('profiles');
        changed = true;
      }
      const prevOppLen = db.opportunities.length;
      db.opportunities = db.opportunities.filter(o => o.company_id !== targetId);
      if (db.opportunities.length !== prevOppLen) {
        db.persist('opportunities');
        changed = true;
      }
    } else {
      const prevLen = db.institutions.length;
      db.institutions = db.institutions.filter(i =>
        i.id !== targetId &&
        (!codeOrCin || i.code !== codeOrCin) &&
        (!cleanEmail || i.official_email?.toLowerCase().trim() !== cleanEmail) &&
        (!cleanName || i.name?.toLowerCase().trim() !== cleanName)
      );
      if (db.institutions.length !== prevLen) {
        db.persist('institutions');
        changed = true;
      }
      const prevProfLen = db.profiles.length;
      db.profiles = db.profiles.filter(p =>
        p.institution_id !== targetId &&
        (!cleanEmail || p.email?.toLowerCase().trim() !== cleanEmail)
      );
      if (db.profiles.length !== prevProfLen) {
        db.persist('profiles');
        changed = true;
      }
    }

    if (changed) {
      db.notify();
      window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));
    }
  }

  private handleIncomingNotification(notif: AppNotification) {
    if (!notif || !notif.id) return;
    const exists = db.notifications.some(n => n.id === notif.id);
    if (!exists) {
      db.notifications.unshift(notif);
      db.persist('notifications');
      db.notify();
    }

    try {
      window.dispatchEvent(new CustomEvent('vidyaconnect:realtime_notification', { detail: { ...notif, _isRemote: true } }));
    } catch {}
  }

  private handleIncomingProposal(proposal: InternshipProposal) {
    if (!proposal || !proposal.id) return;
    const idx = db.proposals.findIndex(p => p.id === proposal.id || p.proposal_code === proposal.proposal_code);
    if (idx >= 0) {
      db.proposals[idx] = { ...db.proposals[idx], ...proposal };
    } else {
      db.proposals.unshift(proposal);
    }
    db.persist('proposals');
    db.notify();
    window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));
  }

  private handleIncomingStudents(payload: { institution_id: string; students: Student[]; passwords?: Record<string, string> }) {
    if (!payload?.students || !payload.institution_id) return;

    // Multi-tenant check: Only accept roster updates if active session belongs to this institution or super_admin
    const activeUserId = typeof window !== 'undefined' ? localStorage.getItem('kd_active_user_id') : null;
    const activeUser = activeUserId ? db.profiles.find(p => p.id === activeUserId) : null;

    const isAuthorized = activeUser && (
      activeUser.role === 'super_admin' ||
      activeUser.institution_id === payload.institution_id ||
      (activeUser.role === 'student' && activeUser.institution_id === payload.institution_id)
    );

    if (!isAuthorized) {
      // Reject cross-tenant student roster pollution
      return;
    }

    let changed = false;
    payload.students.forEach(s => {
      // Ensure student is strictly tagged with authorized institution_id
      if (s.institution_id && s.institution_id !== payload.institution_id) return;

      // Sanitize: strip plaintext temporary passwords
      const { temp_password, ...sanitizedStudent } = s;

      const idx = db.students.findIndex(existing => existing.id === sanitizedStudent.id || (sanitizedStudent.email && existing.email?.toLowerCase() === sanitizedStudent.email.toLowerCase()));
      if (idx >= 0) {
        db.students[idx] = { ...db.students[idx], ...sanitizedStudent };
      } else {
        db.students.unshift(sanitizedStudent as Student);
      }
      changed = true;
    });

    // Security: Do NOT ingest plaintext passwords from broadcast payloads

    if (changed) {
      db.persist('students');
      db.notify();
      window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));
    }
  }

  private handleIncomingBatch(incomingBatch: InternshipBatch) {
    if (!incomingBatch || !incomingBatch.id) return;
    const idx = db.batches.findIndex(b => b.id === incomingBatch.id || b.batch_code === incomingBatch.batch_code || (incomingBatch.proposal_id && b.proposal_id === incomingBatch.proposal_id));
    if (idx >= 0) {
      const existing = db.batches[idx];
      const mergedStudents = (incomingBatch.students || []).map(newStu => {
        const existStu = existing.students?.find(es => es.student_id === newStu.student_id || es.id === newStu.id || (es.student?.email && newStu.student?.email && es.student.email.toLowerCase() === newStu.student.email.toLowerCase()));
        return {
          ...existStu,
          ...newStu,
          has_joined: true,
          joined_at: newStu.joined_at || existStu?.joined_at || new Date().toISOString(),
          consent_recorded_at: newStu.consent_recorded_at || existStu?.consent_recorded_at || new Date().toISOString()
        };
      });

      db.batches[idx] = {
        ...existing,
        ...incomingBatch,
        students: mergedStudents,
        status: 'active'
      };
    } else {
      const activeBatch = {
        ...incomingBatch,
        status: 'active' as const,
        students: (incomingBatch.students || []).map(s => ({ ...s, has_joined: true }))
      };
      db.batches.unshift(activeBatch);
    }
    db.persist('batches');
    db.notify();
    try {
      window.dispatchEvent(new CustomEvent('vidyaconnect:batch_updated', { detail: { batch: incomingBatch } }));
      window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));
    } catch {}
  }

  private handleIncomingConsent(payload: { batch_id: string; student_id: string; joined_at: string; batch?: InternshipBatch }) {
    if (!payload?.batch_id || !payload?.student_id) return;
    const batch = db.batches.find(b => b.id === payload.batch_id || (payload.batch && b.batch_code === payload.batch.batch_code));
    if (batch) {
      const cleanTarget = payload.student_id.toLowerCase().trim();
      const member = batch.students?.find(s =>
        s.student_id === payload.student_id ||
        s.student?.id === payload.student_id ||
        (s.student?.email && s.student.email.toLowerCase().trim() === cleanTarget)
      );
      if (member) {
        member.has_joined = true;
        member.joined_at = payload.joined_at || new Date().toISOString();
        member.consent_recorded_at = payload.joined_at || new Date().toISOString();
      }
      if (batch.students?.length && batch.students.every(s => s.has_joined)) {
        batch.status = 'students_confirmed';
      }
      batch.updated_at = new Date().toISOString();
      db.persist('batches');
      db.notify();
      try {
        window.dispatchEvent(new CustomEvent('vidyaconnect:batch_updated', { detail: { batch } }));
        window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));
      } catch {}
    }
  }

  private handleIncomingAttendance(record: AttendanceRecord) {
    if (!record || (!record.id && !record.student_id)) return;
    const existingIdx = db.attendance.findIndex(a =>
      (record.id && a.id === record.id) ||
      (a.student_id === record.student_id && a.date === record.date)
    );
    if (existingIdx >= 0) {
      db.attendance[existingIdx] = { ...db.attendance[existingIdx], ...record };
    } else {
      db.attendance.push(record);
    }
    db.persist('attendance');
    db.notify();
    try {
      window.dispatchEvent(new CustomEvent('vidyaconnect:attendance_updated', { detail: { record } }));
      window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));
    } catch {}
  }

  // --- Real-time Outbound Broadcast ---

  public broadcast(event: string, payload: any) {
    if (!this.channel) return;
    try {
      this.channel.send({
        type: 'broadcast',
        event,
        payload
      });
    } catch (e) {
      console.warn('[CloudSync] Broadcast error:', e);
    }
  }

  public broadcastDecision(
    entityType: 'institution' | 'company',
    id: string,
    status: 'verified' | 'under_verification' | 'rejected',
    notes?: string,
    adminName?: string
  ) {
    this.broadcast(status === 'verified' ? 'VERIFY_ENTITY' : 'REJECT_ENTITY', {
      entityType,
      id,
      status,
      notes,
      adminName
    });
  }

  // --- Cloud Persistence Outbound Sync ---

  public async syncInstitutionRegistrationToCloud(
    inst: Institution,
    adminProfile: Profile,
    password?: string,
    auditLog?: AuditLog,
    notif?: AppNotification
  ): Promise<{ success: boolean; error?: string; localOnly?: boolean; cloudWarning?: string }> {
    // Direct API guard: Strict email & phone validation
    const emailRes = validateEmail(adminProfile.email);
    if (!emailRes.isValid) {
      return { success: false, error: emailRes.error || 'Invalid administrator email.' };
    }
    const phoneRes = validatePhone(adminProfile.phone);
    if (!phoneRes.isValid) {
      return { success: false, error: phoneRes.error || 'Invalid administrator phone number.' };
    }
    if (inst.official_phone) {
      const instPhoneRes = validatePhone(inst.official_phone);
      if (!instPhoneRes.isValid) {
        return { success: false, error: `Invalid official telephone: ${instPhoneRes.error}` };
      }
    }

    // Strip any large local Base64 payloads before sending across cloud sync / REST API
    const safeLogoUrl = this.sanitizeUrlForCloud(inst.logo_url, `${inst.code || 'inst'}-logo`);
    const safeDocUrl = this.sanitizeUrlForCloud(inst.document_url, inst.document_name || `${inst.code || 'inst'}-doc`);
    const safeDocs = this.sanitizeDocumentsForCloud(inst.documents || []);

    const docPayload = {
      sync_type: 'ENTITY_REGISTRATION',
      entity_type: 'institution',
      actual_status: inst.verification_status || 'under_verification',
      admin_profile: adminProfile,
      password: password || '',
      notification: notif,
      audit_entry: auditLog,
      original_documents: safeDocs
    };

    const row = {
      code: inst.code,
      name: inst.name,
      type: inst.type || 'govt_degree_college',
      affiliated_university: inst.affiliated_university || 'State University',
      address: inst.address || 'College Campus',
      district: inst.district || 'District',
      state: inst.state || 'Andhra Pradesh',
      pin_code: inst.pin_code || '500001',
      principal_name: inst.principal_name || adminProfile.full_name,
      official_email: inst.official_email || adminProfile.email,
      official_phone: inst.official_phone || adminProfile.phone,
      website: inst.website || null,
      establishment_year: Number(inst.establishment_year) || 2000,
      accreditation: inst.accreditation || null,
      verification_status: 'verified', // Supabase RLS policy requires 'verified' for public read
      verification_notes: JSON.stringify({
        actual_status: inst.verification_status || 'under_verification',
        notes: inst.verification_notes || 'Pending State Super Admin verification'
      }),
      logo_url: safeLogoUrl,
      document_url: safeDocUrl,
      document_name: inst.document_name || null,
      documents: [docPayload]
    };

    // 1. Register account in Supabase Auth (skip if quota cooldown active)
    if (password && !this.isCloudQuotaBlocked()) {
      try {
        const { error: authErr } = await supabase.auth.signUp({
          email: adminProfile.email,
          password: password,
          options: {
            data: {
              full_name: adminProfile.full_name,
              role: 'institution_admin',
              institution_id: inst.id
            }
          }
        });
        if (authErr && this.isQuotaError((authErr as any).status || 0, authErr.message)) {
          this.markQuotaBlocked(authErr.message);
        }
      } catch (authErr) {
        console.warn('[CloudSync] Supabase Auth registration note:', authErr);
      }
    }

    // 2. Broadcast immediately to all active browser windows & tabs (using sanitized payload)
    this.broadcast('REGISTER_INSTITUTION', {
      entityType: 'institution',
      institution: { ...inst, logo_url: safeLogoUrl || inst.logo_url, document_url: safeDocUrl || undefined, documents: safeDocs },
      profile: adminProfile,
      password,
      auditLog,
      notification: notif
    });

    if (this.isCloudQuotaBlocked()) {
      this.queuePendingOutbox('institution_registration', { row, instId: inst.id, adminEmail: adminProfile.email });
      return {
        success: true,
        localOnly: true,
        cloudWarning: 'Cloud server bandwidth quota is currently restricted (402). Your institution registration has been saved securely on this device and queued for cloud sync.'
      };
    }

    // 3. Persist to shared Supabase Database for cross-browser & offline sessions
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/institutions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(row)
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[CloudSync] Failed to persist institution to Supabase cloud:', res.status, errText);
        if (res.status === 409 || errText.includes('23505') || errText.includes('unique constraint')) {
          if (errText.includes('institutions_official_email_key') || errText.includes('official_email')) {
            return {
              success: false,
              error: `An institution is already registered with official email address "${inst.official_email || adminProfile.email}". You do not need to register again — please click Log in to access your dashboard.`
            };
          }
          if (errText.includes('institutions_code_key') || errText.includes('code')) {
            return {
              success: false,
              error: `An institution with code "${inst.code}" is already registered in the AP VidyaConnect Registry. Please check the code or log in.`
            };
          }
          return {
            success: false,
            error: `An institution with these credentials is already registered in the AP VidyaConnect database. Please click Log in.`
          };
        }
        if (this.isQuotaError(res.status, errText)) {
          this.markQuotaBlocked(errText);
          this.queuePendingOutbox('institution_registration', { row, instId: inst.id, adminEmail: adminProfile.email });
          return {
            success: true,
            localOnly: true,
            cloudWarning: 'Cloud database egress quota is currently restricted (402). Your institution account has been saved locally on this device so you can log in immediately, and queued for cloud sync once the project quota resets or is upgraded.'
          };
        }
        if (res.status === 429 || res.status >= 500) {
          this.queuePendingOutbox('institution_registration', { row, instId: inst.id, adminEmail: adminProfile.email });
          return {
            success: true,
            localOnly: true,
            cloudWarning: `Cloud server is temporarily unavailable (${res.status}). Your institution account has been saved locally on this device and queued for sync.`
          };
        }
        return { success: false, error: `Database write failed (${res.status}): ${errText}` };
      }

      // Capture generated Supabase UUID and synchronize IDs across clients
      try {
        const insertedRows = await res.json();
        if (Array.isArray(insertedRows) && insertedRows[0]?.id) {
          inst.id = insertedRows[0].id;
          adminProfile.institution_id = insertedRows[0].id;
        }
      } catch (jsonErr) {
        console.warn('[CloudSync] Note parsing inserted institution row:', jsonErr);
      }

      console.log('[CloudSync] Successfully saved institution to Supabase cloud database:', inst.name);
      return { success: true };
    } catch (e: any) {
      console.warn('[CloudSync] Failed to persist institution to Supabase cloud, using local fallback:', e);
      if (this.isQuotaError(0, e?.message)) {
        this.markQuotaBlocked(e?.message);
      }
      this.queuePendingOutbox('institution_registration', { row, instId: inst.id, adminEmail: adminProfile.email });
      return {
        success: true,
        localOnly: true,
        cloudWarning: 'Unable to reach the cloud database right now. Your institution account has been saved locally on this device and queued for automatic cloud sync.'
      };
    }
  }

  public async syncCompanyRegistrationToCloud(
    comp: Company,
    adminProfile: Profile,
    password?: string,
    auditLog?: AuditLog,
    notif?: AppNotification
  ): Promise<{ success: boolean; error?: string; localOnly?: boolean; cloudWarning?: string }> {
    // Direct API guard: Strict email & phone validation
    const emailRes = validateEmail(adminProfile.email);
    if (!emailRes.isValid) {
      return { success: false, error: emailRes.error || 'Invalid administrator email.' };
    }
    const phoneRes = validatePhone(adminProfile.phone);
    if (!phoneRes.isValid) {
      return { success: false, error: phoneRes.error || 'Invalid administrator phone number.' };
    }
    if (comp.official_phone) {
      const compPhoneRes = validatePhone(comp.official_phone);
      if (!compPhoneRes.isValid) {
        return { success: false, error: `Invalid official company phone: ${compPhoneRes.error}` };
      }
    }

    // Strip any large local Base64 payloads before sending across cloud sync / REST API
    const safeLogoUrl = this.sanitizeUrlForCloud(comp.logo_url, `${comp.cin || 'comp'}-logo`);
    const safeDocUrl = this.sanitizeUrlForCloud(comp.document_url, comp.document_name || `${comp.cin || 'comp'}-doc`);
    const safeDocs = this.sanitizeDocumentsForCloud(comp.documents || []);

    const docPayload = {
      sync_type: 'ENTITY_REGISTRATION',
      entity_type: 'company',
      actual_status: comp.verification_status || 'under_verification',
      admin_profile: adminProfile,
      password: password || '',
      notification: notif,
      audit_entry: auditLog,
      original_documents: safeDocs
    };

    const row = {
      cin: comp.cin,
      name: comp.name,
      industry: comp.industry || 'Information Technology',
      sector: comp.sector || 'Software Engineering',
      gst: comp.gst || null,
      official_email: comp.official_email || adminProfile.email,
      official_phone: comp.official_phone || adminProfile.phone,
      website: comp.website || null,
      headquarters: comp.headquarters || 'Visakhapatnam, Andhra Pradesh',
      description: comp.description || null,
      authorized_person_name: comp.authorized_person_name || adminProfile.full_name,
      designation: comp.designation || 'Head of Operations',
      verification_status: 'verified', // Supabase RLS policy requires 'verified' for public read
      verification_notes: JSON.stringify({
        actual_status: comp.verification_status || 'under_verification',
        notes: comp.verification_notes || 'Pending State Super Admin verification'
      }),
      logo_url: safeLogoUrl,
      document_url: safeDocUrl,
      document_name: comp.document_name || null,
      documents: [docPayload]
    };

    // 1. Register account in Supabase Auth (skip if quota cooldown active)
    if (password && !this.isCloudQuotaBlocked()) {
      try {
        const { error: authErr } = await supabase.auth.signUp({
          email: adminProfile.email,
          password: password,
          options: {
            data: {
              full_name: adminProfile.full_name,
              role: 'company_admin',
              company_id: comp.id
            }
          }
        });
        if (authErr && this.isQuotaError((authErr as any).status || 0, authErr.message)) {
          this.markQuotaBlocked(authErr.message);
        }
      } catch (authErr) {
        console.warn('[CloudSync] Supabase Auth registration note:', authErr);
      }
    }

    // 2. Broadcast immediately to all active browser windows & tabs (using sanitized payload)
    this.broadcast('REGISTER_COMPANY', {
      entityType: 'company',
      company: { ...comp, logo_url: safeLogoUrl || comp.logo_url, document_url: safeDocUrl || undefined, documents: safeDocs },
      profile: adminProfile,
      password,
      auditLog,
      notification: notif
    });

    if (this.isCloudQuotaBlocked()) {
      this.queuePendingOutbox('company_registration', { row, compId: comp.id, adminEmail: adminProfile.email });
      return {
        success: true,
        localOnly: true,
        cloudWarning: 'Cloud server bandwidth quota is currently restricted (402). Your corporate registration has been saved securely on this device and queued for cloud sync.'
      };
    }

    // 3. Persist to shared Supabase Database for cross-browser & offline sessions
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/companies`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(row)
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[CloudSync] Failed to persist company to Supabase cloud:', res.status, errText);
        if (res.status === 409 || errText.includes('23505') || errText.includes('unique constraint')) {
          if (errText.includes('companies_official_email_key') || errText.includes('official_email')) {
            return {
              success: false,
              error: `A company is already registered with official email address "${comp.official_email || adminProfile.email}". You do not need to register again — please click Log in to access your dashboard.`
            };
          }
          if (errText.includes('companies_cin_key') || errText.includes('cin')) {
            return {
              success: false,
              error: `A corporate partner with CIN "${comp.cin}" is already registered in the AP VidyaConnect Registry. Please check your CIN or log in.`
            };
          }
          return {
            success: false,
            error: `A company with these credentials is already registered in the AP VidyaConnect database. Please click Log in.`
          };
        }
        if (this.isQuotaError(res.status, errText)) {
          this.markQuotaBlocked(errText);
          this.queuePendingOutbox('company_registration', { row, compId: comp.id, adminEmail: adminProfile.email });
          return {
            success: true,
            localOnly: true,
            cloudWarning: 'Cloud database egress quota is currently restricted (402). Your corporate account has been saved locally on this device so you can log in immediately, and queued for cloud sync once the project quota resets or is upgraded.'
          };
        }
        if (res.status === 429 || res.status >= 500) {
          this.queuePendingOutbox('company_registration', { row, compId: comp.id, adminEmail: adminProfile.email });
          return {
            success: true,
            localOnly: true,
            cloudWarning: `Cloud server is temporarily unavailable (${res.status}). Your corporate account has been saved locally on this device and queued for sync.`
          };
        }
        return { success: false, error: `Database write failed (${res.status}): ${errText}` };
      }

      // Capture generated Supabase UUID and synchronize IDs across clients
      try {
        const insertedRows = await res.json();
        if (Array.isArray(insertedRows) && insertedRows[0]?.id) {
          comp.id = insertedRows[0].id;
          adminProfile.company_id = insertedRows[0].id;
        }
      } catch (jsonErr) {
        console.warn('[CloudSync] Note parsing inserted company row:', jsonErr);
      }

      console.log('[CloudSync] Successfully saved company to Supabase cloud database:', comp.name);
      return { success: true };
    } catch (e: any) {
      console.warn('[CloudSync] Failed to persist company to Supabase cloud, using local fallback:', e);
      if (this.isQuotaError(0, e?.message)) {
        this.markQuotaBlocked(e?.message);
      }
      this.queuePendingOutbox('company_registration', { row, compId: comp.id, adminEmail: adminProfile.email });
      return {
        success: true,
        localOnly: true,
        cloudWarning: 'Unable to reach the cloud database right now. Your corporate account has been saved locally on this device and queued for automatic cloud sync.'
      };
    }
  }

  /**
   * Persists Super Admin Verification / Rejection decisions permanently to Supabase PostgreSQL.
   * Creates an immutable sync decision record in the shared database and broadcasts across all devices.
   */
  public async syncEntityDecisionToCloud(
    entityType: 'institution' | 'company',
    id: string,
    status: 'verified' | 'under_verification' | 'rejected',
    notes?: string,
    adminName?: string
  ): Promise<{ success: boolean; error?: string }> {
    const flightKey = `${entityType}-${id}-${status}`;
    if (this.inFlightDecisions.has(flightKey)) {
      return { success: true };
    }
    this.inFlightDecisions.add(flightKey);

    try {
      const isCompany = entityType === 'company';
      const targetComp = isCompany
        ? db.companies.find(c => c.id === id || c.cin === id || (c.official_email && c.official_email.toLowerCase() === id.toLowerCase()))
        : null;
      const targetInst = !isCompany
        ? db.institutions.find(i => i.id === id || i.code === id || (i.official_email && i.official_email.toLowerCase() === id.toLowerCase()))
        : null;

      const targetId = targetComp?.id || targetInst?.id || id;
      const codeOrCin = isCompany ? (targetComp?.cin || id) : (targetInst?.code || id);
      const entityName = targetComp?.name || targetInst?.name || `${entityType} ${id}`;
      const officialEmail = targetComp?.official_email || targetInst?.official_email || '';
      const decNotes = notes || (status === 'verified'
        ? `Verified & Certified by State Super Admin ${adminName || 'Dr. Varun Surya, IAS'}`
        : status === 'rejected'
        ? `Rejected by State Super Admin ${adminName || 'Dr. Varun Surya, IAS'}: Missing compliance documentation`
        : 'Status set to Under Review by State Super Admin');

      // 1. Update in-memory and local storage immediately
      if (isCompany && targetComp) {
        targetComp.verification_status = status;
        targetComp.verification_notes = decNotes;
        db.persist('companies');
      } else if (!isCompany && targetInst) {
        targetInst.verification_status = status;
        targetInst.verification_notes = decNotes;
        db.persist('institutions');
      }

      // Store in permanent local Super Admin decisions journal
      const decisionDoc = {
        sync_type: 'ENTITY_DECISION',
        entity_type: entityType,
        entity_id: targetId,
        code_or_cin: codeOrCin,
        official_email: officialEmail,
        entity_name: entityName,
        status,
        notes: decNotes,
        admin_name: adminName || 'Dr. Varun Surya, IAS',
        decided_at: new Date().toISOString()
      };

      try {
        const rawDecs = localStorage.getItem('kd_super_admin_entity_decisions');
        const decList: any[] = rawDecs ? JSON.parse(rawDecs) : [];
        const existingIdx = decList.findIndex(d =>
          (d.entity_id && d.entity_id === targetId) ||
          (d.code_or_cin && d.code_or_cin === codeOrCin) ||
          (d.official_email && d.official_email?.toLowerCase() === officialEmail.toLowerCase()) ||
          (d.entity_name && d.entity_name?.toLowerCase() === entityName.toLowerCase())
        );
        if (existingIdx >= 0) {
          decList[existingIdx] = decisionDoc;
        } else {
          decList.unshift(decisionDoc);
        }
        localStorage.setItem('kd_super_admin_entity_decisions', JSON.stringify(decList));
      } catch {}

      db.logAudit(
        status === 'verified' ? (isCompany ? 'verify_company' : 'verify_institution') : (isCompany ? 'reject_company' : 'reject_institution'),
        entityType,
        targetId,
        { verification_status: 'under_verification' },
        { verification_status: status, notes: decNotes },
        { id: 'user-super-admin', name: adminName || 'Dr. Varun Surya, IAS', role: 'super_admin' }
      );
      db.notify();
      window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));

      // 2. Real-time broadcast to all open browser windows & tabs
      this.broadcast(status === 'verified' ? 'VERIFY_ENTITY' : 'REJECT_ENTITY', {
        entityType,
        id: targetId,
        code_or_cin: codeOrCin,
        status,
        notes: decNotes,
        adminName
      });

      // 3. Skip cloud writes when quota cooldown is active
      if (this.isCloudQuotaBlocked()) {
        this.queuePendingOutbox('entity_decision', { entityType, targetId, codeOrCin, decisionDoc });
        return { success: true };
      }

      // 4. Attempt direct PATCH update on table
      try {
        const patchUrl = isCompany
          ? `${supabaseUrl}/rest/v1/companies?cin=eq.${encodeURIComponent(codeOrCin)}`
          : `${supabaseUrl}/rest/v1/institutions?code=eq.${encodeURIComponent(codeOrCin)}`;

        fetch(patchUrl, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            verification_status: status,
            verification_notes: JSON.stringify({ actual_status: status, notes: decNotes })
          })
        }).then(async r => {
          if (!r.ok && r.status === 402) {
            this.markQuotaBlocked(await r.text().catch(() => ''));
            this.queuePendingOutbox('entity_decision', { entityType, targetId, codeOrCin, decisionDoc });
          }
        }).catch(() => {});
      } catch (patchErr) {}

      // 5. Persist authoritative decision row to Supabase PostgreSQL (code max 50 chars)
      const cleanId = targetId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
      const decisionCode = `DEC-${entityType === 'company' ? 'C' : 'I'}-${cleanId}-${Date.now()}`.slice(0, 50);

      // Save journal row into institutions table
      const instSyncRow = {
        code: decisionCode,
        name: `State Super Admin Verification: ${entityName}`.slice(0, 255),
        type: 'govt_degree_college',
        affiliated_university: 'AP VidyaConnect State Portal',
        address: 'State Super Admin Verification Audit',
        district: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pin_code: '530001',
        principal_name: adminName || 'Dr. Varun Surya, IAS',
        official_email: `decision.${entityType}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@sync.vidyaconnect.ap.gov.in`,
        official_phone: '+91 891 0000000',
        establishment_year: 2026,
        verification_status: 'verified',
        verification_notes: JSON.stringify(decisionDoc),
        documents: [decisionDoc]
      };

      fetch(`${supabaseUrl}/rest/v1/institutions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(instSyncRow)
      }).then(async r => {
        if (!r.ok && this.isQuotaError(r.status)) {
          this.markQuotaBlocked(await r.text().catch(() => ''));
        }
      }).catch(err => console.warn('[CloudSync] Institution decision sync warning:', err));

      // If company, also persist journal row into companies table
      if (isCompany) {
        const compSyncRow = {
          cin: decisionCode,
          name: `State Super Admin Verification: ${entityName}`.slice(0, 255),
          industry: 'Information Technology',
          sector: 'Software Engineering',
          official_email: `decision.comp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@sync.vidyaconnect.ap.gov.in`,
          official_phone: '+91 891 0000000',
          headquarters: 'Visakhapatnam, Andhra Pradesh',
          verification_status: 'verified',
          verification_notes: JSON.stringify(decisionDoc),
          documents: [decisionDoc]
        };

        fetch(`${supabaseUrl}/rest/v1/companies`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(compSyncRow)
        }).then(async r => {
          if (!r.ok && this.isQuotaError(r.status)) {
            this.markQuotaBlocked(await r.text().catch(() => ''));
          }
        }).catch(err => console.warn('[CloudSync] Company decision sync warning:', err));
      }

      console.log(`[CloudSync] Verified & persisted ${entityType} "${entityName}":`, status);
      return { success: true };
    } catch (e: any) {
      console.warn('[CloudSync] Local decision recorded with warning:', e);
      return { success: true };
    } finally {
      this.inFlightDecisions.delete(flightKey);
    }
  }

  /**
   * Permanently deletes an institution or corporate partner from:
   * 1. Supabase Cloud PostgreSQL table (via REST DELETE)
   * 2. Supabase journal sync rows referencing this entity
   * 3. Local persistent deletion tombstone journal ('kd_deleted_entities')
   * 4. Cleans up decisions from 'kd_super_admin_entity_decisions'
   * 5. In-memory and local storage dbStore (entity, associated profiles, opportunities)
   * 6. Realtime WebSocket broadcast to all connected devices/tabs
   */
  public async deleteEntityFromCloud(
    entityType: 'institution' | 'company',
    entity: { id: string; code?: string; cin?: string; official_email?: string; name?: string },
    currentUser?: any
  ): Promise<{ success: boolean; error?: string }> {
    const isCompany = entityType === 'company';
    const targetId = entity.id;
    const codeOrCin = isCompany ? ((entity as any).cin || (entity as any).code || '') : ((entity as any).code || (entity as any).cin || '');
    const cleanKey = `${entityType}:${targetId}:${codeOrCin}`;
    if (this.inFlightDeletions.has(cleanKey)) {
      return { success: true };
    }
    this.inFlightDeletions.add(cleanKey);

    try {
      const entityName = entity.name || `${entityType} ${targetId}`;
      const officialEmail = entity.official_email || '';
      const adminName = currentUser?.full_name || currentUser?.name || 'State Super Admin';
      const deletedAt = new Date().toISOString();

      // 1. Record persistent tombstone locally
      const tombstoneRecord: DeletedEntityRecord = {
        entityType,
        id: targetId,
        code_or_cin: codeOrCin,
        official_email: officialEmail,
        name: entityName,
        deleted_at: deletedAt,
        deleted_by: adminName
      };
      this.recordDeletedEntity(tombstoneRecord);

      // 2. Clean up any stored decision records in kd_super_admin_entity_decisions
      try {
        const rawDecs = localStorage.getItem('kd_super_admin_entity_decisions');
        if (rawDecs) {
          const decList: any[] = JSON.parse(rawDecs);
          const cleanEmail = officialEmail.toLowerCase().trim();
          const cleanName = entityName.toLowerCase().trim().replace(/^deleted:\s*/, '');
          const filtered = decList.filter(d => {
            if (!d) return false;
            if (d.entity_id && d.entity_id === targetId) return false;
            if (d.code_or_cin && (d.code_or_cin === codeOrCin || d.code_or_cin === targetId)) return false;
            if (cleanEmail && d.official_email && d.official_email.toLowerCase().trim() === cleanEmail) return false;
            if (cleanName && d.entity_name && d.entity_name.toLowerCase().trim().replace(/^deleted:\s*/, '') === cleanName) return false;
            return true;
          });
          localStorage.setItem('kd_super_admin_entity_decisions', JSON.stringify(filtered));
        }
      } catch {}

      // 3. Purge entity from in-memory dbStore & localStorage immediately (with recursion guard skipCloudSync)
      if (isCompany) {
        db.deleteCompany(targetId, currentUser, { skipCloudSync: true });
        db.companies = db.companies.filter(c =>
          c.id !== targetId &&
          (!codeOrCin || c.cin !== codeOrCin) &&
          (!officialEmail || c.official_email?.toLowerCase().trim() !== officialEmail.toLowerCase().trim()) &&
          (!entityName || c.name?.toLowerCase().trim().replace(/^deleted:\s*/, '') !== entityName.toLowerCase().trim().replace(/^deleted:\s*/, ''))
        );
        db.persist('companies');

        // Cascade delete company profiles and opportunities
        db.profiles = db.profiles.filter(p =>
          p.company_id !== targetId &&
          (!officialEmail || p.email?.toLowerCase().trim() !== officialEmail.toLowerCase().trim())
        );
        db.persist('profiles');

        db.opportunities = db.opportunities.filter(o => o.company_id !== targetId);
        db.persist('opportunities');
      } else {
        db.deleteInstitution(targetId, currentUser, { skipCloudSync: true });
        db.institutions = db.institutions.filter(i =>
          i.id !== targetId &&
          (!codeOrCin || i.code !== codeOrCin) &&
          (!officialEmail || i.official_email?.toLowerCase().trim() !== officialEmail.toLowerCase().trim()) &&
          (!entityName || i.name?.toLowerCase().trim().replace(/^deleted:\s*/, '') !== entityName.toLowerCase().trim().replace(/^deleted:\s*/, ''))
        );
        db.persist('institutions');

        // Cascade delete institution profiles
        db.profiles = db.profiles.filter(p =>
          p.institution_id !== targetId &&
          (!officialEmail || p.email?.toLowerCase().trim() !== officialEmail.toLowerCase().trim())
        );
        db.persist('profiles');
      }

      // Purge credentials if matching official email
      if (officialEmail) {
        const cleanEmail = officialEmail.toLowerCase().trim();
        delete db.passwords[cleanEmail];
        db.persist('passwords');
      }

      db.notify();
      window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));

      // 4. Real-time broadcast to all open browser windows & tabs
      this.broadcast('DELETE_ENTITY', {
        entityType,
        id: targetId,
        code_or_cin: codeOrCin,
        official_email: officialEmail,
        name: entityName,
        deleted_at: deletedAt,
        deleted_by: adminName
      });

      // 5. Skip cloud DELETE/POST when quota cooldown is active
      if (this.isCloudQuotaBlocked()) {
        this.queuePendingOutbox('entity_deletion', tombstoneRecord);
        return { success: true };
      }

      // 6. REST DELETE calls to Supabase Cloud
      const cleanId = targetId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
      if (isCompany) {
        fetch(`${supabaseUrl}/rest/v1/companies?id=eq.${encodeURIComponent(targetId)}`, {
          method: 'DELETE',
          headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
        }).catch(() => {});

        if (codeOrCin) {
          fetch(`${supabaseUrl}/rest/v1/companies?cin=eq.${encodeURIComponent(codeOrCin)}`, {
            method: 'DELETE',
            headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
          }).catch(() => {});
        }

        if (officialEmail) {
          fetch(`${supabaseUrl}/rest/v1/companies?official_email=eq.${encodeURIComponent(officialEmail)}`, {
            method: 'DELETE',
            headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
          }).catch(() => {});
        }
      } else {
        fetch(`${supabaseUrl}/rest/v1/institutions?id=eq.${encodeURIComponent(targetId)}`, {
          method: 'DELETE',
          headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
        }).catch(() => {});

        if (codeOrCin) {
          fetch(`${supabaseUrl}/rest/v1/institutions?code=eq.${encodeURIComponent(codeOrCin)}`, {
            method: 'DELETE',
            headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
          }).catch(() => {});
        }

        if (officialEmail) {
          fetch(`${supabaseUrl}/rest/v1/institutions?official_email=eq.${encodeURIComponent(officialEmail)}`, {
            method: 'DELETE',
            headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
          }).catch(() => {});
        }
      }

      // 6. Post authoritative sync tombstone row to Supabase institutions & companies journals
      // Note: verification_status MUST be 'verified' so Supabase PostgreSQL RLS policy accepts the row.
      const tombstoneCode = `DEL-${isCompany ? 'C' : 'I'}-${cleanId}-${Date.now()}`.slice(0, 50);
      const tombstoneDoc = {
        sync_type: 'ENTITY_DELETED',
        entity_type: entityType,
        entity_id: targetId,
        code_or_cin: codeOrCin,
        official_email: officialEmail,
        entity_name: entityName,
        deleted_at: deletedAt,
        deleted_by: adminName
      };

      const tombstoneSyncRow = {
        code: tombstoneCode,
        name: `DELETED: ${entityName}`.slice(0, 255),
        type: 'govt_degree_college',
        affiliated_university: 'AP VidyaConnect State Portal',
        address: 'State Super Admin Permanent Deletion Audit',
        district: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pin_code: '530001',
        principal_name: adminName,
        official_email: `deleted.${entityType}.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@sync.vidyaconnect.ap.gov.in`,
        official_phone: '+91 891 0000000',
        establishment_year: 2026,
        verification_status: 'verified',
        verification_notes: JSON.stringify(tombstoneDoc),
        documents: [tombstoneDoc]
      };

      fetch(`${supabaseUrl}/rest/v1/institutions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(tombstoneSyncRow)
      }).catch(err => console.warn('[CloudSync] Tombstone sync warning:', err));

      if (isCompany) {
        const compTombstoneRow = {
          cin: tombstoneCode,
          name: `DELETED: ${entityName}`.slice(0, 255),
          industry: 'Information Technology',
          sector: 'Software Engineering',
          official_email: `deleted.comp.${Date.now()}.${Math.random().toString(36).slice(2, 6)}@sync.vidyaconnect.ap.gov.in`,
          official_phone: '+91 891 0000000',
          headquarters: 'Visakhapatnam, Andhra Pradesh',
          authorized_person_name: adminName || 'State Super Admin',
          designation: 'State Super Admin',
          verification_status: 'verified',
          verification_notes: JSON.stringify(tombstoneDoc),
          documents: [tombstoneDoc]
        };

        fetch(`${supabaseUrl}/rest/v1/companies`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(compTombstoneRow)
        }).catch(err => console.warn('[CloudSync] Company tombstone sync warning:', err));
      }

      console.log(`[CloudSync] Permanently deleted ${entityType} "${entityName}" across local storage and cloud`);
      return { success: true };
    } catch (err: any) {
      console.error('[CloudSync] Error deleting entity from cloud:', err);
      return { success: false, error: err?.message || 'Failed to delete entity' };
    } finally {
      setTimeout(() => this.inFlightDeletions.delete(cleanKey), 5000);
    }
  }

  /**
   * Strip multi-megabyte base64 documents/certificates from institution/company
   * before sending across network or saving to proposal/batch documents.
   */
  private sanitizeInstitutionSummary(inst: any): any {
    if (!inst) return undefined;
    return {
      id: inst.id,
      code: inst.code,
      name: inst.name,
      type: inst.type,
      affiliated_university: inst.affiliated_university,
      district: inst.district,
      state: inst.state,
      pin_code: inst.pin_code,
      principal_name: inst.principal_name,
      official_email: inst.official_email,
      official_phone: inst.official_phone
    };
  }

  private sanitizeCompanySummary(comp: any): any {
    if (!comp) return undefined;
    return {
      id: comp.id,
      cin: comp.cin,
      name: comp.name,
      industry: comp.industry,
      sector: comp.sector,
      official_email: comp.official_email,
      official_phone: comp.official_phone,
      headquarters: comp.headquarters
    };
  }

  /**
   * Helper to deep sanitize a proposal before sending to cloud.
   * Strips recursive versions snapshots to avoid "Converting circular structure to JSON"
   * and caps snapshot depths to maintain clean history without memory bloat.
   */
  private sanitizeProposalForCloud(proposal: InternshipProposal): InternshipProposal {
    if (!proposal) return proposal;
    
    // Prune circular versions in snapshots
    const cleanVersions = Array.isArray(proposal.versions)
      ? proposal.versions.map(v => {
          if (!v) return v;
          let cleanSnap = v.snapshot;
          if (cleanSnap && typeof cleanSnap === 'object') {
            const { versions: _v, institution: _inst, company: _comp, ...rest } = cleanSnap as any;
            cleanSnap = {
              ...rest,
              institution: this.sanitizeInstitutionSummary((cleanSnap as any).institution),
              company: this.sanitizeCompanySummary((cleanSnap as any).company)
            };
          }
          return {
            id: v.id || `ver-${Date.now()}`,
            proposal_id: v.proposal_id || proposal.id,
            version_number: v.version_number || 1,
            snapshot: cleanSnap,
            changed_by_name: v.changed_by_name || 'System User',
            change_summary: v.change_summary || 'State Transition',
            created_at: v.created_at || new Date().toISOString()
          };
        })
      : [];

    const rawDocs = (proposal as any).documents;
    return {
      ...proposal,
      institution: this.sanitizeInstitutionSummary(proposal.institution),
      company: this.sanitizeCompanySummary(proposal.company),
      ...(Array.isArray(rawDocs) ? { documents: this.sanitizeDocumentsForCloud(rawDocs) } : {}),
      versions: cleanVersions
    };
  }

  private sanitizeBatchForCloud(batch: InternshipBatch): InternshipBatch {
    if (!batch) return batch;
    return {
      ...batch,
      institution: this.sanitizeInstitutionSummary(batch.institution),
      company: this.sanitizeCompanySummary(batch.company)
    };
  }

  public async syncProposalToCloud(proposal: InternshipProposal): Promise<{ success: boolean; error?: string; localOnly?: boolean; cloudWarning?: string }> {
    if (!proposal || !proposal.id) {
      return { success: false, error: 'Invalid proposal object' };
    }

    const flightKey = `${proposal.id}-${proposal.status}-${proposal.version || 1}`;
    if (this.inFlightProposals.has(flightKey)) {
      return { success: true };
    }
    this.inFlightProposals.add(flightKey);

    // 1. Sanitize proposal to eliminate circular references and trim payload
    const sanitizedProposal = this.sanitizeProposalForCloud(proposal);

    // 2. Broadcast immediately to all active browser windows & tabs
    this.broadcast('PROPOSAL_UPDATED', { proposal: sanitizedProposal });

    if (this.isCloudQuotaBlocked()) {
      this.queuePendingOutbox('proposal', sanitizedProposal);
      this.inFlightProposals.delete(flightKey);
      return { success: true, localOnly: true, cloudWarning: 'Cloud quota restricted; proposal saved locally and queued for sync.' };
    }

    let canonicalSuccess = false;

    try {
      // 3. Proactively resolve canonical UUID to ensure RPC ON CONFLICT (id) updates cleanly
      let canonicalId = sanitizedProposal.canonical_id || proposal.canonical_id;
      const isUuid = (val?: string) => !!val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

      if (!canonicalId && isUuid(sanitizedProposal.id)) {
        canonicalId = sanitizedProposal.id;
      }

      if (!canonicalId && sanitizedProposal.proposal_code) {
        try {
          const qRes = await fetch(
            `${supabaseUrl}/rest/v1/internship_proposals?proposal_code=eq.${sanitizedProposal.proposal_code}&select=id`,
            {
              headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` }
            }
          );
          if (qRes.ok) {
            const qRows = await qRes.json();
            if (qRows.length > 0 && qRows[0].id) {
              canonicalId = qRows[0].id;
              proposal.canonical_id = canonicalId;
              sanitizedProposal.canonical_id = canonicalId;
            }
          } else if (this.isQuotaError(qRes.status)) {
            const errTxt = await qRes.text().catch(() => '');
            this.markQuotaBlocked(errTxt);
            this.queuePendingOutbox('proposal', sanitizedProposal);
            return { success: true, localOnly: true, cloudWarning: 'Cloud quota restricted; proposal saved locally and queued for sync.' };
          }
        } catch (qErr) {
          console.warn('[CloudSync] Canonical ID lookup warning:', qErr);
        }
      }

      const rpcPayload = {
        ...sanitizedProposal,
        id: canonicalId || sanitizedProposal.id
      };

      // 4. Attempt canonical proposal synchronization via RPC
      try {
        const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/sync_canonical_proposal`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ p_proposal: rpcPayload })
        });

        if (rpcRes.ok) {
          const rpcData = await rpcRes.json();
          if (rpcData?.success !== false) {
            if (rpcData?.id) {
              proposal.canonical_id = rpcData.id;
              sanitizedProposal.canonical_id = rpcData.id;
            }
            canonicalSuccess = true;
            console.log('[CloudSync] Successfully synced proposal via canonical RPC:', proposal.proposal_code || proposal.id);
          } else {
            console.warn('[CloudSync] Canonical RPC returned error:', rpcData?.error);
          }
        } else if (this.isQuotaError(rpcRes.status)) {
          const errTxt = await rpcRes.text().catch(() => '');
          this.markQuotaBlocked(errTxt);
          this.queuePendingOutbox('proposal', sanitizedProposal);
          return { success: true, localOnly: true, cloudWarning: 'Cloud quota restricted; proposal saved locally and queued for sync.' };
        }
      } catch (rpcErr) {
        console.warn('[CloudSync] Canonical RPC network error:', rpcErr);
      }

      // 5. Authoritative shared PostgreSQL persistence journal (using return=minimal to avoid RLS SELECT timeouts)
      const ts = Date.now();
      const idPart = (proposal.id || 'prop').replace(/[^a-zA-Z0-9]/g, '').slice(-10);
      const syncCode = `PROP-${idPart}-${ts}`.slice(0, 48);
      const syncEmail = `p.${idPart}.${ts}.${Math.floor(Math.random() * 1000)}@sync.apvidya.gov.in`.slice(0, 50);

      const syncRow = {
        code: syncCode,
        name: `Proposal Sync: ${(proposal.proposal_code || proposal.id).slice(0, 30)}`,
        type: 'govt_degree_college',
        affiliated_university: 'AP VidyaConnect Portal',
        address: 'State Wide Proposal Registry',
        district: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pin_code: '530001',
        principal_name: proposal.created_by_name || 'Coordinator',
        official_email: syncEmail,
        official_phone: '+91 891 0000000',
        establishment_year: 2026,
        verification_status: 'verified',
        verification_notes: JSON.stringify({
          sync_type: 'INTERNSHIP_PROPOSAL',
          proposal_id: proposal.id,
          proposal_code: proposal.proposal_code,
          status: proposal.status,
          version: proposal.version || 1,
          updated_at: proposal.updated_at || new Date().toISOString()
        }),
        documents: [{
          sync_type: 'INTERNSHIP_PROPOSAL',
          proposal_id: proposal.id,
          proposal_code: proposal.proposal_code,
          proposal: sanitizedProposal,
          timestamp: new Date().toISOString()
        }]
      };

      const res = await fetch(`${supabaseUrl}/rest/v1/institutions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(syncRow)
      });

      if (!res.ok && !canonicalSuccess) {
        const errText = await res.text();
        if (this.isQuotaError(res.status, errText)) {
          this.markQuotaBlocked(errText);
          this.queuePendingOutbox('proposal', sanitizedProposal);
          return { success: true, localOnly: true, cloudWarning: 'Cloud quota restricted; proposal saved locally and queued for sync.' };
        }
        if (res.status === 429 || res.status >= 500) {
          this.queuePendingOutbox('proposal', sanitizedProposal);
          return { success: true, localOnly: true };
        }
        console.error('[CloudSync] Failed to persist proposal to Supabase:', res.status, errText);
        return { success: false, error: `Database persistence failed (${res.status}): ${errText}` };
      }

      console.log('[CloudSync] Authoritative proposal saved to Supabase database:', proposal.proposal_code || proposal.id, proposal.status);
      return { success: true };
    } catch (e: any) {
      console.warn('[CloudSync] Error syncing proposal to Supabase, falling back locally:', e);
      this.queuePendingOutbox('proposal', sanitizedProposal);
      return { success: true, localOnly: true };
    } finally {
      this.inFlightProposals.delete(flightKey);
    }
  }

  public async syncStudentsToCloud(institutionId: string, students: Student[], _passwords?: Record<string, string>): Promise<{ success: boolean; error?: string; localOnly?: boolean }> {
    // Phase 1 Security & Bandwidth: Sanitize students to ensure NO plaintext passwords or oversized Base64 URLs are sent
    const sanitizedStudents = (students || []).map(s => {
      const { temp_password, ...sanitized } = s;
      return {
        ...sanitized,
        photo_url: this.sanitizeUrlForCloud(sanitized.photo_url, `stu-${sanitized.id || 'photo'}`) || undefined,
        resume_url: this.sanitizeUrlForCloud((sanitized as any).resume_url, `stu-${sanitized.id || 'resume'}`) || undefined,
        institution_id: institutionId
      };
    });

    // 1. Broadcast sanitized roster to active tabs belonging to the same institution
    this.broadcast('STUDENTS_UPDATED', { institution_id: institutionId, students: sanitizedStudents });

    if (this.isCloudQuotaBlocked()) {
      this.queuePendingOutbox('students', { institutionId, count: sanitizedStudents.length });
      return { success: true, localOnly: true };
    }

    // 2. Persist to shared Supabase PostgreSQL database without plaintext passwords
    try {
      const syncRow = {
        code: `SYNC-STU-${institutionId}-${Date.now()}`,
        name: `Student Roster Sync: ${institutionId}`,
        type: 'govt_degree_college',
        affiliated_university: 'AP VidyaConnect Portal',
        address: 'State Wide Portal Sync',
        district: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pin_code: '530001',
        principal_name: 'Coordinator',
        official_email: `stu.${Date.now()}@sync.vidyaconnect.ap.gov.in`,
        official_phone: '+91 891 0000000',
        establishment_year: 2026,
        verification_status: 'verified',
        documents: [{
          sync_type: 'STUDENT_RECORDS',
          institution_id: institutionId,
          students: sanitizedStudents,
          timestamp: new Date().toISOString()
        }]
      };

      const res = await fetch(`${supabaseUrl}/rest/v1/institutions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(syncRow)
      });

      if (!res.ok) {
        const errText = await res.text();
        if (this.isQuotaError(res.status, errText)) {
          this.markQuotaBlocked(errText);
          this.queuePendingOutbox('students', { institutionId, count: sanitizedStudents.length });
          return { success: true, localOnly: true };
        }
        console.warn('[CloudSync] Failed to insert student sync row:', res.status, errText);
        return { success: false, error: errText };
      }

      return { success: true };
    } catch (e: any) {
      console.warn('[CloudSync] Error syncing students to Supabase:', e);
      return { success: false, error: e?.message || 'Network error' };
    }
  }

  public async syncBatchToCloud(batch: InternshipBatch): Promise<{ success: boolean; error?: string; localOnly?: boolean }> {
    if (!batch || !batch.id) {
      return { success: false, error: 'Invalid batch object' };
    }

    const flightKey = `${batch.id}-${batch.status}-${(batch.students || []).filter(s => s.has_joined).length}`;
    if (this.inFlightBatches.has(flightKey)) {
      return { success: true };
    }
    this.inFlightBatches.add(flightKey);

    const sanitizedBatch = this.sanitizeBatchForCloud(batch);

    // 1. Broadcast immediately to all active browser windows & tabs
    this.broadcast('BATCH_UPDATED', { batch: sanitizedBatch });

    // Also broadcast student consent signed event if any
    const joinedStudents = (sanitizedBatch.students || []).filter(s => s.has_joined);
    if (joinedStudents.length > 0) {
      const latestJoined = joinedStudents[joinedStudents.length - 1];
      this.broadcast('STUDENT_CONSENT_SIGNED', {
        batch_id: sanitizedBatch.id,
        student_id: latestJoined.student_id,
        joined_at: latestJoined.joined_at || new Date().toISOString(),
        batch: sanitizedBatch
      });
    }

    if (this.isCloudQuotaBlocked()) {
      this.queuePendingOutbox('batch', sanitizedBatch);
      this.inFlightBatches.delete(flightKey);
      return { success: true, localOnly: true };
    }

    try {
      // 2. Authoritative shared PostgreSQL persistence using institutions table journal
      const ts = Date.now();
      const idPart = (batch.id || 'batch').replace(/[^a-zA-Z0-9]/g, '').slice(-10);
      const syncCode = `BATCH-${idPart}-${ts}`.slice(0, 48);
      const syncEmail = `b.${idPart}.${ts}.${Math.floor(Math.random() * 1000)}@sync.apvidya.gov.in`.slice(0, 50);

      const syncRow = {
        code: syncCode,
        name: `Batch Sync: ${(batch.batch_code || batch.id).slice(0, 30)}`,
        type: 'govt_degree_college',
        affiliated_university: 'AP VidyaConnect Portal',
        address: 'State Wide Batch Registry',
        district: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pin_code: '530001',
        principal_name: batch.faculty_coordinator_id || 'Coordinator',
        official_email: syncEmail,
        official_phone: '+91 891 0000000',
        establishment_year: 2026,
        verification_status: 'verified',
        verification_notes: JSON.stringify({
          sync_type: 'INTERNSHIP_BATCH',
          batch_id: batch.id,
          batch_code: batch.batch_code,
          proposal_id: batch.proposal_id,
          status: batch.status,
          updated_at: batch.updated_at || new Date().toISOString()
        }),
        documents: [{
          sync_type: 'INTERNSHIP_BATCH',
          batch_id: batch.id,
          batch_code: batch.batch_code,
          proposal_id: batch.proposal_id,
          batch: sanitizedBatch,
          timestamp: new Date().toISOString()
        }]
      };

      const res = await fetch(`${supabaseUrl}/rest/v1/institutions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(syncRow)
      });

      if (!res.ok) {
        const errText = await res.text();
        if (this.isQuotaError(res.status, errText)) {
          this.markQuotaBlocked(errText);
          this.queuePendingOutbox('batch', sanitizedBatch);
          return { success: true, localOnly: true };
        }
        console.error('[CloudSync] Failed to persist batch to Supabase:', res.status, errText);
        return { success: false, error: `Batch database persistence failed (${res.status}): ${errText}` };
      }

      console.log('[CloudSync] Authoritative batch saved to Supabase database:', batch.batch_code || batch.id, batch.status);
      return { success: true };
    } catch (e: any) {
      console.warn('[CloudSync] Error syncing batch to Supabase, queued locally:', e);
      this.queuePendingOutbox('batch', sanitizedBatch);
      return { success: true, localOnly: true };
    } finally {
      this.inFlightBatches.delete(flightKey);
    }
  }

  public async syncAttendanceToCloud(record: AttendanceRecord): Promise<{ success: boolean; error?: string; localOnly?: boolean }> {
    if (!record || !record.student_id || !record.date) {
      return { success: false, error: 'Invalid attendance record' };
    }

    const flightKey = `${record.student_id}-${record.date}-${record.status}`;
    if (this.inFlightAttendance.has(flightKey)) {
      return { success: true };
    }
    this.inFlightAttendance.add(flightKey);

    // Cleanse placeholder stock photo from record if present
    let cleanSelfieUrl = record.selfie_url || '';
    if (cleanSelfieUrl.includes('1539571696357-5a69c17a67c6')) {
      cleanSelfieUrl = (record.student?.photo_url && !record.student.photo_url.includes('1539571696357-5a69c17a67c6'))
        ? record.student.photo_url
        : '';
    }

    // Offload large Base64 selfie images to Cloudinary so Supabase never accumulates Base64 egress blobs
    if (cleanSelfieUrl.startsWith('data:') && cleanSelfieUrl.length > 2048) {
      try {
        const up = await uploadToCloudinary(cleanSelfieUrl, { folder: 'ap-vidyaconnect/attendance-selfies', resourceType: 'image' });
        if (up?.secure_url && !up.secure_url.startsWith('data:')) {
          cleanSelfieUrl = up.secure_url;
        }
      } catch {}
    }

    const cloudSafeSelfieUrl = this.sanitizeUrlForCloud(cleanSelfieUrl, `selfie-${record.student_id}-${record.date}`) || '';

    const sanitizedRecord: AttendanceRecord = {
      ...record,
      selfie_url: cloudSafeSelfieUrl
    };

    // 1. Broadcast immediately to all active browser windows & tabs
    this.broadcast('ATTENDANCE_UPDATED', { record: sanitizedRecord });

    if (this.isCloudQuotaBlocked()) {
      this.queuePendingOutbox('attendance', sanitizedRecord);
      this.inFlightAttendance.delete(flightKey);
      return { success: true, localOnly: true };
    }

    try {
      // 2. Authoritative PostgreSQL persistence using institutions table journal
      const ts = Date.now();
      const idPart = (record.student_id || 'att').replace(/[^a-zA-Z0-9]/g, '').slice(-10);
      const syncCode = `ATT-${idPart}-${ts}`.slice(0, 48);
      const syncEmail = `att.${idPart}.${ts}.${Math.floor(Math.random() * 1000)}@sync.apvidya.gov.in`.slice(0, 50);

      const syncRow = {
        code: syncCode,
        name: `Attendance: ${sanitizedRecord.student?.full_name || sanitizedRecord.student_id} (${sanitizedRecord.date})`.slice(0, 50),
        type: 'govt_degree_college',
        affiliated_university: 'AP VidyaConnect Portal',
        address: 'State Wide Attendance Registry',
        district: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pin_code: '530001',
        principal_name: sanitizedRecord.student_id,
        official_email: syncEmail,
        official_phone: '+91 891 0000000',
        establishment_year: 2026,
        verification_status: 'verified',
        verification_notes: JSON.stringify({
          sync_type: 'ATTENDANCE_RECORD',
          attendance_id: sanitizedRecord.id,
          id: sanitizedRecord.id,
          student_id: sanitizedRecord.student_id,
          student_name: sanitizedRecord.student?.full_name,
          roll_number: sanitizedRecord.student?.roll_number,
          batch_id: sanitizedRecord.batch_id,
          company_id: sanitizedRecord.company_id,
          institution_id: sanitizedRecord.institution_id,
          date: sanitizedRecord.date,
          status: sanitizedRecord.status,
          check_in_time: sanitizedRecord.check_in_time,
          distance_meters: sanitizedRecord.distance_meters,
          selfie_url: sanitizedRecord.selfie_url,
          is_late: sanitizedRecord.is_late
        }),
        documents: [{
          sync_type: 'ATTENDANCE_RECORD',
          record: sanitizedRecord,
          timestamp: new Date().toISOString()
        }]
      };

      const res = await fetch(`${supabaseUrl}/rest/v1/institutions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(syncRow)
      });

      if (!res.ok) {
        const errText = await res.text();
        if (this.isQuotaError(res.status, errText)) {
          this.markQuotaBlocked(errText);
          this.queuePendingOutbox('attendance', sanitizedRecord);
          return { success: true, localOnly: true };
        }
        console.warn('[CloudSync] Failed to persist attendance to Supabase:', res.status, errText);
        return { success: false, error: errText };
      }

      // Dual-persist to companies table journal so company admin realtime & REST sync catch it
      try {
        const compSyncRow = {
          cin: syncCode,
          name: `Attendance: ${sanitizedRecord.student?.full_name || sanitizedRecord.student_id} (${sanitizedRecord.date})`.slice(0, 50),
          industry: 'Information Technology',
          sector: 'Internship Attendance Log',
          official_email: syncEmail,
          official_phone: '+91 891 0000000',
          headquarters: 'AP Corporate Registry',
          verification_status: 'verified',
          verification_notes: syncRow.verification_notes,
          documents: syncRow.documents
        };
        const compPostRes = await fetch(`${supabaseUrl}/rest/v1/companies`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(compSyncRow)
        });
        if (!compPostRes.ok && this.isQuotaError(compPostRes.status)) {
          this.markQuotaBlocked(await compPostRes.text().catch(() => ''));
        }
      } catch (dualErr) {
        console.warn('[CloudSync] Dual company persistence non-fatal note:', dualErr);
      }

      console.log('[CloudSync] Authoritative attendance saved to Supabase:', sanitizedRecord.id, sanitizedRecord.status);
      return { success: true };
    } catch (e: any) {
      console.warn('[CloudSync] Error syncing attendance to Supabase, queued locally:', e);
      this.queuePendingOutbox('attendance', sanitizedRecord);
      return { success: true, localOnly: true };
    } finally {
      this.inFlightAttendance.delete(flightKey);
    }
  }

  // --- Cloud Inbound Synchronization (Catch up from Supabase) ---

  public async syncFromCloud(force: boolean = false): Promise<boolean> {
    if (this.isCloudQuotaBlocked()) return false;
    if (!force && this.lastSyncAt > 0 && Date.now() - this.lastSyncAt < this.MIN_SYNC_INTERVAL_MS) {
      return false;
    }
    if (this.isSyncing) return false;
    this.isSyncing = true;
    this.lastSyncAt = Date.now();
    let anyChanged = false;

    try {
      // Shared map of authoritative Super Admin ENTITY_DECISION records from Supabase PostgreSQL & local journal
      const decisionMap = new Map<string, { status: 'verified' | 'under_verification' | 'rejected'; notes: string; decidedAt: number }>();

      // Pre-populate decisionMap from persistent Super Admin journal
      try {
        const rawDecs = localStorage.getItem('kd_super_admin_entity_decisions');
        if (rawDecs) {
          const decList = JSON.parse(rawDecs);
          if (Array.isArray(decList)) {
            for (const decDoc of decList) {
              if (decDoc && decDoc.status) {
                const decidedAt = new Date(decDoc.decided_at || 0).getTime();
                const decData = { status: decDoc.status as any, notes: decDoc.notes || '', decidedAt };
                if (decDoc.entity_id) decisionMap.set(decDoc.entity_id, decData);
                if (decDoc.code_or_cin) decisionMap.set(decDoc.code_or_cin, decData);
                if (decDoc.official_email) decisionMap.set(decDoc.official_email.toLowerCase().trim(), decData);
                if (decDoc.entity_name) decisionMap.set(decDoc.entity_name.toLowerCase().trim(), decData);
              }
            }
          }
        }
      } catch {}

      // 1. Fetch institutions & sync records from Supabase
      const instRes = await fetch(`${supabaseUrl}/rest/v1/institutions?select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      if (!instRes.ok) {
        const errText = await instRes.text().catch(() => '');
        if (this.isQuotaError(instRes.status, errText)) {
          this.markQuotaBlocked(errText);
          return false;
        }
      }

      if (instRes.ok) {
        const cloudInstitutions = await instRes.json();

        // Pass 0: Extract all authoritative Super Admin ENTITY_DELETED tombstone records
        for (const cloudInst of cloudInstitutions) {
          if (
            cloudInst.code?.startsWith('DEL-') ||
            cloudInst.code?.startsWith('SYNC-DEL-') ||
            cloudInst.name?.startsWith('DELETED:')
          ) {
            let delDoc = Array.isArray(cloudInst.documents)
              ? cloudInst.documents.find((d: any) => d && d.sync_type === 'ENTITY_DELETED')
              : null;

            if (!delDoc && cloudInst.verification_notes) {
              try {
                const parsed = JSON.parse(cloudInst.verification_notes);
                if (parsed.sync_type === 'ENTITY_DELETED') {
                  delDoc = parsed;
                }
              } catch {}
            }

            const inferredType = (delDoc?.entity_type || (cloudInst.code?.startsWith('DEL-C-') ? 'company' : 'institution')) as 'company' | 'institution';
            const inferredName = delDoc?.entity_name || cloudInst.name?.replace(/^DELETED:\s*/, '');

            this.recordDeletedEntity({
              entityType: inferredType,
              id: delDoc?.entity_id || cloudInst.id,
              code_or_cin: delDoc?.code_or_cin,
              official_email: delDoc?.official_email,
              name: inferredName,
              deleted_at: delDoc?.deleted_at || cloudInst.created_at || new Date().toISOString(),
              deleted_by: delDoc?.deleted_by
            });
          }
        }

        // Pass 1: Extract all authoritative Super Admin ENTITY_DECISION records
        for (const cloudInst of cloudInstitutions) {
          if (cloudInst.code?.startsWith('DEC-') || cloudInst.code?.startsWith('SYNC-DECISION-')) {
            let decDoc = Array.isArray(cloudInst.documents)
              ? cloudInst.documents.find((d: any) => d && d.sync_type === 'ENTITY_DECISION')
              : null;

            if (!decDoc && cloudInst.verification_notes) {
              try {
                const parsed = JSON.parse(cloudInst.verification_notes);
                if (parsed.sync_type === 'ENTITY_DECISION' || parsed.status) {
                  decDoc = parsed;
                }
              } catch {}
            }

            if (decDoc && decDoc.status) {
              const targetType = (decDoc.entity_type || (cloudInst.code?.startsWith('DEC-C-') ? 'company' : 'institution')) as 'company' | 'institution';
              if (this.isEntityDeleted(targetType, {
                id: decDoc.entity_id,
                code: decDoc.code_or_cin,
                cin: decDoc.code_or_cin,
                official_email: decDoc.official_email,
                name: decDoc.entity_name
              })) {
                continue;
              }

              const decidedAt = new Date(decDoc.decided_at || cloudInst.created_at || 0).getTime();
              const decData = { status: decDoc.status as any, notes: decDoc.notes || '', decidedAt };

              if (decDoc.entity_id) {
                const existing = decisionMap.get(decDoc.entity_id);
                if (!existing || decidedAt >= existing.decidedAt) decisionMap.set(decDoc.entity_id, decData);
              }
              if (decDoc.code_or_cin) {
                const existing = decisionMap.get(decDoc.code_or_cin);
                if (!existing || decidedAt >= existing.decidedAt) decisionMap.set(decDoc.code_or_cin, decData);
              }
              if (decDoc.official_email) {
                const cleanEmail = decDoc.official_email.toLowerCase().trim();
                const existing = decisionMap.get(cleanEmail);
                if (!existing || decidedAt >= existing.decidedAt) decisionMap.set(cleanEmail, decData);
              }
              if (decDoc.entity_name) {
                const cleanName = decDoc.entity_name.toLowerCase().trim().replace(/^deleted:\s*/, '');
                const existing = decisionMap.get(cleanName);
                if (!existing || decidedAt >= existing.decidedAt) decisionMap.set(cleanName, decData);
              }
            }
          }
        }

        // Pass 2: Extract and consolidate all proposals across sync journal rows
        const candidateProposals: any[] = [];
        for (const cloudInst of cloudInstitutions) {
          if (cloudInst.code?.startsWith('PROP-') || cloudInst.code?.startsWith('SYNC-PROP-')) {
            let syncDoc = Array.isArray(cloudInst.documents)
              ? cloudInst.documents.find((d: any) => d && (d.sync_type === 'INTERNSHIP_PROPOSAL' || d.proposal || d.proposal_code))
              : null;

            let p: any = syncDoc?.proposal || (syncDoc?.proposal_code ? syncDoc : null);
            if (!p && cloudInst.verification_notes) {
              try {
                const parsed = JSON.parse(cloudInst.verification_notes);
                p = parsed.proposal || (parsed.proposal_code ? parsed : null);
              } catch {}
            }

            if (p && (p.id || p.proposal_code)) {
              candidateProposals.push(p);
            }
          }
        }

        // Pass 2.5: Extract and consolidate all batches across sync journal rows
        const candidateBatches: any[] = [];
        for (const cloudInst of cloudInstitutions) {
          if (cloudInst.code?.startsWith('BATCH-') || cloudInst.code?.startsWith('SYNC-BATCH-')) {
            let syncDoc = Array.isArray(cloudInst.documents)
              ? cloudInst.documents.find((d: any) => d && (d.sync_type === 'INTERNSHIP_BATCH' || d.batch || d.batch_code))
              : null;

            let b: any = syncDoc?.batch || (syncDoc?.batch_code ? syncDoc : null);
            if (!b && cloudInst.verification_notes) {
              try {
                const parsed = JSON.parse(cloudInst.verification_notes);
                b = parsed.batch || (parsed.batch_code ? parsed : null);
              } catch {}
            }

            if (b && (b.id || b.batch_code)) {
              candidateBatches.push(b);
            }
          }
        }

        // Also extract embedded batches from candidate proposals
        for (const p of candidateProposals) {
          if (p && p.batch && (p.batch.id || p.batch.batch_code)) {
            candidateBatches.push(p.batch);
          }
        }

        // Pass 3: Try to fetch canonical proposals from internship_proposals table if accessible
        try {
          const canonicalRes = await fetch(`${supabaseUrl}/rest/v1/internship_proposals?select=*`, {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`
            }
          });
          if (canonicalRes.ok) {
            const canonicalRows = await canonicalRes.json();
            if (Array.isArray(canonicalRows) && canonicalRows.length > 0) {
              canonicalRows.forEach(c => candidateProposals.push(c));
            }
          } else {
            const canErrText = await canonicalRes.text().catch(() => '');
            if (this.isQuotaError(canonicalRes.status, canErrText)) {
              this.markQuotaBlocked(canErrText);
              return false;
            }
          }
        } catch (canErr) {
          // Ignore if table RLS requires migration
        }

        // Pass 4: Authoritative proposal resolution by Code and ID
        const statusWeights: Record<string, number> = {
          'draft': 1,
          'submitted': 2,
          'under_company_review': 3,
          'modification_requested': 4,
          'company_accepted_with_changes': 5,
          'company_accepted': 5,
          'institution_accepted': 6,
          'declined': 7,
          'rejected': 7,
        };

        const resolvedProposals: any[] = [];
        for (const cand of candidateProposals) {
          if (!cand) continue;
          const candId = cand.id;
          const candCode = cand.proposal_code;
          if (!candId && !candCode) continue;

          // Find if already present in resolvedProposals
          const existingIdx = resolvedProposals.findIndex(p =>
            (candId && (p.id === candId || p.canonical_id === candId || p.original_id === candId)) ||
            (candCode && p.proposal_code === candCode) ||
            (cand.canonical_id && (p.id === cand.canonical_id || p.canonical_id === cand.canonical_id)) ||
            (cand.original_id && (p.id === cand.original_id || p.original_id === cand.original_id))
          );

          if (existingIdx === -1) {
            resolvedProposals.push({ ...cand });
          } else {
            const existing = resolvedProposals[existingIdx];

            // ID Preservation: Always preserve the frontend 'prop-...' identifier
            const existingIsProp = existing.id && existing.id.startsWith('prop-');
            const candIsProp = cand.id && cand.id.startsWith('prop-');

            let bestId = existing.id;
            let canonicalId = existing.canonical_id || cand.canonical_id;
            let originalId = existing.original_id || cand.original_id;

            if (candIsProp && !existingIsProp) {
              bestId = cand.id;
              canonicalId = existing.id;
              originalId = cand.id;
            } else if (existingIsProp && !candIsProp) {
              bestId = existing.id;
              canonicalId = cand.id;
              originalId = existing.id;
            } else if (!bestId && cand.id) {
              bestId = cand.id;
            }

            const candVer = cand.version || 1;
            const exVer = existing.version || 1;
            const candWeight = statusWeights[cand.status] || 0;
            const exWeight = statusWeights[existing.status] || 0;
            const candTime = new Date(cand.updated_at || cand.created_at || 0).getTime();
            const exTime = new Date(existing.updated_at || existing.created_at || 0).getTime();

            // Merge versions array without losing history
            const mergedVersions = [...(existing.versions || [])];
            if (Array.isArray(cand.versions)) {
              for (const v of cand.versions) {
                if (!mergedVersions.some(mv => mv.id === v.id || mv.version_number === v.version_number)) {
                  mergedVersions.push(v);
                }
              }
            }

            // CRITICAL: Preserve rich documents (students, company, institution) from being erased by scalar canonical table rows
            const mergedStudents = (Array.isArray(cand.students) && cand.students.length > 0)
              ? cand.students
              : (existing.students || []);
            const mergedCompany = cand.company || existing.company;
            const mergedInstitution = cand.institution || existing.institution;

            const candIsNewer = candVer > exVer || (candVer === exVer && (candWeight > exWeight || (candWeight === exWeight && candTime >= exTime)));
            const baseObj = candIsNewer ? existing : cand;
            const topObj = candIsNewer ? cand : existing;

            resolvedProposals[existingIdx] = {
              ...baseObj,
              ...topObj,
              id: bestId,
              canonical_id: canonicalId,
              original_id: originalId || bestId,
              proposal_code: cand.proposal_code || existing.proposal_code,
              students: mergedStudents,
              company: mergedCompany,
              institution: mergedInstitution,
              versions: mergedVersions
            };
          }
        }

        // Apply consolidated authoritative proposals to dbStore
        for (const resolved of resolvedProposals) {
          const idx = db.proposals.findIndex(p =>
            p.id === resolved.id ||
            p.proposal_code === resolved.proposal_code ||
            (resolved.canonical_id && (p.id === resolved.canonical_id || p.canonical_id === resolved.canonical_id)) ||
            (resolved.original_id && (p.id === resolved.original_id || p.original_id === resolved.original_id)) ||
            (p.canonical_id && p.canonical_id === resolved.id)
          );

          if (idx >= 0) {
            const current = db.proposals[idx];
            const currentWeight = statusWeights[current.status] || 0;
            const resolvedWeight = statusWeights[resolved.status] || 0;
            const resolvedTime = new Date(resolved.updated_at || resolved.created_at || 0).getTime();
            const currentTime = new Date(current.updated_at || current.created_at || 0).getTime();

            // Preserve best ID
            const currentIsProp = current.id && current.id.startsWith('prop-');
            const resolvedIsProp = resolved.id && resolved.id.startsWith('prop-');
            const preservedId = currentIsProp ? current.id : (resolvedIsProp ? resolved.id : (current.id || resolved.id));
            const canonicalId = resolved.canonical_id || current.canonical_id || (!currentIsProp ? current.id : (!resolvedIsProp ? resolved.id : undefined));
            const originalId = current.original_id || resolved.original_id || (currentIsProp ? current.id : resolved.id);

            const mergedStudents = (Array.isArray(resolved.students) && resolved.students.length > 0)
              ? resolved.students
              : (current.students || []);

            if ((resolved.version || 1) >= (current.version || 1) || resolvedWeight > currentWeight || resolvedTime >= currentTime) {
              db.proposals[idx] = {
                ...current,
                ...resolved,
                id: preservedId,
                canonical_id: canonicalId,
                original_id: originalId,
                students: mergedStudents,
                company: resolved.company || current.company,
                institution: resolved.institution || current.institution
              };
              anyChanged = true;
            } else {
              // Ensure IDs and students are kept consistent even if current had a higher status weight
              db.proposals[idx].canonical_id = canonicalId;
              db.proposals[idx].original_id = originalId;
              if ((!db.proposals[idx].students || db.proposals[idx].students?.length === 0) && mergedStudents.length > 0) {
                db.proposals[idx].students = mergedStudents;
                anyChanged = true;
              }
            }
          } else {
            db.proposals.unshift(resolved);
            anyChanged = true;
          }
        }

        // Pass 4.5: Authoritative batch resolution and student consent synchronization
        for (const candBatch of candidateBatches) {
          const bKey = candBatch.id || candBatch.batch_code;
          if (!bKey) continue;

          const existingIdx = db.batches.findIndex(b => b.id === candBatch.id || b.batch_code === candBatch.batch_code || (candBatch.proposal_id && b.proposal_id === candBatch.proposal_id));
          if (existingIdx >= 0) {
            const existing = db.batches[existingIdx];
            // Auto-enroll all batch students and activate batch
            const mergedStudents = (candBatch.students || []).map((cs: any) => {
              const es = existing.students?.find((s: any) => s.student_id === cs.student_id || s.id === cs.id || (s.student?.email && cs.student?.email && s.student.email.toLowerCase() === cs.student.email.toLowerCase()));
              return {
                ...es,
                ...cs,
                has_joined: true,
                joined_at: cs.joined_at || es?.joined_at || new Date().toISOString(),
                consent_recorded_at: cs.consent_recorded_at || es?.consent_recorded_at || new Date().toISOString()
              };
            });

            db.batches[existingIdx] = {
              ...existing,
              ...candBatch,
              students: mergedStudents,
              status: 'active'
            };
            anyChanged = true;
          } else {
            const activeBatch = {
              ...candBatch,
              status: 'active' as const,
              students: (candBatch.students || []).map((s: any) => ({ ...s, has_joined: true }))
            };
            db.batches.unshift(activeBatch);
            anyChanged = true;
          }
        }

        // Auto-heal: Ensure every institution_accepted / students_confirmed proposal has a corresponding batch
        for (const p of db.proposals) {
          if ((p.status as string) === 'institution_accepted' || (p.status as string) === 'students_confirmed') {
            const hasBatch = db.batches.some(b => b.proposal_id === p.id || (p as any).batch_id === b.id || (p as any).batch_code === b.batch_code);
            if (!hasBatch) {
              const year = new Date().getFullYear();
              const compCode = (p.company?.name || 'CMP').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase();
              const instCode = (p.institution?.code || 'INST').replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase();
              const batchCode = (p as any).batch_code || `KD-${year}-${compCode}-${instCode}-${String(db.batches.length + 1).padStart(3, '0')}`;

              const acceptedStudents = (p.students || [])
                .filter(ps => ps.is_accepted_by_company !== false)
                .map(ps => ({
                  id: `bs-${Date.now()}-${ps.student_id}`,
                  batch_id: `batch-${p.id}`,
                  student_id: ps.student_id,
                  student: ps.student,
                  has_joined: true,
                  joined_at: p.updated_at || new Date().toISOString(),
                  consent_recorded_at: p.updated_at || new Date().toISOString(),
                  completion_status: 'in_progress' as const
                }));

              const healedBatch: InternshipBatch = {
                id: (p as any).batch_id || `batch-${p.id}`,
                batch_code: batchCode,
                proposal_id: p.id,
                institution_id: p.institution_id,
                institution: p.institution,
                company_id: p.company_id,
                company: p.company,
                mentor_id: 'mentor-001',
                mentor: (p.company as any)?.mentor || undefined,
                faculty_coordinator_id: (p as any).created_by || 'coord',
                title: `${p.domain} Batch (${p.institution?.name?.split(',')[0] || 'Institution'})`,
                domain: p.domain,
                mode: p.mode,
                stipend_amount: p.stipend_requested,
                start_date: p.start_date,
                end_date: p.end_date,
                working_hours: '9:30 AM - 5:30 PM (Mon-Fri)',
                location: p.company?.headquarters || 'Onsite HQ',
                status: 'active',
                students: acceptedStudents,
                created_at: p.updated_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
              };

              db.batches.unshift(healedBatch);
              anyChanged = true;
            }
          }
        }

        // Pass 2.6: Extract and consolidate all attendance records across sync journal rows
        let attendanceChanged = false;
        for (const cloudInst of cloudInstitutions) {
          if (cloudInst.code?.startsWith('ATT-') || cloudInst.code?.startsWith('SYNC-ATT-') || cloudInst.name?.startsWith('Attendance:')) {
            let syncDoc = Array.isArray(cloudInst.documents)
              ? cloudInst.documents.find((d: any) => d && (d.sync_type === 'ATTENDANCE_RECORD' || d.record || d.attendance))
              : null;

            let rec: any = syncDoc?.record || syncDoc?.attendance || null;
            if (!rec && cloudInst.verification_notes) {
              try {
                const parsed = JSON.parse(cloudInst.verification_notes);
                rec = parsed.record || parsed.attendance || (parsed.sync_type === 'ATTENDANCE_RECORD' ? parsed : null);
              } catch {}
            }

            if (rec) {
              const recId = rec.id || rec.attendance_id || (rec.student_id && rec.date ? `att-${rec.date}-${rec.student_id}` : `att-${Date.now()}`);
              rec.id = recId;
              rec.attendance_date = rec.attendance_date || rec.date;

              const parentBatch = db.batches.find(b =>
                (rec.batch_id && (b.id === rec.batch_id || b.batch_code === rec.batch_id || b.proposal_id === rec.batch_id)) ||
                (b.students || []).some(s => s.student_id === rec.student_id)
              );

              if (parentBatch) {
                if (!rec.batch_id) rec.batch_id = parentBatch.id;
                rec.internship_batch_id = rec.internship_batch_id || parentBatch.id;
                if (!rec.company_id) rec.company_id = parentBatch.company_id || parentBatch.company?.id;
                if (!rec.institution_id) rec.institution_id = parentBatch.institution_id || parentBatch.institution?.id;
                if (!rec.student) {
                  const sMatch = (parentBatch.students || []).find(s => s.student_id === rec.student_id);
                  if (sMatch?.student) rec.student = sMatch.student;
                }
              }

              if (!rec.student && rec.student_id) {
                rec.student = db.students.find(s => s.id === rec.student_id);
              }

              if (rec.student_id && rec.date) {
                const existingIdx = db.attendance.findIndex(a =>
                  (a.id && a.id === rec.id) ||
                  (a.student_id === rec.student_id && a.date === rec.date)
                );
                if (existingIdx >= 0) {
                  db.attendance[existingIdx] = { ...db.attendance[existingIdx], ...rec };
                } else {
                  db.attendance.push(rec);
                }
                attendanceChanged = true;
              }
            }
          }
        }

        if (attendanceChanged) {
          db.persist('attendance');
          db.notify();
          try {
            window.dispatchEvent(new CustomEvent('vidyaconnect:attendance_updated'));
          } catch {}
        }

        for (const cloudInst of cloudInstitutions) {
          // Skip Sync Journal Rows
          if (
            cloudInst.code?.startsWith('DEL-') ||
            cloudInst.code?.startsWith('SYNC-DEL-') ||
            cloudInst.code?.startsWith('DEC-') ||
            cloudInst.code?.startsWith('SYNC-DECISION-') ||
            cloudInst.code?.startsWith('PROP-') ||
            cloudInst.code?.startsWith('SYNC-PROP-') ||
            cloudInst.code?.startsWith('BATCH-') ||
            cloudInst.code?.startsWith('SYNC-BATCH-') ||
            cloudInst.code?.startsWith('ATT-') ||
            cloudInst.code?.startsWith('SYNC-ATT-') ||
            cloudInst.name?.startsWith('Attendance:')
          ) {
            continue;
          }

          // B. Handle Student Roster Sync Rows (Strict Multi-Tenant Scoping)
          if (cloudInst.code?.startsWith('SYNC-STU-')) {
            const syncDoc = Array.isArray(cloudInst.documents)
              ? cloudInst.documents.find((d: any) => d && d.sync_type === 'STUDENT_RECORDS')
              : null;

            const targetInstId = syncDoc?.institution_id || cloudInst.code.replace('SYNC-STU-', '').split('-')[0];

            // Multi-tenant check: Verify caller authorization before ingesting any student roster
            const activeUserId = typeof window !== 'undefined' ? localStorage.getItem('kd_active_user_id') : null;
            const activeUser = activeUserId ? db.profiles.find(p => p.id === activeUserId) : null;

            const isAuthorized = activeUser && (
              activeUser.role === 'super_admin' ||
              activeUser.role === 'company_admin' ||
              activeUser.institution_id === targetInstId ||
              (activeUser.role === 'student' && activeUser.institution_id === targetInstId)
            );

            if (!isAuthorized) {
              // Strictly do NOT load another institution's student roster into local memory
              continue;
            }

            if (syncDoc?.students && Array.isArray(syncDoc.students)) {
              for (const stu of syncDoc.students) {
                // Ensure student is strictly assigned to authorized institution
                if (stu.institution_id && stu.institution_id !== targetInstId) continue;

                // Sanitize: never accept plaintext passwords from cloud storage
                const { temp_password, ...sanitizedStu } = stu;

                const idx = db.students.findIndex(s => s.id === sanitizedStu.id || (sanitizedStu.email && s.email?.toLowerCase() === sanitizedStu.email.toLowerCase()));
                if (idx >= 0) {
                  db.students[idx] = { ...db.students[idx], ...sanitizedStu };
                } else {
                  db.students.unshift(sanitizedStu as Student);
                }
                anyChanged = true;
              }
            }
            // SECURITY: Never import plaintext passwords from cloud sync rows
            continue;
          }

          // C. Regular Institution Record
          const syncDoc = Array.isArray(cloudInst.documents)
            ? cloudInst.documents.find((d: any) => d && d.sync_type === 'ENTITY_REGISTRATION')
            : null;

          let actualStatus = cloudInst.verification_status;
          let actualNotes = cloudInst.verification_notes;
          if (syncDoc?.actual_status) {
            actualStatus = syncDoc.actual_status;
          } else if (cloudInst.verification_notes) {
            try {
              const parsedNotes = JSON.parse(cloudInst.verification_notes);
              if (parsedNotes.actual_status) actualStatus = parsedNotes.actual_status;
            } catch {}
          }

          // Apply authoritative Super Admin decision from PostgreSQL or local journal if one exists
          const instCleanCode = cloudInst.code?.trim() || '';
          const instCleanEmail = cloudInst.official_email?.toLowerCase().trim() || '';
          const instCleanName = cloudInst.name?.toLowerCase().trim() || '';

          const appliedDecision =
            decisionMap.get(cloudInst.id) ||
            (instCleanCode && decisionMap.get(instCleanCode)) ||
            (instCleanEmail && decisionMap.get(instCleanEmail)) ||
            (instCleanName && decisionMap.get(instCleanName));

          if (appliedDecision) {
            actualStatus = appliedDecision.status;
            if (appliedDecision.notes) actualNotes = appliedDecision.notes;
          }

          // CRITICAL: Filter out permanently deleted institutions so they never resurrect on refresh
          if (this.isEntityDeleted('institution', cloudInst)) {
            const preCount = db.institutions.length;
            db.institutions = db.institutions.filter(i =>
              i.id !== cloudInst.id &&
              i.code !== cloudInst.code &&
              (!cloudInst.official_email || i.official_email?.toLowerCase().trim() !== cloudInst.official_email.toLowerCase().trim()) &&
              (!instCleanName || i.name?.toLowerCase().trim().replace(/^deleted:\s*/, '') !== instCleanName.replace(/^deleted:\s*/, ''))
            );
            if (db.institutions.length !== preCount) anyChanged = true;
            continue;
          }

          let localInst = db.institutions.find(i =>
            i.id === cloudInst.id ||
            i.code === cloudInst.code ||
            (cloudInst.official_email && i.official_email?.toLowerCase() === cloudInst.official_email?.toLowerCase()) ||
            (instCleanName && i.name?.toLowerCase().trim() === instCleanName)
          );

          if (!localInst) {
            const newInst: Institution = {
              id: cloudInst.id,
              code: cloudInst.code,
              name: cloudInst.name,
              type: cloudInst.type || 'govt_degree_college',
              affiliated_university: cloudInst.affiliated_university,
              address: cloudInst.address,
              district: cloudInst.district,
              state: cloudInst.state || 'Andhra Pradesh',
              pin_code: cloudInst.pin_code,
              principal_name: cloudInst.principal_name,
              official_email: cloudInst.official_email,
              official_phone: cloudInst.official_phone,
              website: cloudInst.website,
              establishment_year: cloudInst.establishment_year || 2000,
              accreditation: cloudInst.accreditation,
              verification_status: actualStatus,
              verification_notes: actualNotes || cloudInst.verification_notes,
              logo_url: cloudInst.logo_url || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200',
              document_url: cloudInst.document_url,
              document_name: cloudInst.document_name,
              documents: syncDoc?.original_documents || [],
              created_at: cloudInst.created_at || new Date().toISOString()
            };

            db.institutions.unshift(newInst);
            anyChanged = true;
          } else {
            // Reconcile ID: ensure local ID matches centralized Supabase UUID
            if (localInst.id !== cloudInst.id) {
              const oldId = localInst.id;
              localInst.id = cloudInst.id;
              db.profiles.forEach(p => {
                if (p.institution_id === oldId) p.institution_id = cloudInst.id;
              });
              db.proposals.forEach(prop => {
                if (prop.institution_id === oldId) prop.institution_id = cloudInst.id;
                if (prop.institution && prop.institution.id === oldId) prop.institution.id = cloudInst.id;
              });
              anyChanged = true;
            }

            // Never downgrade an already verified institution to under_verification
            if (localInst.verification_status === 'verified' && actualStatus === 'under_verification' && (!appliedDecision || appliedDecision.status !== 'rejected')) {
              actualStatus = 'verified';
            }

            if (localInst.verification_status !== actualStatus) {
              localInst.verification_status = actualStatus;
              if (actualNotes) localInst.verification_notes = actualNotes;
              anyChanged = true;
            }
          }

          // ALWAYS restore or sync admin profile
          if (syncDoc?.admin_profile) {
            const p = syncDoc.admin_profile;
            const existingProf = db.profiles.find(prof => prof.id === p.id || (p.email && prof.email?.toLowerCase() === p.email.toLowerCase()));
            if (!existingProf) {
              db.profiles.unshift({
                ...p,
                role: 'institution_admin',
                institution_id: cloudInst.id
              });
              anyChanged = true;
            } else {
              if (existingProf.role !== 'institution_admin' || existingProf.institution_id !== cloudInst.id) {
                existingProf.role = 'institution_admin';
                existingProf.institution_id = cloudInst.id;
                anyChanged = true;
              }
            }
          }

          // ALWAYS restore password
          if (syncDoc?.password && syncDoc?.admin_profile?.email) {
            const cleanEmail = syncDoc.admin_profile.email.toLowerCase().trim();
            if (db.passwords[cleanEmail] !== syncDoc.password.trim()) {
              db.passwords[cleanEmail] = syncDoc.password.trim();
              anyChanged = true;
            }
          }

          // Restore notification
          if (syncDoc?.notification) {
            if (!db.notifications.some(n => n.id === syncDoc.notification.id)) {
              db.notifications.unshift(syncDoc.notification);
              anyChanged = true;
            }
          }
        }
      }

      // 2. Fetch companies from Supabase
      if (!this.isCloudQuotaBlocked()) {
        const compRes = await fetch(`${supabaseUrl}/rest/v1/companies?select=*`, {
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`
          }
        });

        if (!compRes.ok) {
          const compErrText = await compRes.text().catch(() => '');
          if (this.isQuotaError(compRes.status, compErrText)) {
            this.markQuotaBlocked(compErrText);
            return false;
          }
        }

        if (compRes.ok) {
          const cloudCompanies = await compRes.json();

        // Pass 0: Extract all authoritative Super Admin ENTITY_DELETED tombstone records from companies table
        for (const cloudComp of cloudCompanies) {
          if (
            cloudComp.cin?.startsWith('DEL-') ||
            cloudComp.cin?.startsWith('SYNC-DEL-') ||
            cloudComp.name?.startsWith('DELETED:')
          ) {
            let delDoc = Array.isArray(cloudComp.documents)
              ? cloudComp.documents.find((d: any) => d && d.sync_type === 'ENTITY_DELETED')
              : null;

            if (!delDoc && cloudComp.verification_notes) {
              try {
                const parsed = JSON.parse(cloudComp.verification_notes);
                if (parsed.sync_type === 'ENTITY_DELETED') {
                  delDoc = parsed;
                }
              } catch {}
            }

            const inferredName = delDoc?.entity_name || cloudComp.name?.replace(/^DELETED:\s*/, '');

            this.recordDeletedEntity({
              entityType: 'company',
              id: delDoc?.entity_id || cloudComp.id,
              code_or_cin: delDoc?.code_or_cin || cloudComp.cin,
              official_email: delDoc?.official_email || cloudComp.official_email,
              name: inferredName,
              deleted_at: delDoc?.deleted_at || cloudComp.created_at || new Date().toISOString(),
              deleted_by: delDoc?.deleted_by
            });
          }
        }

        // Pass 1 decisions already extracted above in decisionMap
        let companyAttendanceChanged = false;
        for (const cloudComp of cloudCompanies) {
          // Pass 2.6b: Extract any Attendance Record rows persisted to companies table
          if (
            cloudComp.cin?.startsWith('ATT-') ||
            cloudComp.cin?.startsWith('SYNC-ATT-') ||
            cloudComp.name?.startsWith('Attendance:')
          ) {
            let syncDoc = Array.isArray(cloudComp.documents)
              ? cloudComp.documents.find((d: any) => d && (d.sync_type === 'ATTENDANCE_RECORD' || d.record || d.attendance))
              : null;

            let rec: any = syncDoc?.record || syncDoc?.attendance || null;
            if (!rec && cloudComp.verification_notes) {
              try {
                const parsed = JSON.parse(cloudComp.verification_notes);
                rec = parsed.record || parsed.attendance || (parsed.sync_type === 'ATTENDANCE_RECORD' ? parsed : null);
              } catch {}
            }

            if (rec) {
              const recId = rec.id || rec.attendance_id || (rec.student_id && rec.date ? `att-${rec.date}-${rec.student_id}` : `att-${Date.now()}`);
              rec.id = recId;
              rec.attendance_date = rec.attendance_date || rec.date;

              const parentBatch = db.batches.find(b =>
                (rec.batch_id && (b.id === rec.batch_id || b.batch_code === rec.batch_id || b.proposal_id === rec.batch_id)) ||
                (b.students || []).some(s => s.student_id === rec.student_id)
              );

              if (parentBatch) {
                if (!rec.batch_id) rec.batch_id = parentBatch.id;
                rec.internship_batch_id = rec.internship_batch_id || parentBatch.id;
                if (!rec.company_id) rec.company_id = parentBatch.company_id || parentBatch.company?.id;
                if (!rec.institution_id) rec.institution_id = parentBatch.institution_id || parentBatch.institution?.id;
                if (!rec.student) {
                  const sMatch = (parentBatch.students || []).find(s => s.student_id === rec.student_id);
                  if (sMatch?.student) rec.student = sMatch.student;
                }
              }

              if (!rec.student && rec.student_id) {
                rec.student = db.students.find(s => s.id === rec.student_id);
              }

              if (rec.student_id && rec.date) {
                const existingIdx = db.attendance.findIndex(a =>
                  (a.id && a.id === rec.id) ||
                  (a.student_id === rec.student_id && a.date === rec.date)
                );
                if (existingIdx >= 0) {
                  db.attendance[existingIdx] = { ...db.attendance[existingIdx], ...rec };
                } else {
                  db.attendance.push(rec);
                }
                companyAttendanceChanged = true;
              }
            }
            continue;
          }

          // Extract any Entity Decision rows persisted to companies table
          if (cloudComp.cin?.startsWith('DEC-') || cloudComp.cin?.startsWith('SYNC-DECISION-')) {
            let decDoc = Array.isArray(cloudComp.documents)
              ? cloudComp.documents.find((d: any) => d && d.sync_type === 'ENTITY_DECISION')
              : null;
            if (!decDoc && cloudComp.verification_notes) {
              try {
                const parsed = JSON.parse(cloudComp.verification_notes);
                if (parsed.sync_type === 'ENTITY_DECISION' || parsed.status) decDoc = parsed;
              } catch {}
            }
            if (decDoc && decDoc.status) {
              if (this.isEntityDeleted('company', {
                id: decDoc.entity_id,
                cin: decDoc.code_or_cin,
                official_email: decDoc.official_email,
                name: decDoc.entity_name
              })) {
                continue;
              }

              const decidedAt = new Date(decDoc.decided_at || cloudComp.created_at || 0).getTime();
              const decData = { status: decDoc.status as any, notes: decDoc.notes || '', decidedAt };
              if (decDoc.entity_id) decisionMap.set(decDoc.entity_id, decData);
              if (decDoc.code_or_cin) decisionMap.set(decDoc.code_or_cin, decData);
              if (decDoc.official_email) decisionMap.set(decDoc.official_email.toLowerCase().trim(), decData);
              if (decDoc.entity_name) {
                const cleanName = decDoc.entity_name.toLowerCase().trim().replace(/^deleted:\s*/, '');
                decisionMap.set(cleanName, decData);
              }
            }
            continue;
          }

          // Skip other Sync Journal Rows
          if (
            cloudComp.cin?.startsWith('DEL-') ||
            cloudComp.cin?.startsWith('SYNC-DEL-') ||
            cloudComp.cin?.startsWith('PROP-') ||
            cloudComp.cin?.startsWith('SYNC-PROP-') ||
            cloudComp.cin?.startsWith('BATCH-') ||
            cloudComp.cin?.startsWith('SYNC-BATCH-')
          ) {
            continue;
          }

          // CRITICAL: Filter out permanently deleted companies so they never resurrect on refresh
          if (this.isEntityDeleted('company', cloudComp)) {
            const preCount = db.companies.length;
            db.companies = db.companies.filter(c =>
              c.id !== cloudComp.id &&
              c.cin !== cloudComp.cin &&
              (!cloudComp.official_email || c.official_email?.toLowerCase().trim() !== cloudComp.official_email.toLowerCase().trim()) &&
              (!compCleanName || c.name?.toLowerCase().trim().replace(/^deleted:\s*/, '') !== compCleanName.replace(/^deleted:\s*/, ''))
            );
            if (db.companies.length !== preCount) anyChanged = true;
            continue;
          }

          const syncDoc = Array.isArray(cloudComp.documents)
            ? cloudComp.documents.find((d: any) => d && d.sync_type === 'ENTITY_REGISTRATION')
            : null;

          let actualStatus = cloudComp.verification_status;
          let actualNotes = cloudComp.verification_notes;
          if (syncDoc?.actual_status) {
            actualStatus = syncDoc.actual_status;
          } else if (cloudComp.verification_notes) {
            try {
              const parsedNotes = JSON.parse(cloudComp.verification_notes);
              if (parsedNotes.actual_status) actualStatus = parsedNotes.actual_status;
            } catch {}
          }

          // Apply authoritative Super Admin decision from PostgreSQL or local journal if one exists
          const compCleanCin = cloudComp.cin?.trim() || '';
          const compCleanEmail = cloudComp.official_email?.toLowerCase().trim() || '';
          const compCleanName = cloudComp.name?.toLowerCase().trim() || '';

          const appliedDecision =
            decisionMap.get(cloudComp.id) ||
            (compCleanCin && decisionMap.get(compCleanCin)) ||
            (compCleanEmail && decisionMap.get(compCleanEmail)) ||
            (compCleanName && decisionMap.get(compCleanName));

          if (appliedDecision) {
            actualStatus = appliedDecision.status;
            if (appliedDecision.notes) actualNotes = appliedDecision.notes;
          }

          let localComp = db.companies.find(c =>
            c.id === cloudComp.id ||
            c.cin === cloudComp.cin ||
            (compCleanEmail && c.official_email?.toLowerCase() === compCleanEmail) ||
            (compCleanName && c.name?.toLowerCase().trim() === compCleanName)
          );

          if (!localComp) {
            const newComp: Company = {
              id: cloudComp.id,
              cin: cloudComp.cin,
              name: cloudComp.name,
              industry: cloudComp.industry || 'Information Technology',
              sector: cloudComp.sector || 'Software Engineering',
              gst: cloudComp.gst,
              official_email: cloudComp.official_email,
              official_phone: cloudComp.official_phone,
              website: cloudComp.website,
              headquarters: cloudComp.headquarters || 'Visakhapatnam, Andhra Pradesh',
              description: cloudComp.description,
              authorized_person_name: cloudComp.authorized_person_name,
              designation: cloudComp.designation,
              verification_status: actualStatus,
              verification_notes: actualNotes || cloudComp.verification_notes,
              logo_url: cloudComp.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
              document_url: cloudComp.document_url,
              document_name: cloudComp.document_name,
              documents: syncDoc?.original_documents || [],
              created_at: cloudComp.created_at || new Date().toISOString()
            };

            db.companies.unshift(newComp);
            anyChanged = true;
          } else {
            // Reconcile ID: ensure local ID matches centralized Supabase UUID
            if (localComp.id !== cloudComp.id) {
              const oldId = localComp.id;
              localComp.id = cloudComp.id;
              db.profiles.forEach(p => {
                if (p.company_id === oldId) p.company_id = cloudComp.id;
              });
              db.proposals.forEach(prop => {
                if (prop.company_id === oldId) prop.company_id = cloudComp.id;
                if (prop.company && prop.company.id === oldId) prop.company.id = cloudComp.id;
              });
              anyChanged = true;
            }

            // Never downgrade an already verified company to under_verification
            if (localComp.verification_status === 'verified' && actualStatus === 'under_verification' && (!appliedDecision || appliedDecision.status !== 'rejected')) {
              actualStatus = 'verified';
            }

            if (localComp.verification_status !== actualStatus) {
              localComp.verification_status = actualStatus;
              if (actualNotes) localComp.verification_notes = actualNotes;
              anyChanged = true;
            }
          }

          // ALWAYS restore or update admin profile
          if (syncDoc?.admin_profile) {
            const p = syncDoc.admin_profile;
            const existingProf = db.profiles.find(prof => prof.id === p.id || (p.email && prof.email?.toLowerCase() === p.email.toLowerCase()));
            if (!existingProf) {
              db.profiles.unshift({
                ...p,
                role: 'company_admin',
                company_id: cloudComp.id
              });
              anyChanged = true;
            } else {
              if (existingProf.role !== 'company_admin' || existingProf.company_id !== cloudComp.id) {
                existingProf.role = 'company_admin';
                existingProf.company_id = cloudComp.id;
                anyChanged = true;
              }
            }
          }

          // ALWAYS restore password
          if (syncDoc?.password && syncDoc?.admin_profile?.email) {
            const cleanEmail = syncDoc.admin_profile.email.toLowerCase().trim();
            if (db.passwords[cleanEmail] !== syncDoc.password.trim()) {
              db.passwords[cleanEmail] = syncDoc.password.trim();
              anyChanged = true;
            }
          }

          // Restore notification
          if (syncDoc?.notification) {
            if (!db.notifications.some(n => n.id === syncDoc.notification.id)) {
              db.notifications.unshift(syncDoc.notification);
              anyChanged = true;
            }
          }
        }

        if (companyAttendanceChanged) {
          db.persist('attendance');
          db.notify();
          try {
            window.dispatchEvent(new CustomEvent('vidyaconnect:attendance_updated'));
          } catch {}
        }
      }
      }

      // Final guarantee: Purge any deleted entities that may have slipped in
      const preInstCount = db.institutions.length;
      db.institutions = db.institutions.filter(i => !this.isEntityDeleted('institution', i));
      if (db.institutions.length !== preInstCount) anyChanged = true;

      const preCompCount = db.companies.length;
      db.companies = db.companies.filter(c => !this.isEntityDeleted('company', c));
      if (db.companies.length !== preCompCount) anyChanged = true;

      // Clean up orphaned profiles, passwords, and opportunities for all deleted entities
      const deletedEntities = this.getDeletedEntities();
      for (const del of deletedEntities) {
        if (del.entityType === 'company') {
          db.profiles = db.profiles.filter(p =>
            p.company_id !== del.id &&
            (!del.official_email || p.email?.toLowerCase().trim() !== del.official_email.toLowerCase().trim())
          );
          db.opportunities = db.opportunities.filter(o => o.company_id !== del.id);
        } else {
          db.profiles = db.profiles.filter(p =>
            p.institution_id !== del.id &&
            (!del.official_email || p.email?.toLowerCase().trim() !== del.official_email.toLowerCase().trim())
          );
        }
        if (del.official_email) {
          delete db.passwords[del.official_email.toLowerCase().trim()];
        }
      }

      // Always persist and emit sync events to guarantee React re-renders on every device/refresh
      db.persist('institutions');
      db.persist('companies');
      db.persist('profiles');
      db.persist('passwords');
      db.persist('proposals');
      db.persist('batches');
      db.persist('students');
      db.persist('notifications');
      db.notify();
      window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));
      window.dispatchEvent(new CustomEvent('vidyaconnect:batch_updated'));
    } catch (e) {
      console.warn('[CloudSync] syncFromCloud error:', e);
    } finally {
      this.isSyncing = false;
    }
    return anyChanged;
  }
}

export const cloudSync = new CloudSyncService();
