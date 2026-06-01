# 학습 대시보드 구현 계획 v3.2 (실무 패턴 통합 + 부록 강화)

> Antigravity Fashion 도메인 기반 풀스택 자바/리액트/Next.js 재활 학습 대시보드
> 작성: 2026-05-26 | 개정: 2026-05-28 | 버전: v3.3 (시각자료 체계 현실화 반영)
> 변경 이력: v1 (단일 HTML) → v2 (멀티파일 분리) → v3 (로컬 서버 + 로컬 DB + 검색 캐싱 + Mermaid/SVG) → v3.1 (2026 AI 트렌드 분리 + UI/UX 4종) → v3.2 (실무 패턴 4종 인라인 + 보강 6종 + 부록 B 강화) → v3.3 (개념 비유 raster 일러스트 시각 체계를 정식 반영 — Mermaid/SVG와 3중 하이브리드로 명문화)

---

## 0. 결정 배경 및 피드백 보완 요약

이 프로젝트는 웹 브라우저의 보안 정책과 정적 사이트 개발 시 마주하는 현실적인 기술 장벽을 극복하면서, 2026년 실무 동향까지 흡수하기 위해 아래 일곱 가지 핵심 피드백을 수용하여 최종 개정되었습니다.

### 1) 로컬 웹 서버 실행 필수 전제화 (file:// CORS 장벽 해결)
*   **원인:** 브라우저는 `file:///C:/Study/index.html` 형태로 파일을 더블 클릭하여 실행할 경우, 로컬 파일 간의 `fetch` 요청을 CORS 정책으로 전면 차단합니다.
*   **해결책:** 본 프로젝트는 **로컬 웹 서버(예: VS Code Live Server 또는 Python HTTP Server 등)** 상에서 구동하는 것을 명시적인 필수 전제로 삼습니다. 이로써 `mock-data.json` 조회 및 챕터별 실시간 동적 검색이 차단 없이 안전하게 작동합니다.

### 2) LocalStorage Mock DB 고도화 (버전 관리 & 리셋 안전장치)
*   **보완점:** 학습 과정에서 챕터별 상태 변화와 Mock 데이터의 일관성을 완벽히 유지하기 위해 `localStorage` 데이터베이스를 운용하되, 개발 중 스키마 불일치(Schema Drift)로 인한 오작동을 막기 위해 **버전 관리 및 리셋 시스템**을 도입합니다.
    *   `localStorage.mockDB_version`을 대조하여 로컬 스키마 변경 시 자동 재적재(Reseed).
    *   사이드바 영역에 명시적인 **[데이터 초기화]** 버튼을 구현하여 언제든 최초의 깨끗한 쇼핑몰 데이터로 복구 가능.

### 3) 동적 검색 인덱싱 최적화 (sessionStorage 캐싱)
*   **보완점:** 12개 HTML 파일의 실시간 동적 검색(DOMParser)을 매 페이지 이동이나 검색 실행 시마다 서버에 재요청하는 비효율을 막기 위해, 첫 조회 결과를 **`sessionStorage`에 직렬화하여 캐싱**하는 메모리 보완책을 추가합니다.

### 4) 시각자료 렌더링 최적화 (raster 일러스트 + Mermaid + 인라인 SVG 3중 하이브리드)
*   **원칙:** 다크 모드에서 무방비로 떠 눈부심을 유발하는 raster 삽입을 금지하되, raster를 *전면* 배제하지는 않고 **용도에 따라 3가지를 구분**한다. (v3.3 현실화: 실제 구현은 개념 비유 raster 일러스트를 적극 사용 중이며, 이를 정식 표준으로 명문화)
    *   **개념 비유 raster 일러스트 (`.webp`):** "도서관=인덱스", "손목밴드=JWT"처럼 직관/감성으로 와닿아야 하는 비유 컷에 사용. `assets/learning-visuals/`에 챕터별 hero + 비유 이미지로 저장. 반드시 `<figure class="learning-visual">`(테마 카드 배경 `var(--bg-card)` + 테두리 + 16:9 프레임) 안에 넣어 다크모드 눈부심을 완화하고, `loading="lazy"` + 서술형 `alt` + `figcaption`을 동반한다.
    *   **Mermaid.js CDN:** 구조가 정형화되어 학습자가 수정하기 쉬운 ERD, 시퀀스, 플로우차트 등 **기술 다이어그램**에 사용 (다크/라이트 테마 반전 자동).
    *   **인라인 SVG:** 정교한 레이아웃과 AWS/Docker 등 전용 로고 그래픽이 필요한 복잡한 토폴로지에 적용.
