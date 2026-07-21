"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Filter, Layers, ArrowRight, Check, Eye } from "lucide-react";

const PRODUCTS = [
  {
    sku: "FP-2201-WAL",
    name: "Heritage Walnut & Gold Inlay",
    material: "PS Moulding",
    finish: "Walnut Wood Grain",
    color: "Walnut / Gold",
    width_mm: 55,
    depth_mm: 35,
    moq: 100,
    retail_price: 28.00,
    wholesale_price: 14.00,
    img: "/samples/frame_walnut.jpg"
  },
  {
    sku: "FP-1042-BLK",
    name: "Minimalist Obsidian Black",
    material: "PS Moulding",
    finish: "Satin Black",
    color: "Black",
    width_mm: 40,
    depth_mm: 25,
    moq: 100,
    retail_price: 19.00,
    wholesale_price: 9.50,
    img: "/samples/art_abstract.jpg"
  },
  {
    sku: "FP-3088-GLD",
    name: "Imperial Champagne Gold Leaf",
    material: "PS Moulding",
    finish: "Brushed Foil",
    color: "Gold",
    width_mm: 65,
    depth_mm: 40,
    moq: 100,
    retail_price: 36.00,
    wholesale_price: 18.00,
    img: "/samples/frame_walnut.jpg"
  }
];

export default function CatalogPage() {
  const [selectedColor, setSelectedColor] = useState<string>("all");

  const filteredProducts = selectedColor === "all"
    ? PRODUCTS
    : PRODUCTS.filter((p) => p.color.toLowerCase().includes(selectedColor));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
          <Layers className="w-4 h-4" /> Master Catalogue
        </div>
        <h1 className="text-3xl font-bold text-slate-100 mt-1">PS Picture Frame Mouldings</h1>
        <p className="text-xs text-slate-400 mt-1">Explore high-density polystyrene profiles engineered for luxury framing and B2B wholesale distribution.</p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Filter className="w-4 h-4 text-amber-400" />
          <span className="font-semibold">Filter Finish:</span>
        </div>
        <div className="flex items-center gap-2">
          {["all", "walnut", "black", "gold"].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                selectedColor === c
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredProducts.map((p) => (
          <div key={p.sku} className="glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative h-64 bg-slate-900">
                <Image src={p.img} alt={p.name} fill className="object-cover" />
                <div className="absolute top-3 left-3 bg-slate-950/80 px-2.5 py-1 rounded text-[10px] font-mono text-amber-400 border border-amber-500/30">
                  {p.sku}
                </div>
                <div className="absolute bottom-3 right-3 bg-slate-950/80 px-2.5 py-1 rounded text-[10px] font-mono text-slate-300">
                  MOQ: {p.moq}m
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{p.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{p.finish} • {p.material}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Profile Width:</span>
                    <span>{p.width_mm} mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Profile Depth:</span>
                    <span>{p.depth_mm} mm</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold pt-1 border-t border-slate-900">
                    <span>Wholesale Price:</span>
                    <span>${p.wholesale_price.toFixed(2)} / m</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <Link
                href={`/ai-preview?sku=${p.sku}`}
                className="flex-1 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> AI Preview
              </Link>
              <Link
                href="/quotations"
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                Quote <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
