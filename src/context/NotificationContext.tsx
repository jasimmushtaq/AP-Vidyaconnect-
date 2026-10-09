// ============================================================================
// AP VIDYACONNECT — REALTIME NOTIFICATION SYSTEM & CONTEXT
// Multi-channel Real-time Sync (Supabase Realtime, BroadcastChannel & Audio Engine)
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppNotification, NotificationType } from '../types/database';
import { db } from '../services/dbStore';
import { supabase } from '../services/supabaseClient';
import { useAuth } from './AuthContext';

export interface RealtimeToast {
  id: string;
  notification: AppNotification;
  createdAt: number;
  durationMs: number;
}

interface NotificationContextType {
  notifications: AppNotification[];
  allNotifications: AppNotification[];
  unreadCount: number;
  toasts: RealtimeToast[];
  soundEnabled: boolean;
  browserPermission: NotificationPermission;
  isConnected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllRead: () => void;
  dismissToast: (toastId: string) => void;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  requestBrowserNotificationPermission: () => Promise<boolean>;
  sendNotification: (
    title: string,
    message: string,
    type?: NotificationType,
    linkUrl?: string,
    options?: {
      recipientUserId?: string;
      recipientRole?: string;
      metadata?: any;
    }
  ) => AppNotification;
  simulateNotification: (category?: 'attendance' | 'mou' | 'proposal' | 'task' | 'evaluation' | 'system') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Web Audio API Gentle Two-Tone Realtime Chime
function playMelodicNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Harmonic Chord 1 (F5 / 698.46Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(698.46, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.38);

    // Harmonic Chord 2 (A5 / 880Hz or C6 / 1046.5Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1046.5, now + 0.07);
    gain2.gain.setValueAtTime(0, now + 0.07);
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.11);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.07);
    osc2.stop(now + 0.65);
  } catch (e) {
    // Audio contexts might be constrained by browser autoplay policies until user interaction
  }
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, currentRole, isAuthenticated } = useAuth();
  const [allNotifications, setAllNotifications] = useState<AppNotification[]>(() => db.notifications || []);
  const [toasts, setToasts] = useState<RealtimeToast[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vidyaconnect_notification_sound');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    try {
      localStorage.setItem('vidyaconnect_notification_sound', JSON.stringify(enabled));
    } catch {}
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled(!soundEnabledRef.current);
  }, [setSoundEnabled]);

  // Request native browser desktop push notification permission
  const requestBrowserNotificationPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      return permission === 'granted';
    } catch (err) {
      console.error('Failed to request notification permission', err);
      return false;
    }
  }, []);

  // Helper for matching user/role with strict isolation
  function nMatchesUser(
    n: AppNotification,
    uid: string,
    role?: string,
    studentId?: string
  ): boolean {
    if (!uid || !role) return false;

    // 1. If notification is assigned to a specific target user ID
    const targetUserId = n.recipient_user_id || (n.user_id !== 'system' && n.user_id !== 'admin' ? n.user_id : undefined);

    if (targetUserId) {
      // If a specific target user is set, it MUST match this user's ID or student ID
      if (targetUserId === uid || (!!studentId && targetUserId === studentId)) {
        return true;
      }
      // If it is targeted to another user (like a student or mentor), NEVER show to anyone else
      return false;
    }

    // 2. Strict Role-based Matching
    if (n.recipient_role) {
      if (role === 'super_admin') {
        return n.recipient_role === 'super_admin' || n.recipient_role === 'admin';
      }
      if (role === 'institution_admin') {
        return n.recipient_role === 'institution_admin' || n.recipient_role === 'institution';
      }
      if (role === 'faculty_coordinator') {
        return n.recipient_role === 'faculty_coordinator' || n.recipient_role === 'faculty';
      }
      if (role === 'company_admin') {
        return n.recipient_role === 'company_admin' || n.recipient_role === 'company';
      }
      if (role === 'mentor') {
        return n.recipient_role === 'mentor' || n.recipient_role === 'industry_mentor';
      }
      if (role === 'student') {
        return n.recipient_role === 'student';
      }
      return false;
    }

    // 3. Fallback for unassigned system alerts: only show to super_admin if explicitly system-level
    if (role === 'super_admin' && n.user_id === 'system' && !n.recipient_user_id && !n.recipient_role) {
      return true;
    }

    return false;
  }

  // Filter notifications strictly relevant to current user and role
  const notifications = React.useMemo(() => {
    if (!isAuthenticated || !currentUser) return [];
    return allNotifications.filter(n =>
      nMatchesUser(n, currentUser.id, currentRole, currentUser.student_id)
    );
  }, [allNotifications, currentUser, currentRole, isAuthenticated]);

  const unreadCount = React.useMemo(() => {
    if (!isAuthenticated || !currentUser) return 0;
    return notifications.filter(n => !n.is_read).length;
  }, [notifications, isAuthenticated, currentUser]);

  // Push incoming notification to toast, play sound, and native push
  const handleIncomingRealtimeNotification = useCallback((notif: AppNotification) => {
    // Strictly do not process or pop notifications if user is logged out
    if (!isAuthenticated || !currentUser) return;

    // Check if notification is strictly intended for this active user/role
    const isForMe = nMatchesUser(notif, currentUser.id, currentRole, currentUser.student_id);

    if (!isForMe) return;

    // 1. Play melodic Web Audio chime if enabled
    if (soundEnabledRef.current) {
      playMelodicNotificationChime();
    }

    // 2. Add to active interactive floating Toasts
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => {
      // Keep max 4 concurrent toasts
      const filtered = prev.filter(t => t.notification.id !== notif.id);
      return [{ id: toastId, notification: notif, createdAt: Date.now(), durationMs: 6000 }, ...filtered].slice(0, 4);
    });

    // 3. Native Browser Notification (if permission granted and tab in background)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(notif.title || 'AP VidyaConnect Alert', {
          body: notif.message,
          icon: '/brand/pixelwind-logo.png',
          badge: '/favicon.ico',
          tag: notif.id
        });
      } catch (e) {}
    }
  }, [currentUser, currentRole, isAuthenticated]);

  const dismissToast = useCallback((toastId: string) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  }, []);

  // 1. Listen to Local Database Store state updates
  useEffect(() => {
    const unsub = db.subscribe(() => {
      setAllNotifications([...db.notifications]);
    });
    return unsub;
  }, []);

  // 2. Listen to Window Custom Events
  useEffect(() => {
    const handleCustomEvent = (e: any) => {
      if (e.detail) {
        handleIncomingRealtimeNotification(e.detail);
      }
    };
    window.addEventListener('vidyaconnect:realtime_notification', handleCustomEvent);
    return () => {
      window.removeEventListener('vidyaconnect:realtime_notification', handleCustomEvent);
    };
  }, [handleIncomingRealtimeNotification]);

  // 3. Listen to Cross-tab BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
    const bc = new BroadcastChannel('ap_vidyaconnect_realtime');

    bc.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'NOTIFICATION_INSERT' && payload) {
        setAllNotifications([...db.notifications]);
        handleIncomingRealtimeNotification(payload);
      } else if (type === 'NOTIFICATION_UPDATE' || type === 'NOTIFICATION_DELETE' || type === 'NOTIFICATIONS_MARK_ALL_READ') {
        setAllNotifications([...db.notifications]);
      }
    };

    return () => {
      bc.close();
    };
  }, [handleIncomingRealtimeNotification]);

  // 4. Listen to LocalStorage updates across tabs in the same browser
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ap_vidyaconnect_v3_notifications' && e.newValue) {
        try {
          const parsed: AppNotification[] = JSON.parse(e.newValue);
          setAllNotifications(parsed);
          if (parsed.length > 0) {
            const latest = parsed[0];
            const isFresh = (Date.now() - new Date(latest.created_at).getTime()) < 10000;
            if (isFresh) {
              handleIncomingRealtimeNotification(latest);
            }
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleIncomingRealtimeNotification]);

  // 5. Listen to Supabase Realtime Channel
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('vidyaconnect-realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload: any) => {
          if (payload.new) {
            const raw = payload.new;
            const formatted: AppNotification = {
              id: raw.id,
              user_id: raw.user_id,
              recipient_user_id: raw.recipient_user_id,
              recipient_role: raw.recipient_role,
              notification_type: raw.notification_type,
              type: raw.type || 'system_alert',
              title: raw.title,
              message: raw.message,
              attendance_id: raw.attendance_id,
              link_url: raw.link_url,
              is_read: raw.is_read ?? false,
              metadata: raw.metadata || {},
              created_at: raw.created_at || new Date().toISOString()
            };

            // Avoid duplicate if already exists locally
            if (!db.notifications.some(n => n.id === formatted.id)) {
              db.notifications.unshift(formatted);
              db.persist('notifications');
            }
            handleIncomingRealtimeNotification(formatted);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications' },
        (payload: any) => {
          if (payload.new) {
            const idx = db.notifications.findIndex(n => n.id === payload.new.id);
            if (idx !== -1) {
              db.notifications[idx] = { ...db.notifications[idx], ...payload.new };
              db.persist('notifications');
            }
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setIsConnected(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [handleIncomingRealtimeNotification]);

  // Actions
  const markAsRead = useCallback((id: string) => {
    db.markNotificationRead(id);
    setAllNotifications([...db.notifications]);
  }, []);

  const markAllAsRead = useCallback(() => {
    if (!currentUser) return;
    db.markAllNotificationsRead(currentUser.id, currentRole);
    setAllNotifications([...db.notifications]);
  }, [currentUser, currentRole]);

  const deleteNotification = useCallback((id: string) => {
    db.deleteNotification(id);
    setAllNotifications([...db.notifications]);
  }, []);

  const clearAllRead = useCallback(() => {
    if (!currentUser) return;
    db.clearReadNotifications(currentUser.id, currentRole);
    setAllNotifications([...db.notifications]);
  }, [currentUser, currentRole]);

  const sendNotification = useCallback((
    title: string,
    message: string,
    type: NotificationType = 'system_alert',
    linkUrl?: string,
    options?: {
      recipientUserId?: string;
      recipientRole?: string;
      metadata?: any;
    }
  ): AppNotification => {
    const targetUserId = options?.recipientUserId || currentUser?.id || 'system';
    return db.sendNotification(targetUserId, type, title, message, linkUrl, {
      recipient_role: options?.recipientRole,
      recipient_user_id: options?.recipientUserId,
      metadata: options?.metadata
    });
  }, [currentUser]);

  // Interactive Live Simulator for Testing Realtime alerts
  const simulateNotification = useCallback((category: 'attendance' | 'mou' | 'proposal' | 'task' | 'evaluation' | 'system' = 'attendance') => {
    const studentNames = ['Hoor K.', 'Sai Teja R.', 'Ananya Deshmukh', 'Pavan Kalyan', 'Divya Sri M.'];
    const randomStudent = studentNames[Math.floor(Math.random() * studentNames.length)];
    const rollNo = `23341A05${Math.floor(10 + Math.random() * 89)}`;
    const timeNow = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    let notif: AppNotification;

    if (currentRole === 'super_admin') {
      if (category === 'mou' || category === 'proposal' || category === 'attendance') {
        notif = sendNotification(
          '🏛️ New College Registration Submitted',
          `Government Polytechnic, Vijayawada submitted registration credentials with Principal endorsement.`,
          'system_alert',
          '/admin/verifications',
          {
            recipientRole: 'super_admin',
            recipientUserId: currentUser?.id
          }
        );
      } else {
        notif = sendNotification(
          '⚡ State Gateway Status: Operational',
          `AP Higher Education State Gateway synchronized all institutional nodes at ${timeNow}.`,
          'system_alert',
          '/dashboard',
          {
            recipientRole: 'super_admin',
            recipientUserId: currentUser?.id
          }
        );
      }
      return;
    }

    switch (category) {
      case 'attendance':
        notif = sendNotification(
          '📍 Live Geofence Check-in Recorded',
          `${randomStudent} (${rollNo}) verified selfie & GPS location at Pixelwind Technology Visakhapatnam Campus (${timeNow}).`,
          'attendance_alert',
          '/attendance',
          {
            recipientRole: currentRole || 'company_admin',
            recipientUserId: currentUser?.id,
            metadata: {
              student_name: randomStudent,
              roll_number: rollNo,
              status: 'PRESENT',
              location: 'Verified (Rushikonda IT Park)'
            }
          }
        );
        break;

      case 'mou':
        notif = sendNotification(
          '📜 Dual-Signed Institutional MoU Executed',
          `MoU AP-MOU-2026-092 has been counter-signed digitally between Andhra University & TechCorp India Ltd.`,
          'mou_active',
          '/mous',
          {
            recipientRole: currentRole || 'institution_admin',
            recipientUserId: currentUser?.id
          }
        );
        break;

      case 'proposal':
        notif = sendNotification(
          '📝 Internship Proposal Approved',
          `Pixelwind Technology has formally approved proposal AP-PROP-2026-104 for 25 AI/ML Student Interns.`,
          'proposal_accepted',
          '/proposals',
          {
            recipientRole: currentRole || 'institution_admin',
            recipientUserId: currentUser?.id
          }
        );
        break;

      case 'task':
        notif = sendNotification(
          '📋 New Internship Milestone Assigned',
          `Mentor Rajesh Verma posted "Sprint 3: Realtime WebSockets & Telemetry Integration" with due date in 4 days.`,
          'task_assigned',
          '/batches',
          {
            recipientRole: currentRole || 'student',
            recipientUserId: currentUser?.id
          }
        );
        break;

      case 'evaluation':
        notif = sendNotification(
          '⭐ Mid-Term Performance Evaluation Completed',
          `Faculty Coordinator and Industry Mentor evaluated 18 students in Batch AP-BATCH-001 (Average Score: 92.4%).`,
          'evaluation_completed',
          '/evaluations',
          {
            recipientRole: currentRole || 'institution_admin',
            recipientUserId: currentUser?.id
          }
        );
        break;

      case 'system':
      default:
        notif = sendNotification(
          '⚡ System Realtime Channel Synchronized',
          `Realtime notification broadcast channel connected successfully across all active AP VidyaConnect portal sessions.`,
          'system_alert',
          '/dashboard',
          {
            recipientRole: currentRole || 'super_admin',
            recipientUserId: currentUser?.id
          }
        );
        break;
    }
  }, [currentUser, currentRole, sendNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        allNotifications,
        unreadCount,
        toasts,
        soundEnabled,
        browserPermission,
        isConnected,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllRead,
        dismissToast,
        toggleSound,
        setSoundEnabled,
        requestBrowserNotificationPermission,
        sendNotification,
        simulateNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