*   **금지선:** 기술 다이어그램(ERD·시퀀스·아키텍처)은 raster로 박지 않는다 — 이건 여전히 Mermaid/SVG. raster는 "비유 일러스트"에 한정한다.

### 5) 2026 AI 패러다임 통합 전략 (인라인 vs 별도 부록)
*   **배경:** Gemini 3.1 Pro 피드백에서 React 19, Next.js 15, Virtual Threads, Spring Modulith, pgvector, Agentic RAG, Generative UI 등 최신 트렌드 흡수 제안이 들어왔습니다.
*   **판단:** 이 중 "버전 업데이트성"은 인라인 통합, "새 패러다임성"은 별도 부록으로 분리합니다. 본 프로젝트의 우선순위인 **"개념 학습 > 면접 키워드 수집"** 원칙을 지키며, 메인 8챕터의 깊이가 무너지지 않도록 합니다.
*   **인라인 통합 (버전 업데이트):**
    *   **Ch 1 / Ch 2:** Java 21 LTS의 Virtual Threads(Project Loom) → 비동기를 구조적으로 대체.
    *   **Ch 2 / Ch 8:** Spring Boot 3.4+ 및 Spring Modulith → 무분별한 MSA 분리의 합리적 대안.
    *   **Ch 5 / Ch 6:** React 19(React Compiler · useActionState 등) → useMemo/useCallback의 종말 + Next.js 15(Uncached by default · Turbopack).
*   **별도 부록 분리 (`appendix-ai.html`):** pgvector + 하이브리드 검색(RRF), Spring AI + Agentic RAG (multi-hop · Advisor 패턴), Generative UI + Vercel AI SDK + 스트리밍 렌더링. **메인 8챕터를 모두 완주한 학습자만 진입하는 심화 부록**으로 배치.

### 6) UI/UX 몰입감 강화 4종 (전역 적용)
*   **배경:** 챕터가 10개 이상의 심화 섹션으로 길어지면서 학습 동선과 몰입감 개선이 필요합니다.
*   **적용 4종:**
    1.  **우측 스크롤스파이 TOC:** 현재 읽고 있는 `<h2>` 섹션이 우측 사이드바에서 실시간 하이라이트.
    2.  **상단 읽기 진행률 바:** 스크롤에 반응하여 화면 상단에 가늘게 차오르는 진행 표시.
    3.  **챕터 하단 이전/다음 네비:** 좌측 메뉴 안 열고도 챕터 맨 밑에서 [← 이전] / [다음 →]로 매끄러운 이동.
    4.  **글로서리 툴팁:** RAG, Virtual Threads 등 전문 용어에 점선 밑줄. 마우스 오버 시 즉석 정의 표시(전역 `Cmd/Ctrl+K` 사전 팝업과 보완 관계).

### 7) 실무 패턴 4종 인라인 + 보강 6종 + 부록 B 강화 (v3.2 추가)
*   **배경:** 학습 콘텐츠 갭 분석 결과, 메인 8챕터에 면접/실무에서 곧바로 막힐 수 있는 실무 패턴이 누락된 것이 확인되었습니다. 별도 부록을 신설하지 않고 각 챕터 본문에 자연스럽게 통합하여 보강합니다.
*   **진짜 구멍 4종 (각 챕터에 필수 통합):**
    1.  **TypeScript** (Ch 5/6) — 2026년 React/Next.js 실무는 거의 100% TS. 자바 백그라운드라면 타입 시스템 흡수가 빠름. 자바스크립트로만 학습하면 실무 코드를 못 읽음.
    2.  **레이어드 아키텍처** (Ch 2) — Controller → Service → Repository → DTO/Entity. Spring 실무 코드의 척추. 현재 묻혀있던 구조를 명시적으로 도입.
    3.  **검증 + 에러 처리** (Ch 4) — Bean Validation(`@Valid`), `@ControllerAdvice` 글로벌 예외 처리, `ProblemDetail` (RFC 9457) 표준 에러 응답. 프론트 측 Zod 스키마 검증.
    4.  **폼 관리** (Ch 6) — react-hook-form + Zod로 쇼핑몰 주문 폼 구현. `useState` 폼의 한계와 RHF 도입 이유.
