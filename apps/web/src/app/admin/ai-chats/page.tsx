"use client";

import React, { useState, useEffect } from "react";

interface ChatSession {
  id: string;
  user_id?: string;
  user?: { email: string; full_name: string; role: string } | null;
  session_title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  content: string;
  suggested_skus?: string[];
  created_at: string;
}

export default function AdminAIChatsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const token = localStorage.getItem("framepro_admin_token") || "admin_token";
      const res = await fetch("http://localhost:8000/v1/admin/ai-chats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.items || []);
        if (data.items && data.items.length > 0 && !selectedSessionId) {
          setSelectedSessionId(data.items[0].id);
        }
      }
    } catch {
      // Mock fallback for UI preview
      setSessions([
        {
          id: "cs-901",
          session_title: "Wholesale MOQ Inquiry for Walnut Moulding",
          user: { email: "marriott.procurement@hotel.com", full_name: "Elena Rostova", role: "distributor" },
          message_count: 4,
          created_at: "2026-07-22T14:30:00Z",
          updated_at: "2026-07-22T14:35:00Z"
        },
        {
          id: "cs-902",
          session_title: "Frame Selection for Modern Minimalist Art",
          user: null,
          message_count: 2,
          created_at: "2026-07-22T15:10:00Z",
          updated_at: "2026-07-22T15:12:00Z"
        }
      ]);
      setSelectedSessionId("cs-901");
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchSessionMessages = async (sessionId: string) => {
    setLoadingMessages(true);
    try {
      const token = localStorage.getItem("framepro_admin_token") || "admin_token";
      const res = await fetch(`http://localhost:8000/v1/admin/ai-chats/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch {
      if (sessionId === "cs-901") {
        setMessages([
          {
            id: "m-1",
            sender: "user",
            content: "Hello, what is the MOQ for Heritage Walnut moulding (FP-2201-WAL)?",
            created_at: "2026-07-22T14:30:05Z"
          },
          {
            id: "m-2",
            sender: "assistant",
            content: "FramePro offers direct wholesale pricing for registered distributors! Our PS Moulding profiles carry a standard MOQ of 100 meters per SKU with volume breaks at container capacity (5,000m).",
            suggested_skus: ["FP-2201-WAL"],
            created_at: "2026-07-22T14:30:08Z"
          },
          {
            id: "m-3",
            sender: "user",
            content: "Can we order a container quote with DDP terms to US West Coast?",
            created_at: "2026-07-22T14:32:00Z"
          },
          {
            id: "m-4",
            sender: "assistant",
            content: "Yes, we support FOB, EXW, and DDP terms for 20ft and 40ft container shipments. Would you like me to connect you with a Sales Manager?",
            suggested_skus: ["FP-2201-WAL", "FP-3088-GLD"],
            created_at: "2026-07-22T14:32:04Z"
          }
        ]);
      } else {
        setMessages([
          {
            id: "m-10",
            sender: "user",
            content: "Looking for a matte black frame for fine art photography.",
            created_at: "2026-07-22T15:10:00Z"
          },
          {
            id: "m-11",
            sender: "assistant",
            content: "For a minimal, contemporary aesthetic, I recommend our Matte Obsidian profile (SKU: FP-1042-BLK). It features a 40mm width with satin finish.",
            suggested_skus: ["FP-1042-BLK"],
            created_at: "2026-07-22T15:10:03Z"
          }
        ]);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSessionId) {
      fetchSessionMessages(selectedSessionId);
    }
  }, [selectedSessionId]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">💬</span>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Consultant Chat Logs & Review</h1>
        </div>
        <p className="text-sm text-slate-400">
          Inspect customer AI Assistant conversations, verify recommended SKUs, and monitor wholesale escalation inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Sessions Sidebar */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recent Chat Sessions</h3>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              {sessions.length} Threads
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loadingSessions ? (
              <div className="p-6 text-center text-xs text-slate-500">Loading AI chat history...</div>
            ) : (
              sessions.map((s) => {
                const isSelected = s.id === selectedSessionId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/40 text-white shadow-md shadow-amber-500/10"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white truncate max-w-[220px]">
                        {s.session_title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(s.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span className="truncate">
                        👤 {s.user ? `${s.user.full_name} (${s.user.role})` : "Anonymous Visitor"}
                      </span>
                      <span className="font-mono text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {s.message_count} msgs
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Transcript Canvas */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col">
          <div className="border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Transcript History</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Session ID: {selectedSessionId || "N/A"}</p>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-medium">
              Audited by Staff Role
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 p-2 text-xs">
            {loadingMessages ? (
              <div className="p-8 text-center text-slate-500">Retrieving transcript details...</div>
            ) : messages.length > 0 ? (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400">
                    <span className="font-semibold uppercase tracking-wider text-amber-300 font-mono">
                      {m.sender === "user" ? "User Inquiry" : "DeepSeek AI Assistant"}
                    </span>
                    <span>•</span>
                    <span>{new Date(m.created_at).toLocaleTimeString()}</span>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                      m.sender === "user"
                        ? "bg-slate-800 border border-slate-700 text-slate-100"
                        : "bg-amber-500/10 border border-amber-500/30 text-amber-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>

                    {m.suggested_skus && m.suggested_skus.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-amber-500/20 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">Recommended SKUs:</span>
                        {m.suggested_skus.map((sku) => (
                          <span
                            key={sku}
                            className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold"
                          >
                            {sku}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-500">
                Select a chat session to view transcript history.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
