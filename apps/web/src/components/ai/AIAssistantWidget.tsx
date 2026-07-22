"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, User, ArrowRight } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
  skus?: string[];
}

export const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! I'm FramePro's AI Product Consultant & Sales Assistant. How can I help you choose picture frame mouldings or build a wholesale quote today?"
    }
  ]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setLoading(true);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("framepro_admin_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8000/v1/ai/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: userMsg, session_id: sessionId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.session_id) {
          setSessionId(data.session_id);
        }
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: data.reply, skus: data.suggested_skus }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Our Heritage Walnut (FP-2201-WAL) and Obsidian Black (FP-1042-BLK) are popular for wholesale orders. Would you like to view our PDF catalog?",
            skus: ["FP-2201-WAL", "FP-1042-BLK"]
          }
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I can assist you with frame profile selections, MOQ validation (100m per SKU), and Incoterms (FOB/EXW/DDP). What items are you interested in?",
          skus: ["FP-2201-WAL", "FP-3088-GLD"]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold shadow-xl shadow-amber-500/25 hover:scale-105 transition-all duration-300 border border-amber-400/40"
        >
          <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: "4s" }} />
          <span>AI Consultant</span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] glass-panel rounded-2xl flex flex-col shadow-2xl border border-amber-500/30 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-950/80 border-b border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                  FramePro Sales AI <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </h3>
                <p className="text-[10px] text-slate-400">Product & Wholesale Consultant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[80%] ${
                    m.sender === "user"
                      ? "bg-amber-500 text-slate-950 font-medium"
                      : "bg-slate-900 border border-slate-800 text-slate-200"
                  }`}
                >
                  <p>{m.text}</p>
                  {m.skus && m.skus.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1">
                      {m.skus.map((sku) => (
                        <span key={sku} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px]">
                          {sku}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-xs text-amber-400/70 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Thinking...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-900 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about SKUs, MOQ, quotes..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
            />
            <button
              onClick={handleSend}
              className="p-2 rounded-lg bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
