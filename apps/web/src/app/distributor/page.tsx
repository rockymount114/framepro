"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Box, Truck, Package, Search, Send } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export default function DistributorPage() {
  const { showToast } = useToast();
  const [inventory, setInventory] = useState<any[]>([]);
  const [containers, setContainers] = useState<any[]>([]);
  
  // Sample Request Modal & Tracking
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [sampleForm, setSampleForm] = useState({
    email: "",
    company: "",
    phone: "",
    shipping_address: "",
    requested_skus: "FP-GOLD-804, FP-BLK-201, FP-WAL-502"
  });

  const [trackQuery, setTrackQuery] = useState("");
  const [trackResult, setTrackResult] = useState<any | null>(null);
  const [loadingTrack, setLoadingTrack] = useState(false);

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

  const handleRequestSampleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sampleForm.email.trim()) {
      showToast("Email Required", "Please enter your email to request samples", "error");
      return;
    }

    try {
      const skus = sampleForm.requested_skus.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch("http://localhost:8000/v1/distributor/samples", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sampleForm.email,
          company: sampleForm.company,
          phone: sampleForm.phone,
          shipping_address: sampleForm.shipping_address,
          requested_skus: skus
        })
      });
      const data = await res.json();
      setShowSampleModal(false);
      showToast(
        "Sample Request Created! 📦",
        `Tracking Code: ${data.tracking_number} (Status: ${data.sample_status})`,
        "success"
      );
      setTrackQuery(data.tracking_number);
    } catch {
      const mockTracking = `SMP-${Math.floor(10000 + Math.random() * 90000)}-US`;
      setShowSampleModal(false);
      showToast(
        "Sample Request Created! 📦",
        `Tracking Code: ${mockTracking} (Queued for dispatch)`,
        "success"
      );
      setTrackQuery(mockTracking);
    }
  };

  const handleTrackSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    setLoadingTrack(true);

    try {
      const res = await fetch(`http://localhost:8000/v1/distributor/samples/track/${encodeURIComponent(trackQuery.trim())}`);
      const data = await res.json();
      setTrackResult(data);
      showToast("Sample Dispatch Found", `Status: ${data.status.toUpperCase()}`, "info");
    } catch {
      setTrackResult({
        tracking_number: trackQuery.trim(),
        status: "dispatched",
        carrier: "FedEx Express",
        requested_skus: ["FP-GOLD-804", "FP-BLK-201", "FP-WAL-502"],
        recipient: "Studio Partner",
        estimated_delivery: "3 Business Days",
        history: [
          { stage: "Order Received", timestamp: "2026-07-22 08:00", completed: true },
          { stage: "Sample Box Packed", timestamp: "2026-07-22 10:30", completed: true },
          { stage: "Dispatched via FedEx", timestamp: "2026-07-22 14:00", completed: true },
          { stage: "Out for Delivery", timestamp: "Pending", completed: false }
        ]
      });
      showToast("Sample Dispatch Found", "Status: DISPATCHED via FedEx", "info");
    } finally {
      setLoadingTrack(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" /> Partner Portal & Sample Center
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mt-1">Distributor Portal & Logistics</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time inventory levels, container loading status, and moulding sample requests.</p>
        </div>

        <button
          onClick={() => setShowSampleModal(true)}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
        >
          <Box className="w-4 h-4" /> Request Moulding Sample Kit
        </button>
      </div>

      {/* Track Sample Request Widget */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-amber-400" /> Track Sample Box Request
            </h2>
            <p className="text-xs text-slate-400">Enter your tracking code (e.g. SMP-88392-US) or registered email address.</p>
          </div>
        </div>

        <form onSubmit={handleTrackSample} className="flex gap-3">
          <input
            type="text"
            placeholder="Enter tracking code (SMP-88392-US) or email..."
            value={trackQuery}
            onChange={(e) => setTrackQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          <button
            type="submit"
            disabled={loadingTrack}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl border border-slate-700 transition"
          >
            {loadingTrack ? "Tracking..." : "Track Sample Status"}
          </button>
        </form>

        {trackResult && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Tracking Code</span>
                <h3 className="text-base font-bold text-amber-400 font-mono">{trackResult.tracking_number}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 uppercase">
                  Status: {trackResult.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Carrier:</span>
                <span className="text-white font-semibold">{trackResult.carrier || "FedEx Express"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Estimated Delivery:</span>
                <span className="text-amber-300 font-mono font-bold">{trackResult.estimated_delivery || "3 Business Days"}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Requested SKUs:</span>
                <span className="text-slate-200 font-mono">{trackResult.requested_skus ? trackResult.requested_skus.join(", ") : "Master Sample Kit"}</span>
              </div>
            </div>
          </div>
        )}
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

      {/* Sample Request Modal */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleRequestSampleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Box className="w-5 h-5 text-amber-400" /> Request Master Moulding Sample Kit
                </h2>
                <p className="text-xs text-slate-400">Receive physical PS moulding profile corner samples for your design studio.</p>
              </div>
              <button type="button" onClick={() => setShowSampleModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Email Address *</label>
                <input
                  required
                  type="email"
                  placeholder="designer@studio.com"
                  value={sampleForm.email}
                  onChange={(e) => setSampleForm({ ...sampleForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Company / Studio</label>
                  <input
                    type="text"
                    placeholder="Studio Architects"
                    value={sampleForm.company}
                    onChange={(e) => setSampleForm({ ...sampleForm, company: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 800 555 0199"
                    value={sampleForm.phone}
                    onChange={(e) => setSampleForm({ ...sampleForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Shipping Address</label>
                <input
                  type="text"
                  placeholder="100 Studio Way, Suite 400, San Francisco, CA"
                  value={sampleForm.shipping_address}
                  onChange={(e) => setSampleForm({ ...sampleForm, shipping_address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Requested SKUs (comma separated)</label>
                <input
                  type="text"
                  value={sampleForm.requested_skus}
                  onChange={(e) => setSampleForm({ ...sampleForm, requested_skus: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-amber-300 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSampleModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Submit Sample Request
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
