import React from "react";
import { QuotationBuilder } from "@/components/distributor/QuotationBuilder";

export default function QuotationsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">B2B Quotation System</h1>
        <p className="text-xs text-slate-400 mt-1">Configure line items, validate MOQs, select Incoterms (FOB, EXW, DDP), and download branded PDF quotations instantly.</p>
      </div>
      <QuotationBuilder />
    </div>
  );
}
