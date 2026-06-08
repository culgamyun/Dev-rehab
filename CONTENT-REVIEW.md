# 콘텐츠 검증 리포트 — 개념 정확성 · 난이도 · 코드 · 주석

실행: 2026-06-02 · 대상 15파일(챕터 1-8 + 부록 A-G, ~13,000줄) · **리포트 전용(미수정)**
검증: Pass0 기계 스캔 → Pass1 4축 정독(Explore ×7) → Pass2 공식 문서(context7)+Codex 교차 → Pass3 컴파일
루브릭 4축: **A 정확성 / B 난이도·명료 / C 코드 / D 주석**. 심각도: High(틀린 사실·안 도는 코드) / Med(과장·버전 드리프트·오해) / Low(다듬기·보강).

---

## 한눈 결론
**콘텐츠는 정확성·난이도·주석 모두 강합니다 (종합 A−).** "정말 이걸로 복귀가 되나?" → **네.** 비유→코드→용어→퀴즈 흐름이 일관되고, 주석 밀도는 챕터 HEAVY(✅/❌ 대조식)·부록 moderate로 충분합니다. 무엇보다 **이전 errata(`handoff-content-review.md`)의 8개 정확성 이슈가 전부 해소**돼 있었습니다.

> ⚠️ 솔직한 메모: 4축 정독에서 서브에이전트가 **HIGH 5건을 올렸지만 직접 확인 결과 거의 전부 false positive**였습니다(아래 §오판 참고). 실제 손볼 건 **Med 1건 + Low 소수 + 선택적 보강**뿐입니다. 즉 콘텐츠가 finding 수보다 훨씬 단단합니다.

## handoff 8개 이슈 — 전부 해소 ✓ (공식 문서+Codex 확인)
| # | 이슈 | 파일 | 현재 상태 |
|---|------|------|-----------|
| 1 | `@MockBean`→`@MockitoBean` | 부록A | ✅ 수정됨(line 298-300이 deprecation 설명 + `@MockitoBean` 사용) |
| 2 | Vercel `streamUI` API 드리프트 | 부록D | ✅ 수정됨(`@ai-sdk/rsc`·`inputSchema`·experimental 경고박스 line 518-553) |
| 3 | React Compiler 과장 | Ch5 | ✅ 수정됨("과신 금지" 제약 박스 존재) |
| 4 | Next 15/Turbopack 정밀화 | Ch5 | ✅ 수정됨("no-store가 모든 것의 디폴트가 아니라" 구분) |
| 5 | Virtual Threads "수백만" 과장 | Ch1·2·B | ✅ 수정됨(Ch1 478 "'수백만'은 과장입니다" + 제약 명시) |
| 6 | `readOnly` "스냅샷 안 만듦" 과장 | Ch2·3·B | ✅ 수정됨(Ch2 721 "프로바이더·버전 의존" 단서) |
| 7 | 깨진 앵커 `chapter-3.html#indexes` | 부록D | ✅ 수정됨(링크체커 결과 깨진 링크 **0**) |
| 8 | Security 6 "완전 제거·의무화" 과장 | Ch4 | ✅ 현재 문구 정확("최신 권장(사실상 표준)... deprecated되어 제거 예정" — Codex CONFIRM, Security 7에서 실제 제거) |

---

## 손볼 가치가 있는 발견 (승인 시 수정)

### ◆ Med-1 [버전] Ch6 Zod 에러 커스터마이즈가 Zod 3 문법
- `chapter-6.html:567-576` — `z.enum([...], { errorMap: () => ({ message }) })`, `z.literal(true, { errorMap })`
- **근거(확정):** Zod 4(2025)는 `errorMap`/`message`/`invalid_type_error`/`required_error`를 **단일 `error` 파라미터**로 통합(공식 zod.dev/v4 + Codex CONFIRM). 2026 기준 Zod 4가 현행이라 `errorMap`은 구문법.
- **영향:** Zod 3에선 정상 동작하나, 2026 신규 프로젝트엔 비표준.
- **수정안:** `{ error: () => "결제 수단을 선택하세요" }` 형태로. 또는 코드 위에 "Zod 3 기준 예제 — Zod 4는 `error` 파라미터" 한 줄 주석. (form 섹션의 동일 패턴도 함께)

