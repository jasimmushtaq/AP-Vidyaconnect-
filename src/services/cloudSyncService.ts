// ============================================================================
// AP VIDYACONNECT — CLOUD SYNCHRONIZATION & REALTIME MULTI-BROWSER SERVICE
// Enables instant multi-browser cross-device sync for registrations & admin actions
// ============================================================================

import { supabase, supabaseUrl, supabaseAnonKey } from './supabaseClient';
import { db } from './dbStore';
import { Institution, Company, Profile, AppNotification, AuditLog } from '../types/database';

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

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;
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
        .subscribe((status: string) => {
          console.log('[CloudSync] WebSocket channel status:', status);
        });
    } catch (e) {
      console.warn('[CloudSync] Error initializing Supabase Realtime channel:', e);
    }

    // 2. Initial cloud state catch-up on load
    this.syncFromCloud();

    // 3. Periodic cloud reconciliation (every 20s)
    setInterval(() => {
      this.syncFromCloud();
    }, 20000);

    // 4. Tab focus auto-sync: when admin switches back to tab, immediately check for new accounts
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
  }

  // --- Real-time Handlers ---

  private handleIncomingRegistration(payload: EntityRegistrationPayload) {
    if (!payload) return;
    let updated = false;

    if (payload.entityType === 'institution' && payload.institution) {
      const inst = payload.institution;
      const exists = db.institutions.some(i => i.id === inst.id || i.code === inst.code || i.official_email?.toLowerCase() === inst.official_email?.toLowerCase());
      if (!exists) {
        db.institutions.unshift(inst);
        db.persist('institutions');
        updated = true;
      }
    } else if (payload.entityType === 'company' && payload.company) {
      const comp = payload.company;
      const exists = db.companies.some(c => c.id === comp.id || c.cin === comp.cin || c.official_email?.toLowerCase() === comp.official_email?.toLowerCase());
      if (!exists) {
        db.companies.unshift(comp);
        db.persist('companies');
        updated = true;
      }
    }

    if (payload.profile) {
      const existsProfile = db.profiles.some(p => p.id === payload.profile.id || p.email?.toLowerCase() === payload.profile.email?.toLowerCase());
      if (!existsProfile) {
        db.profiles.unshift(payload.profile);
        db.persist('profiles');
        updated = true;
      }
    }

    if (payload.password && payload.profile?.email) {
      db.passwords[payload.profile.email.toLowerCase().trim()] = payload.password.trim();
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
      // Trigger UI updates across all components
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
      window.dispatchEvent(new CustomEvent('vidyaconnect:cloud_sync_updated'));
    }
  }

  private handleIncomingNotification(notif: AppNotification) {
    if (!notif || !notif.id) return;
    const exists = db.notifications.some(n => n.id === notif.id);
    if (!exists) {
      db.notifications.unshift(notif);
      db.persist('notifications');
    }

    // Trigger local notification sound and banner toast
    try {
      window.dispatchEvent(new CustomEvent('vidyaconnect:realtime_notification', { detail: { ...notif, _isRemote: true } }));
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

  // --- Cloud Persistence Outbound Sync ---

  public async syncInstitutionRegistrationToCloud(
    inst: Institution,
    adminProfile: Profile,
    password?: string,
    auditLog?: AuditLog,
    notif?: AppNotification
  ) {
    // 1. Broadcast immediately to all active browsers
    this.broadcast('REGISTER_INSTITUTION', {
      entityType: 'institution',
      institution: inst,
      profile: adminProfile,
      password,
      auditLog,
      notification: notif
    });

    // 2. Persist to Supabase Database for future / offline browsers
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
        state: inst.state || 'Telangana',
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

      await fetch(`${supabaseUrl}/rest/v1/institutions`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(row)
      });
      console.log('[CloudSync] Successfully saved institution to Supabase cloud database:', inst.name);
    } catch (e) {
      console.warn('[CloudSync] Failed to persist institution to Supabase cloud:', e);
    }
  }

  public async syncCompanyRegistrationToCloud(
    comp: Company,
    adminProfile: Profile,
    password?: string,
    auditLog?: AuditLog,
    notif?: AppNotification
  ) {
    // 1. Broadcast immediately to all active browsers
    this.broadcast('REGISTER_COMPANY', {
      entityType: 'company',
      company: comp,
      profile: adminProfile,
      password,
      auditLog,
      notification: notif
    });

    // 2. Persist to Supabase Database for future / offline browsers
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
        headquarters: comp.headquarters || 'Hyderabad',
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

      await fetch(`${supabaseUrl}/rest/v1/companies`, {
        method: 'POST',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(row)
      });
      console.log('[CloudSync] Successfully saved company to Supabase cloud database:', comp.name);
    } catch (e) {
      console.warn('[CloudSync] Failed to persist company to Supabase cloud:', e);
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

  // --- Cloud Inbound Synchronization (Catch up from Supabase) ---

  public async syncFromCloud() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      // 1. Fetch all institutions from cloud
      const instRes = await fetch(`${supabaseUrl}/rest/v1/institutions?select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      if (instRes.ok) {
        const cloudInstitutions = await instRes.json();
        let changed = false;

        for (const cloudInst of cloudInstitutions) {
          const syncDoc = Array.isArray(cloudInst.documents)
            ? cloudInst.documents.find((d: any) => d && d.sync_type === 'ENTITY_REGISTRATION')
            : null;

          // Determine actual status
          let actualStatus = cloudInst.verification_status;
          if (syncDoc && syncDoc.actual_status) {
            actualStatus = syncDoc.actual_status;
          } else if (cloudInst.verification_notes) {
            try {
              const parsedNotes = JSON.parse(cloudInst.verification_notes);
              if (parsedNotes.actual_status) actualStatus = parsedNotes.actual_status;
            } catch {}
          }

          // Check if exists locally
          let localInst = db.institutions.find(i => i.id === cloudInst.id || i.code === cloudInst.code || i.official_email?.toLowerCase() === cloudInst.official_email?.toLowerCase());

          if (!localInst) {
            // New institution registered in another browser!
            const newInst: Institution = {
              id: cloudInst.id || `inst-${Date.now()}`,
              code: cloudInst.code,
              name: cloudInst.name,
              type: cloudInst.type || 'govt_degree_college',
              affiliated_university: cloudInst.affiliated_university,
              address: cloudInst.address,
              district: cloudInst.district,
              state: cloudInst.state || 'Telangana',
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
            db.persist('institutions');
            changed = true;

            // Restore admin profile
            if (syncDoc?.admin_profile) {
              const p = syncDoc.admin_profile;
              if (!db.profiles.some(existing => existing.id === p.id || existing.email?.toLowerCase() === p.email?.toLowerCase())) {
                db.profiles.unshift({
                  ...p,
                  institution_id: newInst.id
                });
                db.persist('profiles');
              }
            }

            // Restore password
            if (syncDoc?.password && syncDoc?.admin_profile?.email) {
              db.passwords[syncDoc.admin_profile.email.toLowerCase().trim()] = syncDoc.password.trim();
              db.persist('passwords');
            }

            // Restore super admin notification
            if (syncDoc?.notification) {
              if (!db.notifications.some(n => n.id === syncDoc.notification.id)) {
                db.notifications.unshift(syncDoc.notification);
                db.persist('notifications');
              }
            }
          }
        }

        if (changed) {
          db.syncFromStorage();
        }
      }

      // 2. Fetch all companies from cloud
      const compRes = await fetch(`${supabaseUrl}/rest/v1/companies?select=*`, {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`
        }
      });

      if (compRes.ok) {
        const cloudCompanies = await compRes.json();
        let changed = false;

        for (const cloudComp of cloudCompanies) {
          const syncDoc = Array.isArray(cloudComp.documents)
            ? cloudComp.documents.find((d: any) => d && d.sync_type === 'ENTITY_REGISTRATION')
            : null;

          let actualStatus = cloudComp.verification_status;
          if (syncDoc && syncDoc.actual_status) {
            actualStatus = syncDoc.actual_status;
          } else if (cloudComp.verification_notes) {
            try {
              const parsedNotes = JSON.parse(cloudComp.verification_notes);
              if (parsedNotes.actual_status) actualStatus = parsedNotes.actual_status;
            } catch {}
          }

          let localComp = db.companies.find(c => c.id === cloudComp.id || c.cin === cloudComp.cin || c.official_email?.toLowerCase() === cloudComp.official_email?.toLowerCase());

          if (!localComp) {
            const newComp: Company = {
              id: cloudComp.id || `comp-${Date.now()}`,
              cin: cloudComp.cin,
              name: cloudComp.name,
              industry: cloudComp.industry || 'Information Technology',
              sector: cloudComp.sector || 'Software Engineering',
              gst: cloudComp.gst,
              official_email: cloudComp.official_email,
              official_phone: cloudComp.official_phone,
              website: cloudComp.website,
              headquarters: cloudComp.headquarters || 'Hyderabad',
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
            db.persist('companies');
            changed = true;

            // Restore admin profile
            if (syncDoc?.admin_profile) {
              const p = syncDoc.admin_profile;
              if (!db.profiles.some(existing => existing.id === p.id || existing.email?.toLowerCase() === p.email?.toLowerCase())) {
                db.profiles.unshift({
                  ...p,
                  company_id: newComp.id
                });
                db.persist('profiles');
              }
            }

            // Restore password
            if (syncDoc?.password && syncDoc?.admin_profile?.email) {
              db.passwords[syncDoc.admin_profile.email.toLowerCase().trim()] = syncDoc.password.trim();
              db.persist('passwords');
            }

            // Restore notification
            if (syncDoc?.notification) {
              if (!db.notifications.some(n => n.id === syncDoc.notification.id)) {
                db.notifications.unshift(syncDoc.notification);
                db.persist('notifications');
              }
            }
          }
        }

        if (changed) {
          db.syncFromStorage();
        }
      }
    } catch (e) {
      console.warn('[CloudSync] syncFromCloud error:', e);
    } finally {
      this.isSyncing = false;
    }
  }
}

export const cloudSync = new CloudSyncService();
