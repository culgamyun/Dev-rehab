# 🤖 로보틱스 입문 코스 — 새 세션 핸드오프 프롬프트

> 이 문서를 **새 세션의 첫 메시지로 붙여넣거나**, "`C:\Study\ROBOTICS-COURSE-HANDOFF.md` 를 읽고 시작해줘" 라고 지시하세요.
> 작성 맥락: 기존 **Dev Rehab 학습 대시보드**(공백기 풀스택 개발자 복귀용)에, 같은 시스템을 재사용해 **Python 중심 로보틱스 입문 코스**를 기초부터 추가합니다.

---

## 0. 미션 한 줄
`C:\Study`(git repo `culgamyun/Dev-rehab`, GitHub Pages 라이브)에 **"로보틱스 코스"**를 새로 추가한다. **기존 디자인·퀴즈·SRS·용어사전·검색 시스템을 그대로 재사용**하되, **일러스트만 '기술 블루프린트/도면' 스타일**로 새로 간다(기존 2D 파스텔과 구분). 언어는 **Python 중심**, 범위는 **기초 수학 → 센서/임베디드 → 키네매틱스/제어 → ROS 2/시뮬레이션 → 인식/SLAM/학습제어**까지 **폭넓게 통합**.

사용자 확정 사항(2026-06-08):
- 이미지 스타일 = **기술 블루프린트·도면** (기존과 다르게)
- 초점 = **폭넓게 통합** (기초부터 전 영역)
- 언어 = **Python 중심**
- 구성 = **기존 Dev-rehab 사이트에 새 코스로 확장**

---

## 1. 프로젝트 컨텍스트 (반드시 숙지)

- **정적 멀티파일 HTML + 바닐라 JS, 빌드 스텝 없음.** `fetch()`를 쓰므로 `file://`이 아니라 **HTTP 서버** 필요.
- **로컬 프리뷰**: `.claude/launch.json`의 `study-static` (python `http.server` :5599). Claude Preview MCP로 렌더 검증. 자산 변경 후 브라우저는 `Ctrl+Shift+R`(하드 리프레시) 필요.
- **git/PR 규칙** (중요):
  - `gh` CLI 없음 → **GitHub API + GCM 토큰**(`git credential fill`로 토큰 획득)으로 PR 생성·머지.
  - **main 직접 push 금지**(분류기가 차단). 항상 **feature 브랜치 + PR**. 머지 후 원격 브랜치 삭제 + 로컬 main `pull --ff-only`.
  - 커밋 메시지 끝에 `Co-Authored-By: Claude <noreply@anthropic.com>`, PR 본문 끝에 generated-with 푸터.
  - GitHub Pages는 **main / 루트(/)** 에서 서빙 → 머지 즉시 자동 재배포(라이브 `https://culgamyun.github.io/Dev-rehab/`).
- **빌드 철학**: **로드맵 주도**로 코스/챕터 단위로 빌드. bkit `/pdca`는 돌리지 말 것(`docs/.pdca-status.json`은 다른 코드베이스용, stale). `ADDITIONAL-LEARNING-ROADMAP.md`가 계획 문서.
- **브랜드**: 좌상단 로고는 `main.js`가 런타임에 **"Dev Rehab"**으로 리브랜드(정적 HTML엔 `<span>Antigravity</span> Rehab` 그대로 둠 — 건드리지 말 것). 실습 쇼핑몰명은 Rehab Fashion(로보틱스엔 무관).

---

## 2. 재사용할 시스템 규약 (정확히 따를 것)

### 2-1. 페이지 스켈레톤
새 `chapter-r*.html`은 기존 `chapter-1.html`을 복제해 만든다. 구조:
```
<head>: theme script(localStorage 'antigravity_theme'||'light') + style.css + prism.min.css
<aside id="sidebar">: .sidebar-logo + <ul class="nav-menu"> + .sidebar-footer(용어사전/테마/초기화 버튼)
<main id="main-content">: .chapter-header(breadcrumb + h1 + intro p) + figure.learning-visual(hero) + .concept-section(<section> 들)
<div id="toast-container">, <div id="glossary-modal">
scripts: prism + prism-언어들 + lunr + mock-api.js + main.js + search.js + quiz.js + copyCode()
```

