# 디자인 감사 — Antigravity Rehab Dashboard

실행: /design-review (Claude Preview MCP, Windows·비-git 적응) · 2026-06-01
기본 테마: light · 분류: **APP UI** (학습 대시보드/워크스페이스) → App UI 규칙 적용

## 헤드라인 스코어
- **Design Score: B+** — 관점이 있는 디자인. 진짜 문제는 반응형뿐이었음.
- **AI-Slop Score: B** — 슬롭 아님. 코스 컬러 아이덴티티 + 글래스모피즘 + 라이트/다크라는 명확한 시스템.

## 추출된 디자인 시스템 (렌더 기준)
- **폰트:** Pretendard(주 269회, 비제너릭 한글 폰트 ✓) + Noto Sans KR(폴백) + Fira Code(코드). ≤3 → 합격.
- **색:** non-gray 9색(코스 아이덴티티 7 + 본문 + muted), <12 → 합격. 의도된 팔레트.
- **라운드:** 4·6·8·10·12·14·16·20px 위계 존재 → "균일 버블" 슬롭 아님. 합격.
- **헤딩 스케일:** 28/20/18/14 — h2(20)·h3(18)가 2px차라 위계 약함(경미).

## 발견 + 조치

| # | 임팩트 | 발견 | 상태 |
|---|--------|------|------|
| 1 | **HIGH** | **모바일 헤더 붕괴** — `<header>`에 미디어쿼리가 없어 좁은 폭(<~500px)에서 제목 vs 검색창이 가로로 싸우다 h1이 **한 글자씩** 깨짐 | ✅ **수정·검증** |
| 2 | **HIGH(기능)** | **모바일 네비게이션 부재** — ≤768px에서 `.nav-menu{display:none}` + 햄버거 대체 없음. 모바일에선 페이지 이동 불가 | ✅ **구현·검증** |
| 3 | MEDIUM | **stats-grid 4-카드 orphan** — 데스크탑에서 stat 카드 4개가 auto-fit 3열에 → 4번째가 빈 2칸 옆에 외톨이 | ✅ **수정·검증** |
| 4 | POLISH | 헤딩 위계 — 대시보드 섹션 라벨이 인라인 20px(챕터 본문 h2는 이미 22px) | ✅ 22px로 정렬 |
| 5 | POLISH(주관) | 이모지를 디자인 요소로 다수 사용(🏠🧪💬🧩🤖📚🛍️🔁⚡) — 친근하나 슬롭 블랙리스트 #7. 개인 도구엔 허용 가능 | 플래그만 |
| 6 | POLISH | 일부 카드/섹션 헤더 `border-left: Npx solid <accent>`(슬롭 #8) — 단 코스 컬러 코딩 겸함 | 플래그만 |

### 수정 #1 상세 (HIGH)
- **원인:** `assets/style.css` `header{}`(282)는 `display:flex; justify-content:space-between`인데 768/1024/640 미디어쿼리 어디서도 header를 안 건드림. 좁은 폭에서 `.header-controls`(검색 240px + 실행버튼)가 공간을 먹어 `.header-title`이 ~48px로 압축 → h1 per-char wrap.
- **수정:** `@media (max-width:768px)`에 `header{flex-direction:column; align-items:stretch; gap:14px}` + `.header-controls{width:100%; flex-wrap:wrap}` + `.search-input{width:100%; box-sizing:border-box}`. CSS-only.
- **검증(Claude Preview):** index@375 → 제목 풀폭 1줄(48→335px), 검색 풀폭, 가로 스크롤 0. demo-shop@375 → 동일 정상(공유 CSS). 콘솔 에러 0.

## 수정 #2 상세 (HIGH·기능) — 모바일 햄버거 네비게이션
- **방식:** 사이드바가 12개 HTML에 중복돼 있어 **공유 파일만** 수정(per-page 마크업 0). `assets/main.js`에 `initMobileNav()` 추가 → 사이드바에 `☰` 버튼을 JS로 주입, 클릭 시 `#sidebar.mobile-open` 토글. `assets/style.css` `@media(max-width:768px)`에서 `.nav-menu`/`.sidebar-footer`는 기본 숨김, `.mobile-open`일 때만 표시(+ 1024 아이콘레일 규칙을 열림 상태에서 텍스트 복원으로 오버라이드). 메뉴 항목 클릭 시 자동 닫힘.
- **검증(Claude Preview, 375px):** 햄버거 주입·노출(flex), 클릭 → ✕·메뉴 block·nav 텍스트 복원·링크 48px 터치타깃. 데스크탑(1280): 햄버거 `display:none`, 사이드바 정상. 콘솔 에러 0. main.js 신선본 fetch로 로직 end-to-end 확인.

## 수정 #3 상세 (MEDIUM) — stats-grid 2x2
- `assets/style.css` `.stats-grid`를 `auto-fit minmax(280px)` → `repeat(2,1fr)`(+ ≤560px 1열). `index.html` 부록 그리드의 인라인 `grid-template-columns` 오버라이드 제거 → 메인 4위젯·부록 4카드 모두 2x2로 일관. 데스크탑 446px×2 확인, 모바일 1열 확인.

## ⚠️ 알려진 환경 이슈 (코드 버그 아님)
`python -m http.server`는 Cache-Control 헤더를 안 보내 브라우저가 `main.js`/`style.css`를 메모리 캐시함. **변경 직후 첫 로드는 Ctrl+Shift+R(하드 리프레시) 1회 필요** — 특히 모바일 햄버거는 main.js 갱신이 적용돼야 보임. 새 브라우저/시크릿창은 처음부터 정상. (서버는 신선본을 정상 서빙함을 fetch로 확인.) VS Code Live Server는 자동 무효화.

## 최종
- 발견 6건 중 **4건 수정·검증**(#1·#2·#3·#4), 2건은 주관적 폴리시(#5 이모지·#6 좌측보더)로 플래그만 — 개인 학습 도구의 친근한 톤에 부합해 의도적 유지.
- **Design Score: B+ → A-** (반응형 결함 제거, 4-카드 정렬). AI-Slop: B 유지(슬롭 아님).
- 수정 파일: `assets/style.css`, `assets/main.js`, `index.html`. (git 아님 → 커밋 없음, 직접 편집)
