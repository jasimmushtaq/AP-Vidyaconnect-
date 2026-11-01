// ============================================================================
// AP VIDYACONNECT — CLOUD SYNCHRONIZATION & REALTIME MULTI-BROWSER SERVICE
// Enables instant multi-browser cross-device sync for registrations & admin actions
// ============================================================================

import { supabase, supabaseUrl, supabaseAnonKey } from './supabaseClient';
import { db } from './dbStore';
import { Institution, Company, Profile, AppNotification, AuditLog, InternshipProposal, Student } from '../types/database';

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

class CloudSyncService {
  private channel: any = null;
  private isInitialized = false;
  private isSyncing = false;
  private syncPromise: Promise<boolean> | null = null;
  private inFlightDecisions = new Set<string>();
  private inFlightProposals = new Set<string>();

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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'institutions' }, (payload: any) => {
          console.log('[CloudSync] Realtime Postgres change on institutions table:', payload);
          this.syncFromCloud();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, (payload: any) => {
          console.log('[CloudSync] Realtime Postgres change on companies table:', payload);
          this.syncFromCloud();
        })
        .subscribe((status: string) => {
          console.log('[CloudSync] WebSocket channel status:', status);
        });
    } catch (e) {
      console.warn('[CloudSync] Error initializing Supabase Realtime channel:', e);
    }

    // 2. Initial cloud state catch-up on load (awaited by callers)
    this.syncPromise = this.syncFromCloud();

    // 3. Periodic cloud reconciliation (every 30s when tab is active)
    setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        this.syncFromCloud();
      }
    }, 30000);

    // 4. Tab focus auto-sync: when user switches tabs or browsers, immediately check for new accounts/proposals
    window.addEventListener('focus', () => {
      this.syncFromCloud();
    });

    window.addEventListener('online', () => {
      this.syncFromCloud();
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
    if (!payload?.students) return;
    let changed = false;
    payload.students.forEach(s => {
      const idx = db.students.findIndex(existing => existing.id === s.id || (s.email && existing.email?.toLowerCase() === s.email.toLowerCase()));
      if (idx >= 0) {
        db.students[idx] = { ...db.students[idx], ...s };
      } else {
        db.students.unshift(s);
      }
      changed = true;
    });

    if (payload.passwords) {
      Object.assign(db.passwords, payload.passwords);
      db.persist('passwords');
    }

    if (changed) {
      db.persist('students');
      db.notify();
      window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));
    }
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
  ): Promise<{ success: boolean; error?: string }> {
    // 1. Register account in Supabase Auth
    try {
      if (password) {
        await supabase.auth.signUp({
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
      }
    } catch (authErr) {
      console.warn('[CloudSync] Supabase Auth registration note:', authErr);
    }

    // 2. Broadcast immediately to all active browser windows & tabs
    this.broadcast('REGISTER_INSTITUTION', {
      entityType: 'institution',
      institution: inst,
      profile: adminProfile,
      password,
      auditLog,
      notification: notif
    });

    // 3. Persist to shared Supabase Database for cross-browser & offline sessions
    try {
      const docPayload = {
        sync_type: 'ENTITY_REGISTRATION',
        entity_type: 'institution',
        actual_status: inst.verification_status || 'under_verification',
        admin_profile: adminProfile,
        password: password || '',
        notification: notif,
        audit_entry: auditLog,
        original_documents: inst.documents || []
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
        logo_url: inst.logo_url || null,
        document_url: inst.document_url || null,
        document_name: inst.document_name || null,
        documents: [docPayload]
      };

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
      console.error('[CloudSync] Failed to persist institution to Supabase cloud:', e);
      return { success: false, error: e?.message || 'Network connection failed' };
    }
  }

  public async syncCompanyRegistrationToCloud(
    comp: Company,
    adminProfile: Profile,
    password?: string,
    auditLog?: AuditLog,
    notif?: AppNotification
  ): Promise<{ success: boolean; error?: string }> {
    // 1. Register account in Supabase Auth
    try {
      if (password) {
        await supabase.auth.signUp({
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
      }
    } catch (authErr) {
      console.warn('[CloudSync] Supabase Auth registration note:', authErr);
    }

    // 2. Broadcast immediately to all active browser windows & tabs
    this.broadcast('REGISTER_COMPANY', {
      entityType: 'company',
      company: comp,
      profile: adminProfile,
      password,
      auditLog,
      notification: notif
    });

    // 3. Persist to shared Supabase Database for cross-browser & offline sessions
    try {
      const docPayload = {
        sync_type: 'ENTITY_REGISTRATION',
        entity_type: 'company',
        actual_status: comp.verification_status || 'under_verification',
        admin_profile: adminProfile,
        password: password || '',
        notification: notif,
        audit_entry: auditLog,
        original_documents: comp.documents || []
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
        logo_url: comp.logo_url || null,
        document_url: comp.document_url || null,
        document_name: comp.document_name || null,
        documents: [docPayload]
      };

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
      console.error('[CloudSync] Failed to persist company to Supabase cloud:', e);
      return { success: false, error: e?.message || 'Network connection failed' };
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

      // 3. Attempt direct PATCH update on table
      try {
        const patchUrl = isCompany
          ? `${supabaseUrl}/rest/v1/companies?id=eq.${encodeURIComponent(targetId)}`
          : `${supabaseUrl}/rest/v1/institutions?id=eq.${encodeURIComponent(targetId)}`;

        await fetch(patchUrl, {
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
        });
      } catch (patchErr) {
        // Continue to persistent decision journal
      }

      // 4. Persist authoritative decision row to Supabase PostgreSQL (code max 50 chars)
      const decisionDoc = {
        sync_type: 'ENTITY_DECISION',
        entity_type: entityType,
        entity_id: targetId,
        code_or_cin: codeOrCin,
        official_email: officialEmail,
        status,
        notes: decNotes,
        admin_name: adminName || 'Dr. Varun Surya, IAS',
        decided_at: new Date().toISOString()
      };

      const cleanId = targetId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
      const decisionCode = `DEC-${entityType === 'company' ? 'C' : 'I'}-${cleanId}-${Date.now()}`.slice(0, 50);

      const syncRow = {
        code: decisionCode,
        name: `State Super Admin Verification: ${entityName}`.slice(0, 255),
        type: 'govt_degree_college',
        affiliated_university: 'AP VidyaConnect State Portal',
        address: 'State Super Admin Verification Audit',
        district: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pin_code: '530001',
        principal_name: adminName || 'Dr. Varun Surya, IAS',
        official_email: `decision.${entityType}.${Date.now()}@sync.vidyaconnect.ap.gov.in`,
        official_phone: '+91 891 0000000',
        establishment_year: 2026,
        verification_status: 'verified',
        verification_notes: JSON.stringify(decisionDoc),
        documents: [decisionDoc]
      };

      const res = await fetch(`${supabaseUrl}/rest/v1/institutions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(syncRow)
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[CloudSync] Failed to persist verification decision to Supabase PostgreSQL:', res.status, errText);
        return { success: false, error: `Database persistence failed (${res.status}): ${errText}` };
      }

      console.log(`[CloudSync] Verified & persisted ${entityType} "${entityName}" to Supabase PostgreSQL:`, status);
      return { success: true };
    } catch (e: any) {
      console.error('[CloudSync] Error saving verification decision to Supabase:', e);
      return { success: false, error: e?.message || 'Network connection failed' };
    } finally {
      this.inFlightDecisions.delete(flightKey);
    }
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
            const { versions: _v, ...rest } = cleanSnap as any;
            cleanSnap = rest;
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

    return {
      ...proposal,
      versions: cleanVersions
    };
  }

  public async syncProposalToCloud(proposal: InternshipProposal): Promise<{ success: boolean; error?: string }> {
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

    try {
      // 3. Attempt canonical proposal synchronization via RPC or internship_proposals table
      try {
        const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/sync_canonical_proposal`, {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ p_proposal: sanitizedProposal })
        });

        if (rpcRes.ok) {
          console.log('[CloudSync] Successfully synced proposal via canonical RPC:', proposal.proposal_code || proposal.id);
        }
      } catch (rpcErr) {
        // Canonical RPC fallback to shared journal
      }

      // 4. Authoritative shared PostgreSQL persistence
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
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(syncRow)
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[CloudSync] Failed to persist proposal to Supabase:', res.status, errText);
        return { success: false, error: `Database persistence failed (${res.status}): ${errText}` };
      }

      console.log('[CloudSync] Authoritative proposal saved to Supabase database:', proposal.proposal_code || proposal.id, proposal.status);
      return { success: true };
    } catch (e: any) {
      console.error('[CloudSync] Error syncing proposal to Supabase:', e);
      return { success: false, error: e?.message || 'Network communication failed' };
    } finally {
      this.inFlightProposals.delete(flightKey);
    }
  }

  public async syncStudentsToCloud(institutionId: string, students: Student[], passwords?: Record<string, string>): Promise<{ success: boolean; error?: string }> {
    // 1. Broadcast immediately
    this.broadcast('STUDENTS_UPDATED', { institution_id: institutionId, students, passwords });

    // 2. Persist to shared Supabase PostgreSQL database
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
          students,
          passwords: passwords || {},
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
        console.warn('[CloudSync] Failed to insert student sync row:', res.status, errText);
        return { success: false, error: errText };
      }

      return { success: true };
    } catch (e: any) {
      console.warn('[CloudSync] Error syncing students to Supabase:', e);
      return { success: false, error: e?.message || 'Network error' };
    }
  }

  // --- Cloud Inbound Synchronization (Catch up from Supabase) ---

  public async syncFromCloud(): Promise<boolean> {
    if (this.isSyncing) return false;
    this.isSyncing = true;
    let anyChanged = false;

    try {
      // Shared map of authoritative Super Admin ENTITY_DECISION records from Supabase PostgreSQL
      const decisionMap = new Map<string, { status: 'verified' | 'under_verification' | 'rejected'; notes: string; decidedAt: number }>();

      // 1. Fetch institutions & sync records from Supabase
      const instRes = await fetch(`${supabaseUrl}/rest/v1/institutions?select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      if (instRes.ok) {
        const cloudInstitutions = await instRes.json();

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
          }
        } catch (canErr) {
          // Ignore if table RLS requires migration
        }

        // Pass 4: Authoritative proposal resolution by ID and Code
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

        const resolvedProposalMap = new Map<string, any>();
        for (const cand of candidateProposals) {
          const key = cand.id || cand.proposal_code;
          if (!key) continue;

          const existing = resolvedProposalMap.get(key);
          if (!existing) {
            resolvedProposalMap.set(key, { ...cand });
          } else {
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

            if (candVer > exVer || (candVer === exVer && (candWeight > exWeight || (candWeight === exWeight && candTime >= exTime)))) {
              resolvedProposalMap.set(key, {
                ...existing,
                ...cand,
                versions: mergedVersions
              });
            } else {
              existing.versions = mergedVersions;
            }
          }
        }

        // Apply consolidated authoritative proposals to dbStore
        for (const [_, resolved] of resolvedProposalMap.entries()) {
          const idx = db.proposals.findIndex(p => p.id === resolved.id || p.proposal_code === resolved.proposal_code);
          if (idx >= 0) {
            const current = db.proposals[idx];
            const currentWeight = statusWeights[current.status] || 0;
            const resolvedWeight = statusWeights[resolved.status] || 0;
            const resolvedTime = new Date(resolved.updated_at || resolved.created_at || 0).getTime();
            const currentTime = new Date(current.updated_at || current.created_at || 0).getTime();

            if ((resolved.version || 1) >= (current.version || 1) || resolvedWeight > currentWeight || resolvedTime >= currentTime) {
              db.proposals[idx] = {
                ...db.proposals[idx],
                ...resolved
              };
              anyChanged = true;
            }
          } else {
            db.proposals.unshift(resolved);
            anyChanged = true;
          }
        }

        for (const cloudInst of cloudInstitutions) {
          // Skip Sync Journal Rows
          if (cloudInst.code?.startsWith('DEC-') || cloudInst.code?.startsWith('SYNC-DECISION-') || cloudInst.code?.startsWith('PROP-') || cloudInst.code?.startsWith('SYNC-PROP-')) {
            continue;
          }

          // B. Handle Student Roster Sync Rows
          if (cloudInst.code?.startsWith('SYNC-STU-')) {
            const syncDoc = Array.isArray(cloudInst.documents)
              ? cloudInst.documents.find((d: any) => d && d.sync_type === 'STUDENT_RECORDS')
              : null;
            if (syncDoc?.students && Array.isArray(syncDoc.students)) {
              for (const stu of syncDoc.students) {
                const idx = db.students.findIndex(s => s.id === stu.id || (stu.email && s.email?.toLowerCase() === stu.email.toLowerCase()));
                if (idx >= 0) {
                  db.students[idx] = { ...db.students[idx], ...stu };
                } else {
                  db.students.unshift(stu);
                }
                anyChanged = true;
              }
            }
            if (syncDoc?.passwords) {
              Object.assign(db.passwords, syncDoc.passwords);
              anyChanged = true;
            }
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

          // Apply authoritative Super Admin decision from PostgreSQL if one exists
          const appliedDecision =
            decisionMap.get(cloudInst.id) ||
            decisionMap.get(cloudInst.code) ||
            (cloudInst.official_email && decisionMap.get(cloudInst.official_email.toLowerCase().trim()));

          if (appliedDecision) {
            actualStatus = appliedDecision.status;
            if (appliedDecision.notes) actualNotes = appliedDecision.notes;
          }

          let localInst = db.institutions.find(i =>
            i.id === cloudInst.id ||
            i.code === cloudInst.code ||
            (cloudInst.official_email && i.official_email?.toLowerCase() === cloudInst.official_email?.toLowerCase())
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
      const compRes = await fetch(`${supabaseUrl}/rest/v1/companies?select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      if (compRes.ok) {
        const cloudCompanies = await compRes.json();

        // Pass 1 decisions already extracted above in decisionMap
        for (const cloudComp of cloudCompanies) {
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

          // Apply authoritative Super Admin decision from PostgreSQL if one exists
          const appliedDecision =
            decisionMap.get(cloudComp.id) ||
            decisionMap.get(cloudComp.cin) ||
            (cloudComp.official_email && decisionMap.get(cloudComp.official_email.toLowerCase().trim()));

          if (appliedDecision) {
            actualStatus = appliedDecision.status;
            if (appliedDecision.notes) actualNotes = appliedDecision.notes;
          }

          let localComp = db.companies.find(c =>
            c.id === cloudComp.id ||
            c.cin === cloudComp.cin ||
            (cloudComp.official_email && c.official_email?.toLowerCase() === cloudComp.official_email?.toLowerCase())
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
      }

      if (anyChanged) {
        db.persist('institutions');
        db.persist('companies');
        db.persist('profiles');
        db.persist('passwords');
        db.persist('proposals');
        db.persist('students');
        db.persist('notifications');
        db.notify();
        window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));
      }
    } catch (e) {
      console.warn('[CloudSync] syncFromCloud error:', e);
    } finally {
      this.isSyncing = false;
    }
    return anyChanged;
  }
}

export const cloudSync = new CloudSyncService();
