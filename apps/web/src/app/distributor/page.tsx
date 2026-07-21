"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Box, Truck, Package, Download } from "lucide-react";

export default function DistributorPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [containers, setContainers] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/v1/distributor/inventory")
      .then((res) => res.json())
      .then((data) => setInventory(data))
      .catch(() => setInventory([
        { sku: "FP-2201-WAL", warehouse: "US-West (California)", quantity_on_hand: 14500, quantity_reserved: 2000 },
        { sku: "FP-1042-BLK", warehouse: "US-East (New Jersey)", quantity_on_hand: 22000, quantity_reserved: 3500 },
        { sku: "FP-3088-GLD", warehouse: "Asia-Central (Ningbo)", quantity_on_hand: 45000, quantity_reserved: 8000 }
      ]));

    fetch("http://localhost:8000/v1/distributor/containers")
      .then((res) => res.json())
      .then((data) => setContainers(data))
      .catch(() => setContainers([
        { container_id: "CONT-2026-088", status: "in_transit", origin: "Ningbo Port", destination: "Port of Long Beach", eta: "2026-08-04", capacity_utilized_pct: 98.5 }
      ]));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" /> Partner Portal
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mt-1">Distributor Portal & Logistics</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time inventory levels, container loading status, and catalog download center.</p>
      </div>

      {/* Real-time Inventory */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-400" /> Real-time Warehouse Inventory
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3">SKU</th>
                <th className="p-3">Warehouse Facility</th>
                <th className="p-3">Available Stock (m)</th>
                <th className="p-3">Reserved Stock (m)</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {inventory.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40">
                  <td className="p-3 font-mono font-bold text-amber-400">{row.sku}</td>
                  <td className="p-3">{row.warehouse}</td>
                  <td className="p-3 font-mono font-bold text-slate-100">{row.quantity_on_hand.toLocaleString()}m</td>
                  <td className="p-3 font-mono text-slate-400">{row.quantity_reserved.toLocaleString()}m</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                      In Stock
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Container Logistics */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-400" /> Global Container Logistics & Planning
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {containers.map((cont) => (
            <div key={cont.container_id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-mono text-amber-400 font-bold">{cont.container_id}</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] uppercase font-mono">
                  {cont.status}
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <div>Route: <span className="text-slate-100 font-semibold">{cont.origin} ➔ {cont.destination}</span></div>
                <div>ETA Port: <span className="font-mono text-amber-400">{cont.eta}</span></div>
                <div>Volume Capacity: <span className="font-mono">{cont.capacity_utilized_pct}% Utilized</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
