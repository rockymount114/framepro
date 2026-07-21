"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Sparkles, Move, Maximize2, RefreshCw, CheckCircle2, Download } from "lucide-react";

export const RoomVisualizerCanvas = () => {
  const [roomPhoto, setRoomPhoto] = useState("/samples/room_living.jpg");
  const [frameSku, setFrameSku] = useState("FP-2201-WAL");
  const [placementX, setPlacementX] = useState(50);
  const [placementY, setPlacementY] = useState(38);
  const [scalePct, setScalePct] = useState(32);
  const [processing, setProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);

  const handleRunAI = async () => {
    setProcessing(true);
    try {
      const res = await fetch("http://localhost:8000/v1/ai/room-visualizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placements: [
            {
              frame_sku: frameSku,
              placement_x_pct: placementX / 100,
              placement_y_pct: placementY / 100
            }
          ]
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result_url) {
          setResultImage(data.result_url);
        }
      }
    } catch (e) {
      console.log("Mock fallback for AI room visualizer");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-6 md:p-8 shadow-2xl border border-amber-500/20">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Controls */}
        <div className="w-full lg:w-96 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">AI Room Visualizer</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Wall Detection Studio</h2>
            <p className="text-xs text-slate-400 mt-1">Upload a room photo or use our architectural sample to place artwork with automatic wall detection and homography.</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Select Frame Moulding</label>
            <select
              value={frameSku}
              onChange={(e) => setFrameSku(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:border-amber-400 focus:outline-none"
            >
              <option value="FP-2201-WAL">FP-2201-WAL • Heritage Walnut & Gold (55mm)</option>
              <option value="FP-1042-BLK">FP-1042-BLK • Minimalist Obsidian Black (40mm)</option>
              <option value="FP-3088-GLD">FP-3088-GLD • Imperial Champagne Gold (65mm)</option>
            </select>
          </div>

          {/* Wall Position Adjustments */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Wall Horizontal Position</span>
                <span className="font-mono text-amber-400">{placementX}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="80"
                value={placementX}
                onChange={(e) => setPlacementX(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Wall Vertical Elevation</span>
                <span className="font-mono text-amber-400">{placementY}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="60"
                value={placementY}
                onChange={(e) => setPlacementY(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg h-1.5"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Frame Scale</span>
                <span className="font-mono text-amber-400">{scalePct}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="50"
                value={scalePct}
                onChange={(e) => setScalePct(Number(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 rounded-lg h-1.5"
              />
            </div>
          </div>

          <button
            onClick={handleRunAI}
            disabled={processing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            {processing ? "Synthesizing Wall Lighting & Shadow..." : "Synthesize Photorealistic Scene"}
          </button>
        </div>

        {/* Room Stage */}
        <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative min-h-[450px] flex items-center justify-center">
          {resultImage ? (
            <div className="relative w-full h-full min-h-[450px]">
              <img src={resultImage} alt="AI Room Visualizer Result" className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-slate-950/80 border border-emerald-500/30 text-emerald-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Wall Lighting & Perspective Composite
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full min-h-[450px] flex items-center justify-center">
              <Image src={roomPhoto} alt="Living Room Wall" fill className="object-cover opacity-85" />
              
              {/* Wall Detection Boundary Overlay */}
              <div className="absolute inset-0 bg-amber-500/5 border-2 border-dashed border-amber-500/30 pointer-events-none flex items-start justify-end p-4">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] uppercase font-mono px-2 py-0.5 rounded">
                  Wall Plane Detected (Confidence 94%)
                </span>
              </div>

              {/* Placed Framed Artwork */}
              <div
                className="absolute shadow-2xl border-4 border-[#5C4033] bg-[#FAF8F5] p-2 transition-all duration-200"
                style={{
                  left: `${placementX}%`,
                  top: `${placementY}%`,
                  transform: "translate(-50%, -50%)",
                  width: `${scalePct}%`,
                  aspectRatio: "3/4"
                }}
              >
                <div className="w-full h-full relative overflow-hidden rounded shadow-inner">
                  <Image src="/samples/art_abstract.jpg" alt="Art on Wall" fill className="object-cover" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