*   **보강 6종 (각 챕터 끝의 "실무 보강 박스"로 짧게 추가):**
    *   **Ch 4:** SLF4J + Logback 구조화 로깅 / Springdoc OpenAPI 자동 문서화
    *   **Ch 3:** Flyway DB 마이그레이션
    *   **Ch 2:** MapStruct 자동 DTO 매핑 vs 수동 변환
    *   **Ch 5:** 스타일링 선택지 비교 (CSS Modules vs Tailwind vs CSS-in-JS)
    *   **Ch 8:** GitHub Actions CI/CD 파이프라인 (빌드 → 테스트 → Docker 푸시 → 배포)
*   **부록 B (면접) 강화 주제 추가:**
    *   OWASP Top 10 (2021) — XSS, CSRF, SQL Injection, SSRF 등 방어 전반
    *   캐싱 전략 — `@Cacheable`, Look-aside vs Write-through, 캐시 무효화 패턴
    *   `@Transactional` 함정 모음 — self-invocation, propagation 7종, rollback rules, readOnly 효과

---

## 1. 확정된 핵심 아키텍처 결정

| 항목 | 결정 | 구현 및 보완 세부 사항 |
|------|------|------------------------|
| **구동 환경** | 로컬 웹 서버 필수 (`http://localhost:...`) | VS Code Live Server 권장, CORS 해결 |
| **페이지 구조** | 챕터별 정적 HTML 파일 분리 (총 12개 콘텐츠 파일) | 메인 8 + 부록 4 + 인덱스 + 데모 |
| **Mock DB** | `localStorage` 저장 + 버전 검증 + 리셋 | `localStorage.mockDB_version` 검증 적용 |
| **실시간 검색** | lunr.js + `sessionStorage` 캐싱 동적 인덱싱 | 최초 1회 fetch 후 브라우저 세션에 저장 |
| **다이어그램** | Mermaid + 인라인 SVG 하이브리드 | 다크 모드에 맞춘 테마 반전 대응 |
| **퀴즈 엔진** | 객관식 3문항 + 코드 완성형 2문항 | 정답 보기 토글 및 정규화 키워드 검증 |
| **진척도 저장** | 챕터 읽기 완료 + 퀴즈 합격 상태 영구 저장 | `localStorage.dashboardProgress` 활용 |
| **AI 트렌드** | 버전 업데이트 인라인 + 새 패러다임은 부록 D 분리 | 메인 챕터 깊이 보존 |
| **UI/UX 강화** | 스크롤스파이 TOC + 진행률 바 + 하단 네비 + 툴팁 | `style.css` + `main.js` 전역 적용 |
| **실무 패턴** | TS · 레이어드 · 검증/에러 · 폼 관리 인라인 통합 | 별도 부록 없이 각 메인 챕터에 자연스럽게 흡수 |

---

## 2. 파일 및 디렉토리 구조

