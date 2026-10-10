"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  key: string;
  variantId: string;
  productSlug: string;
  productName: string;
  /** e.g. "90 GSM Art Paper · Both sides · 8.25 x 11" */
  spec: string;
  quantity: number;
  /** Display price at the time of adding. The server re-prices at checkout. */
  price: number;
  /** Path inside the design-files bucket, e.g. "<user id>/1700000000-flyer.pdf". */
  filePath: string;
  fileName: string;
};

type CartContextValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  total: number;
  add: (item: Omit<CartItem, "key">) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "printza-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from storage once on mount
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // storage unavailable or corrupt: start with an empty cart
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota / private mode errors
    }
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "key">) => {
    setItems((prev) => [...prev, { ...item, key: crypto.randomUUID() }]);
  }, []);
  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      ready,
      count: items.length,
      total: items.reduce((sum, i) => sum + i.price, 0),
      add,
      remove,
      clear,
    }),
    [items, ready, add, remove, clear],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = use(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
