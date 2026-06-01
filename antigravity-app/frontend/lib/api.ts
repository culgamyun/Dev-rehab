// Ch7 체크포인트 — 타입 안전 Axios 클라이언트 + 인터셉터
import axios, { AxiosError } from "axios";
import type { Product, ProblemDetail } from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8080",
});

// 요청 인터셉터: JWT 자동 주입 (Ch4 토큰을 localStorage에서)
api.interceptors.request.use((cfg) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// 백엔드 ProblemDetail 에러를 읽기 쉬운 메시지로 변환 (Ch4↔Ch7 연계)
function toMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const ae = e as AxiosError<ProblemDetail>;
    const p = ae.response?.data;
    if (p?.title) return p.detail ? `${p.title}: ${p.detail}` : p.title;
  }
  return "알 수 없는 오류가 발생했습니다.";
}

// ===== 참고용 완성 API (product) =====
export async function fetchProducts(): Promise<Product[]> {
  const res = await api.get<Product[]>("/api/products");
  return res.data;
}

export async function fetchProduct(id: number): Promise<Product> {
  try {
    const res = await api.get<Product>(`/api/products/${id}`);
    return res.data;
  } catch (e) {
    throw new Error(toMessage(e));
  }
}

// TODO(Ch7): createOrder(req) — 주문 생성 API 호출 + 에러 처리
// TODO(Ch4): login(email, password) — 토큰 저장 / logout() — 토큰 제거

export default api;