### ◆ Low-1 [정밀] 부록D pgvector 코사인 거리 설명 imprecise
- `appendix-ai.html:186` — `<=>` — 코사인 거리 (1에 가까울수록 다름)
- **근거(Codex NUANCE):** 코사인 거리 범위는 0~2(0=동일, 1=직교, 2=반대). "1에 가까울수록 다름"은 *틀리진 않지만*(1=무관) 최대가 2라 부정확. (위 SQL `1 - (a <=> b)`는 정상.) ※ 정독 에이전트가 "backwards"라 한 건 오판.
- **수정안:** "`<=>` — 코사인 거리 (값이 클수록 덜 유사: 0=동일·1=무관·2=반대)".

### ◆ Low-2 [정밀] 부록F PPR을 "결정판"으로 단정
- `appendix-f.html:137` — "...PPR이 그 결정판입니다. ...양자택일 자체를 풉니다."
- **근거(공식+Codex):** PPR은 Next 15 `experimental.ppr`(실험적) → Next 16 `cacheComponents`로 opt-in. **2026에도 기본값 아님.** (단 line 139에 "PPR이 부담되면 ISR로 타협" 단서가 이미 있어 과장은 완화됨.)
- **수정안:** 137에 한 줄 — "(PPR은 Next 15 실험 기능 → 16 `cacheComponents`로 opt-in; 아직 기본값은 아님)".

### ◆ Low-3 [코드] Ch4 퀴즈 validator 군더더기 제약
- `chapter-4.html` 블랙리스트 퀴즈 — `mustNotContain: ["equals"]`
- 퀴즈가 `equals`를 요구한 적이 없어 의미 없는 제약. **수정안:** 해당 줄 삭제.

### ◆ Low-4 [명료] Ch6 퀴즈 starter의 콜론 위치 어색
- `chapter-6.html:807` — `"// 여기에 작성\n: zodResolver(orderSchema),"` → 학생이 `resolver`를 쓰면 `resolver`와 `:`가 다른 줄에 놓임(JS상 유효하나 시각적으로 헷갈림).
- **수정안:** starter를 `"  resolver: // 여기에 작성(zodResolver(orderSchema))"` 식으로 재배치하거나 빈칸을 값 자리로 이동.

---

## 선택적 보강 (오류 아님 — "실무 깊이" 더하기, 원하면)
정독에서 "한 줄 단서를 더하면 좋다" 수준으로 나온 것들. 전부 **현재도 틀리진 않음**.
- **Ch7:414** `withSockJS()` 폴백 — 2026 대부분 브라우저가 WebSocket 네이티브 → "레거시 대비용" 한 줄.
- **Ch8 depends_on** — "기동 순서만 보장, 준비완료(readiness)는 아님 → 재시도/healthcheck 필요" 단서. (단 퀴즈는 정답)
- **Ch8 k8s probe** — `/actuator/health/*`는 actuator 의존성 필요. **Ch8 Saga** — 예제는 Choreography, Orchestration(Temporal 등) 대안 한 줄. **Ch8 k8s Secret** — base64≠암호화 경고 강조(이미 단서 있음).
- **부록E** idempotency — Redis에 "1" 말고 응답 자체 캐싱이 더 정석. INCR+EXPIRE 원자성(Lua) 각주.
- **부록G** Kafka 파티션 추가 시 키 매핑 깨짐(재처리) 주의 / exactly-once는 외부 DB까지면 2PC·Saga 필요(Ch8 연계).
- **부록B:1264** NESTED "JDBC만 지원" → "대부분 DB가 SAVEPOINT 지원, JPA 이식성은 별개"로 정밀화.
- **Ch1** `.isBlank()` 예제에 [Java 11+] 표식(챕터가 Java 8~21 범위라).

## §오판 (정독 에이전트가 올렸으나 검증 결과 문제 없음 — 참고)
직접 코드/문서 확인 + Codex로 false positive 확정:
- 부록D 코사인 "backwards" → **정상**(거리 1=다름 맞음, 최대 2 부정확만 Low-1로 격하).
- Ch4 `sendError(401); return;` "unsafe/High" → **정상 패턴**(`chain.doFilter` 미호출로 체인 중단; Codex CONFIRM).
- Ch6 `z.literal(true)` + `agreeTerms:false` "mismatch/High" → **의도된 정상 패턴**(약관 동의 필수 체크박스, 제출 시 검증).
- 부록D streamUI "버전 확인 없음/High" → **이미 경고박스+최신 API**.
- Ch7 typed axios 응답 `Schema.parse(res.data)` "redundant" → **의도된 런타임 방어 검증**(권장 practice).

---

