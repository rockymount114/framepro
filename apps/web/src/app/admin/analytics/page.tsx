"use client";

import React, { useState } from "react";

interface ProductViewStat {
  sku: string;
  name: string;
  material: string;
  total_views: number;
  pct_change: string;
}

const mockViewData: Record<string, ProductViewStat[]> = {
  week: [
    { sku: "FP-GOLD-804", name: "Luxury Gold Baroque Frame Profile", material: "PS Composite", total_views: 1240, pct_change: "+18%" },
    { sku: "FP-BLK-201", name: "Modern Minimalist Matte Black Profile", material: "Recycled PS", total_views: 980, pct_change: "+12%" },
    { sku: "FP-WAL-502", name: "Deep Walnut Grain Hotel Framing Profile", material: "PS Composite", total_views: 740, pct_change: "+5%" },
    { sku: "FP-SLV-309", name: "Brushed Champagne Silver Profile", material: "PS Composite", total_views: 620, pct_change: "+8%" },
  ],
  month: [
    { sku: "FP-GOLD-804", name: "Luxury Gold Baroque Frame Profile", material: "PS Composite", total_views: 4820, pct_change: "+22%" },
    { sku: "FP-BLK-201", name: "Modern Minimalist Matte Black Profile", material: "Recycled PS", total_views: 3910, pct_change: "+15%" },
    { sku: "FP-WAL-502", name: "Deep Walnut Grain Hotel Framing Profile", material: "PS Composite", total_views: 2950, pct_change: "+11%" },
    { sku: "FP-SLV-309", name: "Brushed Champagne Silver Profile", material: "PS Composite", total_views: 2410, pct_change: "+9%" },
  ],
  year: [
    { sku: "FP-GOLD-804", name: "Luxury Gold Baroque Frame Profile", material: "PS Composite", total_views: 48200, pct_change: "+34%" },
    { sku: "FP-BLK-201", name: "Modern Minimalist Matte Black Profile", material: "Recycled PS", total_views: 39100, pct_change: "+28%" },
    { sku: "FP-WAL-502", name: "Deep Walnut Grain Hotel Framing Profile", material: "PS Composite", total_views: 29500, pct_change: "+19%" },
    { sku: "FP-SLV-309", name: "Brushed Champagne Silver Profile", material: "PS Composite", total_views: 24100, pct_change: "+16%" },
  ],
  all_time: [
    { sku: "FP-GOLD-804", name: "Luxury Gold Baroque Frame Profile", material: "PS Composite", total_views: 98400, pct_change: "--" },
    { sku: "FP-BLK-201", name: "Modern Minimalist Matte Black Profile", material: "Recycled PS", total_views: 76200, pct_change: "--" },
    { sku: "FP-WAL-502", name: "Deep Walnut Grain Hotel Framing Profile", material: "PS Composite", total_views: 58900, pct_change: "--" },
    { sku: "FP-SLV-309", name: "Brushed Champagne Silver Profile", material: "PS Composite", total_views: 49100, pct_change: "--" },
  ],
};

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState<"week" | "month" | "year" | "all_time">("week");
  const data = mockViewData[range];
  const maxViews = Math.max(...data.map((d) => d.total_views));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Product View Analytics & Demand Reporting</h1>
          <p className="text-sm text-slate-400 mt-1">
            Redis write-path counters aggregated into nightly PostgreSQL rollups for zero-latency demand metrics.
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          {(["week", "month", "year", "all_time"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setRange(key)}
              className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition ${
                range === key
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {key.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-400 font-medium">Total Period Views</p>
          <h3 className="text-2xl font-bold text-white mt-1">
            {data.reduce((acc, curr) => acc + curr.total_views, 0).toLocaleString()}
          </h3>
          <p className="text-[11px] text-emerald-400 mt-1">✓ Nightly Rollup Synced</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-400 font-medium">Most Viewed SKU</p>
          <h3 className="text-2xl font-bold text-amber-400 mt-1">{data[0].sku}</h3>
          <p className="text-[11px] text-slate-400 mt-1">{data[0].name}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <p className="text-xs text-slate-400 font-medium">Top Material Category</p>
          <h3 className="text-2xl font-bold text-white mt-1">PS Composite</h3>
          <p className="text-[11px] text-amber-400 mt-1">72% of total traffic</p>
        </div>
      </div>

      {/* Top Products Bar Chart / Ranked Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        <h3 className="text-base font-bold text-white">Top 20 Most Viewed Products ({range.replace("_", " ")})</h3>

        <div className="space-y-4">
          {data.map((item, idx) => {
            const widthPct = Math.round((item.total_views / maxViews) * 100);
            return (
              <div key={item.sku} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-center font-bold text-amber-400 font-mono">#{idx + 1}</span>
                    <span className="font-mono font-bold text-white">{item.sku}</span>
                    <span className="text-slate-400 truncate max-w-xs">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="font-bold text-amber-300">{item.total_views.toLocaleString()} views</span>
                    <span className="text-[11px] text-emerald-400">{item.pct_change}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-300 h-full rounded-full transition-all duration-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
