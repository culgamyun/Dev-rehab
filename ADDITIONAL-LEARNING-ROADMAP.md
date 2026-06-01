# 추가 학습 로드맵 — 면접·재취업 통과 우선

> Antigravity Fullstack Rehab 대시보드(8챕터 + 부록 A~D)에서 **다음에 더 배울 개념**을 정리한 문서.
> 작성: 2026-05-29 | 1차 목표: **재취업·면접 통과력** | 영역: 백엔드 운영·확장 / 프론트 품질 / 인프라·DevOps / 면접·시스템 설계 (전부)
> 상태: ✅ 완료(2026-05-29) — 부록 E·F·G + Ch4 OAuth2 + Ch8 k8s·Terraform + 부록 D AI 코딩 노트 전부 제작 완료. §5 검증 통과(크로스링크 322개 0 깨짐·검색 인덱스에 신규 페이지 반영·SRS 자동등록·용어 툴팁·콘솔 에러 0). [§6-2 결정: k8s는 부록 G가 아닌 Ch8 보강으로 분리] (이 문서는 "무엇을·왜·어떤 순서로"만 다룸)

---

## 0. 어떻게 읽나

기존 커리큘럼은 이미 v3.2 갭 분석(실무 패턴 4종 + 보강 6종)을 거쳐 촘촘하다. 이 문서는 **그 위에 얹을 것만** 다룬다. 각 모듈은 다음 형식:

- **무엇** — 학습 항목 세부
- **왜(면접 근거)** — 채용/면접에서 통하는 이유 (2026-05 시장 검증)
- **기존 연결** — 어느 챕터에 이어지나
- **면접 예상 질문** — 바로 대비할 단골 질문 샘플
- **분량 / 위치** — 예상 작업량과 대시보드 배치 제안

> ⚠️ `C:\Study`는 **git 미사용 → 롤백 불가**. 그래서 추가는 **신규 부록 위주 + 기존 챕터엔 보강 박스만**으로 설계해 챕터 1~8과 진척도 배열을 건드리지 않는다.

---

## 1. 이미 덮인 것 vs 추가 필요 (한눈에)

| 영역 | 이미 있음 | **추가 필요(갭)** |
|------|-----------|-------------------|
| 백엔드 | Java 21, Spring Boot 3.4+, JPA/QueryDSL, Security6+Redis JWT, 로깅(SLF4J), Saga 개념 | **관측성 스택**, **Kafka 메시징 토대**, 캐시 교체/무효화 심화 |
| 프론트 | React19, Next15, TS, Zustand, RHF+Zod, Server/Client Component | **렌더링 전략 비교**, **CWV 성능**, **접근성(a11y)**, **Tailwind 실전** |
| 인프라 | Docker, GitHub Actions, AWS 개요, Spring Modulith/MSA | **Kubernetes**, Terraform(IaC) |
| 면접 | CS·OWASP·캐싱·@Transactional·설계 "개요" | **시스템 설계 심화**, OAuth2 소셜 로그인, idempotency/rate limit |

---

## 2. 추천 로드맵 (면접 ROI 티어)

면접이 1차 목표이므로 **면접 즉효 → 시장 최다 키워드 → 우대/차별화** 순으로 배열.

### Tier 1 — 면접 즉효 (최우선)

#### ① 시스템 설계 심화
- **무엇:** 대용량 트래픽 처리 흐름, 캐시 계층(LRU 등 교체 알고리즘 · 캐시 스탬피드 · 무효화 패턴), 로드밸런싱, DB 복제/샤딩/파티셔닝, idempotency·rate limiting, 단골 설계 문제 워크북(URL 단축기 · 뉴스피드 · 채팅 · 이커머스 주문/재고).
- **왜(면접 근거):** 경력·복귀 면접의 핵심 관문. "정의"보다 "이 상황에 인덱스를 걸까?"식 **판단**을 본다. 현재 부록 B엔 설계 "개요"만 있음.
- **기존 연결:** Ch3(B-Tree 인덱스), Ch4(REST·Redis), 부록 B(CS 기초).
- **면접 예상 질문:**
  - "초당 1만 주문이 들어오면 병목은 어디서 먼저 터지나? 순서대로 방어책은?"
  - "캐시 무효화 전략 3가지와 캐시 스탬피드(thundering herd) 방지법은?"
  - "재고 차감을 어떻게 동시성 안전하게? (낙관/비관 락, Redis 분산락, 메시지큐)"
  - "읽기가 99%인 서비스의 DB 확장 순서는? (인덱스→캐시→읽기 복제본→샤딩)"
- **분량 / 위치:** 큼(설계 문제 4~5종 포함). **신규 부록 E**.

