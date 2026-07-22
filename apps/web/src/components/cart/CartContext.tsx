"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface CartItem {
  sku: string;
  name: string;
  material: string;
  finish: string;
  color: string;
  width_mm: number;
  depth_mm: number;
  moq: number;
  unit_price: number;
  quantity: number;
  img: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialDefaultCart: CartItem[] = [
  {
    sku: "FP-2201-WAL",
    name: "Heritage Walnut & Gold Inlay",
    material: "PS Moulding",
    finish: "Walnut Wood Grain",
    color: "Walnut / Gold",
    width_mm: 55,
    depth_mm: 35,
    moq: 100,
    unit_price: 14.00,
    quantity: 100,
    img: "/samples/frame_walnut.jpg"
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
    unit_price: 18.00,
    quantity: 100,
    img: "/samples/frame_walnut.jpg"
  }
];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(initialDefaultCart);

  // Load from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem("framepro_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("framepro_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  const addToCart = useCallback((item: Omit<CartItem, "quantity">, quantityToAdd?: number) => {
    const qty = quantityToAdd || item.moq || 100;
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.sku === item.sku);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += qty;
        return updated;
      } else {
        return [...prev, { ...item, quantity: qty }];
      }
    });
  }, []);

  const removeFromCart = useCallback((sku: string) => {
    setCart((prev) => prev.filter((i) => i.sku !== sku));
  }, []);

  const updateQuantity = useCallback((sku: string, newQty: number) => {
    setCart((prev) =>
      prev.map((i) => (i.sku === sku ? { ...i, quantity: Math.max(10, newQty) } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
