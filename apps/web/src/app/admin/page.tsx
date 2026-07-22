"use client";

import React from "react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Frame SKUs", value: "48 Profiles", change: "+12% this month", icon: "🖼️", href: "/admin/products" },
    { title: "Active CRM Leads", value: "14 Pipeline", change: "+4 high-priority", icon: "👥", href: "/admin/crm" },
    { title: "Wholesale Revenue", value: "$184,200", change: "+24% YoY", icon: "💰", href: "/quotations" },
    { title: "Total Catalog Views", value: "9,240 Views", change: "Top: Luxury Gold", icon: "📈", href: "/admin/analytics" },
  ];

  const recentLogs = [
    { action: "product.created", actor: "admin@framepro.com", target: "SKU: FP-GOLD-804", time: "10 mins ago" },
    { action: "crm.lead_updated", actor: "sales@framepro.com", target: "Lead: Marriott Hotel Group", time: "25 mins ago" },
    { action: "product.bulk_import", actor: "admin@framepro.com", target: "Committed 15 items via CSV", time: "1 hour ago" },
    { action: "analytics.rollup", actor: "System Worker", target: "Daily view aggregate rollup complete", time: "3 hours ago" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Overview & Control Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Role-based management system for FramePro catalogue, CRM pipeline, and view metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/users"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <span>👥</span> Staff & Users
          </Link>
          <Link
            href="/admin/products"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-2"
          >
            <span>➕</span> Add Product
          </Link>
        </div>
      </div>

      {/* Stats Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 transition group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs text-slate-400 font-medium">{stat.title}</p>
              <h2 className="text-2xl font-bold text-white mt-1 group-hover:text-amber-300 transition">
                {stat.value}
              </h2>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Product Management */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl mb-4">
              🖼️
            </div>
            <h3 className="text-lg font-semibold text-white">Product Catalog Management</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Create, update, and manage PS moulding profiles. Includes bulk CSV import with diff preview and catalog export.
            </p>
          </div>
          <Link
            href="/admin/products"
            className="mt-6 text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            Open Product Console ➔
          </Link>
        </div>

        {/* CRM Pipeline */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl mb-4">
              👥
            </div>
            <h3 className="text-lg font-semibold text-white">CRM & Lead Pipeline</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Kanban view for distributor leads (New → Contacted → Qualified → Won). Manage scheduled follow-up dates and notes.
            </p>
          </div>
          <Link
            href="/admin/crm"
            className="mt-6 text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            Open CRM Kanban ➔
          </Link>
        </div>

        {/* Product View Analytics */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-4">
              📈
            </div>
            <h3 className="text-lg font-semibold text-white">Product View Analytics</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Redis-backed view tracking with nightly rollups. Inspect top viewed products by week, month, year, or all-time.
            </p>
          </div>
          <Link
            href="/admin/analytics"
            className="mt-6 text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
          >
            View Analytics Report ➔
          </Link>
        </div>
      </div>

      {/* Recent Audit Log Preview */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-semibold text-white text-base">Recent Audit Logs</h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated logging of all mutation actions performed in the admin panel.</p>
          </div>
          <Link href="/admin/audit-log" className="text-xs text-amber-400 hover:underline">
            View All Logs
          </Link>
        </div>
        <div className="mt-4 divide-y divide-slate-800/60">
          {recentLogs.map((log, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                  {log.action}
                </span>
                <span className="text-slate-200 font-medium">{log.target}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                <span>{log.actor}</span>
                <span>{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
