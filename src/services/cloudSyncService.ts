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
  status: 'verified' | 'under_verification' | 'rejected';
  notes?: string;
  adminName?: string;
}

class CloudSyncService {
  private channel: any = null;
  private isInitialized = false;
  private isSyncing = false;
  private syncPromise: Promise<boolean> | null = null;

  public init(): Promise<boolean> {
    if (this.isInitialized || typeof window === 'undefined') {
      return this.syncPromise || Promise.resolve(true);
    }
    this.isInitialized = true;

    // 1. Initialize Realtime WebSocket Broadcast Channel
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
        .subscribe((status: string) => {
          console.log('[CloudSync] WebSocket channel status:', status);
        });
    } catch (e) {
      console.warn('[CloudSync] Error initializing Supabase Realtime channel:', e);
    }

    // 2. Initial cloud state catch-up on load (awaited by callers)
    this.syncPromise = this.syncFromCloud();

    // 3. Periodic cloud reconciliation (every 60s when tab is active)
    setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        this.syncFromCloud();
      }
    }, 60000);

    // 4. Tab focus auto-sync: when user switches tabs or browsers, immediately check for new accounts/proposals
    window.addEventListener('focus', () => {
      this.syncFromCloud();
    });

    window.addEventListener('online', () => {
      this.syncFromCloud();
    });

    // 5. Listen to local entity decisions made in this browser to broadcast to all other browsers
    window.addEventListener('vidyaconnect:entity_decision', ((e: CustomEvent<EntityDecisionPayload>) => {
      if (e.detail) {
        this.broadcastDecision(e.detail.entityType, e.detail.id, e.detail.status, e.detail.notes, e.detail.adminName);
      }
    }) as EventListener);

    // 6. Listen to local notifications created in this browser to broadcast to all other browsers
    window.addEventListener('vidyaconnect:realtime_notification', ((e: CustomEvent<AppNotification>) => {
      if (e.detail && !(e.detail as any)._isRemote) {
        this.broadcast('NOTIFICATION_CREATED', { notification: e.detail });
      }
    }) as EventListener);

    return this.syncPromise;
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
      const inst = db.institutions.find(i => i.id === payload.id);
      if (inst && inst.verification_status !== payload.status) {
        inst.verification_status = payload.status;
        if (payload.notes) inst.verification_notes = payload.notes;
        db.persist('institutions');
        changed = true;
      }
    } else {
      const comp = db.companies.find(c => c.id === payload.id);
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
          'Prefer': 'return=minimal'
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
          'Prefer': 'return=minimal'
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

      console.log('[CloudSync] Successfully saved company to Supabase cloud database:', comp.name);
      return { success: true };
    } catch (e: any) {
      console.error('[CloudSync] Failed to persist company to Supabase cloud:', e);
      return { success: false, error: e?.message || 'Network connection failed' };
    }
  }

  public async syncProposalToCloud(proposal: InternshipProposal): Promise<{ success: boolean; error?: string }> {
    // 1. Broadcast immediately to all active browser windows & tabs
    this.broadcast('PROPOSAL_UPDATED', { proposal });

    // 2. Persist to shared Supabase PostgreSQL database
    try {
      const syncRow = {
        code: `SYNC-PROP-${proposal.id}`,
        name: `Internship Proposal Sync: ${proposal.proposal_code || proposal.id}`,
        type: 'govt_degree_college',
        affiliated_university: 'AP VidyaConnect Portal',
        address: 'State Wide Portal Sync',
        district: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        pin_code: '530001',
        principal_name: proposal.created_by_name || 'Coordinator',
        official_email: `${proposal.id}@sync.vidyaconnect.ap.gov.in`,
        official_phone: '+91 891 0000000',
        establishment_year: 2026,
        verification_status: 'verified',
        documents: [{
          sync_type: 'INTERNSHIP_PROPOSAL',
          proposal,
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
        console.warn('[CloudSync] Failed to insert proposal sync row:', res.status, errText);
        return { success: false, error: errText };
      }

      console.log('[CloudSync] Successfully saved proposal to shared Supabase database:', proposal.proposal_code);
      return { success: true };
    } catch (e: any) {
      console.warn('[CloudSync] Error syncing proposal to Supabase:', e);
      return { success: false, error: e?.message || 'Network error' };
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
      // 1. Fetch institutions & sync records from Supabase
      const instRes = await fetch(`${supabaseUrl}/rest/v1/institutions?select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      if (instRes.ok) {
        const cloudInstitutions = await instRes.json();

        for (const cloudInst of cloudInstitutions) {
          // A. Handle Proposal Sync Rows
          if (cloudInst.code?.startsWith('SYNC-PROP-')) {
            const syncDoc = Array.isArray(cloudInst.documents)
              ? cloudInst.documents.find((d: any) => d && d.sync_type === 'INTERNSHIP_PROPOSAL')
              : null;
            if (syncDoc?.proposal) {
              const p = syncDoc.proposal;
              const idx = db.proposals.findIndex(existing => existing.id === p.id || existing.proposal_code === p.proposal_code);
              if (idx >= 0) {
                const cloudTime = new Date(p.updated_at || p.created_at || 0).getTime();
                const localTime = new Date(db.proposals[idx].updated_at || db.proposals[idx].created_at || 0).getTime();
                if (cloudTime >= localTime) {
                  db.proposals[idx] = { ...db.proposals[idx], ...p };
                  anyChanged = true;
                }
              } else {
                db.proposals.unshift(p);
                anyChanged = true;
              }
            }
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
          if (syncDoc?.actual_status) {
            actualStatus = syncDoc.actual_status;
          } else if (cloudInst.verification_notes) {
            try {
              const parsedNotes = JSON.parse(cloudInst.verification_notes);
              if (parsedNotes.actual_status) actualStatus = parsedNotes.actual_status;
            } catch {}
          }

          let localInst = db.institutions.find(i => i.id === cloudInst.id || i.code === cloudInst.code || (cloudInst.official_email && i.official_email?.toLowerCase() === cloudInst.official_email?.toLowerCase()));

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
              verification_notes: cloudInst.verification_notes,
              logo_url: cloudInst.logo_url || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200',
              document_url: cloudInst.document_url,
              document_name: cloudInst.document_name,
              documents: syncDoc?.original_documents || [],
              created_at: cloudInst.created_at || new Date().toISOString()
            };

            db.institutions.unshift(newInst);
            anyChanged = true;
          } else {
            if (localInst.verification_status !== actualStatus) {
              localInst.verification_status = actualStatus;
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
              if (existingProf.role !== 'institution_admin') {
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

        for (const cloudComp of cloudCompanies) {
          const syncDoc = Array.isArray(cloudComp.documents)
            ? cloudComp.documents.find((d: any) => d && d.sync_type === 'ENTITY_REGISTRATION')
            : null;

          let actualStatus = cloudComp.verification_status;
          if (syncDoc?.actual_status) {
            actualStatus = syncDoc.actual_status;
          } else if (cloudComp.verification_notes) {
            try {
              const parsedNotes = JSON.parse(cloudComp.verification_notes);
              if (parsedNotes.actual_status) actualStatus = parsedNotes.actual_status;
            } catch {}
          }

          let localComp = db.companies.find(c => c.id === cloudComp.id || c.cin === cloudComp.cin || (cloudComp.official_email && c.official_email?.toLowerCase() === cloudComp.official_email?.toLowerCase()));

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
              verification_notes: cloudComp.verification_notes,
              logo_url: cloudComp.logo_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
              document_url: cloudComp.document_url,
              document_name: cloudComp.document_name,
              documents: syncDoc?.original_documents || [],
              created_at: cloudComp.created_at || new Date().toISOString()
            };

            db.companies.unshift(newComp);
            anyChanged = true;
          } else {
            if (localComp.verification_status !== actualStatus) {
              localComp.verification_status = actualStatus;
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
              if (existingProf.role !== 'company_admin') {
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
