"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

interface Product {
  sku: string;
  name: string;
  material: string;
  finish: string;
  color: string;
  width_mm: number;
  depth_mm: number;
  moq: number;
  retail_price_cents: number;
  wholesale_price_cents: number;
}

const initialProducts: Product[] = [
  { sku: "FP-GOLD-804", name: "Luxury Gold Baroque Frame Profile", material: "PS Composite", finish: "Foil Stamping", color: "Antique Gold", width_mm: 45, depth_mm: 25, moq: 100, retail_price_cents: 3500, wholesale_price_cents: 1800 },
  { sku: "FP-BLK-201", name: "Modern Minimalist Matte Black Profile", material: "Recycled PS", finish: "Matte", color: "Black", width_mm: 30, depth_mm: 20, moq: 200, retail_price_cents: 1800, wholesale_price_cents: 950 },
  { sku: "FP-WAL-502", name: "Deep Walnut Grain Hotel Framing Profile", material: "PS Composite", finish: "Wood Grain Film", color: "Walnut", width_mm: 60, depth_mm: 35, moq: 150, retail_price_cents: 4200, wholesale_price_cents: 2200 },
  { sku: "FP-SLV-309", name: "Brushed Champagne Silver Profile", material: "PS Composite", finish: "Brushed Metallic", color: "Silver", width_mm: 38, depth_mm: 22, moq: 120, retail_price_cents: 2900, wholesale_price_cents: 1450 },
];

