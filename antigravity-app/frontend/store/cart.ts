// Ch6 체크포인트 — Zustand 전역 장바구니 (persist로 새로고침 후 유지)
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";

interface CartItem {
  product: Product;
  qty: number;
}

interface CartState {
  items: CartItem[];
  add: (product: Product) => void;
  remove: (productId: number) => void;
  setQty: (productId: number, qty: number) => void;
  total: () => number;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (product) =>
        set((s) => {
          const found = s.items.find((i) => i.product.id === product.id);
          if (found) {
            return {
              items: s.items.map((i) =>
                i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          }
          return { items: [...s.items, { product, qty: 1 }] };
        }),
      remove: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.product.id !== productId) })),
      setQty: (productId, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.product.id === productId ? { ...i, qty: Math.max(1, qty) } : i
          ),
        })),
      total: () => get().items.reduce((sum, i) => sum + i.product.price * i.qty, 0),
      clear: () => set({ items: [] }),
    }),
    { name: "antigravity-cart" } // localStorage 키
  )
);
