// ============================================================================
// AP VIDYACONNECT — REALTIME NOTIFICATION DROPDOWN MENU
// Interactive notification center in header with search, filters, sound toggles, and live simulator
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Trash2,
  Volume2,
  VolumeX,
  Search,
  ExternalLink,
  Sparkles,
  CalendarCheck2,
  FileCheck2,
  Award,
  Layers,
  ShieldCheck,
  Filter,
  Play,
  Settings,
  ChevronRight,
  X
} from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    soundEnabled,
    toggleSound,
    browserPermission,
    requestBrowserNotificationPermission,
    simulateNotification,
    isConnected
  } = useNotifications();

  const { currentUser, currentRole, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // If user is logged out, never render notification dropdown bell
  if (!isAuthenticated || !currentUser) {
    return null;
  }
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'attendance' | 'mou_proposal' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSimulator, setShowSimulator] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Relative Time helper
  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Filtered Notifications
  const filteredNotifications = notifications.filter(n => {
    // 1. Tab filter
    if (activeTab === 'unread' && n.is_read) return false;
    if (activeTab === 'attendance') {
      const isAtt = n.type?.includes('attendance') || n.notification_type?.includes('ATTENDANCE') || n.attendance_id;
      if (!isAtt) return false;
    }
    if (activeTab === 'mou_proposal') {
      const isMouOrProp = n.type?.includes('mou') || n.type?.includes('proposal');
      if (!isMouOrProp) return false;
    }
    if (activeTab === 'system') {
      const isSystem = n.type?.includes('task') || n.type?.includes('evaluation') || n.type?.includes('certificate') || n.type?.includes('system');
      if (!isSystem) return false;
    }

    // 2. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchMsg = n.message?.toLowerCase().includes(q);
      const matchType = n.type?.toLowerCase().includes(q);
      return matchTitle || matchMsg || matchType;
    }

    return true;
  });

  const getCategoryIcon = (type?: string, notifType?: string) => {
    const combined = (type || notifType || '').toLowerCase();
    if (combined.includes('attendance')) {
      return {
        icon: <CalendarCheck2 className="w-4 h-4 text-emerald-600" />,
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        label: 'Attendance'
      };
    }
    if (combined.includes('mou')) {
      return {
        icon: <FileCheck2 className="w-4 h-4 text-blue-600" />,
        bg: 'bg-blue-50 border-blue-200 text-blue-700',
        label: 'MoU Agreement'
      };
    }
    if (combined.includes('proposal')) {
      return {
        icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
        bg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
        label: 'Proposal'
      };
    }
    if (combined.includes('certificate')) {
      return {
        icon: <Award className="w-4 h-4 text-purple-600" />,
        bg: 'bg-purple-50 border-purple-200 text-purple-700',
        label: 'Certificate'
      };
    }
    return {
      icon: <Bell className="w-4 h-4 text-[#F07421]" />,
      bg: 'bg-orange-50 border-orange-200 text-[#F07421]',
      label: 'Portal Alert'
    };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-600 hover:text-[#0B2A5B] hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B2A5B]/20"
        title="Realtime Notifications Center"
        aria-label="Realtime Notifications"
      >
        <Bell className="w-5 h-5 text-[#0B2A5B]" />
        
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-[#FF7A00] text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Realtime Notification Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[340px] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200/90 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden flex flex-col max-h-[580px]">
          {/* Header Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#0E2350] to-[#14336F] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Bell className="w-4 h-4 text-[#F07421]" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                  Realtime Notifications
                  {unreadCount > 0 && (
                    <span className="bg-[#FF7A00] text-white text-[10px] font-black px-2 py-0.2 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-300 font-medium">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span>{isConnected ? 'Supabase Realtime & WebSockets Live' : 'Offline / Local Sync'}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-1">
              {/* Sound toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className={`p-1.5 rounded-lg transition-colors ${
                  soundEnabled ? 'text-white hover:bg-white/10' : 'text-gray-400 hover:bg-white/10'
                }`}
                title={soundEnabled ? 'Notification Sound Enabled (Click to Mute)' : 'Notification Sound Muted (Click to Unmute)'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Browser Push Permission Toggle */}
              {browserPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={requestBrowserNotificationPermission}
                  className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
                  title="Enable Desktop Browser Push Notifications"
                >
                  <BellRing className="w-4 h-4 text-amber-400" />
                </button>
              )}

              {/* Mark All Read */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] text-[#93C5FD] hover:text-white font-bold ml-1 hover:underline flex items-center gap-0.5"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Read all
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-2.5 bg-gray-50 border-b border-gray-100 space-y-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts, batches, students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-gray-200 rounded-lg text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B2A5B] focus:border-[#0B2A5B]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar text-[11px] font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'all'
                    ? 'bg-[#0E2350] text-white shadow-2xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'unread'
                    ? 'bg-[#0E2350] text-white shadow-2xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'attendance'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                📍 Attendance
              </button>
              <button
                onClick={() => setActiveTab('mou_proposal')}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'mou_proposal'
                    ? 'bg-blue-700 text-white shadow-2xs'
                    : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                📜 MoU & Proposals
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'system'
                    ? 'bg-purple-700 text-white shadow-2xs'
                    : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
                }`}
              >
                ⚡ Tasks
              </button>
            </div>
          </div>

          {/* Notifications Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[320px]">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 mx-auto flex items-center justify-center text-gray-400 mb-2">
                  <Bell className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-700">No notifications found</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {searchQuery ? 'Try matching another search query' : 'You are all caught up! Real-time alerts will appear here.'}
                </p>
              </div>
            ) : (
              filteredNotifications.slice(0, 15).map((n) => {
                const category = getCategoryIcon(n.type, n.notification_type);
                return (
                  <div
                    key={n.id}
                    className={`p-3.5 transition-colors relative group ${
                      !n.is_read ? 'bg-[#EEF2FA]/60 hover:bg-[#EEF2FA]' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Top line: Badge + Time + Read Dot */}
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${category.bg}`}>
                          {category.label}
                        </span>
                        {!n.is_read && (
                          <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" title="Unread" />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 font-medium shrink-0">
                          {getRelativeTime(n.created_at)}
                        </span>

                        {/* Hover Action: Mark Read / Delete */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          {!n.is_read && (
                            <button
                              onClick={() => markAsRead(n.id)}
                              className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-emerald-700"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(n.id)}
                            className="p-1 rounded hover:bg-rose-100 text-gray-400 hover:text-rose-600"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Title & Message */}
                    <h5 className="text-xs font-bold text-[#0E2350] leading-snug">{n.title}</h5>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">{n.message}</p>

                    {/* Action link if available */}
                    {n.link_url && (
                      <div className="mt-2.5 pt-2 border-t border-gray-200/50 flex items-center justify-between">
                        {n.metadata?.status && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {n.metadata.status} Check-in Verified
                          </span>
                        )}
                        <Link
                          to={n.link_url}
                          onClick={() => {
                            markAsRead(n.id);
                            setIsOpen(false);
                          }}
                          className="ml-auto px-2.5 py-1 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-all hover:scale-102"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Realtime Live Simulator Accordion for Instant Verification */}
          <div className="border-t border-gray-100 bg-gray-50/80 p-2.5">
            <button
              type="button"
              onClick={() => setShowSimulator(!showSimulator)}
              className="w-full flex items-center justify-between text-[11px] font-bold text-gray-600 hover:text-[#0E2350] transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-[#F07421]" />
                Simulate Realtime Event Trigger
              </span>
              <span className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-semibold">
                {showSimulator ? 'Hide' : 'Test Live'}
              </span>
            </button>

            {showSimulator && (
              <div className="mt-2 pt-2 border-t border-gray-200 grid grid-cols-2 gap-1.5 text-[11px] animate-in fade-in duration-200">
                {currentRole === 'super_admin' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => simulateNotification('system')}
                      className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-left font-bold transition-all flex items-center gap-1"
                    >
                      <span>🏛️ College Reg Submitted</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateNotification('system')}
                      className="px-2 py-1.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 rounded-lg text-left font-bold transition-all flex items-center gap-1"
                    >
                      <span>⚡ State Gateway Status</span>
                    </button>
                  </>
                ) : currentRole === 'student' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => simulateNotification('task')}
                      className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-left font-bold transition-all flex items-center gap-1"
                    >
                      <span>📋 Task Assigned</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateNotification('attendance')}
                      className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-left font-bold transition-all flex items-center gap-1"
                    >
                      <span>📍 Check-in Verified</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => simulateNotification('attendance')}
                      className="px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-lg text-left font-bold transition-all flex items-center gap-1"
                    >
                      <span>📍 Student Check-in</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateNotification('mou')}
                      className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-left font-bold transition-all flex items-center gap-1"
                    >
                      <span>📜 MoU Dual-Signed</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateNotification('proposal')}
                      className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-lg text-left font-bold transition-all flex items-center gap-1"
                    >
                      <span>📝 Proposal Status</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => simulateNotification('task')}
                      className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-left font-bold transition-all flex items-center gap-1"
                    >
                      <span>📋 Task / Batch Alert</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-white border-t border-gray-200 flex items-center justify-between text-xs">
            <button
              onClick={clearAllRead}
              className="text-[11px] text-gray-500 hover:text-rose-600 font-semibold transition-colors"
            >
              Clear read items
            </button>

            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-[#2A4E96] hover:text-[#0E2350] hover:underline flex items-center gap-1"
            >
              <span>Full Notification Console</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