## 파일별 4축 커버리지 (전 15파일)
| 파일 | A 정확 | B 명료 | C 코드 | D 주석 | 비고 |
|------|:---:|:---:|:---:|:---:|------|
| Ch1 모던자바 | ✅ | ✅ | ◐ | ✅ | C: .isBlank() Java11+ 표식(Low) |
| Ch2 Spring·JPA | ✅ | ✅ | ✅ | ✅ | readOnly/N+1 caveat 양호 |
| Ch3 DB·QueryDSL | ✅ | ✅ | ✅ | ✅ | clean |
| Ch4 REST·Security | ✅ | ✅ | ◐ | ✅ | Low-3 퀴즈 제약 / sendError는 정상 |
| Ch5 React·Next | ✅ | ✅ | ✅ | ✅ | Compiler·Next15 caveat 견고 |
| Ch6 고급React·Zod | ◐ | ✅ | ◐ | ✅ | **Med-1 Zod3 errorMap** / Low-4 starter |
| Ch7 풀스택·소켓 | ✅ | ✅ | ✅ | ◐ | SockJS 한 줄(선택) |
| Ch8 DevOps·k8s | ✅ | ✅ | ◐ | ◐ | 선택 보강 다수(오류 아님) |
| 부록A 테스트 | ✅ | ✅ | ✅ | ✅ | @MockitoBean 최신 |
| 부록B 면접CS | ◐ | ✅ | ✅ | ◐ | NESTED 정밀화(선택) |
| 부록C 알고리즘 | ✅ | ✅ | ✅ | ✅ | **clean**(복잡도·점화식·코드 정확) |
| 부록D AI-Native | ◐ | ✅ | ✅ | ◐ | Low-1 코사인 / streamUI 양호 |
| 부록E 시스템설계 | ✅ | ✅ | ◐ | ◐ | idempotency 보강(선택) |
| 부록F 프론트품질 | ◐ | ✅ | ✅ | ◐ | Low-2 PPR 정밀화 |
| 부록G 백엔드운영 | ✅ | ✅ | ✅ | ◐ | Kafka/exactly-once 보강(선택) |
(✅ 양호 · ◐ 경미 보강거리)

## 검증 출처
- **공식 문서(context7):** Zod 4 error API(zod.dev/v4 — errorMap→error 통합 확인), Next.js PPR(experimental.ppr→cacheComponents, opt-in 확인).
- **Codex 독립 교차(10개 주장):** 9 CONFIRM + 1 NUANCE(코사인). 핵심 정확성 주장 전부 통과.
- **기계 스캔:** 내부링크 0 broken / 과장표현 grep 80건 → 대부분 정당(문맥상 올바른 "항상/절대" 등) + 이미 caveat된 항목.

## ✅ 수정 완료 (2026-06-02 · 사용자 승인 "이슈 + 선택적 보강 전부")
17건 편집(8파일). 라이브 검증(퀴즈 작동·렌더·콘솔 에러 0·링크 0 broken) 통과.

**진짜 이슈(6):**
- Med-1: Ch6 `errorMap`→`error`(Zod 4) ×2 + 퀴즈 설명 문구 (chapter-6.html)
- Low-1: 부록D 코사인 거리 "값이 클수록 덜 유사: 0=동일·1=무관·2=반대" (appendix-ai.html)
- Low-2: 부록F PPR opt-in 단서(experimental.ppr→cacheComponents) (appendix-f.html)
- Low-3: Ch4 퀴즈 군더더기 `mustNotContain:["equals"]` 제거 (chapter-4.html)
- Low-4: Ch6 퀴즈 starter 콜론 위치 정리 `____: zodResolver(...)` (chapter-6.html)
- (보너스) Ch6 퀴즈 validator를 `["resolver:"]`로 강화 — 빈 답이 "zodResolver"에 매칭돼 통과하던 약점 수정.

**선택적 보강(적용):**
- 부록B NESTED "JDBC만 지원"→"SAVEPOINT 지원 DB 필요, 이식성은 별개"
- Ch1 `.isBlank()`에 [Java 11+] 주석 / Ch7 SockJS 레거시 폴백 주석
- Ch8 depends_on(주석+퀴즈 설명: 순서≠readiness) / k8s probe actuator 주석 / Saga 코레오그래피vs오케스트레이션 노트(+ `**` 마크다운 버그 수정)
- 부록G exactly-once "외부 DB까진 2PC/Saga 필요" / 부록E rate-limit INCR+EXPIRE 원자성(Lua/SET EX NX)