#### ② 프론트 렌더링 전략 + 성능 면접 정리
- **무엇:** CSR/SSR/SSG/ISR/PPR 비교와 선택 기준, Hydration 원리와 비용, Core Web Vitals(LCP/INP/CLS), 코드 스플리팅·동적 import·번들 분석, 이미지 최적화(next/image), Lighthouse 읽는 법.
- **왜(면접 근거):** 프론트 면접 1순위 단골(렌더링·Hydration·성능). 공고에 "퍼포먼스 튜닝 경험" 명시 다수.
- **기존 연결:** Ch5(Server/Client Component, Next.js 15) 심화.
- **면접 예상 질문:**
  - "CSR vs SSR vs SSG vs ISR을 언제 각각 쓰나? SEO/TTFB/서버부하 관점에서."
  - "Hydration이 뭐고 왜 느려질 수 있나? 줄이는 방법은?(RSC, 스트리밍, islands)"
  - "INP가 나쁠 때 원인 후보와 진단 순서는?"
  - "초기 로딩이 느린 SPA, 어디부터 자르나?(코드 스플리팅·프리페치·LCP 이미지)"
- **분량 / 위치:** 중간. **신규 부록 F** (프론트 색).

### Tier 2 — 시장 최다 키워드 (실무 + 면접)

#### ③ Kafka & 이벤트 기반 아키텍처
- **무엇:** 토픽/파티션/오프셋/컨슈머 그룹, 순서 보장 범위, Spring Kafka(Producer/Consumer), at-least-once와 멱등 컨슈머, DLQ, 주문 생성→재고/알림 이벤트 시나리오.
- **왜(면접 근거):** 국내 백엔드 공고 **최다 키워드** 중 하나(MySQL·Redis·Kafka 묶음). Ch8 Saga의 빠진 토대.
- **기존 연결:** Ch8(MSA·Saga), Ch7(실시간).
- **면접 예상 질문:**
  - "메시지 유실 없이 '정확히 한 번' 처리는 가능한가? 현실적 타협(멱등성)은?"
  - "파티션 수와 컨슈머 수의 관계, 순서 보장은 어디까지?"
  - "RabbitMQ 대신 Kafka를 고르는 기준은?"
- **분량 / 위치:** 중간. **신규 부록 G**(관측성과 묶거나 분리).

#### ④ 관측성·운영 (Observability)
- **무엇:** Spring Boot Actuator(health/metrics), Micrometer→Prometheus→Grafana, 구조적 로깅과 로그 수집(Loki/ELK), 분산 추적(OpenTelemetry/Trace ID 전파) 개념, 알림(SLO/에러레이트).
- **왜(면접 근거):** 운영 경험을 묻는 공고 다수(Prometheus/Grafana/Loki/Datadog). 현재는 "로그 한 줄"에서 멈춤 → 운영 가시성으로 확장.
- **기존 연결:** Ch4(로깅), Ch8(배포·운영).
- **면접 예상 질문:**
  - "장애가 났는데 로그만으론 원인을 못 찾는다. 무엇이 더 필요한가?(메트릭·트레이스)"
  - "분산 환경에서 한 요청의 전체 경로를 어떻게 추적하나?(Trace ID)"
  - "어떤 지표를 대시보드 최상단에 두겠나?(p99 지연·에러율·포화도·트래픽 = RED/USE)"
- **분량 / 위치:** 중간. **신규 부록 G**.

### Tier 3 — 우대·차별화

#### ⑤ Kubernetes 기초
- **무엇:** Pod/Deployment/ReplicaSet/Service/Ingress, ConfigMap·Secret, 헬스체크(liveness/readiness), 롤링 업데이트/롤백, 로컬 실습(kind/minikube). Docker에서 자연 연결.
- **왜(면접 근거):** 중·대형사 공고 다수(Istio·Terraform·Datadog 동반). 우대사항 단골.
- **기존 연결:** Ch8(Docker) 확장.
- **면접 예상 질문:** "컨테이너 하나 죽으면 어떻게 자동 복구되나?", "무중단 배포를 k8s로 어떻게?", "ConfigMap과 Secret 차이/주의점."
- **분량 / 위치:** 중간. **Ch8 보강 박스**(또는 부록 G에 섹션).

#### ⑥ OAuth2 / OIDC 소셜 로그인
- **무엇:** Authorization Code Flow(+PKCE), OAuth2 vs OIDC, 카카오/네이버/구글 provider 설정, 기존 커스텀 JWT와 결합(소셜 인증 후 자체 토큰 발급), `OAuth2UserService` 매핑.
- **왜(면접 근거):** 실무 사실상 필수(자료·요구 풍부). 현재 커리큘럼은 커스텀 JWT만 → 흔한 면접 후속 질문에 막힘.
- **기존 연결:** Ch4(Security6·JWT) 보강.
- **면접 예상 질문:** "Authorization Code Flow 단계 설명", "소셜 로그인 후 우리 서비스 세션/토큰은 어떻게 발급?", "왜 Implicit Flow는 안 쓰나?"
- **분량 / 위치:** 작음~중간. **Ch4 보강 박스**.

### Tier 4 — 보너스 (짧게)

#### ⑦ Terraform(IaC) 개요 + AI 코딩 워크플로우
- **무엇:** IaC 개념, Terraform 기본(provider/resource/state/plan-apply) 개요 / Cursor·Copilot·Claude를 실제 개발 흐름에 쓰는 법(테스트 생성·리뷰·리팩터)·한계.
- **왜:** Terraform은 인프라 공고 동반 키워드. AI 도구는 면접에서 "AI 활용 경험"을 묻는 추세(State of JS Cursor 11%→26%).
- **위치:** 각 짧은 보강/노트(부록 G 끝 + 부록 D 연계).

