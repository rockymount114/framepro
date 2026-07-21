import React from "react";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <span className="font-bold text-lg text-slate-100 flex items-center gap-2">
            FRAMEPRO <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">AI Ecosystem</span>
          </span>
          <p className="text-xs leading-relaxed text-slate-400">
            The intelligent AI platform for the framing industry. Connecting manufacturers, distributors, interior designers, and luxury hotel projects worldwide.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-widest mb-4">Catalog & Mouldings</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/catalog?material=ps" className="hover:text-amber-400 transition-colors">PS Picture Mouldings</Link></li>
            <li><Link href="/catalog?finish=walnut" className="hover:text-amber-400 transition-colors">American Walnut Collection</Link></li>
            <li><Link href="/catalog?finish=gold" className="hover:text-amber-400 transition-colors">Champagne Gold Foil</Link></li>
            <li><Link href="/catalog?finish=black" className="hover:text-amber-400 transition-colors">Matte Obsidian Series</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-widest mb-4">AI Tools & B2B</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/ai-preview" className="hover:text-amber-400 transition-colors">AI 2D Frame Preview</Link></li>
            <li><Link href="/room-visualizer" className="hover:text-amber-400 transition-colors">AI Room Visualizer & Wall Detector</Link></li>
            <li><Link href="/distributor" className="hover:text-amber-400 transition-colors">Wholesale Portal & Container Planner</Link></li>
            <li><Link href="/quotations" className="hover:text-amber-400 transition-colors">Automated PDF Quotation Engine</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-widest mb-4">Quality & Compliance</h4>
          <p className="text-xs text-slate-400 mb-3">
            High-density polystyrene mouldings engineered to ISO 9001 standards. MOQ 100m per SKU with global container logistics (FOB / EXW / DDP).
          </p>
          <span className="inline-block text-[11px] text-amber-400/80 font-mono">
            FastAPI Backend • Next.js App Router • WCAG 2.1 AA
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
        <p>© 2026 FramePro Ecosystem Inc. All rights reserved.</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <span>Privacy Policy</span>
          <span>Terms of Supply</span>
          <span>Security & CSP</span>
        </div>
      </div>
    </footer>
  );
};
