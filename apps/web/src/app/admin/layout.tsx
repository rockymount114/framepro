"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Users & Staff", href: "/admin/users", icon: "👥", badge: "RBAC" },
  { name: "Products & Catalog", href: "/admin/products", icon: "🖼️", badge: "Bulk CSV" },
  { name: "CRM & Leads", href: "/admin/crm", icon: "💼", badge: "Kanban" },
  { name: "AI Chat Logs", href: "/admin/ai-chats", icon: "💬", badge: "History" },
  { name: "View Analytics", href: "/admin/analytics", icon: "📈" },
  { name: "Audit Logs", href: "/admin/audit-log", icon: "🛡️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string; full_name?: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setAuthChecked(true);
      return;
    }

    // Inspect authentication token
    const token = localStorage.getItem("framepro_admin_token");
    const storedUser = localStorage.getItem("framepro_admin_user");

    if (!token) {
      router.push("/admin/login");
    } else {
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser({ email: "admin@framepro.com", role: "admin" });
        }
      } else {
        setUser({ email: "admin@framepro.com", role: "admin" });
      }
      setAuthChecked(true);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("framepro_admin_token");
    localStorage.removeItem("framepro_admin_user");
    document.cookie = "framepro_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/admin/login");
  };

  // If rendering the login page itself, don't show the admin shell layout
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-amber-400 animate-ping" />
          <span className="text-sm font-medium">Verifying admin session & permissions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans border-t border-slate-800">
      {/* Sidebar */}
      <aside
        className={`bg-slate-900/90 backdrop-blur-md border-r border-slate-800 flex flex-col transition-all duration-300 z-20 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand / Admin Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              FP
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-sm tracking-wide text-white">FramePro Admin</h1>
                <p className="text-[11px] text-amber-400 font-medium">Control Center</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            title="Toggle Sidebar"
          >
            {collapsed ? "➡️" : "⬅️"}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {!collapsed && (
                  <span className="flex-1 truncate flex items-center justify-between">
                    {item.name}
                    {item.badge && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Admin Credentials & Session Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-amber-400 font-bold flex-shrink-0">
                {user?.role === "admin" ? "AD" : "ST"}
              </div>
              {!collapsed && (
                <div className="overflow-hidden text-left">
                  <p className="text-xs font-semibold text-white truncate">{user?.full_name || "Admin Staff"}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || "admin@framepro.com"}</p>
                </div>
              )}
            </div>
            {!collapsed && (
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                title="Sign Out"
              >
                🚪
              </button>
            )}
          </div>
          {!collapsed && (
            <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Role: <span className="uppercase text-amber-300 font-bold">{user?.role || "admin"}</span>
              </span>
              <Link href="/catalog" className="text-slate-400 hover:text-amber-400 transition">
                Store ↗
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">FramePro Enterprise</span>
            <span className="text-slate-700">/</span>
            <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              Admin Mode
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-xs bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition flex items-center gap-1"
            >
              <span>🚪</span> Sign Out
            </button>
          </div>
        </header>

        {/* Body Canvas */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