### 2-2. 사이드바 (⚠️ 전 페이지 공유 canonical — 드리프트 주의)
- nav-menu는 **모든 페이지가 동일한 한 벌**을 공유한다. `main.js`의 `highlightActiveSidebarItem()`이 **URL로 active를 런타임 부여**(하드코딩 `active` 불필요), `initSidebarBrand()`가 로고 리브랜드 + "대시보드 홈" 제거, `initMobileNav()`가 햄버거 주입.
- 현재 섹션: **백엔드 코스 / 프론트엔드 코스 / 데브옵스 코스 / 실무 연계 스페셜 부록(부록 A~G)**.
- ★ **로보틱스 코스 추가 = 모든 ~18개 페이지의 nav-menu를 갱신해야 함.** 한 곳만 고치면 "들어가면 로보틱스 항목이 안 보이는" 드리프트 버그가 생긴다(과거 부록 E/F에서 실제로 발생). **표준 nav 한 벌을 만들어 전 페이지에 일괄 치환**하는 스크립트로 처리(파이썬 정규식 치환, 실행 후 삭제). 신규 코스 섹션 라벨은 기존 코스 라벨과 동일 스타일의 `<li style="...">로보틱스 코스</li>`.

### 2-3. 콘텐츠 포맷 (기존과 100% 일관되게)
- `<section id="...">` → `<h2>` → 도입 `<p>` → `.analogy-box`(h4 비유 제목 + p) → 본문(표 / `.glass-panel` 카드 그리드 / 코드블록) → 마무리 강조 문단.
- 코드블록:
  ```
  <div class="code-block-header"><span class="code-title">제목</span><button class="btn-copy" onclick="copyCode(this)">코드 복사</button></div>
  <pre class="language-python"><code class="language-python">...</code></pre>
  ```
  코드 안의 `<` `>` `&`는 반드시 `&lt;` `&gt;` `&amp;`로 이스케이프.
- 색상 변수 로테이션: `var(--accent-color)`, `var(--frontend)`, `var(--devops)`, `var(--algo)`, `var(--interview)`, `var(--test)`.

### 2-4. ⚠️ Python 신택스 하이라이팅 — `prism-python` 추가 필요
- 현재 `lib/`엔 prism-**java/json/jsx/sql**만 있고 **python이 없다.** Python 코드가 하이라이팅되려면:
  1. `lib/prism-python.min.js`를 추가(Prism CDN의 components/prism-python.min.js).
  2. **모든 페이지의 스크립트 블록**에 `<script src="lib/prism-python.min.js"></script>`를 prism-java 줄 옆에 포함(전 페이지 일괄, 사이드바 갱신과 함께 처리).

### 2-5. 퀴즈 → 대시보드 SRS 자동 편입
- `quizEngine.render("quiz-wrapper", chapterRQuizzes, "chapter-r1")` 형식. `quiz.js`가 `registerToReviewBank()`로 **SRS 복습 뱅크에 자동 등록**(srs.js, localStorage `antigravity_srs`/`antigravity_review_bank`, `review.html`, DAILY_NEW_LIMIT=15).
- 퀴즈 포맷:
  - mcq: `{type:"mcq", question, options:[...], correct:인덱스, explanation}`
  - code: `{type:"code", language:"python", prompt, starter, validator:{mustContain:[...], mustNotContain:[...]}, solution, explanation}` (substring 채점이므로 `mustContain` 토큰은 **대소문자·공백까지** 답안에 확실히 들어갈 핵심 토큰으로).

### 2-6. 용어사전
- `assets/glossary.json`에 `{key, chapter:"Robotics 1" 등, name:"한글 (English)", definition, explanation}` 추가 → `main.js`가 본문 첫 등장 단어를 hover 툴팁으로 자동 래핑(H1~H4/코드/링크 제외, 기존 key 중복 금지).

### 2-7. ⚠️ 검색 인덱스 등록 (필수)
- `assets/search.js`의 **`INDEX_PAGES` 하드코딩 배열(~23행)** 에 **새 로보틱스 페이지 파일명을 모두 추가**. 안 하면 `Ctrl+K` lunr 검색에서 누락. (인덱스는 `sessionStorage`에 캐시되므로 하드 리프레시로 확인.)

