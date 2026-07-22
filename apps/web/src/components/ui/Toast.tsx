"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (title: string, message?: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((title: string, message?: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          let bgColors = "bg-slate-900 border-slate-700 text-slate-100";
          let icon = "ℹ️";
          if (toast.type === "success") {
            bgColors = "bg-slate-900 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10";
            icon = "✅";
          } else if (toast.type === "error") {
            bgColors = "bg-slate-900 border-rose-500/40 text-rose-300 shadow-rose-500/10";
            icon = "⚠️";
          } else if (toast.type === "warning") {
            bgColors = "bg-slate-900 border-amber-500/40 text-amber-300 shadow-amber-500/10";
            icon = "🔔";
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto border rounded-xl p-4 shadow-xl backdrop-blur-md flex items-start justify-between gap-3 transition-all duration-300 transform translate-y-0 ${bgColors}`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg">{icon}</span>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{toast.title}</h4>
                  {toast.message && (
                    <p className="text-[11px] text-slate-300 mt-1 leading-normal">{toast.message}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-white text-xs p-0.5 rounded transition"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
