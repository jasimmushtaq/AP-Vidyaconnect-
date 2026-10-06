// ============================================================================
// AP VIDYACONNECT — REALTIME NOTIFICATIONS CONSOLE & ANALYTICS PAGE
// Full-screen notification command center with filters, bulk actions, and live simulator
// ============================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Radio,
  Clock,
  ArrowUpDown,
  Send,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
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
    sendNotification,
    isConnected
  } = useNotifications();

  const { currentUser, currentRole, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'attendance' | 'mou' | 'proposal' | 'task'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customType, setCustomType] = useState('attendance_alert');

  // If user is not signed in
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 max-w-md w-full text-center shadow-xl space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 text-[#0E2350] flex items-center justify-center mx-auto shadow-2xs">
            <Bell className="w-7 h-7 text-[#F07421]" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#0E2350]">Sign In to View Notifications</h2>
            <p className="text-xs text-gray-500 mt-1">
              Please sign in to access your role-specific realtime notifications, geofence check-in alerts, and milestone updates.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Sign In Now
            </Link>
            <Link
              to="/"
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Relative Time helper
  const getRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hr ago`;
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  // Filtered Notifications
  const filteredNotifications = notifications.filter(n => {
    // 1. Tab filter
    if (activeTab === 'unread' && n.is_read) return false;
    if (activeTab === 'attendance' && !(n.type?.includes('attendance') || n.notification_type?.includes('ATTENDANCE') || n.attendance_id)) return false;
    if (activeTab === 'mou' && !n.type?.includes('mou')) return false;
    if (activeTab === 'proposal' && !n.type?.includes('proposal')) return false;
    if (activeTab === 'task' && !(n.type?.includes('task') || n.type?.includes('evaluation'))) return false;

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

  // Metrics calculation
  const totalCount = notifications.length;
  const attendanceCount = notifications.filter(n => n.type?.includes('attendance') || n.attendance_id).length;
  const mouCount = notifications.filter(n => n.type?.includes('mou')).length;
  const proposalCount = notifications.filter(n => n.type?.includes('proposal')).length;

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleBulkMarkRead = () => {
    selectedIds.forEach(id => markAsRead(id));
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => deleteNotification(id));
    setSelectedIds([]);
  };

  const handleSendCustomAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !customMessage) return;
    sendNotification(customTitle, customMessage, customType as any, '/dashboard', {
      recipientRole: currentRole || 'super_admin'
    });
    setCustomTitle('');
    setCustomMessage('');
  };

  const getCategoryBadge = (type?: string, notifType?: string) => {
    const combined = (type || notifType || '').toLowerCase();
    if (combined.includes('attendance')) {
      return {
        icon: <CalendarCheck2 className="w-4 h-4 text-emerald-600" />,
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'Attendance Geofence'
      };
    }
    if (combined.includes('mou')) {
      return {
        icon: <FileCheck2 className="w-4 h-4 text-blue-600" />,
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'MoU Agreement'
      };
    }
    if (combined.includes('proposal')) {
      return {
        icon: <Sparkles className="w-4 h-4 text-indigo-600" />,
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        label: 'Proposal'
      };
    }
    return {
      icon: <Bell className="w-4 h-4 text-[#F07421]" />,
      bg: 'bg-orange-50 text-[#F07421] border-orange-200',
      label: 'Portal Alert'
    };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-[#0E2350] rounded-xl text-white shadow-xs">
                <Bell className="w-6 h-6 text-[#F07421]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#0E2350] tracking-tight">
                  Realtime Notification Center
                </h1>
                <p className="text-xs text-gray-500 font-medium">
                  State Higher Education Live Telemetry & Event Streaming Console
                </p>
              </div>
            </div>
          </div>

          {/* Connection Status & Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Socket Status */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold shadow-2xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>{isConnected ? 'Supabase Realtime Live' : 'Local Channel Synced'}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                soundEnabled
                  ? 'bg-[#EEF2FA] text-[#0E2350] border-[#2A4E96]'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
              title={soundEnabled ? 'Mute notification sound' : 'Unmute notification sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Audio Alert On' : 'Audio Muted'}</span>
            </button>

            {/* Desktop Notification Toggle */}
            <button
              onClick={requestBrowserNotificationPermission}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors ${
                browserPermission === 'granted'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <BellRing className="w-4 h-4" />
              <span>{browserPermission === 'granted' ? 'Desktop Push Active' : 'Enable Push'}</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
            <p className="text-xs font-bold text-gray-500 uppercase">Total Notifications</p>
            <p className="text-2xl font-black text-[#0E2350] mt-1">{totalCount}</p>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Active session history</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
            <p className="text-xs font-bold text-[#FF7A00] uppercase">Unread Alerts</p>
            <p className="text-2xl font-black text-[#FF7A00] mt-1">{unreadCount}</p>
            <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
              <Bell className="w-3.5 h-3.5" />
              <span>Pending your review</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
            <p className="text-xs font-bold text-emerald-700 uppercase">Attendance Events</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{attendanceCount}</p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-1 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>GPS Geofence Verified</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
            <p className="text-xs font-bold text-blue-700 uppercase">MoU & Proposals</p>
            <p className="text-2xl font-black text-blue-700 mt-1">{mouCount + proposalCount}</p>
            <div className="flex items-center gap-1 text-[11px] text-blue-600 mt-1 font-semibold">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Institutional Records</span>
            </div>
          </div>
        </div>

        {/* Main Console Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Main: Notifications List (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter Tabs & Search */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Search Box */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications by title, student, batch, remarks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E2350]/20"
                  />
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {selectedIds.length > 0 ? (
                    <>
                      <button
                        onClick={handleBulkMarkRead}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark Read ({selectedIds.length})
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete ({selectedIds.length})
                      </button>
                    </>
                  ) : (
                    <>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="px-3 py-1.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Mark All as Read
                        </button>
                      )}
                      <button
                        onClick={clearAllRead}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Clear Read
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'bg-[#0E2350] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({totalCount})
                </button>
                <button
                  onClick={() => setActiveTab('unread')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'unread'
                      ? 'bg-[#0E2350] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'attendance'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  📍 Attendance ({attendanceCount})
                </button>
                <button
                  onClick={() => setActiveTab('mou')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'mou'
                      ? 'bg-blue-700 text-white'
                      : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  📜 MoUs ({mouCount})
                </button>
                <button
                  onClick={() => setActiveTab('proposal')}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === 'proposal'
                      ? 'bg-indigo-700 text-white'
                      : 'bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  📝 Proposals ({proposalCount})
                </button>
              </div>
            </div>

            {/* List Table Container */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              {/* Table Toolbar Header */}
              <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between text-xs font-bold text-gray-500">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={filteredNotifications.length > 0 && selectedIds.length === filteredNotifications.length}
                    onChange={handleSelectAll}
                    className="rounded text-[#0E2350] focus:ring-[#0E2350] cursor-pointer"
                  />
                  <span>Select All Shown ({filteredNotifications.length})</span>
                </div>
                <span>Sorted by Most Recent</span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100">
                {filteredNotifications.length === 0 ? (
                  <div className="py-16 px-4 text-center">
                    <div className="w-14 h-14 rounded-full bg-gray-100 mx-auto flex items-center justify-center text-gray-400 mb-3">
                      <Bell className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-[#0E2350]">No notifications matching criteria</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      All realtime notifications will stream here continuously as students check in, MoUs are executed, and proposals progress.
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => {
                    const badge = getCategoryBadge(n.type, n.notification_type);
                    const isSelected = selectedIds.includes(n.id);

                    return (
                      <div
                        key={n.id}
                        className={`p-4 transition-all flex items-start gap-3.5 group ${
                          !n.is_read
                            ? 'bg-[#EEF2FA]/50 hover:bg-[#EEF2FA]'
                            : 'hover:bg-gray-50'
                        } ${isSelected ? 'bg-indigo-50/60' : ''}`}
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(n.id)}
                          className="mt-1 rounded text-[#0E2350] focus:ring-[#0E2350] cursor-pointer"
                        />

                        {/* Category Icon */}
                        <div className="mt-0.5 p-2 rounded-xl bg-white border border-gray-200 shadow-2xs shrink-0">
                          {badge.icon}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${badge.bg}`}>
                              {badge.label}
                            </span>
                            {!n.is_read && (
                              <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                                Unread
                              </span>
                            )}
                            <span className="text-xs text-gray-400 font-medium ml-auto">
                              {getRelativeTime(n.created_at)}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-[#0E2350] leading-snug">{n.title}</h4>
                          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>

                          {/* Metadata pill details if any */}
                          {n.metadata && Object.keys(n.metadata).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                              {n.metadata.student_name && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-semibold">
                                  👤 {n.metadata.student_name}
                                </span>
                              )}
                              {n.metadata.roll_number && (
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-mono">
                                  {n.metadata.roll_number}
                                </span>
                              )}
                              {n.metadata.location && (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-semibold">
                                  📍 {n.metadata.location}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Link & Direct Buttons */}
                          <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              {!n.is_read && (
                                <button
                                  onClick={() => markAsRead(n.id)}
                                  className="text-xs text-[#2A4E96] hover:text-[#0E2350] font-bold flex items-center gap-1 transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  Mark as read
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(n.id)}
                                className="text-xs text-gray-400 hover:text-rose-600 font-medium flex items-center gap-1 transition-colors ml-2"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                              </button>
                            </div>

                            {n.link_url && (
                              <Link
                                to={n.link_url}
                                onClick={() => markAsRead(n.id)}
                                className="px-3 py-1 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-all hover:scale-102"
                              >
                                <span>Navigate to Item</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right: Realtime Event Simulator & Test Trigger Console (1 Col) */}
          <div className="space-y-4">
            {/* Live Event Simulator Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-[#F07421] to-[#FF7A00] rounded-xl text-white shadow-xs">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0E2350]">Realtime Event Simulator</h3>
                  <p className="text-[11px] text-gray-500">Test multi-channel live streaming</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                Click any scenario below to trigger instant real-time broadcasts across all open browser tabs, play synthesized audio chimes, and fire toast alerts:
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => simulateNotification('attendance')}
                  className="w-full p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                      Live Geofence Check-in
                    </span>
                    <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded font-bold">
                      Trigger
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-700 mt-1">
                    Student verified selfie & GPS location at partner office.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => simulateNotification('mou')}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <FileCheck2 className="w-4 h-4 text-blue-600" />
                      Institutional MoU Executed
                    </span>
                    <span className="text-[10px] bg-blue-200/60 text-blue-900 px-2 py-0.5 rounded font-bold">
                      Trigger
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700 mt-1">
                    Both parties signed MoU digitally with legal timestamping.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => simulateNotification('proposal')}
                  className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Proposal Status Transition
                    </span>
                    <span className="text-[10px] bg-indigo-200/60 text-indigo-900 px-2 py-0.5 rounded font-bold">
                      Trigger
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-700 mt-1">
                    Company approved student batch proposal terms and stipend.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => simulateNotification('evaluation')}
                  className="w-full p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Performance Evaluation Completed
                    </span>
                    <span className="text-[10px] bg-purple-200/60 text-purple-900 px-2 py-0.5 rounded font-bold">
                      Trigger
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-700 mt-1">
                    Industry Mentor completed mid-term performance appraisals.
                  </p>
                </button>
              </div>
            </div>

            {/* Custom Notification Dispatcher Form */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-5">
              <h3 className="text-sm font-bold text-[#0E2350] flex items-center gap-1.5 mb-3">
                <Send className="w-4 h-4 text-[#0E2350]" />
                Dispatch Custom Realtime Alert
              </h3>

              <form onSubmit={handleSendCustomAlert} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Alert Category</label>
                  <select
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E2350]"
                  >
                    <option value="attendance_alert">Attendance Geofence Alert</option>
                    <option value="mou_active">MoU Agreement Executed</option>
                    <option value="proposal_accepted">Internship Proposal Approved</option>
                    <option value="task_assigned">Internship Milestone / Task</option>
                    <option value="system_alert">System Broadcast Notice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Urgent Batch Review Required"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E2350]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">Message Body</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Enter notification message payload..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E2350]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  Broadcast Live Alert
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
