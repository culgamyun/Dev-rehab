# Antigravity 빌드 체크포인트 — 읽기에서 실력으로

이 레포는 **학습 대시보드(`C:\Study`)의 "직접 만들어보기" 체크포인트를 실제로 구현하는 동반 프로젝트**입니다.

## 사용법 (핵심)

1. 대시보드에서 챕터를 **읽습니다**.
2. 아래 표에서 그 챕터의 **파일 + TODO**를 엽니다.
3. `// TODO(ChN):` 빈칸을 **직접 채웁니다**. (완성형 정답을 보지 마세요 — `product/` 슬라이스만 참고용 완성본입니다.)
4. 해당 **테스트를 초록으로** 만들고, **실행해 눈으로 확인**합니다.

> 원칙: 완성된 코드를 읽는 건 또 다른 "읽기"입니다. **빈칸을 채워 테스트를 통과시키는 것**이 복귀 훈련입니다.

## 빠른 시작

### 🟢 옵션 A — Docker 없이 (가장 간편, 권장 시작)
PostgreSQL·Redis·Docker 전부 불필요. H2 인메모리로 즉시 실행:
```bash
# 백엔드 (gradlew 래퍼는 최초 1회 'gradle wrapper'로 생성, 또는 IDE가 자동)
cd backend && ./gradlew bootRun --args='--spring.profiles.active=dev'
#  → http://localhost:8080/api/products  (시드 상품 5개 즉시 확인)
#  → http://localhost:8080/swagger-ui.html
./gradlew test                              # 테스트 (H2, 인프라 불필요)

# 프론트엔드
cd frontend && npm install && npm run dev   # http://localhost:3000
```

### 🐳 옵션 B — Docker로 풀스택 (Ch8 학습 시 / 운영 유사 환경)
```bash
docker compose up -d postgres redis     # 인프라만
cd backend && ./gradlew bootRun          # (기본 프로파일 = PostgreSQL + Flyway)
docker compose up --build                # 전체 컨테이너 (Ch8 Dockerfile 완성 후)
```

> 정리: **평소 실습은 옵션 A(H2, Docker 0)**, **Ch8(데브옵스) 배울 때만 옵션 B**. Docker가 귀찮으면 끝까지 옵션 A로만 해도 Ch1~7 + 부록은 전부 가능합니다.

## 챕터 ↔ 파일 ↔ TODO ↔ 검증 매핑

| 챕터 | 무엇을 구현 | 파일 | 검증 |
|------|------------|------|------|
| **참고(완성본)** | product CRUD 한 슬라이스 (DTO/Entity 분리, 레이어드) | `backend/.../product/*` | `./gradlew test --tests ProductServiceTest` → 초록 |
| **Ch2** | Order 1:N 엔티티 + N+1 재현→Fetch Join 해결 | `backend/.../order/OrderService.java` | `./gradlew test --tests OrderServiceTest` |
| **Ch3** | 인덱스 + Flyway 마이그레이션 | `backend/.../resources/db/migration/V2__*.sql` | `EXPLAIN ANALYZE`로 Index Scan 확인 |
| **Ch4** | JWT 로그인/로그아웃 + ProblemDetail + Filter | `backend/.../auth/*`, `common/GlobalExceptionHandler.java` | `./gradlew test --tests AuthFlowTest` + Swagger |
| **Ch5** | 상품 목록/상세 (Server Component, async params) | `frontend/app/products/*` | `npm run dev` → /products |
| **Ch6** | RHF+Zod 주문 폼 + Zustand 장바구니 | `frontend/app/order/page.tsx`, `frontend/store/cart.ts` | 폼 검증 동작 + 새로고침 후 장바구니 유지 |
| **Ch7** | 타입 Axios로 백엔드 연결 + 실시간 알림 | `frontend/lib/api.ts` | 로그인→주문 E2E, 토큰 자동 주입 |
| **Ch8** | Dockerfile + docker-compose + CI | `*/Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml` | `docker compose up --build` |
| **부록 A** | 5종 테스트 (단위/슬라이스/통합/RTL/E2E) | `backend/src/test/*`, `frontend` 테스트 | 전부 초록 |
| **부록 D** | RAG 엔드포인트 + 한계 문서화 | (선택) `backend/.../ai/` 직접 생성 | 검색 미스/환각 케이스 기록 |

## 기술 스택 (대시보드 v3.4 기준)

- **Backend**: Spring Boot 3.4, Java 21, Gradle, JPA/Hibernate, Flyway, Spring Security 6 (lambda DSL), PostgreSQL, Redis, `@MockitoBean` 테스트
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, react-hook-form + Zod, Zustand, TanStack Query, Axios
- **Infra**: Docker, docker-compose, GitHub Actions

> ⚠️ 버전 민감 항목(React Compiler, AI SDK 등)은 실제 적용 전 각 공식 문서에서 현재 버전을 재확인하세요. 본 스캐폴딩은 2026-05-28 기준 공식 문서에 맞춰 작성됐습니다.
