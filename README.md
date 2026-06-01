# Antigravity Fashion — 풀스택 개발자 재활(복귀) 학습 프로젝트

> 자바/스프링 + 리액트/Next.js 풀스택 개발자가 **현장 복귀**를 위해 기초부터 2026 최신 실무 스택까지 다시 익히는 학습 대시보드 + 실습 레포.
> 가상 의류 쇼핑몰 **"Antigravity Fashion"** 도메인 하나로 전 챕터가 일관되게 이어집니다.

---

## 이게 뭔가요

두 부분으로 구성됩니다.

| 구성 | 위치 | 역할 |
|------|------|------|
| **학습 대시보드** | `C:\Study` (이 폴더) | 정적 HTML 학습 사이트 — 8개 챕터 + 4개 부록, 퀴즈·검색·용어사전·다이어그램 |
| **실습 레포** | `antigravity-app/` | 대시보드의 "직접 만들어보기" 체크포인트를 실제로 구현하는 Spring Boot + Next.js 프로젝트 |

핵심 철학: **읽기 ≠ 실력.** 챕터를 읽고 → 실습 레포의 `// TODO(ChN)` 빈칸을 직접 채워 → 테스트를 통과시키고 → 실행해 확인하는 흐름으로 "복습"이 아닌 "복귀"를 목표로 합니다.

---

## 빠른 시작

### 1) 학습 대시보드 보기
- **글·다이어그램·퀴즈만** 보려면: `index.html` 더블클릭으로 충분.
- **검색(Ctrl+K)·용어 hover 툴팁·데모샵**까지 쓰려면 로컬 서버 필요 (파일 직접 열기는 브라우저 CORS로 fetch가 막힘):
  ```bash
  python -m http.server 5500      # → http://localhost:5500
  ```
  또는 VS Code **Live Server** 확장 → `index.html` 우클릭 → "Open with Live Server".
- 사이트 헤더의 **🚀 실행 방법** 버튼을 누르면 위 명령들을 복사할 수 있습니다.

### 2) 실습 레포 실행 — Docker 없이 (권장)
```bash
# 백엔드 (H2 인메모리 — PostgreSQL·Redis·Docker 불필요)
cd antigravity-app/backend && ./gradlew bootRun --args="--spring.profiles.active=dev"
#  → http://localhost:8080/api/products  ·  /swagger-ui.html

# 프론트엔드
cd antigravity-app/frontend && npm install && npm run dev
#  → http://localhost:3000
```
> Docker/`docker-compose`는 **Ch8(데브옵스) 학습 시에만** 선택적으로 사용. 자세한 매핑은 [`antigravity-app/CHECKPOINTS.md`](antigravity-app/CHECKPOINTS.md).

---

## 커리큘럼

**백엔드 코스**
1. **모던 자바 핵심** — 람다·Stream·함수형 인터페이스(Java 8 기반) → var·Record·Pattern Matching·Sealed → 스레드 기초 → Virtual Threads(Java 21)
2. **Spring Boot 3.4+ · 레이어드 아키텍처 · JPA** — DispatcherServlet·Bean·커넥션 풀 → 엔티티 생명주기·N+1·Fetch Join → MapStruct → Virtual Threads 활용
3. **DB/SQL · QueryDSL** — SELECT/JOIN·GROUP BY·서브쿼리·정규화·트랜잭션(ACID) → 인덱스(B-Tree)·QueryDSL 동적 쿼리 → Flyway 마이그레이션
4. **REST · 인증·보안 · Security 6 · Redis JWT** — 로깅·Validation·ProblemDetail → 쿠키/세션·해싱·필터·HTTPS 토대 → JWT·SecurityFilterChain·BCrypt·블랙리스트

**프론트엔드 코스**

5. **모던 JS(ES6+) 기초 → React 19 & Next.js 15 + TypeScript** — 클로저·async/await·구조분해·배열메서드 → JSX·TS → Hooks → Server/Client Component·App Router
6. **고급 React · Zustand · React Hook Form + Zod** — Custom Hook·TanStack Query → Zustand → RHF+Zod 폼
7. **풀스택 통합 · WebSocket · TypeScript Axios · Server Actions** — 클래식 통합 + 2026 모던 패턴

**데브옵스 코스**

8. **인프라 기초 · Docker · GitHub Actions · AWS · Spring Modulith · MSA** — 셸·네트워킹·컨테이너 vs VM 토대 → Docker·CI/CD → MSA·Saga·Circuit Breaker

