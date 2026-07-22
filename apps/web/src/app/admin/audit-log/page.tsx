"use client";

import React, { useState } from "react";

interface AuditLogItem {
  id: string;
  actor_user_id: string;
  action: string;
  target_type: string;
  target_id: string;
  diff: any;
  created_at: string;
}

const mockAuditLogs: AuditLogItem[] = [
  {
    id: "log-1",
    actor_user_id: "admin@framepro.com",
    action: "product.created",
    target_type: "frame_profiles",
    target_id: "FP-GOLD-804",
    diff: { sku: "FP-GOLD-804", wholesale_price_cents: 1800, retail_price_cents: 3500 },
    created_at: "2026-07-22T08:15:00Z",
  },
  {
    id: "log-2",
    actor_user_id: "sales@framepro.com",
    action: "crm.lead_updated",
    target_type: "leads",
    target_id: "lead-1",
    diff: { status: { old: "new", new: "contacted" }, follow_up_at: { old: null, new: "2026-07-25" } },

    created_at: "2026-07-22T07:45:00Z",
  },
  {
    id: "log-3",
    actor_user_id: "admin@framepro.com",
    action: "product.bulk_import",
    target_type: "frame_profiles",
    target_id: "bulk-tx-92",
    diff: { committed_count: 15, creates: 12, updates: 3 },
    created_at: "2026-07-22T06:30:00Z",
  },
  {
    id: "log-4",
    actor_user_id: "system.worker",
    action: "analytics.rollup",
    target_type: "product_view_daily",
    target_id: "rollup-2026-07-21",
    diff: { processed_rows: 48, total_views: 9240 },
    created_at: "2026-07-22T02:00:00Z",
  },
];

export default function AdminAuditLogPage() {
  const [logs] = useState<AuditLogItem[]>(mockAuditLogs);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Action Audit Log</h1>
          <p className="text-sm text-slate-400 mt-1">
            Immutable audit record of all mutation operations, bulk commits, and CRM updates.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Actor</th>
                <th className="py-3.5 px-4 font-semibold">Target Type & ID</th>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold text-center">Diff Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded text-[11px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200 font-medium">{log.actor_user_id}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className="text-slate-400">{log.target_type} / </span>
                    <span className="text-amber-400">{log.target_id}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">{log.created_at}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-[11px] font-semibold"
                    >
                      View JSON Diff 🔍
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Diff Inspection Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">Audit Log Diff: {selectedLog.action}</h2>
                <p className="text-xs text-slate-400 font-mono">{selectedLog.target_id}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
              <pre>{JSON.stringify(selectedLog.diff, null, 2)}</pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