### 2-8. index.html (대시보드 홈)
- 사이드바(2-2) 갱신 외에, **로보틱스 코스 카드/섹션**을 홈에 추가. 통계 위젯의 `"X / 8 챕터"`가 **8로 하드코딩**(`statsCountEl.textContent = ...completedCount / 8...`)되어 있으니, 로보틱스 챕터를 통계에 포함할지 결정하고 그 숫자/로직을 갱신(또는 로보틱스는 별도 카운터).

---

## 3. 🎨 이미지 스타일 — 기술 블루프린트/도면 (NEW · 기존과 구분)

> 기존 dev 코스 일러스트(2D 파스텔)는 **재생성 금지**. **로보틱스 신규 페이지만** 아래 블루프린트 스타일을 쓴다. `.webp` + `<figure class="learning-visual"><img loading="lazy"><figcaption>` 컨벤션은 유지. 파일명 예: `assets/learning-visuals/chapter-r1-coordinate-frames.webp`.

**이미지 생성 프롬프트 베이스 (영문, 이미지 모델용):**
```
Technical blueprint / engineering schematic illustration. Deep blueprint-blue or dark navy
background (#0A1F44 / #0a1929) with a fine white-cyan graph-paper grid. The subject —
[로봇 팔 / 모바일 로봇 / 센서 / 좌표계 / 제어 루프 다이어그램 등] — rendered as precise thin
white & cyan CAD-style line art: orthographic or exploded view, with dimension lines,
measurement ticks, leader-line callouts, and small monospace technical labels. One restrained
accent color (amber #FFB300 or bright cyan) highlights the key part only. When showing a
coordinate frame, use axis convention X=red, Y=green, Z=blue. Flat, high-contrast, precise,
no photorealism, no pastel, no rounded cartoon style. Aspect 16:9.
```
- **figcaption**: 한국어 1줄로 "이 도면이 무엇을 보여주는지"를 요약(기존 톤과 동일).
- **일관성**: 전 로보틱스 페이지가 같은 배경·선·그리드·라벨 톤을 공유하도록 베이스 프롬프트를 고정하고 subject만 교체.
- (참고) 이미지 생성은 **이미지 생성 가능한 모델/툴**이 필요. 만약 이번 세션에서 이미지 생성이 불가하면 **`<figure>`를 비워두지 말고 일단 생략**하고(텍스트·다이어그램 우선), 이미지 인계 메모를 남긴다. 본문 SVG/HTML 다이어그램(좌표축·블록선도)은 코드로 직접 그려도 좋다.

---

## 4. 📚 커리큘럼 로드맵 (Python 중심 · 기초→통합)

> `ADDITIONAL-LEARNING-ROADMAP.md`에 "로보틱스 코스" 섹션을 추가(또는 `ROBOTICS-ROADMAP.md` 신설)하고, **챕터 1개씩 점진적으로** 빌드한다. 아래는 제안 골격 — 첫 세션에서 사용자와 합의해 조정 가능.

