# 설계: 복귀 학습 대시보드 → 능동 연습 앱 확장 (Approach A)

생성: /office-hours (Builder 모드) · 2026-05-28
대상 프로젝트: Antigravity Fullstack Rehab Dashboard (`C:\Study`)
상태: DRAFT
연관 문서: `IMPLEMENTATION_PLAN.md` (v3.2)

---

## 문제 정의

지금 대시보드는 콘텐츠는 탄탄하지만 본질이 **수동적**이다. 사용자는 읽고 → 퀴즈를 한 번 클릭하고 → 진척도 체크박스를 켠다. 그런데 공백기 후 "재활/복귀"의 핵심은 **읽기가 아니라 잊었던 감각이 다시 손에 붙는 것**이다. 8개 챕터를 정독해도 코딩 감각·기억은 안 돌아온다.

목표: **읽기 앱 → "손으로 치고 + 안 까먹게 반복하는" 연습 앱**으로 전환. 제품화·사업 의도 없음. 본인 복귀용 개인 학습 도구.

## 무엇을 멋지게 만드나 (핵심 가치)

1. **간격 반복(SRS)** — 한 번 푼 퀴즈/용어가 끝이 아니라, 틀린 것·잊을 때쯤인 것을 자동으로 다시 띄운다. 공백기 지식 재고착에 최적.
2. **브라우저 코딩 실습** — 코드를 "읽고 빈칸 채우기"가 아니라 **직접 작성·실행해 결과를 본다.**

## 제약 (코드로 검증됨)

- **백엔드 없음, 정적 사이트.** 로컬 웹 서버(Live Server/python http.server)에서만 구동. (`IMPLEMENTATION_PLAN.md` 1절)
- 코드 채점은 현재 **키워드 문자열 매칭**일 뿐 실행이 아님 — `gradeCodeQuiz()` 가 공백 제거 후 `mustContain`/`mustNotContain` 검사 (`assets/quiz.js:200`).
- 진척도 모델은 단일 키 `localStorage.antigravity_progress = { "chapter-1": {read, quizPassed}, ... }` (`assets/main.js:288`).
- 퀴즈 문항이 **각 챕터 HTML 안에 인라인**으로 `quizEngine.render(...)`에 박혀 있음 → 흩어져 있음.
- 용어는 `assets/glossary.json` = `{ terms: [{key, name, definition, explanation}] }`.

## 전제 (확정)

1. 재활의 레버는 "콘텐츠 추가"가 아니라 **능동적 연습 + 망각 방지 반복**이다.
2. 정적 사이트에서 **JS/TS/React/SQL은 브라우저에서 진짜 실행 가능**(sql.js, esbuild-wasm/iframe). **Java/Spring은 클라이언트만으로 실행 불가** → Approach A에서는 Java는 기존 키워드 퀴즈 유지, 실행은 실행 가능한 언어에만 적용.
3. SRS는 새 `localStorage` 키 1개 + 대시보드 위젯 1개로 얹힌다. **문항 뱅크 중앙화가 유일한 선행 작업.**

## 검토한 대안

- **A. 최소 실전 (선택됨)** — SRS + 클라이언트 사이드 실행 가능한 언어만 실습. 백엔드 0. 완성도 8/10.
- **B. 풀 실전 코딩 도장** — A + 원격 실행 API(Piston)로 Java까지 실행 + 어설션 채점. 완성도 9/10이나 네트워크 의존 발생. → **A 이후 Java 실행이 정말 필요해지면 승격.**
- **C. 프로젝트 재현 회상** — SRS가 잡지식이 아니라 프로젝트 마일스톤("오늘: Zustand store 다시 작성")을 스케줄. demo-shop 재구축. 실전 감각 최고지만 설계 부담. → **북극성으로 보관, 나중에 SRS 카드 타입으로 흡수 가능.**

---

## 권장 구현 (Approach A)

### Part 1 — SRS 복습 엔진