**의도적 미수정(이미 충실/오판):** k8s Secret 경고(이미 강함), 부록E idempotency(정상 패턴), 부록G 리샤딩(면접 꼬리질문에 이미 커버), §오판 5건(false positive).


---

## 부록 B/E/F 면접 빈출 갭 보강 (2026-06-08 · PR #5)

### 요청 배경
사용자 요청: "부록 B/E/F 내용이 정말 면접 빈출인지 + 자주 나오는데 빠진 게 없는지 재확인 → 누락분 추가."

### 갭 분석 방법
현재 토픽 인벤토리(B 27문항 / E 9섹션 / F 6섹션)를 2026 한국 IT 면접 빈출과 **Codex + 커리큘럼 중복 제거** 교차로 대조. 이미 다른 곳에서 다루는 주제(Spring MVC 흐름·정규화·observability·Saga 등)는 제외하고, **빈출인데 빠진 20개**를 확정.

### 추가한 20개 섹션 (전부 면접 빈출 확인)
| 부록 | 추가 섹션(Q번호) |
|---|---|
| **B** CS·Java (Q28~Q34) | OOP 4대특성+오버로딩/오버라이딩 · JVM 메모리+클래스로더 부모위임 · 컬렉션 선택+hashCode/equals 계약 · 동시성 심화(synchronized/ReentrantLock/volatile/CAS) · DB락(낙관·비관·MVCC) · HTTP 메서드·상태코드(멱등성) · HTTPS/TLS 핸드셰이크 |
| **E** 시스템설계 (Q6~Q12) | 회복탄력성(타임아웃·재시도·서킷브레이커·벌크헤드) · CAP+일관성모델 · CDN · 파일업로드(presigned/S3) · 알림시스템(큐+워커+멱등) · 실시간랭킹(Redis ZSET) · 분산ID(Snowflake) |
| **F** 프론트품질 (Q6~Q11) | 이벤트루프(매크로/마이크로) · JS핵심(클로저·this·프로토타입·호이스팅) · 브라우저렌더링(CRP·reflow/repaint) · React리렌더(배칭·useEffect) · 상태관리비교(Context/Redux/Zustand/Recoil) · 폼품질(controlled/uncontrolled·검증·디바운스) |

각 섹션은 기존 Q&A 형식(도입→비유→표/카드/코드→면접 꼬리질문) 준수, 이미지(`learning-visual`) 미포함. E/F에는 복습 뱅크용 퀴즈도 각 6문항 추가(quizEngine → 대시보드 SRS 자동 편입).

### 정확성 게이트 (2단계 검증)
1. **작성+적대적 검수 워크플로우**: 20개 섹션 각각 저자 에이전트 작성 → 독립 검수 에이전트가 사실/형식/코드 재검증 후 수정본 반환. 4개 섹션에서 실제 오류 발견·수정(예: `@Transactional` self-invocation 버그, 알림 claim-first 메시지 유실 케이스, 랭킹 TTL 슬라이딩 버그).
2. **Codex 독립 교차검증**(부록별 3회): 추가 발견·수정한 주요 사실 오류 —
   - **B**: PATCH 멱등성 명세 출처 **RFC 7231 → RFC 5789** 정정 / 429 Retry-After "필수 아님"으로 완화 / Major GC vs Full GC 구분 / 클래스 정체성=이름+로더 명확화 / TLS getAcceptedIssuers 주석 정정.
   - **E**: Resilience4j Retry↔CircuitBreaker 순서(CallNotPermittedException ignore 필요) / aspect 순서는 어노테이션 나열순 무관 / max-attempts=3이면 백오프 2회 / 실패율 "이상(≥)" / RYW 1초 휴리스틱→LSN 보장 단서 / 알림 PENDING 동시성(lease) / ZSET 복잡도 "모두 O(log N)" 과일반화 정정.
   - **F**: `this` 우선순위 순서(new>명시>암시>기본) 명확화 / await 다음 줄이 setTimeout보다 "항상" 먼저는 아님(지연 settle 시) / React.memo는 context 구독 리렌더 해결책 아님 / useDeferredValue는 디바운스 아님 / 디바운스 cleanup은 타이머만 취소(AbortController 단서) / Timer 예제 컴포넌트 분리 / JSX 속성 내 주석 → children 위치로.