**스페셜 부록**
- **A. 테스트 코드** — JUnit5·Mockito·`@MockitoBean`·@WebMvcTest·@DataJpaTest·RTL·Playwright
- **B. 면접 단골 CS & 심화** — CS 기초·트랜잭션·동시성·OWASP Top 10·캐싱 전략·`@Transactional` 함정
- **C. 코딩 테스트 / 알고리즘** — 재귀·자료구조 기초 → BFS/DFS/DP/그리디/다익스트라 + 빈출 문제 큐레이션
- **D. AI-Native 통합** — LLM·토큰·프롬프트 기초 → pgvector·하이브리드 검색(RRF) → Spring AI·Agentic RAG → Generative UI

각 챕터: **비유 → 쇼핑몰 코드 예제 → 용어 사전 → 미니 퀴즈 → 직접 만들어보기(빌드 체크포인트)** 구조.

---

## 핵심 기능 (대시보드)

- **자동 학습 장치**: 우측 스크롤스파이 TOC, 상단 읽기 진행률 바, 챕터 하단 이전/다음 네비
- **용어 사전**: 79개 용어, `Ctrl/Cmd+K` 검색 + 본문 단어 hover 툴팁(자동 태깅)
- **하이브리드 시각자료**: 개념 비유 일러스트(webp) + Mermaid 다이어그램(다크/라이트 자동) + 인라인 SVG
- **퀴즈 엔진**: 챕터별 객관식 + 코드 완성형, 80% 통과 시 진척도 반영(LocalStorage 영구 저장)
- **Mock 백엔드**: `mock-api.js` + LocalStorage DB(버전 관리·리셋)로 작동하는 듯한 데모샵
- **테마**: 다크/라이트 토글

---

## 다루는 기술 스택 (2026 기준)

Java 21 · Spring Boot 3.4+ · Spring Security 6 · JPA/Hibernate · QueryDSL · Flyway · Redis · Spring Modulith · Spring AI · pgvector
React 19 · Next.js 15 (App Router) · TypeScript · react-hook-form · Zod · Zustand · TanStack Query · Vercel AI SDK
Docker · docker-compose · GitHub Actions · AWS · JUnit5 · Mockito · RTL · Playwright

> ⚠️ **버전 정확성**: 버전 민감 항목(React Compiler, Next.js 15 캐싱/Turbopack, AI SDK `streamUI`, `@MockitoBean`, Spring Security/AI)은 **2026-05-28 기준 공식 문서로 직접 검증**했습니다. 빠르게 바뀌는 영역이므로 실제 적용 전 각 공식 문서에서 현재 버전을 재확인하세요.

---

## 폴더 구조

```
C:\Study\
├── index.html                  # 학습 대시보드 메인 (헤더에 🚀 실행 방법 버튼)
├── chapter-1.html ~ 8.html     # 8개 챕터
├── appendix-test/interview/algorithm/ai.html   # 4개 부록
├── demo-shop.html              # 작동하는 가상 쇼핑몰 데모
├── assets/                     # style.css, main.js, quiz.js, search.js, mock-api.js, glossary.json, learning-visuals/
├── lib/                        # prism, lunr (CDN 대체 라이브러리)
├── antigravity-app/            # 🛠️ 실습 레포 (Spring Boot + Next.js) — CHECKPOINTS.md 참고
├── IMPLEMENTATION_PLAN.md      # 대시보드 설계/구현 계획 (v3.x)
└── README.md                   # (이 문서)
```

---

## 관련 문서

- [`antigravity-app/CHECKPOINTS.md`](antigravity-app/CHECKPOINTS.md) — 챕터 ↔ 실습 파일 ↔ TODO ↔ 검증 매핑 (실습 시작점)
- [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) — 대시보드 설계 결정·구조·검증 계획

---

## 학습 추천 순서

1. 대시보드 헤더 **🚀 실행 방법**으로 실습 레포 H2 한 줄 실행 확인
2. **Ch1 읽기** → `antigravity-app`에서 `product/` 완성본 구경 → Ch1 빌드 체크포인트 실습
3. Ch2~8 + 부록 순서대로: 읽기 → 빈칸(TODO) 채우기 → 테스트 초록 → 실행 확인
4. 막히면 본문 cross-link로 토대 챕터 복귀 (예: Ch5 클로저 → Hooks)

**Docker는 끝까지 안 써도 Ch1~7 + 부록 전부 가능합니다. Ch8에서만 선택적으로.**