**1.1 문항 뱅크 중앙화 (선행 작업)**
- 신규 `assets/review-bank.js` — 모든 챕터 퀴즈 + 용어를 복습 카드로 단일 출처화.
- 카드 스키마:
  ```js
  {
    id: "ch1-mcq-1",            // 고유 ID
    chapter: "chapter-1",
    type: "mcq" | "code" | "term",
    // mcq:  { question, options, correct, explanation }
    // code: { prompt, starter, solution, language, validator, runnable: true|false }
    // term: { key } → glossary.json에서 정의 조회
  }
  ```
- `quiz.js`에 `getQuizzesForChapter(chapterKey)` 헬퍼 추가 → 각 챕터 HTML은 인라인 배열 대신 뱅크 참조로 전환(점진적). 중복 제거 + SRS와 단일 출처 공유.
- `runnable` 플래그: JS/TS/React/SQL = true, Java/Spring = false. 러너 노출 여부 결정.

**1.2 SM-2 스케줄링**
- 신규 `assets/srs.js`. localStorage 키 `antigravity_srs`:
  ```js
  { [cardId]: { interval, easeFactor, repetitions, dueDate, lapses } }
  ```
- SM-2(~30줄): 복습 시 자가평가 4버튼 → quality 매핑(다시=2 / 어려움=3 / 보통=4 / 쉬움=5).
  - 정답: repetitions++; interval = 1 → 6 → 직전*EF; EF 조정.
  - 오답(quality<3): repetitions=0; interval=1; lapses++.
- API: `srs.getDueCards()`, `srs.grade(cardId, quality)`, `srs.ensureCard(cardId)`.

**1.3 복습 UI**
- `index.html` stats-grid에 위젯 추가: **"오늘의 복습: N개" + [복습 시작]** (위젯 슬롯 이미 존재).
- 신규 `review.html` — due 카드를 하나씩 출제. **채점은 `quiz.js` 로직 재사용**, 채점 후 4버튼 → `srs.grade` → 다음 카드.
- term 카드: 정의를 가린 채 회상 → "기억남/까먹음" 자가평가.

### Part 2 — 클라이언트 사이드 코드 실습

**2.1 SQL 러너 (가장 빠른 "와우")**
- `lib/sql-wasm.js` + `.wasm` (sql.js) 로드.
- `mock-data.json`을 `CREATE TABLE` + `INSERT`로 시드(products/orders/users) → **진짜 SQL 실행 → 결과 테이블 렌더.**
- Ch3(DB/SQL/QueryDSL) 본문에 "쿼리 직접 실행" 박스.

**2.2 JS/TS/React 러너**
- 신규 `assets/code-runner.js` + sandbox iframe (`sandbox="allow-scripts"`, postMessage 통신).
- 트랜스파일: esbuild-wasm(빠름, ~3MB) 또는 Babel standalone(간단, 기존 Mermaid처럼 CDN 동적 로드 패턴과 일관).
- React: iframe에 React/ReactDOM + 트랜스파일 코드 주입 → 미리보기 + console 캡처.
- Ch5~7 본문에 "실행" 박스.

### 파일 변경 요약
- 신규: `assets/srs.js`, `assets/review-bank.js`, `assets/code-runner.js`, `review.html`, `lib/sql-wasm.js`+`.wasm`
- 수정: `assets/quiz.js`(뱅크 참조 헬퍼), `index.html`(복습 위젯), 각 챕터 HTML(인라인 퀴즈 → 뱅크 참조, 점진적), `assets/style.css`(복습/러너 UI)

## 배포 계획
개인용 정적 사이트 — 기존 로컬 웹 서버 구동 방식 그대로. 추가 인프라/CI 불필요.

## 성공 기준
- 대시보드에 "오늘의 복습 N개"가 뜨고, 복습하면 다음 due가 갱신된다.
- 틀린 문항이 더 자주, 맞은 문항이 더 드물게 출제된다(SM-2 동작 확인).
- Ch3에서 SQL을, Ch5~7에서 JS/React를 브라우저에서 직접 실행해 결과를 본다.
- 백엔드 없이 로컬 서버만으로 전부 동작(오프라인 OK).

