"use client";

import React, { useState } from "react";

interface Lead {
  id: string;
  email: string;
  company: string;
  status: "new" | "contacted" | "qualified" | "won" | "lost";
  tags: string[];
  follow_up_at?: string;
  notes?: string;
}

const initialLeads: Lead[] = [
  { id: "lead-1", email: "procurement@marriott.com", company: "Marriott Hotel Group", status: "new", tags: ["hotel", "high-volume"], follow_up_at: "2026-07-25" },
  { id: "lead-2", email: "art@hilton.com", company: "Hilton International", status: "contacted", tags: ["hotel", "custom-finish"], follow_up_at: "2026-07-23" },
  { id: "lead-3", email: "design@studio-architects.com", company: "Studio Architects", status: "qualified", tags: ["interior-designer"], follow_up_at: "2026-07-28" },
  { id: "lead-4", email: "orders@framing-depot.com", company: "Framing Depot Wholesale", status: "won", tags: ["distributor", "contract"], follow_up_at: "2026-08-01" },
];

export default function AdminCRMPage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const columns: Array<{ key: Lead["status"]; title: string; color: string }> = [
    { key: "new", title: "New Leads", color: "border-blue-500/40 bg-blue-500/5" },
    { key: "contacted", title: "Contacted", color: "border-amber-500/40 bg-amber-500/5" },
    { key: "qualified", title: "Qualified", color: "border-purple-500/40 bg-purple-500/5" },
    { key: "won", title: "Won / Contract", color: "border-emerald-500/40 bg-emerald-500/5" },
    { key: "lost", title: "Lost", color: "border-slate-700 bg-slate-900/20" },
  ];

  const moveStatus = (leadId: string, nextStatus: Lead["status"]) => {
    setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l)));
  };

  const updateFollowUpDate = (leadId: string, dateStr: string) => {
    setLeads(leads.map((l) => (l.id === leadId ? { ...l, follow_up_at: dateStr } : l)));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CRM & Lead Pipeline Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Kanban status pipeline, automated follow-up scheduling, and distributor lead segmenting.
          </p>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.key);
          return (
            <div key={col.key} className={`border ${col.color} rounded-2xl p-4 flex flex-col min-h-[500px]`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">{col.title}</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400">
                  {colLeads.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 shadow-lg transition cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                        {lead.company}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">{lead.email}</p>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {lead.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {lead.follow_up_at && (
                      <div className="text-[10px] text-amber-400 flex items-center gap-1 pt-1 border-t border-slate-800/60">
                        <span>📅 Follow-up:</span>
                        <span className="font-mono">{lead.follow_up_at}</span>
                      </div>
                    )}

                    {/* Move Quick Actions */}
                    <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60">
                      <span>Move to:</span>
                      <div className="flex gap-1">
                        {col.key !== "new" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStatus(lead.id, "new");
                            }}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            New
                          </button>
                        )}
                        {col.key !== "contacted" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStatus(lead.id, "contacted");
                            }}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            Cont
                          </button>
                        )}
                        {col.key !== "qualified" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStatus(lead.id, "qualified");
                            }}
                            className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          >
                            Qual
                          </button>
                        )}
                        {col.key !== "won" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveStatus(lead.id, "won");
                            }}
                            className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800"
                          >
                            Won
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead Detail & Schedule Follow-up Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white">{selectedLead.company}</h2>
                <p className="text-xs text-slate-400">{selectedLead.email}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Status Pipeline</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => {
                    const val = e.target.value as Lead["status"];
                    moveStatus(selectedLead.id, val);
                    setSelectedLead({ ...selectedLead, status: val });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="new">New Lead</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="won">Won / Contract</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Scheduled Follow-up Date (Daily Digest Job)</label>
                <input
                  type="date"
                  value={selectedLead.follow_up_at || ""}
                  onChange={(e) => {
                    updateFollowUpDate(selectedLead.id, e.target.value);
                    setSelectedLead({ ...selectedLead, follow_up_at: e.target.value });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLead.tags.map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 text-[11px]">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Close Lead Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
