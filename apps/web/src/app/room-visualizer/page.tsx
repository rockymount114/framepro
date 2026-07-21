import React from "react";
import { RoomVisualizerCanvas } from "@/components/ai/RoomVisualizerCanvas";

export default function RoomVisualizerPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">AI Room Visualizer & Wall Detector</h1>
        <p className="text-xs text-slate-400 mt-1">Upload room interiors, estimate wall plane homography, and generate photorealistic scene renderings.</p>
      </div>
      <RoomVisualizerCanvas />
    </div>
  );
}
