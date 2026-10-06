// ============================================================================
// AP VIDYACONNECT — IMMUTABLE AUDIT TRAIL LOGS
// ============================================================================

import React, { useState, useEffect } from 'react';
import { db } from '../../services/dbStore';
import { AuditLog } from '../../types/database';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  User,
  Clock,
  Code,
  CheckCircle2
} from 'lucide-react';

export const AuditTrailPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(db.auditLogs);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setLogs([...db.auditLogs]);
    });
    return unsub;
  }, []);

  const filteredLogs = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_type.toLowerCase().includes(search.toLowerCase()) ||
    (l.actor_name && l.actor_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#EEF2FA] text-[#0E2350] px-2.5 py-0.5 rounded text-[11px] font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2A4E96]" />
            Insert-Only Immutable Ledger
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0E2350]">
            System Audit Trail & State Logs
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Cryptographically sealed timeline of all proposal transitions, batch creations, and attendance saves.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] p-4 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action name, entity, operator..."
            className="w-full pl-10 pr-4 py-2 bg-[#F6F7F9] border border-[#E3E6EB] rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-[#E3E6EB] shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-gray-50/70 transition-colors space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#0E2350] bg-[#EEF2FA] px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="text-gray-400 font-mono text-[10px]">Entity: {log.entity_type} ({log.entity_id.slice(0, 12)}...)</span>
                </div>

                <div className="flex items-center gap-3 text-gray-500 text-[11px] font-mono">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400" />
                    {log.actor_name || 'System'} ({log.actor_role || 'admin'})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {(log.before || log.after) && (
                <div className="bg-[#F6F7F9] p-2.5 rounded border border-gray-100 font-mono text-[11px] flex flex-col sm:flex-row gap-4 overflow-x-auto">
                  {log.before && (
                    <div className="flex-1">
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">State Before:</span>
                      <pre className="text-rose-700">{JSON.stringify(log.before, null, 1)}</pre>
                    </div>
                  )}
                  {log.after && (
                    <div className="flex-1">
                      <span className="text-gray-400 text-[10px] uppercase font-bold block">State After:</span>
                      <pre className="text-emerald-700">{JSON.stringify(log.after, null, 1)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