## 빌드 순서 (Next Steps)
1. **문항 뱅크 중앙화** — `review-bank.js` 생성 후 Ch1~2 퀴즈만 먼저 이전·검증. (반나절)
2. **SRS 엔진** — `srs.js` SM-2 + localStorage. 콘솔로 스케줄 동작 검증. (반나절)
3. **복습 위젯 + review.html** — due 출제, `quiz.js` 채점 재사용, 4버튼 평가. (1일)
4. **SQL 러너** — sql.js + mock-data 시드. Ch3에 실행 박스. (1일) ← 가장 빠른 도파민
5. **JS/React 러너** — esbuild-wasm/Babel + iframe. Ch5~7 실행 박스. (1~2일)
6. 나머지 챕터 문항 뱅크 이전 + 다듬기.

> 안전한 길은 1→2→3 순서(복습 루프 먼저 완성). 동기 부여가 필요하면 4번(SQL 러너)을 먼저 찔러봐도 됨 — 진짜 쿼리가 브라우저에서 도는 걸 보면 확 붙는다.

## 미해결 질문
- 문항 뱅크: 전체 한 번에 이전 vs 점진적? → 권장 점진적(Ch1~2 먼저).
- 트랜스파일러: esbuild-wasm vs Babel standalone? → 둘 다 가능, 기존 CDN 패턴 살리려면 Babel.
- 복습 UI: 별도 `review.html` vs 대시보드 모달? → 권장 별도 페이지(단순).

## 당신의 사고 방식에서 본 것
- "재활 앱을 만들 수 없을까"라는 막연한 질문에서, 곧장 **"능동 연습 + 망각 방지"** 조합을 짚어냈다. 재활의 진짜 병목이 콘텐츠가 아니라 정착·회상이라는 걸 직관적으로 알고 있다는 신호.
- 화려한 풀빌드(B)가 아니라 **앱의 성격을 바꾸되 위험이 가장 낮은 길(A)**을 골랐다. "한 번에 다"보다 "성격을 먼저 바꾸고 키운다"는 판단 — 공백기 복귀자에게 제일 중요한 건 도구 완성도가 아니라 *매일 돌아오게 만드는 루프*다.

---

## 구현 로그

### v1 — SRS 복습 루프 (2026-05-28, 빌드 순서 1~3 완료)
**방식 변경:** 빌드 1번을 "84문항을 review-bank.js로 이전"에서 **런타임 자동 등록**으로 전환했다 (이 프로젝트는 git 미사용 → 대량 전사/이전은 깨지면 복구 불가). 원본 인라인 퀴즈 배열이 단일 출처로 남고, 뱅크는 파생 캐시.

- ✅ `assets/quiz.js` — `quizEngine.render()` 맨 앞에 `registerToReviewBank()` 추가. 챕터를 열 때 문항이 `localStorage["antigravity_review_bank"]`에 자동 캐시 (안정 id = 챕터키 + 질문 텍스트 해시). 헬퍼 `makeCardId`, `registerToReviewBank` 추가. 기존 채점/렌더 로직은 무변경.
- ✅ `assets/srs.js` (신규) — SM-2 엔진. `localStorage["antigravity_srs"]`에 `{interval, ease, reps, due, lapses}` 저장. API: `getDueCards/getDueCount/grade/getStats/getAllCards/resetSchedule`.
- ✅ `review.html` (신규) — 오늘의 복습 세션 UI. due 카드를 셔플해 1장씩 출제. mcq는 자동 정오 판정, code는 `gradeCodeQuiz` 재사용, 정답 공개 후 회상 4단계(다시2/어려움3/보통4/쉬움5) → SM-2 스케줄. 세션당 최대 20장. prism으로 모범답안 하이라이트.
- ✅ `index.html` — stats-grid에 "오늘의 복습 N개" 위젯 + [복습 시작] 버튼 + `srs.js` 로딩 + `updateReviewWidget()`.

**테스트:** 로컬 서버(`python -m http.server 5500`) → `chapter-1`, `chapter-2` 열어 퀴즈 렌더(=뱅크 등록) → 대시보드 "오늘의 복습" 개수 확인 → 복습 시작 → 회상 평가 → 재방문 시 due 갱신 확인.