```
C:\Study\
├── index.html                  # 학습 대시보드 메인, 진척도 통계, 검색
├── chapter-1.html              # 챕터 1: 모던 자바 (Records, Pattern Matching, Virtual Threads 도입부)
├── chapter-2.html              # 챕터 2: Spring Boot 3.4+ · JPA N+1 · 레이어드 아키텍처 · Virtual Threads
├── chapter-3.html              # 챕터 3: DB/SQL + QueryDSL + Flyway 마이그레이션
├── chapter-4.html              # 챕터 4: REST + Validation/예외 처리 + Security 6 + Redis JWT + 로깅
├── chapter-5.html              # 챕터 5: React 19 + Next.js 15 + TypeScript + 스타일링 전략
├── chapter-6.html              # 챕터 6: 고급 React + Zustand + react-hook-form + Zod
├── chapter-7.html              # 챕터 7: 풀스택 통합 + WebSocket 주문 알림
├── chapter-8.html              # 챕터 8: DevOps + Docker + AWS + Spring Modulith + MSA(Saga) + GitHub Actions
├── appendix-test.html          # 부록 A: 테스트 코드 (JUnit5, Mockito, RTL)
├── appendix-interview.html     # 부록 B: 면접 단골 CS + OWASP + 캐싱 + @Transactional 함정
├── appendix-algorithm.html     # 부록 C: 코딩 테스트 / 자바 알고리즘 핵심
├── appendix-ai.html            # 부록 D: AI-Native 통합 (pgvector, Spring AI, Generative UI)
├── demo-shop.html              # 작동하는 가상 의류 쇼핑몰 데모 페이지
├── assets/
│   ├── style.css               # 공통 스타일 + 글래스모피즘 + 테마 변수 + TOC/진행률/툴팁
│   ├── main.js                 # 진척도 제어, 다크모드, 팝업, DB 초기화, 스크롤스파이
│   ├── quiz.js                 # 퀴즈 로더 및 다이내믹 코드 채점 엔진
│   ├── search.js               # lunr.js 로딩 및 sessionStorage 캐시 동적 검색
│   ├── mock-api.js             # fetch API 인터셉터, LocalStorage DB CRUD 처리
│   ├── glossary.json           # 헷갈리는 주석 용어 사전 마스터 데이터
│   └── mock-data.json          # 의류 쇼핑몰 시드 데이터 (Products, Orders, Users 등)
└── lib/
    ├── prism.min.js            # Prism.js 코드 하이라이터 CDN 대체 라이브러리
    ├── prism.min.css
    ├── lunr.min.js             # Lunr.js 정적 다중 파일 초경량 검색 라이브러리
    └── mermaid.min.js          # Mermaid.js 다이어그램 렌더러
```

---

## 3. 공통 리소스 명세 및 상태 관리

### 3.1 CSS 테마 정의 (`assets/style.css`)
```css
:root {
  /* 영역별 시각적 아이덴티티 포인트 컬러 */
  --backend:   hsl(260 85% 62%);  /* Ch 1-4 */
  --frontend:  hsl(190 85% 48%);  /* Ch 5-7 */
  --devops:    hsl(150 75% 45%);  /* Ch 8 */
  --test:      hsl(38  90% 55%);  /* 부록 A */
  --interview: hsl(0   75% 60%);  /* 부록 B */
  --algo:      hsl(320 65% 55%);  /* 부록 C */
  --ai:        hsl(280 70% 58%);  /* 부록 D */
}
```

### 3.2 Mock DB 상태 영속성 흐름 (`assets/mock-api.js`)
```javascript
// LocalStorage DB 초기화 및 버전 체킹 의사코드
const MOCK_DB_VERSION = "1.0.0";

function initializeMockDatabase() {
  const storedVersion = localStorage.getItem("mockDB_version");
  const storedData = localStorage.getItem("mockDatabase");

  if (!storedData || storedVersion !== MOCK_DB_VERSION) {
    // mock-data.json 최초 로드 후 로컬스토리지에 시딩(Seeding)
    fetch("assets/mock-data.json")
      .then(res => res.json())
      .then(data => {
        localStorage.setItem("mockDatabase", JSON.stringify(data));
        localStorage.setItem("mockDB_version", MOCK_DB_VERSION);
        console.log("Mock Database seeded successfully!");
      });
  }
}
```

### 3.3 UI/UX 4종 작동 명세 (`assets/main.js` + `assets/style.css`)

