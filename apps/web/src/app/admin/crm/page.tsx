"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface Lead {
  id: string;
  email: string;
  company: string;
  status: "new" | "contacted" | "qualified" | "won" | "lost";
  tags: string[];
  source?: string;
  sample_skus?: string[];
  tracking_number?: string;
  shipping_address?: string;
  follow_up_at?: string;
  notes?: string;
}

const initialLeads: Lead[] = [
  { id: "lead-1", email: "procurement@marriott.com", company: "Marriott Hotel Group", status: "new", tags: ["hotel", "high-volume"], follow_up_at: "2026-07-25" },
  { id: "lead-2", email: "art@hilton.com", company: "Hilton International", status: "contacted", tags: ["hotel", "custom-finish"], follow_up_at: "2026-07-23" },
  { id: "lead-3", email: "design@studio-architects.com", company: "Studio Architects", status: "qualified", tags: ["interior-designer"], follow_up_at: "2026-07-28" },
  { id: "lead-4", email: "orders@framing-depot.com", company: "Framing Depot Wholesale", status: "won", tags: ["distributor", "contract"], follow_up_at: "2026-08-01" },
  {
    id: "lead-smp-1",
    email: "designer@luxuryinteriors.com",
    company: "Luxury Interiors Studio",
    status: "new",
    source: "sample_request",
    tags: ["sample_request", "SMP-88392-US"],
    sample_skus: ["FP-GOLD-804", "FP-BLK-201", "FP-WAL-502"],
    tracking_number: "SMP-88392-US",
    shipping_address: "740 Park Ave, Suite 12B, New York, NY 10021",
    follow_up_at: "2026-07-27"
  },
  {
    id: "lead-smp-2",
    email: "framing@artisan-gallery.com",
    company: "Artisan Gallery Framing",
    status: "contacted",
    source: "sample_request",
    tags: ["sample_request", "SMP-91042-US"],
    sample_skus: ["FP-SLV-309", "FP-WAL-502"],
    tracking_number: "SMP-91042-US",
    shipping_address: "550 Market St, San Francisco, CA 94104",
    follow_up_at: "2026-07-29"
  }
];

export default function AdminCRMPage() {
  const { showToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterSource, setFilterSource] = useState<"all" | "sample_request">("all");

  const columns: Array<{ key: Lead["status"]; title: string; color: string }> = [
    { key: "new", title: "New Leads", color: "border-blue-500/40 bg-blue-500/5" },
    { key: "contacted", title: "Contacted / Dispatching", color: "border-amber-500/40 bg-amber-500/5" },
    { key: "qualified", title: "Qualified / Delivered", color: "border-purple-500/40 bg-purple-500/5" },
    { key: "won", title: "Won / Contract", color: "border-emerald-500/40 bg-emerald-500/5" },
    { key: "lost", title: "Lost", color: "border-slate-700 bg-slate-900/20" },
  ];

  const displayedLeads = leads.filter((l) => {
    if (filterSource === "sample_request") {
      return l.source === "sample_request" || l.tags.includes("sample_request");
    }
    return true;
  });

  const moveStatus = (leadId: string, nextStatus: Lead["status"]) => {
    setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: nextStatus } : l)));
    showToast("Pipeline Updated", `Lead status changed to ${nextStatus.toUpperCase()}`, "info");
  };

  const updateTrackingNumber = (leadId: string, trackingNum: string) => {
    setLeads(leads.map((l) => (l.id === leadId ? { ...l, tracking_number: trackingNum } : l)));
    showToast("Carrier Tracking Updated", `Assigned tracking ${trackingNum}`, "success");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">CRM & Sample Request Pipeline</h1>
          <p className="text-sm text-slate-400 mt-1">
            Track distributor leads, moulding sample box dispatches, and scheduled follow-up dates.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setFilterSource("all")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              filterSource === "all" ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            All Pipeline Leads ({leads.length})
          </button>
          <button
            onClick={() => setFilterSource("sample_request")}
            className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              filterSource === "sample_request" ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📦</span> Sample Requests ({leads.filter((l) => l.source === "sample_request" || l.tags.includes("sample_request")).length})
          </button>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colLeads = displayedLeads.filter((l) => l.status === col.key);
          return (
            <div key={col.key} className={`border ${col.color} rounded-2xl p-4 flex flex-col min-h-[500px]`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">{col.title}</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400">
                  {colLeads.length}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {colLeads.map((lead) => {
                  const isSample = lead.source === "sample_request" || lead.tags.includes("sample_request");
                  return (
                    <div
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 shadow-lg transition cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-amber-300 transition truncate max-w-[150px]">
                          {lead.company}
                        </span>
                        {isSample && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                            📦 Sample
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 truncate">{lead.email}</p>

                      {lead.sample_skus && (
                        <div className="text-[10px] text-slate-300 font-mono bg-slate-950 p-1.5 rounded border border-slate-800">
                          SKUs: {lead.sample_skus.join(", ")}
                        </div>
                      )}

                      {lead.tracking_number && (
                        <div className="text-[10px] text-emerald-400 font-mono flex items-center justify-between">
                          <span>Carrier Code:</span>
                          <span className="font-bold">{lead.tracking_number}</span>
                        </div>
                      )}

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
                        <span>Move:</span>
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
                              className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30"
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
                              className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30"
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
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead & Sample Detail Inspection Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  {selectedLead.company}
                  {selectedLead.source === "sample_request" && (
                    <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                      📦 Sample Request
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">{selectedLead.email}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Pipeline Status</label>
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
                  <option value="contacted">Contacted / Sample Dispatching</option>
                  <option value="qualified">Qualified / Sample Delivered</option>
                  <option value="won">Won / Contract Signed</option>
                  <option value="lost">Lost</option>
                </select>
              </div>

              {selectedLead.source === "sample_request" && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                  <h3 className="font-bold text-amber-400 text-xs flex items-center gap-1.5">
                    <span>📦</span> Sample Dispatch Details
                  </h3>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Carrier Tracking Code:</span>
                    <input
                      type="text"
                      value={selectedLead.tracking_number || ""}
                      onChange={(e) => {
                        updateTrackingNumber(selectedLead.id, e.target.value);
                        setSelectedLead({ ...selectedLead, tracking_number: e.target.value });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-emerald-400 font-mono mt-1"
                    />
                  </div>
                  {selectedLead.shipping_address && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">Shipping Destination:</span>
                      <p className="text-slate-200 text-[11px] font-mono mt-0.5">{selectedLead.shipping_address}</p>
                    </div>
                  )}
                  {selectedLead.sample_skus && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">Requested Moulding SKUs:</span>
                      <p className="text-amber-300 text-[11px] font-mono mt-0.5">{selectedLead.sample_skus.join(", ")}</p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-medium mb-1">Scheduled Follow-up Date</label>
                <input
                  type="date"
                  value={selectedLead.follow_up_at || ""}
                  onChange={(e) => {
                    setLeads(leads.map((l) => (l.id === selectedLead.id ? { ...l, follow_up_at: e.target.value } : l)));
                    setSelectedLead({ ...selectedLead, follow_up_at: e.target.value });
                    showToast("Follow-up Scheduled", `Remind sales team on ${e.target.value}`, "info");
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Done / Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
