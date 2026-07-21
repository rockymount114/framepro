"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ShoppingBag, FileText, Layers, Eye, ShieldCheck } from "lucide-react";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-amber-500/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 p-[1px]">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
              <span className="font-bold text-amber-400 text-xl tracking-tighter">F</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-slate-100 flex items-center gap-1.5">
              FRAMEPRO <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">AI Ecosystem</span>
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider">PICTURE FRAME & INTERIOR VISUALIZATION</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/catalog" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-500/70" />
            Frame Mouldings
          </Link>
          <Link href="/ai-preview" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-amber-400" />
            AI Frame Preview
          </Link>
          <Link href="/room-visualizer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            AI Room Visualizer
          </Link>
          <Link href="/distributor" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-500/70" />
            Distributor Portal
          </Link>
          <Link href="/quotations" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-500/70" />
            Quotation System
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/cart"
            className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:border-amber-500/40 text-slate-300 hover:text-amber-400 transition-all relative"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
              2
            </span>
          </Link>

          <Link
            href="/contact"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold text-sm shadow-lg shadow-amber-500/20 transition-all"
          >
            Request Samples
          </Link>
        </div>
      </div>
    </header>
  );
};