| 기능 | 구현 방식 | 핵심 코드 위치 |
|------|----------|----------------|
| 스크롤스파이 TOC | `IntersectionObserver`로 `<h2>` 가시성 추적, 우측 TOC `.active` 토글 | `main.js > initScrollspy()` |
| 진행률 바 | `scroll` 이벤트 throttle → 상단 `<div id="progress-bar">` width 갱신 | `main.js > initProgressBar()` |
| 하단 이전/다음 네비 | 각 챕터 하단 `<nav class="chapter-pager">` 정적 마크업 + 현재 챕터 기준 자동 링크 | 각 챕터 하단 + `style.css` |
| 글로서리 툴팁 | `data-term` 속성 → `mouseenter`에 글로서리 사전에서 정의 조회 → 부동 툴팁 표시 | `main.js > initGlossaryTooltips()` |

---

## 4. 챕터별 핵심 콘텐츠 명세

모든 챕터는 **"쉽고 직관적인 비유 ➡️ 의류 쇼핑몰 'Antigravity Fashion' 기반의 일관된 코드 예제 ➡️ 용어 사전 해설 ➡️ 미니 퀴즈"**로 구조화되어 전달됩니다. 각 챕터 끝에는 **[실무 보강 박스]**로 짧은 보강 주제가 따라옵니다.

*   **Ch 1 (Java 17/21 LTS):** 쇼핑몰 의류 상품(`ProductRecord`) 설계. Records, Sealed Classes 및 Pattern Matching. **Virtual Threads(Project Loom) 도입부** — 기존 OS 스레드 풀과의 차이를 비유 기반으로 소개.
*   **Ch 2 (Spring Boot 3.4+ & JPA):** **Spring 표준 레이어드 아키텍처 도입 — Controller → Service → Repository → DTO/Entity 책임 분리.** 1:N 연동(`Product` ↔ `Review`) 및 **JPA N+1 성능 결함** 시각 실습 + Fetch Join 수정. **Virtual Threads를 활용한 대량 주문 처리 예제** — WebFlux 대신 동기 코드로 처리하는 패턴. **[실무 보강 박스]** MapStruct 자동 DTO 매핑 vs 수동 변환의 트레이드오프.
*   **Ch 3 (DB/SQL & QueryDSL):** 의류 상품 다중 검색용 B-Tree 인덱스 스캔 원리 및 QueryDSL 동적 검색 쿼리. **[실무 보강 박스]** Flyway DB 마이그레이션으로 스키마 진화를 안전하게 관리하는 방식.
*   **Ch 4 (REST API & Security 6):** REST 컨트롤러 설계 + **SLF4J + Logback 구조화 로깅 도입부 ("프로덕션 코드의 첫 줄은 로그")**. **Bean Validation(`@Valid`) + `@ControllerAdvice` 글로벌 예외 처리 + `ProblemDetail` (RFC 9457) 표준 에러 응답.** JWT 토큰 발급 및 로그아웃 유저의 **Redis Blacklist** 모의 차단 아키텍처. **[실무 보강 박스]** Springdoc OpenAPI로 자동 API 문서화.
*   **Ch 5 (React 19 & Next.js 15):** 쇼핑몰 상세 페이지 파일 기반 다이내믹 라우팅. **TypeScript 도입 — 자바 백그라운드 학습자를 위한 타입 시스템 빠른 전이 가이드 (인터페이스 vs 타입, 제네릭, 유틸리티 타입).** **Server/Client Component** 비교. **React 19 Compiler로 인한 useMemo/useCallback의 종말**. **Next.js 15 Uncached by default 정책 + Turbopack 번들러**. **[실무 보강 박스]** 스타일링 선택지 비교 (CSS Modules vs Tailwind vs CSS-in-JS).
*   **Ch 6 (고급 React & Zustand):** **Zustand**를 사용한 고성능 장바구니(`Cart`) 상태 관리 실구현. **`useActionState` 등 React 19 신규 훅 적극 활용**. **react-hook-form + Zod로 쇼핑몰 주문 폼 구현 — `useState` 폼의 한계와 RHF 도입 이유, 스키마 검증으로 프론트/백 일관성 확보.**
*   **Ch 7 (풀스택 연동 & WebSocket):** 상품 주문 생성 시 Axios Interceptor 자동 헤더 주입 및 **WebSocket STOMP** 방식의 주문 성공 실시간 토스트 알림.
*   **Ch 8 (DevOps & AWS & Modulith):** Next.js와 Spring Boot의 멀티 스테이지 `Dockerfile` 경량화 패키징 및 AWS 가상 인프라 배포 설계. **Spring Modulith로 모놀리식 내부를 모듈로 분리하는 중간 단계** → MSA 분리 + Saga 패턴 개념. **GitHub Actions CI/CD 파이프라인 — 빌드 → 테스트 → Docker 푸시 → 배포 자동화 플로우.**

