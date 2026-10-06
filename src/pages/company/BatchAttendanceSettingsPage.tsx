// ============================================================================
// AP VIDYACONNECT — BATCH ATTENDANCE SETTINGS MODULE
// Geofenced location, radius boundary, timing window, working days & audit trail
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useModal } from '../../context/ModalContext';
import { db } from '../../services/dbStore';
import { InternshipBatch, BatchAttendanceSettings, AttendanceAuditLog } from '../../types/database';
import { AttendanceLocationMap } from '../../components/attendance/AttendanceLocationMap';
import {
  MapPin,
  Clock,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Save,
  Compass,
  Building2,
  School,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Info,
  History,
  Sparkles,
  Sliders,
  Check,
  X,
  Radio,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const RADIUS_PRESETS = [
  { value: 50, label: '50m', desc: 'Strict Single Room / Lab' },
  { value: 100, label: '100m', desc: 'Standard Office Floor (Recommended)' },
  { value: 200, label: '200m', desc: 'Large Corporate Campus' },
  { value: 500, label: '500m', desc: 'Industrial Facility / Tech Park' }
];

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const BatchAttendanceSettingsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, currentRole } = useAuth();
  const { showAlert } = useModal();

  const [batch, setBatch] = useState<InternshipBatch | null>(null);
  const [settings, setSettings] = useState<BatchAttendanceSettings | null>(null);
  const [auditLogs, setAuditLogs] = useState<AttendanceAuditLog[]>([]);

  // Form States
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(17.686800);
  const [longitude, setLongitude] = useState<number>(83.218500);
  const [radiusMeters, setRadiusMeters] = useState<number>(100);
  const [isCustomRadius, setIsCustomRadius] = useState(false);
  const [customRadiusValue, setCustomRadiusValue] = useState<number>(150);

  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [allowLate, setAllowLate] = useState(true);
  const [lateAfterTime, setLateAfterTime] = useState('10:30');

  const [workingDays, setWorkingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [isActive, setIsActive] = useState(true);

  // Geolocation Detection State
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [detectedGpsInfo, setDetectedGpsInfo] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [locationDetectError, setLocationDetectError] = useState<string | null>(null);

  // UI States
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load batch and settings
  const loadData = () => {
    if (!id) return;
    const currentBatch = db.batches.find(b => b.id === id);
    if (currentBatch) {
      setBatch(currentBatch);
      const currentSettings = db.getBatchAttendanceSettings(currentBatch.id);
      if (currentSettings) {
        setSettings(currentSettings);
        setLocationName(currentSettings.location_name);
        setAddress(currentSettings.address);
        setLatitude(currentSettings.latitude);
        setLongitude(currentSettings.longitude);
        setRadiusMeters(currentSettings.radius_meters);
        
        const isPreset = RADIUS_PRESETS.some(p => p.value === currentSettings.radius_meters);
        setIsCustomRadius(!isPreset);
        if (!isPreset) setCustomRadiusValue(currentSettings.radius_meters);

        setStartTime(currentSettings.start_time || '09:00');
        setEndTime(currentSettings.end_time || '10:30');
        setAllowLate(currentSettings.allow_late ?? true);
        setLateAfterTime(currentSettings.late_after_time || '10:30');
        setWorkingDays(currentSettings.working_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
        setIsActive(currentSettings.is_active ?? true);
      }
      setAuditLogs(db.getAttendanceAuditLogs(currentBatch.id));
    } else {
      setBatch(null);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(loadData);
    return unsub;
  }, [id]);

  if (!batch) {
    return (
      <div className="bg-white rounded-2xl border border-[#E3E6EB] p-12 text-center text-gray-500 text-xs max-w-4xl mx-auto my-8">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
        <p className="font-bold text-[#0E2350] text-sm">Internship Batch Not Found</p>
        <p className="text-gray-400 mt-1">Please select an active batch from your Company Dashboard.</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0E2350] text-white font-bold rounded-lg text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  // Access Control: Strictly restrict geofence configuration to Company Admin
  const isCompanyAdmin = currentRole === 'company_admin';

  if (!isCompanyAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#F8FAFC]">
        <div className="bg-white rounded-3xl border border-rose-200 p-8 max-w-xl w-full text-center shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-2xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-[11px] font-black rounded-full uppercase tracking-wider mb-2">
              🔒 Access Restricted
            </span>
            <h2 className="text-xl font-extrabold text-[#0E2350]">
              Company Administrator Role Required
            </h2>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              Workplace GPS Geofence coordinates, boundary radius, shift window, and working day schedules for batch <strong>{batch.title}</strong> can strictly and exclusively be configured by an authorized <strong>Company Administrator</strong> (<code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono font-bold">company_admin</code>).
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-left text-xs space-y-1.5 text-gray-600">
            <p className="font-bold text-[#0E2350] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#2A4E96]" /> Current Active Account:
            </p>
            <p>
              Logged in as: <strong className="text-gray-800">{currentUser?.full_name}</strong> ({currentRole?.replace(/_/g, ' ')})
            </p>
            <p className="text-[11px] text-gray-500">
              Institution Admins, Faculty Mentors, and Students have view-only access to recorded attendance logs on the Attendance Register.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to={`/batches/${batch.id}`}
              className="px-5 py-2.5 bg-[#0E2350] hover:bg-[#14336F] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Batch Details
            </Link>
            <Link
              to="/attendance"
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
            >
              View Attendance Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 1. USE CURRENT LOCATION (Browser GPS)
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationDetectError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationDetectError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const accuracy = Math.round(pos.coords.accuracy);

        setLatitude(lat);
        setLongitude(lng);
        setDetectedGpsInfo({ lat, lng, accuracy });
        setIsDetectingLocation(false);

        // Attempt reverse geocoding via Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data.display_name) {
              setAddress(data.display_name);
              if (!locationName || locationName.includes('Visakhapatnam Office')) {
                const namePart = data.address?.amenity || data.address?.building || data.address?.suburb || 'Corporate Worksite';
                setLocationName(`${batch.company?.name || 'Company'} — ${namePart}`);
              }
            }
          }
        } catch (e) {
          console.warn('Reverse geocoding error:', e);
        }
      },
      (err) => {
        setIsDetectingLocation(false);
        let msg = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser settings.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        setLocationDetectError(msg);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Map Location Change callback
  const handleMapLocationChange = (newLat: number, newLng: number, newAddress?: string) => {
    setLatitude(parseFloat(newLat.toFixed(6)));
    setLongitude(parseFloat(newLng.toFixed(6)));
    if (newAddress) {
      setAddress(newAddress);
    }
  };

  // Radius selection
  const handleRadiusSelect = (r: number) => {
    setRadiusMeters(r);
    setIsCustomRadius(false);
  };

  const handleCustomRadiusChange = (val: number) => {
    setCustomRadiusValue(val);
    setRadiusMeters(val);
  };

  // Working day toggling
  const toggleWorkingDay = (day: string) => {
    if (workingDays.includes(day)) {
      if (workingDays.length === 1) {
        return; // At least one working day required
      }
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const selectWorkingDaysPreset = (preset: 'mon-fri' | 'mon-sat' | 'all') => {
    if (preset === 'mon-fri') {
      setWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    } else if (preset === 'mon-sat') {
      setWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
    } else {
      setWorkingDays([...ALL_DAYS]);
    }
  };

  // Save Settings & Validation
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (currentRole !== 'company_admin') {
      await showAlert({
        title: 'Unauthorized Action',
        message: 'Only authorized Company Administrators have permission to save or update geofence parameters.',
        type: 'danger'
      });
      return;
    }

    if (!locationName.trim()) {
      await showAlert({
        title: 'Missing Location Name',
        message: 'Please provide a clear location name for this internship attendance site.',
        type: 'danger'
      });
      return;
    }

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      await showAlert({
        title: 'Invalid Latitude',
        message: 'Latitude must be a valid number between -90 and 90 degrees.',
        type: 'danger'
      });
      return;
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      await showAlert({
        title: 'Invalid Longitude',
        message: 'Longitude must be a valid number between -180 and 180 degrees.',
        type: 'danger'
      });
      return;
    }

    if (isNaN(radiusMeters) || radiusMeters < 10 || radiusMeters > 5000) {
      await showAlert({
        title: 'Invalid Radius',
        message: 'Attendance radius must be between 10 meters and 5000 meters.',
        type: 'danger'
      });
      return;
    }

    if (!startTime || !endTime) {
      await showAlert({
        title: 'Missing Timing Window',
        message: 'Please define both Start Time and End Time for student attendance.',
        type: 'danger'
      });
      return;
    }

    if (workingDays.length === 0) {
      await showAlert({
        title: 'Select Working Days',
        message: 'Please select at least one working day for attendance tracking.',
        type: 'danger'
      });
      return;
    }

    setIsSaving(true);

    try {
      const result = db.saveBatchAttendanceSettings(
        batch.id,
        {
          location_name: locationName.trim(),
          address: address.trim() || `${batch.company?.name || 'Company Office'}, Andhra Pradesh`,
          latitude,
          longitude,
          radius_meters: radiusMeters,
          start_time: startTime,
          end_time: endTime,
          allow_late: allowLate,
          late_after_time: allowLate ? lateAfterTime : undefined,
          working_days: workingDays,
          is_active: isActive
        },
        currentUser
      );

      setSettings(result.settings);
      setAuditLogs(db.getAttendanceAuditLogs(batch.id));

      setIsSavedToast(true);
      setTimeout(() => setIsSavedToast(false), 4000);

      await showAlert({
        title: 'Attendance Settings Saved!',
        subtitle: `Configured for ${batch.batch_code}`,
        message: `Geofence radius of ${radiusMeters}m centered at ${locationName} is now ${isActive ? 'ACTIVE' : 'INACTIVE'} for all ${batch.students?.length || 0} enrolled student(s).`,
        type: 'success',
        badge: `${radiusMeters}m Geofence Active`,
        details: [
          { label: 'Location Name', value: locationName },
          { label: 'Coordinates', value: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` },
          { label: 'Time Window', value: `${startTime} – ${endTime}` },
          { label: 'Working Days', value: workingDays.map(d => d.slice(0, 3)).join(', ') },
          { label: 'Status', value: isActive ? '🟢 ACTIVE' : '🔴 INACTIVE' }
        ]
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle active status directly
  const handleToggleActiveStatus = () => {
    if (!batch) return;
    const newStatus = !isActive;
    setIsActive(newStatus);
    db.toggleBatchAttendanceStatus(batch.id, newStatus, currentUser);
    setAuditLogs(db.getAttendanceAuditLogs(batch.id));
  };

  if (!batch) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto p-12 text-center bg-white rounded-2xl border border-slate-200">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
          <MapPin className="w-8 h-8" />
        </div>
        <h3 className="text-base font-extrabold text-[#0E2350]">Batch Not Found</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          The requested internship cohort could not be found or you do not have permission to view its settings.
        </p>
        <div className="mt-6">
          <Link
            to="/batches"
            className="px-4 py-2.5 bg-[#0E2350] hover:bg-[#163673] text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Back to Batches
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          <Link to="/dashboard" className="hover:text-[#0E2350] transition-colors">
            Company Dashboard
          </Link>
          <span>/</span>
          <Link to={`/batches/${batch.id}`} className="hover:text-[#0E2350] transition-colors font-mono">
            {batch.batch_code}
          </Link>
          <span>/</span>
          <span className="text-[#F07421] font-bold">Attendance Settings</span>
        </div>

        <Link
          to={`/batches/${batch.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E3E6EB] hover:bg-gray-50 text-[#0E2350] text-xs font-bold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Batch Details
        </Link>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#FFF3EA] text-[#F07421] text-[10px] font-extrabold tracking-wider uppercase font-mono">
              BATCH GEOFENCING PROTOCOL
            </span>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 ${
              isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              {isActive ? 'Attendance Active' : 'Attendance Inactive'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0E2350] flex items-center gap-2">
            <span>📍 Attendance Settings</span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            Configure the authorized location and schedule where students can mark their internship attendance.
          </p>
        </div>

        {/* Batch Metadata Pill */}
        <div className="bg-[#F6F7F9] p-4 rounded-xl border border-[#E3E6EB] text-xs space-y-1.5 shrink-0 z-10 md:min-w-[260px]">
          <div className="flex items-center justify-between font-mono font-bold text-[#0E2350] text-[11px] pb-1 border-b border-gray-200">
            <span>{batch.batch_code}</span>
            <span className="text-gray-500 font-normal">{batch.mode.toUpperCase()}</span>
          </div>
          <p className="font-bold text-[#0E2350] truncate">{batch.title}</p>
          <p className="text-[11px] text-gray-500 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-[#F07421]" />
            {batch.company?.name}
          </p>
          <p className="text-[11px] text-gray-500 flex items-center gap-1">
            <School className="w-3 h-3 text-[#2A4E96]" />
            {batch.institution?.name}
          </p>
        </div>

        {/* Background decorative glow */}
        <div className="absolute right-0 top-0 w-64 h-64 bg-gradient-to-br from-[#FFF3EA] to-transparent rounded-full -translate-y-24 translate-x-24 pointer-events-none opacity-70" />
      </div>

      {/* Success Notification Toast */}
      {isSavedToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Attendance settings saved successfully.</span>
        </div>
      )}

      {/* Active Configuration Overview Card (Section 11) */}
      <div className="bg-gradient-to-r from-[#0E2350] to-[#14336F] rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#F07421]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Current Attendance Configuration</h3>
              <p className="text-[11px] text-gray-300">Live verified boundary enforcement for this cohort</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleActiveStatus}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
                isActive
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isActive ? (
                <>
                  <X className="w-3.5 h-3.5" /> Deactivate Attendance
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> Activate Attendance
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <span className="text-[10px] text-gray-300 uppercase font-bold block">📍 Location</span>
            <p className="font-extrabold text-white mt-1 truncate">{locationName || 'Visakhapatnam Office'}</p>
            <p className="text-[10px] text-gray-300 font-mono mt-0.5 truncate">{latitude.toFixed(4)}, {longitude.toFixed(4)}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <span className="text-[10px] text-gray-300 uppercase font-bold block">📏 Radius Boundary</span>
            <p className="font-extrabold text-[#FDE047] mt-1 text-sm">{radiusMeters} Meters</p>
            <p className="text-[10px] text-gray-300 mt-0.5">GPS Geofence Zone</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <span className="text-[10px] text-gray-300 uppercase font-bold block">🕘 Active Timing</span>
            <p className="font-extrabold text-white mt-1">{startTime} – {endTime}</p>
            <p className="text-[10px] text-gray-300 mt-0.5">{allowLate ? `Late after ${lateAfterTime}` : 'Strict cutoff'}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
            <span className="text-[10px] text-gray-300 uppercase font-bold block">📅 Working Days</span>
            <p className="font-extrabold text-white mt-1 truncate">
              {workingDays.length === 7 ? 'All 7 Days' : workingDays.length === 5 ? 'Mon – Fri' : `${workingDays.length} Days / Wk`}
            </p>
            <p className="text-[10px] text-gray-300 mt-0.5 truncate">{workingDays.map(d => d.slice(0, 3)).join(', ')}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-gray-300 uppercase font-bold block">🟢 System Status</span>
            <p className={`font-extrabold mt-1 ${isActive ? 'text-emerald-300' : 'text-rose-300'}`}>
              {isActive ? 'ACTIVE & ENFORCED' : 'INACTIVE'}
            </p>
            <p className="text-[10px] text-gray-300 mt-0.5">
              {isActive ? 'Students can verify' : 'Unavailable for students'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Form Grid */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* SECTION 1: ATTENDANCE LOCATION & MAP (Sections 2, 3, 4, 5, 9) */}
        <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#FFF3EA] text-[#F07421] font-extrabold text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-[#0E2350]">
                  Internship Attendance Location
                </h2>
              </div>
              <p className="text-xs text-gray-500 mt-1 pl-8">
                Designate the physical office, campus, or facility where enrolled interns must be present to mark attendance.
              </p>
            </div>

            {/* Quick Action Button: 📍 Use Current Location */}
            <div className="flex items-center gap-2 pl-8 sm:pl-0">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetectingLocation}
                className="px-4 py-2 rounded-xl bg-[#FFF3EA] hover:bg-[#ffe3d1] border border-[#F07421]/40 text-[#F07421] font-bold text-xs shadow-2xs transition-all flex items-center gap-2"
              >
                {isDetectingLocation ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#F07421] border-t-transparent rounded-full animate-spin" />
                    Detecting GPS...
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 text-[#F07421]" />
                    📍 Use Current Location
                  </>
                )}
              </button>
            </div>
          </div>

          {/* GPS Detected Confirmation Card (Section 3) */}
          {detectedGpsInfo && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Current Location Detected</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  GPS Accuracy: ±{detectedGpsInfo.accuracy || 15}m
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-gray-700 text-[11px]">
                <div>Latitude: <strong className="text-[#0E2350]">{detectedGpsInfo.lat}</strong></div>
                <div>Longitude: <strong className="text-[#0E2350]">{detectedGpsInfo.lng}</strong></div>
                <div className="col-span-2 sm:col-span-1 text-emerald-800 font-sans text-[11px]">
                  ✓ Pin placed on map for your review
                </div>
              </div>
            </div>
          )}

          {locationDetectError && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{locationDetectError}</span>
            </div>
          )}

          {/* Form Fields: Location Name & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0E2350] uppercase tracking-wider mb-1.5">
                Location Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pixelwind Technology — Visakhapatnam Office"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F6F7F9] border border-[#E3E6EB] rounded-xl text-xs font-semibold text-[#0E2350] focus:ring-2 focus:ring-[#F07421] focus:bg-white transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Visible to students on their attendance check-in screen.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0E2350] uppercase tracking-wider mb-1.5">
                Physical Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rushikonda IT Park, Visakhapatnam, Andhra Pradesh"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F6F7F9] border border-[#E3E6EB] rounded-xl text-xs font-semibold text-[#0E2350] focus:ring-2 focus:ring-[#F07421] focus:bg-white transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Auto-updated when you search or drag the map pin.
              </p>
            </div>
          </div>

          {/* Coordinates Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Latitude (GPS) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.000001"
                required
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-[#0E2350] focus:ring-2 focus:ring-[#F07421]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                Longitude (GPS) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.000001"
                required
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-[#0E2350] focus:ring-2 focus:ring-[#F07421]"
              />
            </div>
          </div>

          {/* Section 4: 🗺️ Pick on Map Interactive Component */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0E2350] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#F07421]" />
                Interactive Attendance Map & Geofence Preview
              </label>
              <span className="text-[11px] text-gray-500">
                Drag marker to pinpoint exact entry gate / building
              </span>
            </div>

            <AttendanceLocationMap
              latitude={latitude}
              longitude={longitude}
              radiusMeters={radiusMeters}
              locationName={locationName}
              onLocationChange={handleMapLocationChange}
            />
          </div>

          {/* SECTION 5: ALLOWED ATTENDANCE RADIUS */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="text-xs font-bold text-[#0E2350] uppercase tracking-wider flex items-center gap-1.5">
                  <span>📏 Allowed Attendance Radius</span>
                </label>
                <p className="text-xs text-gray-500 mt-0.5">
                  Only students within this physical radius from the pinned coordinates can successfully mark attendance.
                </p>
              </div>
              <span className="text-xs font-extrabold text-[#F07421] bg-[#FFF3EA] px-3 py-1 rounded-lg border border-[#F07421]/20 font-mono self-start sm:self-auto">
                Current Radius: {radiusMeters}m
              </span>
            </div>

            {/* Radius Preset Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {RADIUS_PRESETS.map((preset) => {
                const isSelected = !isCustomRadius && radiusMeters === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleRadiusSelect(preset.value)}
                    className={`p-3.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-[#EEF2FA] border-[#2A4E96] text-[#0E2350] ring-2 ring-[#2A4E96]/20 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-extrabold font-mono">{preset.label}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#2A4E96]" />}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 leading-snug">{preset.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Custom Radius Input Option */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsCustomRadius(true);
                  setRadiusMeters(customRadiusValue);
                }}
                className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                  isCustomRadius
                    ? 'bg-[#FFF3EA] border-[#F07421] text-[#F07421] ring-2 ring-[#F07421]/20'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                ⚙️ Custom Radius (Meters)
              </button>

              {isCustomRadius && (
                <div className="flex items-center gap-2 animate-in fade-in">
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    step={10}
                    value={customRadiusValue}
                    onChange={(e) => handleCustomRadiusChange(Number(e.target.value))}
                    className="w-28 px-3 py-1.5 bg-white border border-orange-300 rounded-lg text-xs font-mono font-bold text-[#0E2350] focus:ring-2 focus:ring-[#F07421]"
                  />
                  <span className="text-xs text-gray-500 font-semibold">meters (10m to 5,000m)</span>
                </div>
              )}
            </div>

            {/* Visual Geofence Boundary Explanation Card */}
            <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-4 text-xs text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
              <div className="space-y-1">
                <div className="font-bold text-[#0E2350] flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#2A4E96]" />
                  How Geofence Verification Works
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  When a student taps "Check-in", their live GPS coordinates are verified against your <strong>{radiusMeters}m</strong> boundary. Students outside the perimeter cannot complete facial verification.
                </p>
              </div>

              <div className="flex items-center gap-4 text-[11px] font-bold font-mono bg-white px-3 py-2 rounded-lg border border-gray-200 shrink-0">
                <span className="text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Inside: Allowed
                </span>
                <span className="text-rose-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Outside: Blocked
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: ATTENDANCE TIMING & WORKING DAYS (Sections 6, 7) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 6: Attendance Timing */}
          <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-[#FFF3EA] text-[#F07421] font-extrabold text-xs flex items-center justify-center">
                2
              </span>
              <div>
                <h3 className="text-base font-extrabold text-[#0E2350]">
                  Attendance Timing Window
                </h3>
                <p className="text-xs text-gray-500">
                  Allowed daily check-in hours for interns
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  Start Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-gray-300 rounded-lg text-xs font-bold text-[#0E2350] focus:ring-2 focus:ring-[#F07421]"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">Standard Check-In Opening</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  End Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F6F7F9] border border-gray-300 rounded-lg text-xs font-bold text-[#0E2350] focus:ring-2 focus:ring-[#F07421]"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">Standard Window Closes</span>
              </div>
            </div>

            {/* Allow Late Attendance Toggle */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#0E2350] block">Allow Late Attendance</span>
                  <span className="text-[11px] text-gray-500">Permit check-ins after standard end time with a LATE flag</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowLate(!allowLate)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    allowLate ? 'bg-[#F07421]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      allowLate ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {allowLate && (
                <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between gap-3 animate-in fade-in">
                  <span className="text-xs text-gray-600 font-semibold">Mark check-in as LATE after:</span>
                  <input
                    type="time"
                    value={lateAfterTime}
                    onChange={(e) => setLateAfterTime(e.target.value)}
                    className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-mono font-bold text-[#0E2350]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 7: Working Days */}
          <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#FFF3EA] text-[#F07421] font-extrabold text-xs flex items-center justify-center">
                  3
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-[#0E2350]">
                    Authorized Working Days
                  </h3>
                  <p className="text-xs text-gray-500">
                    Only selected days will permit attendance check-ins
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase">Quick Presets:</span>
              <button
                type="button"
                onClick={() => selectWorkingDaysPreset('mon-fri')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#EEF2FA] text-[#0E2350] hover:bg-[#dfe8f7] transition-colors"
              >
                Mon–Fri
              </button>
              <button
                type="button"
                onClick={() => selectWorkingDaysPreset('mon-sat')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#EEF2FA] text-[#0E2350] hover:bg-[#dfe8f7] transition-colors"
              >
                Mon–Sat
              </button>
              <button
                type="button"
                onClick={() => selectWorkingDaysPreset('all')}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#EEF2FA] text-[#0E2350] hover:bg-[#dfe8f7] transition-colors"
              >
                All 7 Days
              </button>
            </div>

            {/* Selectable Days Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-1">
              {ALL_DAYS.map((day) => {
                const isSelected = workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWorkingDay(day)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#EAF6EE] border-[#1C8A3C] text-[#1C8A3C] font-extrabold shadow-2xs'
                        : 'bg-white border-gray-200 text-gray-400 font-medium hover:border-gray-300'
                    }`}
                  >
                    <span className="text-xs">{day.slice(0, 3)}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1C8A3C]" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-300" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-gray-500 pt-1">
              Active schedule: <strong>{workingDays.join(', ')}</strong> ({workingDays.length} days / week).
            </p>
          </div>
        </div>

        {/* SECTION 8 & 10: ATTENDANCE STATUS TOGGLE & SAVE BUTTON */}
        <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#FFF3EA] text-[#F07421] font-extrabold text-xs flex items-center justify-center">
                  4
                </span>
                <h3 className="text-base font-extrabold text-[#0E2350]">
                  Batch Attendance Activation State
                </h3>
              </div>
              <p className="text-xs text-gray-500 mt-1 pl-8">
                Master switch to enable or disable student self-attendance for this specific cohort.
              </p>
            </div>

            <div className="flex items-center gap-3 pl-8 sm:pl-0">
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 shadow-2xs ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-300'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                {isActive ? '🟢 Attendance Active' : '🔴 Attendance Inactive'}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#F6F7F9] border border-gray-200 text-xs text-gray-600 flex items-start gap-3">
            <Info className="w-5 h-5 text-[#2A4E96] shrink-0 mt-0.5" />
            <div>
              {isActive ? (
                <p>
                  <strong>Students are authorized:</strong> When active, enrolled interns in {batch.batch_code} can launch the attendance portal, complete GPS distance validation, and mark daily attendance.
                </p>
              ) : (
                <p>
                  <strong>Attendance is suspended:</strong> Students will see: <em>"Attendance is currently unavailable for this internship batch."</em>
                </p>
              )}
            </div>
          </div>

          {/* Bottom Save Settings CTA (Section 10) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-gray-500">
              Changes will be recorded in the official immutable audit trail.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to={`/batches/${batch.id}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs transition-colors text-center"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-[#0E2350] hover:bg-[#14336F] text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#F07421]" />
                    <span>Save Attendance Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* SECTION 13: AUDIT TRAIL COLLAPSIBLE CARD */}
      <div className="bg-white rounded-2xl border border-[#E3E6EB] p-6 shadow-sm space-y-4">
        <button
          type="button"
          onClick={() => setShowAuditHistory(!showAuditHistory)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-[#2A4E96]" />
            <div>
              <h3 className="font-extrabold text-[#0E2350] text-sm">Attendance Settings Audit Trail</h3>
              <p className="text-[11px] text-gray-500">Immutable ledger of coordinates, radius & timing updates</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#2A4E96]">
            <span>{auditLogs.length} Logged Action(s)</span>
            {showAuditHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showAuditHistory && (
          <div className="pt-3 border-t border-gray-100 space-y-2 animate-in fade-in">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No previous configuration modifications logged.</p>
            ) : (
              <div className="divide-y divide-gray-100 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-[#0E2350] uppercase text-[11px] tracking-wider bg-[#EEF2FA] px-2 py-0.5 rounded font-mono">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <p className="text-xs text-gray-700 mt-1 font-medium">
                        Modified by <strong>{log.coordinator_name || 'Company Coordinator'}</strong>
                      </p>
                    </div>

                    <div className="text-right text-[11px] text-gray-500 font-mono">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