---

## 3. 대시보드 통합 구조 제안

| 신규/보강 | 위치 | 담는 모듈 |
|-----------|------|-----------|
| **부록 E. 시스템 설계 면접** | 신규 부록 | Tier 1-① |
| **부록 F. 프론트 품질** (렌더링·성능·접근성·Tailwind) | 신규 부록 | Tier 1-② |
| **부록 G. 백엔드 운영** (Kafka·관측성·k8s) | 신규 부록 | Tier 2-③④, Tier 3-⑤ |
| **Ch4 보강 박스** | 기존 챕터 인라인 | Tier 3-⑥ OAuth2 |
| **Ch8 보강 박스** | 기존 챕터 인라인 | Tier 3-⑤ k8s, Tier 4 Terraform |
| **AI 코딩 노트** | 부록 D 연계 | Tier 4 |

**기존 시스템 재사용 (무료로 따라오는 효과):**
- 신규 페이지의 퀴즈는 `assets/quiz.js`의 `registerToReviewBank()`가 **SRS에 자동 등록** → "오늘의 복습"에 바로 편입.
- 신규 용어를 `assets/glossary.json`에 추가하면 **용어 hover 툴팁 + 복습 카드**로 자동 활용.
- 일러스트는 `handoff.md` 스타일(cozy 2D webp, q84)로 통일해 톤 유지.
- 각 부록은 `index.html` 사이드바·부록 그리드에 카드 1개씩 추가.

---

## 4. 제작 순서 (모듈 선택 후)

면접 ROI 순: **✅ 부록 E(시스템 설계) → ✅ 부록 F(프론트 품질) → ✅ 부록 G(Kafka·관측성) → ✅ Ch4 OAuth2 · ✅ Ch8 k8s·Terraform 보강 → Tier 4(AI 노트, 선택).**

각 모듈 = 기존 챕터 템플릿: **비유 → Antigravity 쇼핑몰 코드 예제 → 용어 사전 → 미니 퀴즈 → (선택) 직접 만들어보기 체크포인트**. 완성 후 로컬 서버 검증.

---

## 5. 검증 방법

- `python -m http.server 5500` → 신규 부록 페이지 렌더 + 콘솔 에러 0.
- 신규 페이지 방문 후 대시보드 **"오늘의 복습 N개" 증가** 확인(SRS 자동 등록 동작).
- 용어 툴팁·lunr 검색 인덱스에 신규 페이지/용어 반영 확인.
- 다크모드에서 신규 일러스트 가독성 1회 확인.
- 크로스링크 깨짐 점검(`handoff.md`의 HEAD 체크 스크립트 재사용).

---

## 6. 검토 시 결정할 것

1. **구조:** 신규는 **부록 위주(추천, churn 최소)** vs 일부를 **정규 챕터 9~로 승격**(진척도 배열 수정 동반)?
2. **부록 G 분리:** Kafka / 관측성 / k8s를 한 부록에 묶기 vs 2~3개로 분리?
3. **Tier 4 범위:** Terraform·AI 도구를 이번에 포함 vs 보류?
4. **제작 착수 모듈:** 어디부터 만들까? (추천: 부록 E 시스템 설계 — 면접 ROI 최고)

---

## 출처 (2026-05 웹 검색)

- 백엔드 채용 스택(Kafka·k8s·관측성): [인프런 신입 백엔드 로드맵](https://www.inflearn.com/roadmaps/11415), [케이타운포유 주니어 풀스택 공고](https://www.wanted.co.kr/wd/360817), [이포즌 Kafka 미들웨어 채용](https://www.jobkorea.co.kr/Recruit/GI_Read/47349451)
- 프론트 트렌드(TS·Tailwind·CWV·a11y): [2026 프론트엔드 로드맵 - anydding](https://www.anydding.com/frontend-developer-roadmap-2026/), [유닛미 Next.js 공고](https://www.rallit.com/positions/1044)
- 시스템 설계/백엔드 면접: [gyoogle/tech-interview-for-developer](https://github.com/gyoogle/tech-interview-for-developer), [ksundong/backend-interview-question](https://github.com/ksundong/backend-interview-question), [jongyunha/technical-interview](https://github.com/jongyunha/technical-interview)
- 프론트 면접(렌더링·Hydration·성능): [프론트엔드 기술 면접 정리 - hyunwoo.dev](https://www.chahyunwoo.dev/blog/frontend-technical-interview), [리액트 SSR 심층 분석](https://velog.io/@tap_kim/ssr-deep-dive-for-react-developers)
- OAuth2 소셜 로그인: [Spring Boot OAuth2 소셜 로그인 가이드 - Deeplify](https://deeplify.dev/back-end/spring/oauth2-social-login), [Spring Security OAuth2 Login 공식 문서](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/core.html)