### 부수 발견·수정 (같은 파일 정리)
- **사이드바 버그 잔존**: PR #4가 e/f/g를 "완전판"으로 가정해 제외했으나, 실제로 **appendix-e.html(A~E만)·appendix-f.html(A~F만)** 사이드바가 잘려 있었음 → 표준 A~G nav로 교체(사용자 버그 #1 완전 해소). 전 17개 사이드바 페이지 A~G 노출 확인.
- **리브랜드 잔재**: e/f 본문의 쇼핑몰명 "Antigravity" 6곳 → **Rehab Fashion**으로 정정(+"부록 Antigravity의 Redis JWT" 깨진 문구 수정). 로고 span은 main.js 런타임 리브랜드("Dev Rehab")라 그대로 둠.

### 라이브 검증
섹션 open/close·`<pre>` 균형 OK · 퀴즈 배열 JS 파싱 OK(E 11·F 11문항, mcq correct 인덱스 유효) · 내부 링크 0 broken · 브라우저 렌더(B 34섹션·E 7·F 6 신규 노출, 사이드바 A~G, 로고 Dev Rehab, 퀴즈 렌더, 콘솔 에러 0) 통과.


---

## 부록 C 기업 코딩 테스트 빈출 실전 문제 추가 (2026-06-08 · PR #6)

### 요청 배경
사용자 요청 #3: "부록 C에 카카오/토스/무신사/쿠팡/당근/네이버 등 기업 코테 문제~풀이를 많이 수록 + 빈출 문제 난이도(프로그래머스 기준) 표시."

### 추가 내용 — 새 카테고리 "🏢 H. 기업 코딩 테스트 빈출 실전"
14개 패턴 학습 뒤 곧바로 실전 연습하도록, 패턴별 **오리지널 회사 스타일 문제 41개**(표절 없이 유형만 차용, Rehab Fashion 테마)를 카드로 추가.

| 패턴(11) | 문제 수 | 회사 스타일 |
|---|---|---|
| 구현·시뮬레이션 / 문자열 / 해시 / 스택·큐 / 힙 / 정렬+그리디 / DFS·BFS / 이분탐색·파라메트릭 / DP / 최단경로 / 투포인터·슬라이딩윈도우 | 4·4·3·3·3·4·5·4·5·3·3 = **41** | 카카오·네이버·라인·토스·쿠팡·무신사·당근·우아한형제들·삼성 |

각 문제 카드: **난이도 배지(프로그래머스 Lv.1~4)** + 회사 태그 + 문제 + 제약 + 입출력 예시 표 + (접기)**단계별 접근 · Java 코드 · 해설 · 시간/공간복잡도**. 패턴별로 쉬움→어려움 정렬. 패턴 끝마다 **실제 기출 참조 리스트 65개**(회사·플랫폼·문제명·Lv·링크 — 원문 미수록, 저작권 안전). 난이도 분포: Lv.1×6 · Lv.2×20 · Lv.3×12 · Lv.4×3.

### 정확성 게이트 (핵심) — 모든 Java 풀이 실행 검증
- 풀이는 전부 **stdin→stdout `public class Main`**(페이지 기존 BufferedReader 스타일).
- **2중 검증**: ① 생성 단계에서 11개 패턴 에이전트가 각자 `javac`로 컴파일·실행 자체 검증 → ② **독립 하니스(.verify_c.py)로 41문제 전부 재컴파일 + 모든 테스트(예시+엣지) 재실행 → 41/41 통과**(끝 공백 무시 비교). 통과한 문제만 수록.

### 풀이 이해도 재확인 (사용자 추가 요청)
- 별도 클러리티 검수 워크플로우(11 에이전트)로 **단계별 접근(approach)·해설·코드 주석**을 복귀 학습자 눈높이로 점검·보강. 원본 단계별 이해도 점수 3~5 → 더 잘게 쪼갠 단계, 흔한 실수(off-by-one 등) 명시, 주석 보강.
- ★로직 불변 원칙: 주석만 보강하고 알고리즘/입출력은 변경 금지 → **보강본 41개 전부 javac 재검증 통과**(코드 되돌림 0건).

### 검증
섹션/`<pre>`/`<details>` 균형(18/54/41) · 퀴즈 JS 파싱(7문항: 기존 3 + 신규 4) · 내부 링크 0 broken · 브라우저(41 카드·11 패턴 헤더 렌더, Prism 하이라이팅, 풀이 접기/펼치기, 코드 이스케이프 정상, 사이드바 A~G, 콘솔 에러 0) 통과.
