'use client'

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

export type CartItem = {
  id: string;
  name: string;
  reference: string;
  url?: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  isInCart: (id: string) => boolean;
  updateQty: (id: string, qty: number) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('cart-items') : null;
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Partial<CartItem>[];
      return parsed.map((i) => ({
        id: i.id as string,
        name: i.name as string,
        reference: i.reference as string,
        url: i.url,
        qty: typeof i.qty === 'number' && i.qty > 0 ? i.qty : 1,
      }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart-items', JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = useCallback((item: Omit<CartItem, 'qty'>, qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const isInCart = useCallback((id: string) => items.some((i) => i.id === id), [items]);

  const updateQty = useCallback((id: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)));
  }, []);

  const increase = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
  }, []);

  const decrease = useCallback((id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i)));
  }, []);

  const value = useMemo(
    () => ({ items, add, remove, clear, isInCart, updateQty, increase, decrease }),
    [items, add, remove, clear, isInCart, updateQty, increase, decrease]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
