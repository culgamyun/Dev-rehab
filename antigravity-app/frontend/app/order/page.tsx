"use client";
// Ch6 체크포인트(TODO) — react-hook-form + Zod 주문 폼을 직접 완성하세요.
// 아래는 뼈대 + 힌트입니다. 완성하면 장바구니(Zustand)와 연결하고 Ch7에서 백엔드로 전송하세요.

import { useCart } from "@/store/cart";
// TODO(Ch6): import { useForm } from "react-hook-form";
// TODO(Ch6): import { zodResolver } from "@hookform/resolvers/zod";
// TODO(Ch6): import { z } from "zod";

// TODO(Ch6): 주문 스키마 정의 (백엔드 Bean Validation과 동일 규칙)
// const orderSchema = z.object({
//   shippingAddress: z.string().min(1, "배송지를 입력하세요").max(200),
//   phone: z.string().regex(/^010-\d{4}-\d{4}$/, "010-1234-5678 형식"),
//   paymentMethod: z.enum(["CARD", "TRANSFER", "POINT"]),
// });
// type OrderForm = z.infer<typeof orderSchema>;

export default function OrderPage() {
  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());

  // TODO(Ch6): const { register, handleSubmit, formState:{errors,isSubmitting} } =
  //   useForm<OrderForm>({ resolver: zodResolver(orderSchema) });
  // TODO(Ch7): const onSubmit = async (data) => { await createOrder(...); }

  return (
    <section>
      <h2>주문하기</h2>
      <h3>장바구니 ({items.length}개 · 합계 {total.toLocaleString()}원)</h3>
      <ul>
        {items.map((i) => (
          <li key={i.product.id}>
            {i.product.name} × {i.qty}
          </li>
        ))}
      </ul>

      {/* TODO(Ch6): 아래를 react-hook-form + Zod로 교체하고 검증 에러를 표시하세요. */}
      <form /* onSubmit={handleSubmit(onSubmit)} */>
        <p>⚠️ TODO(Ch6): 배송지/전화번호/결제수단 입력 + Zod 검증 구현</p>
        <button type="submit" disabled>주문 (구현 필요)</button>
      </form>
    </section>
  );
}