> AI-Native 패러다임(pgvector, Spring AI, Agentic RAG, Generative UI)은 본 8챕터 어디에도 끼워넣지 않고 **부록 D (`appendix-ai.html`)에 별도로 격리**합니다. 메인 8챕터의 깊이를 보존하기 위함입니다.

---

## 5. 시각자료 렌더링 상세 계획

시각자료는 **용도별 3중 하이브리드**로 적용한다 (v3.3 현실화). 무방비 raster 삽입(특히 기술 다이어그램의 밝은 PNG)은 금지하되, 개념 비유는 카드 프레임 안의 raster 일러스트를 적극 사용한다.

### 5.0 개념 비유 raster 일러스트 (`.webp`) — 실제 구현 반영
*   **위치/네이밍:** `assets/learning-visuals/{페이지}-{개념}-{analogy|core}.webp` (예: `chapter-3-db-index-core-analogy.webp`). 챕터·부록마다 hero 1장 + 개념별 비유 컷.
*   **삽입 틀:** `<figure class="learning-visual">` + `<img loading="lazy" alt="…2D 파스텔 일러스트">` + `<figcaption>`. CSS `.learning-visual`이 테마 카드 배경·테두리·16:9·shadow로 감싸 다크모드 눈부심을 완화한다.
*   **스타일 일관성:** 전 챕터 "2D 파스텔 일러스트" 톤 유지. 개념 보충으로 새 이미지를 추가할 때도 같은 톤·16:9로 생성해 카드 안에 균일하게 들어가게 한다.
*   **다크모드 주의:** 카드 프레이밍으로 완화되나 이미지 자체는 고정 밝기이므로, 새로 추가한 이미지는 한 번 다크모드 렌더로 가독성을 확인한다.

### 5.1 기술 다이어그램 (Mermaid / 인라인 SVG)
아래 항목은 raster가 아닌 Mermaid/SVG로 유지한다 (테마 반전·수정 용이성).

1.  `fullstack_architecture` (전체 풀스택 통신 망) ➡️ **인라인 SVG** (디테일한 아이콘 및 세련된 연동 라인 묘사)
2.  `spring_security_jwt` (Security 필터 및 Redis JWT 흐름) ➡️ **Mermaid.js sequenceDiagram**
3.  `database_erd` (JPA Entity 관계도) ➡️ **Mermaid.js erDiagram**
4.  `react_nextjs_lifecycle` (서버/클라이언트 렌더링 라이프사이클) ➡️ **Mermaid.js flowchart**
5.  `devops_aws_docker` (Docker 빌드 및 AWS 가설 배포 네트워크) ➡️ **인라인 SVG** (AWS 로고 및 인프라 구조 도식화)
6.  `layered_architecture` (Spring 레이어드 아키텍처, Ch 2 전용) ➡️ **Mermaid.js flowchart**
7.  `validation_error_flow` (검증 → 예외 → ControllerAdvice → ProblemDetail 흐름, Ch 4 전용) ➡️ **Mermaid.js sequenceDiagram**
8.  `ai_native_hybrid_search` (벡터 + BM25 + RRF 결합 흐름, 부록 D 전용) ➡️ **Mermaid.js flowchart**
9.  `ai_native_agentic_rag` (에이전트 multi-hop 결정 흐름, 부록 D 전용) ➡️ **Mermaid.js sequenceDiagram**

---

## 6. 부록 명세 (4종)

