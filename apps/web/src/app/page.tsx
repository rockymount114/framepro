"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Layers, ShieldCheck, ArrowRight, CheckCircle2, Building2, Hotel, Star, Mail } from "lucide-react";
import { FramePreviewCanvas } from "@/components/ai/FramePreviewCanvas";
import { RoomVisualizerCanvas } from "@/components/ai/RoomVisualizerCanvas";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch("http://localhost:8000/v1/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company, source: "homepage_lead_form" })
      });
    } catch (e) {
      console.log("Mock lead capture");
    } finally {
      setLeadSubmitted(true);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Generation Picture Frame & Visualization Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-[1.1]">
            Visualize & Order Premium <span className="gold-gradient-text">PS Frame Mouldings</span> with AI
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            From luxury hotel suites to distributor containers. Upload room photos, composite high-density PS profiles, and generate automated FOB/EXW quotations instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/ai-preview"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4" /> Start AI Frame Preview
            </Link>
            <Link
              href="/distributor"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Distributor Wholesale Portal
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-12 border-t border-slate-900 text-left">
            <div>
              <div className="text-2xl font-bold text-slate-100">100m</div>
              <div className="text-xs text-slate-400">Low Wholesale MOQ</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">94%</div>
              <div className="text-xs text-slate-400">AI Wall Detection Precision</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-100">5,000m</div>
              <div className="text-xs text-slate-400">Full Container Capacity</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">Instant</div>
              <div className="text-xs text-slate-400">PDF Quotation Engine</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Moulding Collections */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Curated Engineering</span>
            <h2 className="text-3xl font-bold text-slate-100 mt-1">Featured PS Moulding Collections</h2>
          </div>
          <Link href="/catalog" className="text-xs font-semibold text-amber-400 hover:underline flex items-center gap-1">
            View Full Catalogue (50+ SKUs) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              sku: "FP-2201-WAL",
              title: "Heritage Walnut & Gold",
              spec: "55mm Width • American Walnut Finish",
              price: "$14.00 / m Wholesale",
              img: "/samples/frame_walnut.jpg"
            },
            {
              sku: "FP-1042-BLK",
              title: "Minimalist Obsidian Black",
              spec: "40mm Width • Fine Grain Satin Black",
              price: "$9.50 / m Wholesale",
              img: "/samples/art_abstract.jpg"
            },
            {
              sku: "FP-3088-GLD",
              title: "Imperial Champagne Gold Leaf",
              spec: "65mm Width • Metallic Foil Trim",
              price: "$18.00 / m Wholesale",
              img: "/samples/frame_walnut.jpg"
            }
          ].map((col, idx) => (
            <div key={idx} className="glass-panel glass-panel-hover rounded-2xl overflow-hidden group">
              <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
                <Image src={col.img} alt={col.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded text-[10px] font-mono text-amber-400 border border-amber-500/30">
                  SKU: {col.sku}
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-lg font-bold text-slate-100">{col.title}</h3>
                <p className="text-xs text-slate-400">{col.spec}</p>
                <div className="pt-3 flex justify-between items-center border-t border-slate-800">
                  <span className="text-sm font-bold text-amber-400">{col.price}</span>
                  <Link href={`/catalog?sku=${col.sku}`} className="text-xs font-semibold text-slate-300 hover:text-amber-400 flex items-center gap-1">
                    Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Frame Preview Interactive Studio */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FramePreviewCanvas />
      </section>

      {/* AI Room Visualizer Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RoomVisualizerCanvas />
      </section>

      {/* Hotel Projects & Case Studies */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Hospitality & Commercial</span>
          <h2 className="text-3xl font-bold text-slate-100">Proven in High-Volume Hotel Projects</h2>
          <p className="text-xs text-slate-400">FramePro supplies custom mouldings and container shipments for international luxury hotel chains and corporate galleries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-3xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Hotel className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Ritz-Carlton Suite Renovation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Supplied 12,000 meters of FP-2201-WAL Heritage Walnut moulding across 450 guest suites. Utilized AI Room Visualizer for client board presentation sign-off.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-amber-400 font-mono">
              <span>Volume: 2 Containers</span>
              <span>•</span>
              <span>Incoterm: DDP Chicago</span>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-3xl space-y-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">Metropolitan Modern Art Gallery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standardized on FP-1042-BLK Matte Obsidian for all contemporary exhibition frames. Automated PDF quote system enabled fast procurement turnaround.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-amber-400 font-mono">
              <span>Volume: 8,500m</span>
              <span>•</span>
              <span>Incoterm: FOB Ningbo</span>
            </div>
          </div>
        </div>
      </section>

      {/* CRM Lead Capture Form */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 md:p-12 text-center space-y-6 border border-amber-500/30">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
            <Mail className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">Request Master Moulding Sample Kit</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Get physical samples of our PS moulding profiles (Walnut, Obsidian Black, Gold Leaf) delivered to your studio.
            </p>
          </div>

          {leadSubmitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Your Sample Request has been received! Our sales representative will contact you shortly.
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your business email..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0"
              >
                Send Sample Kit
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
