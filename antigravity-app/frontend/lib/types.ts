// 백엔드 DTO와 1:1 매핑되는 타입 (Ch5 TypeScript)
export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  stock: number;
}

// 백엔드 ProblemDetail (RFC 9457, Ch4) 매핑 — 에러 응답 파싱용 (Ch7)
export interface ProblemDetail {
  type?: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string>;
}