**알려진 단순화(v1):** ① "다시"도 당일 재출제 대신 내일 due(일 단위 스케줄). ② 용어(glossary) 카드는 아직 미포함, 퀴즈 문항만. ③ 한 번도 안 연 챕터는 복습 대상에서 빠짐(설계상 의도).

**QA 통과 (2026-05-28, Claude Preview + python http.server):** chapter-1/2 방문 시 21문항 자동 등록(ID 충돌 0, 콘솔 에러 0) → 대시보드 위젯 "21개" → review.html 출제·채점(gradeCodeQuiz 재사용)·SM-2 스케줄(reps/interval/due) 정상 → due 21→20, 진행 1/20→2/20 확인. **발견·수정 버그 1건:** `.rev-rating`의 `display:flex`가 `hidden` 속성을 덮어써 평가 버튼이 채점 전 노출됨 → `.rev-rating[hidden]{display:none}` 추가로 해결(재검증 완료).

### v1.1 — 다듬기 (2026-05-28, 사용자 피드백 반영)
- ✅ **선택지 글자 안 보임 수정** — `.quiz-option`에 `color` 선언이 없어 `<button>` 기본색(검정)으로 렌더 → 다크 배경에서 안 보임. `assets/style.css`에 `color: var(--text-color)` + `font-family: inherit` 추가 (챕터 퀴즈도 함께 해결되는 전역 수정).
- ✅ **이전 문항 복귀** — `review.html` 하단에 [← 이전] / [다음 →] 페이저 추가. 세션 상태(`sess`)로 되돌아온 카드의 답변·해설·선택한 회상난이도까지 복원. 마지막 카드는 "복습 종료 ✓", 종료 화면에 "← 마지막 문항" 버튼.
- ✅ `[hidden]{display:none!important}` 전역 가드 추가 → `display:flex`가 `hidden` 속성을 덮던 버그 계열 원천 차단.
- **QA (Claude Preview):** 21문항 등록 → 네비게이션 → 상태 복원 → 종료까지 전 구간 재검증, 콘솔 에러 0.
- ⚠️ python http.server는 CSS를 캐시할 수 있음 → 변경 직후 첫 로드는 하드 리프레시(Ctrl+Shift+R) 필요. Live Server는 자동 무효화.

### v1.2 — 용어 카드 편입 (2026-05-28)
- ✅ `assets/srs.js` `ensureGlossaryCards()` 추가 — glossary.json의 용어 79개를 `type:"term"` 복습 카드로 뱅크의 `glossary` 키에 병합 (id `term-<key>`).
- ✅ `review.html` 용어 카드 렌더 — 용어명 표시 → [정의 보기] → 정의 + 설명 공개 → 회상 4단계 평가(SM-2). 이전/다음·상태 복원도 용어 카드 지원. 배지 "용어".
- ✅ `index.html` 위젯이 ensureGlossaryCards 후 재갱신 → due 개수에 용어 포함. 구버전 srs.js 캐시 대비 `startSession` 폴백 방어.
- **QA (Claude Preview):** 총 100문항(퀴즈 21 + 용어 79). 용어 카드 렌더·공개·평가(`term-Generative-UI` SM-2 스케줄)·대시보드 위젯 99개 갱신까지 확인, 콘솔 에러 0.

### 남은 단계 / 재검토
- [ ] **4번 SQL 러너** (sql.js + mock-data 시드). ⚠️ 단, `antigravity-app/`(실제 Spring Boot + H2 + Next.js 실습 레포)가 이미 진짜 코드 실행을 제공 중 → 대시보드 내장 러너의 우선순위 재검토 필요.
- [ ] **5번 JS/React 러너** (esbuild-wasm/iframe). 위와 동일 사유로 재검토.
- [x] ~~용어 카드 SRS 편입~~ (v1.2 완료)
- [ ] "다시" 당일 재출제 + 일일 신규 카드 상한 + 연속 복습일(streak) 표시.
