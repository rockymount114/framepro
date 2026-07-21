"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Sliders, Layers, CheckCircle2, Download, ShoppingCart } from "lucide-react";

const SAMPLE_FRAMES = [
  { sku: "FP-2201-WAL", name: "Heritage Walnut & Gold", color: "Walnut / Gold", material: "Walnut Wood", defaultWidth: 55, borderStyle: "border-[#5C4033]", innerAccent: "border-[#D4AF37]" },
  { sku: "FP-1042-BLK", name: "Minimalist Obsidian Black", color: "Matte Black", material: "PS Satin", defaultWidth: 40, borderStyle: "border-[#1A1A1A]", innerAccent: "border-slate-800" },
  { sku: "FP-3088-GLD", name: "Imperial Champagne Gold", color: "Champagne Gold", material: "PS Foil Leaf", defaultWidth: 65, borderStyle: "border-[#C5A059]", innerAccent: "border-[#FFF0C2]" }
];

export const FramePreviewCanvas = () => {
  const [selectedSku, setSelectedSku] = useState("FP-2201-WAL");
  const [widthMm, setWidthMm] = useState(55);
  const [matCm, setMatCm] = useState(5);
  const [artSrc, setArtSrc] = useState("/samples/art_abstract.jpg");
  const [generating, setGenerating] = useState(false);
  const [aiPreviewData, setAiPreviewData] = useState<string | null>(null);

  const activeFrame = SAMPLE_FRAMES.find((f) => f.sku === selectedSku) || SAMPLE_FRAMES[0];

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const res = await fetch("http://localhost:8000/v1/ai/frame-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frame_sku: selectedSku,
          material: activeFrame.material,
          width_mm: widthMm,
          mat_board_cm: matCm
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result_url) {
          setAiPreviewData(data.result_url);
        }
      }
    } catch (e) {
      console.log("Mock fallback for AI frame preview");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-amber-500/20">
      <div className="flex flex-col lg:flex-row gap-8 items-stretch">
        {/* Controls Sidebar */}
        <div className="w-full lg:w-96 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">Interactive 2D Preview</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">AI Frame Studio</h2>
            <p className="text-xs text-slate-400 mt-1">Select moulding profiles, mat board margins, and view realistic rendered composition.</p>
          </div>

          {/* Moulding Selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select Frame Profile</label>
            <div className="space-y-2">
              {SAMPLE_FRAMES.map((f) => (
                <button
                  key={f.sku}
                  onClick={() => {
                    setSelectedSku(f.sku);
                    setWidthMm(f.defaultWidth);
                    setAiPreviewData(null);
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    selectedSku === f.sku
                      ? "border-amber-400 bg-amber-500/10 text-slate-100 shadow-md shadow-amber-500/10"
                      : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{f.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{f.sku} • {f.material}</div>
                  </div>
                  {selectedSku === f.sku && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Moulding Width</span>
                <span className="font-mono text-amber-400">{widthMm} mm</span>
              </div>
              <input
                type="range"
                min="30"
                max="80"
                value={widthMm}
                onChange={(e) => setWidthMm(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Silk Mat Board Margin</span>
                <span className="font-mono text-amber-400">{matCm} cm</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={matCm}
                onChange={(e) => setMatCm(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg h-1.5"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-4">
            <button
              onClick={handleGenerateAI}
              disabled={generating}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? "Rendering High-Res AI Preview..." : "Render High-Res Composite"}
            </button>
          </div>
        </div>

        {/* Live Visualizer Stage */}
        <div className="flex-1 bg-slate-950/80 rounded-2xl border border-slate-800/80 p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[420px]">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-amber-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Canvas
            </span>
          </div>

          {aiPreviewData ? (
            <div className="relative max-w-full max-h-[380px] rounded-lg shadow-2xl overflow-hidden border border-amber-500/30">
              <img src={aiPreviewData} alt="AI Rendered Framed Artwork" className="max-h-[360px] object-contain rounded" />
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-amber-300 border border-amber-500/30">
                AI Composite Rendered
              </div>
            </div>
          ) : (
            /* Interactive Dynamic HTML Canvas rendering with CSS bevels & mat margins */
            <div
              className={`transition-all duration-500 shadow-2xl relative flex items-center justify-center bg-slate-900 ${activeFrame.borderStyle}`}
              style={{
                padding: `${Math.max(16, widthMm / 2.5)}px`,
                borderWidth: `${Math.max(12, widthMm / 3)}px`,
                borderStyle: "solid"
              }}
            >
              {/* Gold bevel inner line */}
              <div
                className="w-full h-full bg-[#FAF8F5] p-6 shadow-inner flex items-center justify-center relative border"
                style={{ padding: `${matCm * 6}px` }}
              >
                <div className="relative w-48 h-64 shadow-md rounded overflow-hidden">
                  <Image src={artSrc} alt="Artwork" fill className="object-cover" />
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <div className="text-xs font-semibold text-slate-200">{activeFrame.name}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Profile SKU: <span className="font-mono text-amber-400">{selectedSku}</span> • Width: {widthMm}mm • Mat Margin: {matCm}cm
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