### 6.1 부록 A (`appendix-test.html`) — 테스트 코드
*   JUnit 5 + AssertJ 기초
*   Mockito (스텁/스파이/검증)
*   Spring `@WebMvcTest` / `@DataJpaTest` / `@SpringBootTest` 차이
*   React Testing Library (RTL) + user-event
*   통합 테스트 vs 단위 테스트 트레이드오프

### 6.2 부록 B (`appendix-interview.html`) — 면접 단골 [v3.2 강화]
*   **CS 기초:** TCP/UDP, HTTP/1.1 vs 2 vs 3, HTTPS handshake
*   **DB:** 트랜잭션 격리 수준, 락 종류, 인덱스 내부
*   **Java:** GC, JVM 메모리 영역, ClassLoader
*   **Spring:** AOP 동작 원리, Bean 라이프사이클
*   **동시성:** synchronized vs ReentrantLock, ThreadLocal 위험
*   **시스템 설계:** URL 단축기, 채팅 시스템 같은 단골 주제 개요
*   **[v3.2 추가] OWASP Top 10 (2021)** — XSS, CSRF, SQL Injection, SSRF 등 방어 전반과 Spring/React 측 대응법
*   **[v3.2 추가] 캐싱 전략** — `@Cacheable`, Look-aside vs Write-through, 캐시 무효화 패턴, Redis를 캐시로 활용 (JWT Blacklist를 넘어서)
*   **[v3.2 추가] `@Transactional` 함정 모음** — self-invocation, propagation 7종, rollback rules, readOnly 효과, 격리 수준 부작용

### 6.3 부록 C (`appendix-algorithm.html`) — 코딩 테스트 / 알고리즘
*   자료구조 정리: 배열/리스트, 스택/큐, 해시, 트리, 그래프, 힙
*   알고리즘 패턴: DFS/BFS, DP, 그리디, 이분탐색, 투포인터, 슬라이딩 윈도우
*   시간복잡도 직관 (자바 컬렉션별 Big-O 표)
*   추천 유형별 백준/프로그래머스 문제 큐레이션 (20~30제)
*   자바 코딩테스트 템플릿 (BufferedReader, StringTokenizer)

### 6.4 부록 D (`appendix-ai.html`) — AI-Native 통합
본 8챕터 완주를 전제로 진입하는 **AI-Native 심화 부록**입니다. 각 섹션은 메인 챕터로 cross-link되어 학습자가 막힐 때 기초로 복귀 가능합니다.

#### 6.4.1 pgvector + 하이브리드 검색 (Ch 3 연계)
*   PostgreSQL `pgvector` 확장 설치 및 임베딩 칼럼 설계 (`vector(1536)`).
*   의미 기반 벡터 검색 vs 키워드 기반 BM25 검색의 강약점.
*   **RRF(Reciprocal Rank Fusion)**: 두 결과를 점수로 융합하는 단순/강력한 패턴.
*   쇼핑몰 시나리오: 상품 설명 임베딩 + 상품명 BM25 검색 → 하이브리드 결과.

#### 6.4.2 Spring AI + Agentic RAG (Ch 4 / Ch 8 연계)
*   Spring AI 프레임워크 개요 (ChatClient, EmbeddingClient, Advisor).
*   **RAG → Agentic RAG**: 에이전트가 "검색이 필요한가", "추가 multi-hop 검색이 필요한가"를 스스로 판단.
*   Advisor 패턴으로 프롬프트 라우팅 / 안전 가드 / 검색 결과 주입.
*   쇼핑몰 시나리오: 상품 추천 챗봇 — 단순 응답이 아닌 다단계 검색 후 답변.

#### 6.4.3 Generative UI + Vercel AI SDK (Ch 5 / Ch 6 / Ch 7 연계)
*   기존 챗봇 텍스트 응답의 한계 → LLM이 React 컴포넌트를 직접 반환.
*   Vercel AI SDK의 `streamUI`로 차트/폼/카드 컴포넌트 스트리밍 렌더링.
*   쇼핑몰 시나리오: "이번 주 잘 팔린 후드 보여줘" → AI가 BarChart 컴포넌트 + 상품 카드를 실시간 생성.