| # | 챕터 | 핵심 개념 | Python 실습 |
|---|---|---|---|
| **R1** | 로보틱스 입문 & 선형대수 기초 | 로봇 구성(센서·액추에이터·제어기), 좌표계, 벡터/행렬, 회전·평행이동, 동차변환행렬(SE(3)) | `numpy`로 변환행렬 합성·점 변환 |
| **R2** | 센서와 신호 | IMU·엔코더·LiDAR·카메라·초음파, 샘플링, 노이즈/필터(이동평균·간단 칼만) | 센서 데이터 시뮬레이션 + 필터링 |
| **R3** | 액추에이터 & 임베디드 기초 | DC/서보/스텝모터, PWM, GPIO, I2C/SPI/UART, 실시간성 | `gpiozero`/모의 드라이버로 모터 제어 개념(하드웨어 없이 시뮬레이션) |
| **R4** | 키네매틱스 | 정/역기구학, DH 파라미터, 자코비안, 차동구동(differential drive) 모바일 로봇 | 2~3링크 팔 FK/IK, 휠 오도메트리 |
| **R5** | 제어 이론 기초 | 개/폐루프, **PID**, 상태공간 개념, 튜닝(지글러-니콜스 감각) | PID로 위치/속도 추종 시뮬레이션 + 그래프(`matplotlib`) |
| **R6** | ROS 2 기초 | 노드·토픽·서비스·액션, `rclpy` 퍼블리셔/서브스크라이버, 패키지·`colcon`·런치 | 토픽 pub/sub 노드 작성(개념·표준 패턴) |
| **R7** | ROS 2 심화 & 시뮬레이션 | TF2(좌표 변환 트리), URDF(로봇 모델), Gazebo/RViz, 센서 플러그인 | URDF 작성, 텔레옵, RViz 시각화(개념·설정 위주) |
| **R8** | 인식(Perception) | OpenCV 이미지 처리, 객체 검출, 카메라 캘리브레이션, 포인트클라우드 개요 | `opencv-python`으로 색/엣지/마커 검출 |
| **R9** | 위치추정·SLAM·내비게이션 | 오도메트리, 칼만/파티클 필터, SLAM 개념, 경로계획(A*/Dijkstra/RRT), Nav2 | A*/RRT 경로계획 구현, 1D 칼만 필터 |
| **R10** | 매니퓰레이션 & 학습기반 제어 | 모션 플래닝(MoveIt 개요), 그리핑, 로봇 RL 기초, sim-to-real | Gym 류 환경에서 간단 정책(개념·미니 예제) |

**제안 부록(스페셜):**
- 부록 R-A. **Python for Robotics 치트시트** (`numpy`/`scipy`/`matplotlib`/`opencv` 빈출 패턴)
- 부록 R-B. **로보틱스 면접 CS** (좌표변환·PID·TF·SLAM·ROS 빈출 Q&A — 부록 B 포맷 차용)
- 부록 R-C. **수학 복습** (선형대수·삼각함수·확률 핵심, 로보틱스 맥락)

---

## 5. ✅ 코드 정확성 게이트

- **순수 Python 예제(numpy/제어/경로계획/OpenCV 알고리즘)**: 이 환경에 **Python 3.13** 있음 → **직접 실행해 출력/그래프 산출을 검증**(임시 디렉터리에서 실행 후 정리). 가능하면 입출력 단언으로 정답 확인.
- **ROS 2 / 하드웨어 의존 코드(rclpy 노드, GPIO, URDF, Gazebo)**: 이 환경에서 **실행 불가**가 일반적. 따라서:
  - 실행 검증 대신 **공식 API 패턴을 정확히** 따른다. **`context7` MCP로 ROS 2(rclpy)/OpenCV/라이브러리 최신 문서를 조회**해 시그니처·구조를 맞춘다(추측 금지).
  - 코드 상단 주석에 **실행 환경 전제**(예: `# ROS 2 Humble + colcon 워크스페이스에서 실행`)를 명시.
  - 가능하면 ROS 의존부와 **순수 알고리즘부를 분리**해, 알고리즘부만이라도 Python으로 실행 검증.
- **적대적 교차검증**: 개념·코드 정확성은 별도 에이전트/`codex`(`/c/nodejs/codex exec`)로 교차 확인(과거 검증 패턴). 풀이/설명이 **초심자도 단계별로 따라올 수준**인지 클러리티 점검.

---

## 6. 🔁 빌드 절차 (챕터 단위 점진)

각 챕터를 **1개씩**: 작성 → 검증 → 커밋/PR → 머지. (대형이면 챕터 내부도 섹션 단위로.)

1. **준비(첫 PR)**: `lib/prism-python.min.js` 추가 + 전 페이지 스크립트 포함, 사이드바 canonical에 "로보틱스 코스" 섹션 + R1 항목 추가(전 페이지 일괄 치환), `search.js INDEX_PAGES`에 신규 파일 등록, `index.html` 코스 카드 추가.
2. **챕터 작성**: `chapter-r1.html` ~ `chapter-r10.html`(또는 합의된 번호). 콘텐츠 포맷(2-3) 준수, Python 코드 실행 검증, 퀴즈 배열 + `quizEngine.render`, 용어 추가.
3. **검증(머지 전 필수)**:
   - 내부 링크 **0 broken**(전 HTML href/anchor 체커).
   - `<section>`/`<pre>`/`<details>` 태그 균형, 퀴즈 배열 JS 파싱 OK(`node -e eval`로 검사).
   - 프리뷰(5599)에서 렌더 + **콘솔 에러 0** + 사이드바에 로보틱스 코스 노출 + 퀴즈 렌더 + `localStorage.antigravity_review_bank["chapter-r1"]` 등록 + 용어 `.term[data-term]` > 0.
   - Python 예제 실행 결과 첨부.
