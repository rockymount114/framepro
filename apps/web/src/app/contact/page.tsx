"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Contact & Sample Request</h1>
        <p className="text-xs text-slate-400 mt-1">Connect with our framing consultants or request physical moulding sample kits for your studio.</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl space-y-6">
        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-100">Sample Kit Request Dispatched!</h2>
            <p className="text-xs text-slate-400">Our representative will verify your business details and send shipping confirmation.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">Full Name</label>
                <input required type="text" placeholder="John Doe" className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">Company Name</label>
                <input required type="text" placeholder="Acme Interiors Inc." className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-400" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">Business Email</label>
                <input required type="email" placeholder="john@acme.com" className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-semibold mb-1 block">Phone Number</label>
                <input type="tel" placeholder="+1 (555) 000-0000" className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-400" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-300 font-semibold mb-1 block">Project Requirements / Notes</label>
              <textarea rows={4} placeholder="Specify desired frame SKUs or project volume requirements..." className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none focus:border-amber-400" />
            </div>
            <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20">
              Submit Sample Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
