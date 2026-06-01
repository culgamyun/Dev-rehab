// Ch5 참고용 완성본 — Server Component (서버에서 직접 데이터 fetch, "use client" 없음)
import { fetchProducts } from "@/lib/api";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductsPage() {
  // 서버에서 직접 호출. Next.js 15: fetch는 기본 캐싱 안 됨(필요 시 옵션 명시)
  const products = await fetchProducts();

  return (
    <section>
      <h2>상품 목록</h2>
      <ul style={{ display: "grid", gap: 12, listStyle: "none", padding: 0 }}>
        {products.map((p) => (
          <li key={p.id} style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}>
            <a href={`/products/${p.id}`}>
              <strong>{p.name}</strong>
            </a>
            <p>{p.price.toLocaleString()}원 · {p.category} · 재고 {p.stock}</p>
            {/* 인터랙션 부분만 Client Component로 분리 */}
            <AddToCartButton product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