4. **커밋/PR**: feature 브랜치 → GitHub API로 PR → (사용자 합의 시) 머지 → 브랜치 삭제 → main 동기화. 임시 스크립트(.py)는 실행 후 삭제.

---

## 7. 🚀 첫 세션에서 할 일 (제안 순서)

1. 이 문서를 읽고 **사용자에게 R1~R10 로드맵 확정/조정**을 1회 확인(원하면 바로 진행).
2. `ROBOTICS-ROADMAP.md`(또는 기존 로드맵에 섹션) 작성 — 챕터별 학습목표·핵심개념·실습·난이도.
3. **인프라 PR**: prism-python 추가 + 전 페이지 반영, 사이드바 "로보틱스 코스" 섹션 일괄 추가, search INDEX_PAGES 등록, index 코스 카드.
4. **R1(chapter-r1.html)** 작성 → 검증 → PR → 머지. (블루프린트 이미지는 생성 가능 시 삽입, 아니면 다이어그램/생략 + 인계 메모.)
5. 이후 R2…R10 순차. 각 머지 시 Pages 자동 재배포 → 폰에서 확인.

---

## 8. ⚠️ 이 프로젝트 특유의 함정 (꼭 기억)

- **사이드바 드리프트**: 코스/페이지 추가 시 **전 페이지 nav 일괄 갱신**. 한 곳만 고치면 다른 페이지에서 새 항목이 안 보임.
- **search.js INDEX_PAGES 등록 누락** = Ctrl+K 검색에서 신규 페이지 통째 누락.
- **prism-python 미포함** = Python 코드가 하이라이팅 안 됨(전 페이지 스크립트에 추가).
- **CRLF**: 기존 HTML은 CRLF. 파이썬으로 파일 쓸 때 줄바꿈 보존 주의(git autocrlf가 정규화하지만 혼합 줄바꿈 경고 가능 — 무해).
- **prism/자산 캐시**: 자산 변경 후 하드 리프레시(Ctrl+Shift+R) 필요. 프리뷰에서 `?v=Date.now()`로 캐시 우회.
- **이미지 재생성 금지**: 기존 파스텔 dev 이미지 건드리지 말 것. 로보틱스만 블루프린트.
- **main 직접 push 금지** → 항상 브랜치+PR(GitHub API+GCM 토큰).
- **ROS2/하드웨어 코드 실행 불가** → 공식 문서(context7) 기반 정확성 + 환경 전제 주석 + 순수 알고리즘부 분리 검증.
- **`/pdca` 돌리지 말 것**(다른 코드베이스용 stale 상태).

---

## 9. 참고 파일 (현재 레포)
- `ADDITIONAL-LEARNING-ROADMAP.md` — 기존 로드맵(여기에 로보틱스 섹션 추가 가능)
- `CONTENT-REVIEW.md` — 과거 콘텐츠 검증·갭 리포트 누적(검증 패턴 참고)
- `chapter-1.html` / `appendix-interview.html` — 페이지·콘텐츠·퀴즈 포맷의 모범 사본
- `assets/{main.js, quiz.js, srs.js, search.js, glossary.json, style.css}` — 재사용 시스템
- 메모리: `~/.claude/projects/C--Study/memory/MEMORY.md` (프로젝트 규약 인덱스)

> **요약**: 기존 Dev Rehab 시스템을 그대로 입고, **Python 중심·블루프린트 일러스트·기초→ROS2→AI 통합** 로보틱스 코스를 챕터 단위로 빌드·검증·PR 한다. 시스템 규약(사이드바 일괄 갱신·prism-python·search 등록·퀴즈 SRS·용어사전)과 정확성 게이트(Python 실행 검증 + ROS2는 문서 기반)를 지키는 것이 핵심.
