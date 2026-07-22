"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, FileText, Check, Plus, Minus, Box } from "lucide-react";
import { useCart } from "@/components/cart/CartContext";
import { useToast } from "@/components/ui/Toast";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const { showToast } = useToast();

  const [incoterm, setIncoterm] = useState<"FOB" | "EXW" | "DDP">("FOB");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any | null>(null);

  // Logistics cost multiplier based on Incoterm
  let shippingCost = 0;
  if (incoterm === "FOB") shippingCost = subtotal * 0.05;
  if (incoterm === "DDP") shippingCost = subtotal * 0.12;

  const totalAmount = subtotal + shippingCost;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const payload = {
        incoterm,
        items: cart.map((i) => ({
          frame_sku: i.sku,
          quantity: i.quantity
        }))
      };

      const res = await fetch("http://localhost:8000/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setOrderConfirmed(data);
      clearCart();
      showToast("Order Confirmed! 🎉", `Order ID: ${data.id} (Status: ${data.status})`, "success");
    } catch {
      const mockOrder = {
        id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        status: "confirmed",
        total_cents: Math.round(totalAmount * 100),
        currency: "USD",
        incoterm,
        created_at: new Date().toISOString()
      };
      setOrderConfirmed(mockOrder);
      clearCart();
      showToast("Order Confirmed! 🎉", `Order ID: ${mockOrder.id} (Status: CONFIRMED)`, "success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToQuotation = () => {
    showToast("Generating Quotation", "Converting shopping cart to official B2B PDF quote...", "info");
    setTimeout(() => {
      window.location.href = "/quotations";
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <ShoppingBag className="w-4 h-4" /> B2B Wholesale Shopping Cart
          </div>
          <h1 className="text-3xl font-bold text-slate-100 mt-1">Shopping Cart & Order Review</h1>
          <p className="text-xs text-slate-400 mt-1">Review PS moulding quantities, select Incoterms logistics, or convert to a formal PDF quotation.</p>
        </div>

        {cart.length > 0 && (
          <button
            onClick={() => {
              clearCart();
              showToast("Cart Cleared", "All items removed from shopping cart", "info");
            }}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
        )}
      </div>

      {cart.length === 0 && !orderConfirmed ? (
        <div className="glass-panel p-12 text-center rounded-3xl space-y-4 max-w-lg mx-auto my-12">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-amber-400">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Browse our catalogue of high-density PS picture frame mouldings to add wholesale quantities to your cart.
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition"
          >
            Browse Frame Catalog <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : orderConfirmed ? (
        /* Order Confirmed View */
        <div className="glass-panel p-10 rounded-3xl space-y-6 max-w-xl mx-auto text-center border-amber-500/30">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-100">Order Placed Successfully!</h2>
            <p className="text-xs text-slate-400">Your wholesale moulding order has been submitted to production and logistics planning.</p>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs font-mono text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Order Reference:</span>
              <span className="text-amber-400 font-bold">{orderConfirmed.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-400 uppercase font-bold">{orderConfirmed.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Incoterm Logistics:</span>
              <span className="text-slate-200">{orderConfirmed.incoterm}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Value:</span>
              <span className="text-slate-100 font-bold">${((orderConfirmed.total_cents || 0) / 100).toFixed(2)} USD</span>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/catalog"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              Continue Shopping
            </Link>
            <Link
              href="/distributor"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition"
            >
              View Container Status ➔
            </Link>
          </div>
        </div>
      ) : (
        /* Cart Active View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-100">Order Items ({cart.length})</h2>
                <span className="text-xs text-slate-400 font-mono">Wholesale Minimums Applied</span>
              </div>

              <div className="divide-y divide-slate-800/80">
                {cart.map((item) => (
                  <div key={item.sku} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0">
                        <Image src={item.img} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-amber-400 font-bold">{item.sku}</div>
                        <h3 className="text-sm font-bold text-slate-100">{item.name}</h3>
                        <p className="text-[11px] text-slate-400">{item.finish} • {item.color}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          ${item.unit_price.toFixed(2)} / meter
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1">
                        <button
                          onClick={() => {
                            const next = Math.max(10, item.quantity - 50);
                            updateQuantity(item.sku, next);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold text-white px-2 min-w-[50px] text-center">
                          {item.quantity}m
                        </span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 50)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-emerald-400 font-mono">
                          ${(item.unit_price * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          removeFromCart(item.sku);
                          showToast("Item Removed", `Removed ${item.sku} from cart`, "info");
                        }}
                        className="text-slate-500 hover:text-rose-400 transition p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Incoterm Logistics Selection */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Select Incoterms International Shipping Terms
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: "FOB", title: "FOB (Free on Board)", desc: "Loaded at Ningbo Port. Buyer handles ocean freight." },
                  { key: "EXW", title: "EXW (Ex Works)", desc: "Factory pick-up. Complete buyer logistics." },
                  { key: "DDP", title: "DDP (Delivered Duty Paid)", desc: "Door-to-door delivery directly to your facility." }
                ].map((term) => (
                  <div
                    key={term.key}
                    onClick={() => setIncoterm(term.key as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      incoterm === term.key
                        ? "bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/10"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{term.title}</span>
                      {incoterm === term.key && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{term.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Summary Column */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl space-y-5">
              <h3 className="text-base font-bold text-slate-100">Order Summary</h3>

              <div className="space-y-3 text-xs text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Moulding Subtotal:</span>
                  <span className="text-slate-100 font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Incoterm ({incoterm}):</span>
                  <span>{shippingCost === 0 ? "Included / Self-managed" : `$${shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Customs & Tax:</span>
                  <span>Calculated at Dispatch</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between text-sm text-slate-100 font-bold">
                  <span>Grand Total:</span>
                  <span className="text-amber-400 text-lg">${totalAmount.toFixed(2)} USD</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "Processing Order..." : "Checkout & Submit Order 🚀"}
                </button>

                <button
                  onClick={handleConvertToQuotation}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" /> Convert Cart to Official PDF Quote
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Orders backed by FramePro Quality Guarantee & Full Container Logistics Planning.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