#### 6.4.4 cross-link 사례
| 부록 D 섹션 | 메인 챕터로 돌아가기 |
|-------------|-----------------------|
| pgvector | `chapter-3.html#indexes` (B-Tree 인덱스 기초 복습) |
| Agentic RAG | `chapter-4.html#rest-design` (API 설계 복습) |
| Generative UI | `chapter-6.html#zustand-store` (상태 관리 복습) |

---

## 7. 구현 단계 (Phase) 및 체크리스트

### Phase 0: 로컬 인프라 및 기반 다지기 (1~2일)
*   **[필수]** 워크스페이스 `C:\Study\` 디렉토리 구조 초기화.
*   **[CORS 우회]** 로컬 웹 서버 환경(VS Code Live Server 등) 설정 및 작동 검증.
*   `assets/mock-data.json` 및 `assets/glossary.json` 시드 파일 작성.
*   `mock-api.js` 코어 로직(LocalStorage 동화, 버전 관리 및 리셋 브릿지) 설계.
*   `style.css` 변수 + UI/UX 4종 골격(TOC/진행률/하단 네비/툴팁) 미리 잡기.
*   Mermaid CDN 링크 결정 및 다크/라이트 테마 변수 연동 테스트.

### Phase 1: 인덱스 + Ch 1 프로토타입 (2~3일)
*   `index.html` + `chapter-1.html` 풀 구현 → 나머지 챕터의 템플릿이 됨.
*   퀴즈 엔진 객관식/코드 완성 둘 다 동작 확인.
*   UI/UX 4종(TOC/진행률/하단 네비/툴팁) 모두 챕터 1에서 작동 검증 → 이후 챕터는 패턴 복제.

### Phase 2: 메인 8챕터 콘텐츠 (11~18일, 챕터당 1.5~2.5일)
*   Phase 1 템플릿 복제 → 콘텐츠 채우기.
*   다이어그램 9종 제작/삽입 (Mermaid + 인라인 SVG).
*   Ch 6~7에서 `demo-shop.html` 점진적 완성.
*   **[v3.2 분량 증가 사유]** Ch 2 레이어드 + MapStruct, Ch 3 Flyway 박스, Ch 4 검증/에러/로깅/OpenAPI, Ch 5 TypeScript + 스타일링, Ch 6 react-hook-form + Zod, Ch 8 GitHub Actions 추가로 챕터당 약 0.5일 증가.

### Phase 3: 부록 4종 (8~12일)
*   부록 A (테스트), C (알고리즘): 각 1~2일.
*   **[v3.2 강화]** 부록 B (면접): 2~3일 — 기존 CS 기초 + 추가 OWASP Top 10 + 캐싱 전략 + `@Transactional` 함정.
*   부록 D (`appendix-ai.html`): 2~3일 — pgvector + Agentic RAG + Generative UI 개념 수준 정리 + 쇼핑몰 시나리오 시각화.
*   메인 챕터들로의 cross-link 양방향 연결.

### Phase 4: 검색 + Cross-link + 다이어그램 완성 (3~5일)
*   동적 검색(DOMParser + sessionStorage 캐싱) 작동 검증.
*   모든 cross-link 깨짐 검증 (자동 스크립트 또는 수동 점검).
*   Mermaid 다크/라이트 테마 반전 작동 검증.

### Phase 5: 마무리 다듬기 (3~4일)
*   다크 모드 색 대비 / 모바일 반응형 / 키보드 접근성.
*   LocalStorage import/export(백업) 기능.
*   최종 학습 자가검증.

**총 추정: 30~42일 part-time** (하루 2~4시간 기준, v3.1 대비 실무 패턴 4종 + 보강 6종 + 부록 B 강화로 약 5일 증가).

---

이제 v3.2 기준으로 Phase 0 작업에 진입할 준비가 끝났습니다. 실무 패턴까지 다뤄지므로 학습 완료 후 곧바로 실무 코드 작성과 면접 응대에 활용 가능한 수준입니다.
