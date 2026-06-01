import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Antigravity Fashion",
  description: "풀스택 복귀 실습 프로젝트",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, padding: 24 }}>
        <header style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20 }}>🛍️ Antigravity Fashion</h1>
          <nav style={{ display: "flex", gap: 12, fontSize: 14 }}>
            <a href="/products">상품</a>
            <a href="/order">주문</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