export default function AdminProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingSku, setDeletingSku] = useState<string | null>(null);

  // CSV Import State
  const [csvRaw, setCsvRaw] = useState("");
  const [previewData, setPreviewData] = useState<any | null>(null);

  // New Product Form State
  const [newProduct, setNewProduct] = useState<Product>({
    sku: "",
    name: "",
    material: "PS Composite",
    finish: "Matte",
    color: "Black",
    width_mm: 30,
    depth_mm: 20,
    moq: 100,
    retail_price_cents: 2000,
    wholesale_price_cents: 1000,
  });

  const filtered = products.filter(
    (p) =>
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.color.toLowerCase().includes(search.toLowerCase())
  );

  const handleSimulateCSVPreview = () => {
    if (!csvRaw.trim()) {
      showToast("Input Required", "Please paste CSV content to generate diff preview", "warning");
      return;
    }
    const lines = csvRaw.trim().split("\n");
    const creates: any[] = [];
    const updates: any[] = [];

    lines.forEach((line, idx) => {
      if (idx === 0 && line.includes("sku")) return; // skip header
      const parts = line.split(",");
      if (parts.length >= 2) {
        const sku = parts[0].trim();
        const name = parts[1].trim();
        const exists = products.some((p) => p.sku === sku);
        const item = { sku, name, material: "PS", color: "Gold", retail_price_cents: 2500 };
        if (exists) updates.push(item);
        else creates.push(item);
      }
    });

    setPreviewData({
      summary: { total_rows: creates.length + updates.length, creates_count: creates.length, updates_count: updates.length, errors_count: 0 },
      creates,
      updates,
    });
    showToast("Diff Preview Ready", `Found ${creates.length} new profiles and ${updates.length} updates`, "info");
  };

  const handleCommitImport = () => {
    if (!previewData) return;
    const newItems: Product[] = [...products];
    previewData.creates.forEach((c: any) => {
      newItems.push({
        sku: c.sku,
        name: c.name,
        material: "PS Composite",
        finish: "Standard",
        color: "Black",
        width_mm: 35,
        depth_mm: 22,
        moq: 100,
        retail_price_cents: c.retail_price_cents || 2500,
        wholesale_price_cents: 1200,
      });
    });
    setProducts(newItems);
    setShowImportModal(false);
    showToast(
      "CSV Import Committed",
      `Successfully imported ${previewData.summary.creates_count} new profile(s) into catalog!`,
      "success"
    );
    setPreviewData(null);
    setCsvRaw("");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.sku.trim() || !newProduct.name.trim()) {
      showToast("Validation Error", "SKU and Name are required", "error");
      return;
    }
    setProducts([newProduct, ...products]);
    setShowCreateModal(false);
    showToast("Product Created", `Profile ${newProduct.sku} created successfully!`, "success");
    setNewProduct({ sku: "", name: "", material: "PS Composite", finish: "Matte", color: "Black", width_mm: 30, depth_mm: 20, moq: 100, retail_price_cents: 2000, wholesale_price_cents: 1000 });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setProducts(products.map((p) => (p.sku === editingProduct.sku ? editingProduct : p)));
    showToast("Product Updated", `Profile ${editingProduct.sku} saved successfully!`, "success");
    setEditingProduct(null);
  };

  const handleDeleteConfirm = () => {
    if (!deletingSku) return;
    setProducts(products.filter((p) => p.sku !== deletingSku));
    showToast("Product Deleted", `Profile ${deletingSku} soft deleted from catalog.`, "warning");
    setDeletingSku(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Product Catalog Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage PS moulding profiles, internal cost / wholesale pricing, and bulk CSV uploads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
          >
            <span>📥</span> Bulk CSV Import
          </button>
          <a
            href="/v1/admin/products/export"
            download="framepro_catalog.csv"
            onClick={() => showToast("Exporting Catalog", "Downloading framepro_catalog.csv...", "info")}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
          >
            <span>📤</span> Export CSV
          </a>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
          >
            <span>➕</span> Add Product
          </button>
        </div>
      </div>

      {/* Filter / Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by SKU, name, color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300">
              ✕
            </button>
          )}
        </div>
        <div className="text-xs text-slate-400">
          Showing <span className="font-bold text-amber-400">{filtered.length}</span> profile(s)
        </div>
      </div>

      {/* Products Data Grid Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">SKU / Profile</th>
                <th className="py-3.5 px-4 font-semibold">Material & Finish</th>
                <th className="py-3.5 px-4 font-semibold">Color</th>
                <th className="py-3.5 px-4 font-semibold">Dimensions</th>
                <th className="py-3.5 px-4 font-semibold">MOQ</th>
                <th className="py-3.5 px-4 font-semibold text-right">Wholesale Price</th>
                <th className="py-3.5 px-4 font-semibold text-right">Retail Price</th>
                <th className="py-3.5 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((p) => (
                <tr key={p.sku} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white font-mono">{p.sku}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[200px]">{p.name}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-slate-200">{p.material}</div>
                    <div className="text-[11px] text-slate-400">{p.finish}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-200 border border-slate-700">
                      {p.color}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                    {p.width_mm}mm × {p.depth_mm}mm
                  </td>
                  <td className="py-3.5 px-4 font-mono text-amber-300">{p.moq}m</td>
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-400 font-mono">
                    ${(p.wholesale_price_cents / 100).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                    ${(p.retail_price_cents / 100).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center space-x-2">
                    <button
                      onClick={() => setEditingProduct({ ...p })}
                      className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setDeletingSku(p.sku)}
                      className="px-2 py-1 rounded bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] transition"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleEditSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>✏️</span> Edit Moulding Profile
                </h2>
                <p className="text-xs text-amber-400 font-mono">{editingProduct.sku}</p>
              </div>
              <button type="button" onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="block text-slate-400 font-medium mb-1">Profile Name</label>
                <input
                  required
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Material</label>
                <input
                  type="text"
                  value={editingProduct.material}
                  onChange={(e) => setEditingProduct({ ...editingProduct, material: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Finish</label>
                <input
                  type="text"
                  value={editingProduct.finish}
                  onChange={(e) => setEditingProduct({ ...editingProduct, finish: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Color</label>
                <input
                  type="text"
                  value={editingProduct.color}
                  onChange={(e) => setEditingProduct({ ...editingProduct, color: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">MOQ (meters)</label>
                <input
                  type="number"
                  value={editingProduct.moq}
                  onChange={(e) => setEditingProduct({ ...editingProduct, moq: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Width (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingProduct.width_mm}
                  onChange={(e) => setEditingProduct({ ...editingProduct, width_mm: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Depth (mm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingProduct.depth_mm}
                  onChange={(e) => setEditingProduct({ ...editingProduct, depth_mm: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Wholesale Price (cents)</label>
                <input
                  type="number"
                  value={editingProduct.wholesale_price_cents}
                  onChange={(e) => setEditingProduct({ ...editingProduct, wholesale_price_cents: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Retail Price (cents)</label>
                <input
                  type="number"
                  value={editingProduct.retail_price_cents}
                  onChange={(e) => setEditingProduct({ ...editingProduct, retail_price_cents: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
              >
                Finish Edit & Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSku && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <span>⚠️</span> Confirm Delete Profile
              </h2>
              <button onClick={() => setDeletingSku(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to soft delete moulding profile <strong className="font-mono text-amber-300">{deletingSku}</strong>?
            </p>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setDeletingSku(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Bulk Import Modal with Diff Preview */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📥</span> Bulk CSV Catalog Import (Transactional Diff Preview)
              </h2>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Paste CSV rows below. The system will calculate a <strong>diff preview</strong> (creates vs updates) before committing changes in a single transaction.
            </p>

            <textarea
              rows={4}
              placeholder="sku,name,material,finish,color&#10;FP-NEW-101,Nordic Oak Grain Frame,PS Composite,Wood Grain,Oak"
              value={csvRaw}
              onChange={(e) => setCsvRaw(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
            />

            <button
              onClick={handleSimulateCSVPreview}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs rounded-xl border border-slate-700 w-full"
            >
              Generate Diff Preview 🔍
            </button>

            {previewData && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-200">Diff Preview Result:</h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg">
                    <p className="text-[10px] text-emerald-400 font-semibold uppercase">Creates</p>
                    <p className="text-lg font-bold text-emerald-300">{previewData.summary.creates_count}</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/30 p-2 rounded-lg">
                    <p className="text-[10px] text-blue-400 font-semibold uppercase">Updates</p>
                    <p className="text-lg font-bold text-blue-300">{previewData.summary.updates_count}</p>
                  </div>
                  <div className="bg-rose-500/10 border border-rose-500/30 p-2 rounded-lg">
                    <p className="text-[10px] text-rose-400 font-semibold uppercase">Errors</p>
                    <p className="text-lg font-bold text-rose-300">{previewData.summary.errors_count}</p>
                  </div>
                </div>

                <button
                  onClick={handleCommitImport}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
                >
                  Confirm & Commit Transaction 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">Add New Moulding Profile</h2>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">SKU</label>
                <input
                  required
                  type="text"
                  placeholder="FP-GOLD-99"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Profile Name</label>
                <input
                  required
                  type="text"
                  placeholder="Luxury Gold Profile"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Material</label>
                <input
                  type="text"
                  value={newProduct.material}
                  onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Color</label>
                <input
                  type="text"
                  value={newProduct.color}
                  onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Wholesale Price (cents)</label>
                <input
                  type="number"
                  value={newProduct.wholesale_price_cents}
                  onChange={(e) => setNewProduct({ ...newProduct, wholesale_price_cents: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1">Retail Price (cents)</label>
                <input
                  type="number"
                  value={newProduct.retail_price_cents}
                  onChange={(e) => setNewProduct({ ...newProduct, retail_price_cents: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20"
              >
                Save Product Profile
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
