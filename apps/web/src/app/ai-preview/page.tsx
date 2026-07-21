import React from "react";
import { FramePreviewCanvas } from "@/components/ai/FramePreviewCanvas";

export default function AIPreviewPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">AI Frame Preview Studio</h1>
        <p className="text-xs text-slate-400 mt-1">Render realistic 2D composited framed artwork with custom moulding width, silk mat boards, and lighting bevels.</p>
      </div>
      <FramePreviewCanvas />
    </div>
  );
}
