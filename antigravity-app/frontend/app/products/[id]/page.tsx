// Ch5 참고용 완성본 — 동적 라우트 + Next.js 15 async params
import { fetchProduct } from "@/lib/api";
import AddToCartButton from "@/components/AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>; // Next.js 15: params는 Promise → await 필수
}) {
  const { id } = await params;
  const product = await fetchProduct(Number(id));

  return (
    <section>
      <a href="/products">← 목록으로</a>
      <h2>{product.name}</h2>
      <p>{product.price.toLocaleString()}원</p>
      <p>카테고리: {product.category} · 재고: {product.stock}</p>
      <AddToCartButton product={product} />
    </section>
  );
}
