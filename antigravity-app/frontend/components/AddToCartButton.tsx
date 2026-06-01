"use client"; // Ch5 — 인터랙션이 필요한 부분만 Client Component

import { useCart } from "@/store/cart";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const add = useCart((s) => s.add); // Ch6 Zustand selector

  return (
    <button
      onClick={() => add(product)}
      disabled={product.stock === 0}
      style={{ padding: "8px 16px", cursor: product.stock ? "pointer" : "not-allowed" }}
    >
      {product.stock === 0 ? "품절" : "장바구니 담기"}
    </button>
  );
}
