/**
 * Antigravity Fashion Dashboard core UI logic (main.js)
 * ---------------------------------------------------
 * [Visual Interaction Loop]
 * 
 * 1. Progress Gauge System:
 *    Sidebar Checkbox Click ──► updateProgress() ──► Calculate % ──► Render Circular Ring
 *                                                                        │
 *                                                                        ▼ (Save)
 *                                                                [localStorage.dashboardProgress]
 * 
 * 2. Glossary Sidebar Search:
 *    [Ctrl+K] Key Event ──► toggleGlossary() ──► Fetch glossary.json ──► Render Card List
 *                                                                              │
 *                                                                              ▼ (Filter)
 *                                                                       [glossarySearchInput]
 */

// 전역 로딩 캐시 변수
let glossaryDataCache = null;

// 챕터 순서 (이전/다음 네비게이션용)
const CHAPTER_SEQUENCE = [
  { file: "chapter-1.html", title: "01. 모던 자바 핵심" },
  { file: "chapter-2.html", title: "02. 스프링 부트 3 & JPA" },
  { file: "chapter-3.html", title: "03. DB & SQL + QueryDSL" },
  { file: "chapter-4.html", title: "04. Security & Redis JWT" },
  { file: "chapter-5.html", title: "05. React & Next.js" },
  { file: "chapter-6.html", title: "06. 고급 React & Zustand" },
  { file: "chapter-7.html", title: "07. 풀스택 통합 & 소켓" },
  { file: "chapter-8.html", title: "08. DevOps & AWS & MSA" },
  { file: "appendix-test.html", title: "부록 A. 테스트 코드" },
  { file: "appendix-interview.html", title: "부록 B. 면접 CS & 심화" },
  { file: "appendix-algorithm.html", title: "부록 C. 코딩 테스트" },
  { file: "appendix-ai.html", title: "부록 D. AI-Native 통합" }
];

document.addEventListener("DOMContentLoaded", () => {
  // 0. 사이드바 리브랜딩 (타이틀 "Dev Rehab" + 클릭 시 대시보드 이동, '대시보드 홈' 항목 제거)
  initSidebarBrand();

  // 0.5 코스 트랙 토글 (풀스택 재활 ↔ 로보틱스) 바인딩
  initCourseTrackToggle();

  // 1. 테마(다크/라이트) 초기화 수행
  initTheme();

  // 1.5 모바일 햄버거 네비게이션 (≤768px에서 사이드바 메뉴 토글)
  initMobileNav();

  // 1.6 사이드바 접기/펼치기 토글 + 드래그 리사이즈 (≥769px)
  initSidebarResizer();

  // 2. 학습 진척도 시스템 로드 및 초기 렌더링
  initProgress();

  // 3. 용어 사전 모달 바인딩 (단축키 포함)
  initGlossary();

  // 4. 모의 데이터베이스 리셋 버튼 연동
  initDatabaseReset();

  // 5. [v3.1] 상단 읽기 진행률 바
  initReadingProgressBar();

  // 6. [v3.1] 우측 스크롤스파이 TOC (챕터/부록 페이지에서만 작동)
  initScrollspyTOC();

  // 7. [v3.1] 글로서리 hover 툴팁 (data-term 속성)
  initGlossaryTooltips();

  // 8. [v3.1] 챕터 하단 이전/다음 네비게이션 자동 생성
  initChapterPager();

  // 9. [v3.2] Mermaid 다이어그램 지연 로딩 (필요한 페이지에만)
  initMermaidIfNeeded();

  // 10. [v3.2] 글로서리 용어 자동 태깅 (본문에서 첫 등장 시 자동 wrap)
  autoTagGlossaryTerms();
});

/**
 * ==========================================================================
 * [v3.2] 10. Mermaid 다이어그램 지연 로딩 & 다크/라이트 테마 연동
 * ==========================================================================
 * pre.mermaid 블록이 존재하는 페이지에서만 CDN을 동적으로 로드합니다.
 * 테마 변경 이벤트에 반응하여 다이어그램을 다시 그립니다.
 */
let mermaidLoaded = false;
let mermaidOriginalSources = new WeakMap();

function initMermaidIfNeeded() {
  const blocks = document.querySelectorAll("pre.mermaid");
  if (blocks.length === 0) return;

  // 원본 소스 백업 (재렌더링 시 사용)
  blocks.forEach(b => mermaidOriginalSources.set(b, b.textContent));

  // CDN 로드
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
  script.onload = () => {
    mermaidLoaded = true;
    renderMermaid();
  };
  document.head.appendChild(script);
}

function renderMermaid() {
  if (!mermaidLoaded || typeof mermaid === "undefined") return;
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? "dark" : "default",
    securityLevel: "loose",
    fontFamily: "Pretendard, -apple-system, sans-serif",
    flowchart: { useMaxWidth: true, htmlLabels: true, curve: "basis" },
    sequence: { useMaxWidth: true, mirrorActors: false },
    er: { useMaxWidth: true }
  });
  mermaid.run({ querySelector: "pre.mermaid" });
}

// 테마 변경 시 Mermaid 재렌더링
window.addEventListener("themeChanged", () => {
  if (!mermaidLoaded) return;
  // SVG로 변환된 블록을 원본 텍스트로 복원
  document.querySelectorAll("pre.mermaid").forEach(b => {
    const orig = mermaidOriginalSources.get(b);
    if (orig) {
      b.removeAttribute("data-processed");
      b.innerHTML = orig;
    }
  });
  setTimeout(renderMermaid, 50);
});

/**
 * ==========================================================================
 * [v3.2] 11. 글로서리 용어 자동 태깅 — 본문에서 첫 등장 시 자동 wrap
 * ==========================================================================
 * 챕터 본문(.concept-section)에서 glossary.json의 각 용어 첫 등장을 찾아
 * <span class="term" data-term="key">용어</span>로 감쌉니다.
 * 코드 블록(<code>, <pre>) 및 이미 태깅된 영역은 제외합니다.
 */
function autoTagGlossaryTerms() {
  const main = document.querySelector("main#main-content .concept-section");
  if (!main) return;

  fetch("assets/glossary.json")
    .then(res => res.json())
    .then(data => {
      const terms = data.terms || [];
      if (terms.length === 0) return;

      // 검색 키워드 추출 — 각 용어에서 매칭할 한국어/영어 모두
      const candidates = [];
      terms.forEach(t => {
        // 1) name에서 괄호 앞 부분 (한국어 우선) — "레코드 (Record)" → "레코드"
        const koreanPart = t.name.split(" (")[0].trim();
        if (koreanPart && koreanPart.length >= 2) {
          candidates.push({ key: t.key, search: koreanPart });
        }
        // 2) name에서 괄호 안 영어
        const m = t.name.match(/\(([^)]+)\)/);
        if (m && m[1].length >= 3) {
          candidates.push({ key: t.key, search: m[1].trim() });
        }
        // 3) key를 검색어로 (하이픈 → 공백 또는 그대로)
        const keyAsTerm = t.key.replace(/-/g, " ");
        if (keyAsTerm.length >= 3 && !candidates.some(c => c.search === keyAsTerm)) {
          candidates.push({ key: t.key, search: keyAsTerm });
        }
      });

      // 긴 단어부터 매칭 (예: "JPA N+1"이 "JPA"보다 먼저)
      candidates.sort((a, b) => b.search.length - a.search.length);

      const tagged = new Set();
      const SKIP_TAGS = new Set(["CODE", "PRE", "SCRIPT", "STYLE", "A", "BUTTON", "H1", "H2", "H3", "H4"]);

      // 텍스트 노드 워킹
      const walker = document.createTreeWalker(
        main,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
            let p = node.parentElement;
            while (p && p !== main) {
              if (SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
              if (p.hasAttribute("data-term")) return NodeFilter.FILTER_REJECT;
              if (p.classList && p.classList.contains("mermaid")) return NodeFilter.FILTER_REJECT;
              p = p.parentElement;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const textNodes = [];
      let n;
      while ((n = walker.nextNode())) textNodes.push(n);

      // 각 용어를 본문에서 검색하여 첫 등장 시 태깅
      candidates.forEach(c => {
        if (tagged.has(c.key)) return;
        for (const node of textNodes) {
          // 노드가 이미 처리되어 부모에서 분리되었을 수 있음
          if (!node.parentNode) continue;
          const text = node.textContent;
          const idx = text.indexOf(c.search);
          if (idx < 0) continue;

          // 단어 경계 확인 (한영 혼용 환경이라 느슨하게 적용)
          const before = idx > 0 ? text[idx - 1] : "";
          const after = idx + c.search.length < text.length ? text[idx + c.search.length] : "";
          // 영어 단어는 단어 경계 확인, 한국어는 그냥 매칭
          if (/[a-zA-Z]/.test(c.search[0])) {
            if (/[a-zA-Z0-9]/.test(before) || /[a-zA-Z0-9]/.test(after)) continue;
          }

          // wrap 처리
          const span = document.createElement("span");
          span.className = "term";
          span.setAttribute("data-term", c.key);
          span.textContent = c.search;

          const beforeNode = document.createTextNode(text.substring(0, idx));
          const afterNode = document.createTextNode(text.substring(idx + c.search.length));
          const parent = node.parentNode;
          parent.insertBefore(beforeNode, node);
          parent.insertBefore(span, node);
          parent.insertBefore(afterNode, node);
          parent.removeChild(node);

          tagged.add(c.key);
          break;
        }
      });

      // 태깅 완료 후 툴팁 바인딩 재실행
      initGlossaryTooltips();
    })
    .catch(err => console.warn("Glossary auto-tagging skipped:", err));
}

/**
 * ==========================================================================
 * 0. 모바일 햄버거 네비게이션
 * ==========================================================================
 * 사이드바가 12개 HTML에 중복돼 있어, 마크업 수정 없이 JS로 토글 버튼을 주입한다.
 * ≤768px에서 .nav-menu/.sidebar-footer는 기본 숨김이고 #sidebar.mobile-open일 때만 표시.
 */
function initSidebarBrand() {
  // 타이틀을 "Dev Rehab"으로 리브랜딩하고, 클릭하면 대시보드(index.html)로 이동
  const logo = document.querySelector(".sidebar-logo");
  if (logo && !logo.dataset.rebranded) {
    logo.dataset.rebranded = "1";
    logo.innerHTML = '<span>Dev</span> Rehab';
    logo.style.cursor = "pointer";
    logo.setAttribute("role", "link");
    logo.setAttribute("tabindex", "0");
    logo.setAttribute("aria-label", "대시보드 홈으로 이동");
    const goHome = () => { window.location.href = "index.html"; };
    logo.addEventListener("click", goHome);
    logo.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goHome(); }
    });
  }
  // '대시보드 홈' 네비 항목 제거 — 타이틀 클릭으로 대체됨
  document.querySelectorAll('.nav-menu a[href="index.html"]').forEach((a) => {
    if (/대시보드/.test(a.textContent)) {
      const li = a.closest("li");
      if (li) li.remove();
    }
  });
}

/**
 * ==========================================================================
 * 0.5 코스 트랙 토글 (풀스택 재활 ↔ 로보틱스)
 * ==========================================================================
 * 사이드바 상단의 두 탭(.track-tab)으로 두 코스의 네비게이션을 토글한다.
 * 표시/숨김과 활성 탭 스타일은 <html data-track="..."> 속성이 CSS로 구동하고
 * (head의 인라인 스크립트가 FOUC 없이 초기값을 세팅), 여기서는 클릭 시 속성
 * 전환 + localStorage 저장 + 접근성(aria-selected)만 담당한다.
 * 콘텐츠 페이지 방문 시에는 그 페이지의 트랙을 '마지막 컨텍스트'로 저장해
 * 대시보드 홈이 직전에 보던 코스로 열리도록 한다.
 */
function initCourseTrackToggle() {
  const tabs = document.querySelectorAll(".track-tab");
  if (!tabs.length) return;

  const root = document.documentElement;
  const file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const isHome = file === "" || file === "index.html";

  // 콘텐츠 페이지(홈이 아님)는 head 스크립트가 파일명으로 트랙을 강제 지정함 →
  // 그 값을 '마지막 본 코스'로 저장해 홈 복귀 시 일관성 유지.
  if (!isHome) {
    localStorage.setItem("antigravity_track", root.getAttribute("data-track") || "fullstack");
  }

  const syncAria = () => {
    const cur = root.getAttribute("data-track") || "fullstack";
    tabs.forEach(tb => tb.setAttribute("aria-selected", tb.dataset.trackTab === cur ? "true" : "false"));
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const t = tab.dataset.trackTab;
      root.setAttribute("data-track", t);
      localStorage.setItem("antigravity_track", t);
      syncAria();
    });
  });

  syncAria();
}

function initMobileNav() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  const logo = sidebar.querySelector(".sidebar-logo");
  if (!logo || sidebar.querySelector(".mobile-nav-toggle")) return;

  const btn = document.createElement("button");
  btn.className = "mobile-nav-toggle";
  btn.setAttribute("aria-label", "메뉴 열기/닫기");
  btn.setAttribute("aria-expanded", "false");
  btn.textContent = "☰";

  const setOpen = (open) => {
    sidebar.classList.toggle("mobile-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.textContent = open ? "✕" : "☰";
  };

  btn.addEventListener("click", () => setOpen(!sidebar.classList.contains("mobile-open")));
  logo.insertAdjacentElement("afterend", btn);

  // 메뉴 항목(페이지 이동) 클릭 시 자동으로 닫힘
  sidebar.querySelectorAll(".nav-menu a").forEach((a) => {
    a.addEventListener("click", () => setOpen(false));
  });
}

/**
 * ==========================================================================
 * 1.6 사이드바 접기/펼치기 토글 + 드래그 리사이즈 (데스크탑·태블릿 ≥769px)
 * ==========================================================================
 * 좁은 화면에서 사이드바가 아이콘 레일(80px)로 줄면 챕터 이름이 안 보이던 문제를
 * 사용자가 직접 제어하도록: ① 우측 경계 토글 버튼(‹/›)으로 접기/펼치기,
 * ② 우측 경계 드래그 핸들로 너비 자유 조정(150px 미만으로 끌면 자동 접힘 스냅).
 * 상태는 localStorage에 저장돼 전 페이지·재방문 시 유지된다.
 * FOUC 방지를 위해 초기 접힘/너비는 각 페이지 head의 인라인 스크립트가 선반영하고,
 * 여기서는 버튼/핸들 주입 + 동기화 + 이벤트만 담당한다.
 */
function initSidebarResizer() {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  if (sidebar.querySelector(".sidebar-resizer")) return; // 중복 주입 방지

  const root = document.documentElement;
  const MIN_W = 200;      // 펼침 최소 너비(텍스트 가독 한계)
  const MAX_W = 460;      // 펼침 최대 너비
  const DEFAULT_W = 280;  // 기본 펼침 너비
  const COLLAPSE_AT = 150; // 드래그로 이 미만이 되면 접힘으로 스냅

  // 접기/펼치기 토글 버튼
  const btn = document.createElement("button");
  btn.className = "sidebar-collapse-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "사이드바 접기/펼치기");
  sidebar.appendChild(btn);

  // 우측 경계 드래그 핸들
  const resizer = document.createElement("div");
  resizer.className = "sidebar-resizer";
  resizer.setAttribute("role", "separator");
  resizer.setAttribute("aria-orientation", "vertical");
  resizer.title = "드래그하여 너비 조정 · 더블클릭 시 기본값";
  sidebar.appendChild(resizer);

  const isCollapsed = () => root.classList.contains("sidebar-collapsed");

  function setExpandedWidth(w) {
    w = Math.max(MIN_W, Math.min(MAX_W, Math.round(w)));
    root.classList.remove("sidebar-collapsed");
    root.style.setProperty("--sidebar-w", w + "px");
  }
  function collapse() {
    root.classList.add("sidebar-collapsed");
    root.style.removeProperty("--sidebar-w"); // CSS의 레일 너비(80px)가 적용되도록
  }
  function syncBtn() {
    btn.textContent = isCollapsed() ? "›" : "‹";
    btn.title = isCollapsed() ? "사이드바 펼치기" : "사이드바 접기";
    btn.setAttribute("aria-expanded", isCollapsed() ? "false" : "true");
  }
  function persist() {
    const collapsed = isCollapsed();
    localStorage.setItem("sidebar_collapsed", collapsed ? "1" : "0");
    if (!collapsed) {
      const w = parseInt(getComputedStyle(root).getPropertyValue("--sidebar-w"), 10);
      if (w) localStorage.setItem("sidebar_width", String(w));
    }
  }

  syncBtn();

  // ① 토글 버튼
  btn.addEventListener("click", () => {
    if (isCollapsed()) {
      const saved = parseInt(localStorage.getItem("sidebar_width"), 10);
      setExpandedWidth(saved >= MIN_W ? saved : DEFAULT_W);
    } else {
      collapse();
    }
    syncBtn();
    persist();
  });

  // ② 드래그 리사이즈 (마우스·터치 통합: Pointer Events)
  let dragging = false;
  resizer.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    dragging = true;
    resizer.classList.add("dragging");
    root.classList.add("sidebar-dragging");
    try { resizer.setPointerCapture(e.pointerId); } catch (_) {}
  });
  resizer.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const w = e.clientX - sidebar.getBoundingClientRect().left;
    if (w < COLLAPSE_AT) {
      collapse();
    } else {
      setExpandedWidth(w);
    }
    syncBtn();
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    resizer.classList.remove("dragging");
    root.classList.remove("sidebar-dragging");
    try { resizer.releasePointerCapture(e.pointerId); } catch (_) {}
    persist();
  };
  resizer.addEventListener("pointerup", endDrag);
  resizer.addEventListener("pointercancel", endDrag);

  // 더블클릭으로 기본 너비 복원
  resizer.addEventListener("dblclick", () => {
    setExpandedWidth(DEFAULT_W);
    syncBtn();
    persist();
  });

  // 키보드 접근성: 핸들 포커스 후 좌우 화살표로 16px씩 조정
  resizer.tabIndex = 0;
  resizer.addEventListener("keydown", (e) => {
    const cur = isCollapsed() ? 80 : (parseInt(getComputedStyle(root).getPropertyValue("--sidebar-w"), 10) || DEFAULT_W);
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const next = cur - 16;
      if (next < COLLAPSE_AT) collapse(); else setExpandedWidth(next);
      syncBtn(); persist();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setExpandedWidth(cur + 16);
      syncBtn(); persist();
    }
  });
}

/**
 * ==========================================================================
 * 1. 테마 스위치 시스템 (LocalStorage 연동)
 * ==========================================================================
 */
function initTheme() {
  const themeToggles = document.querySelectorAll(".theme-toggle");
  const savedTheme = localStorage.getItem("antigravity_theme") || "light";
  
  // 시스템 초기 테마 주입
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeToggleUI(savedTheme);

  themeToggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const targetTheme = currentTheme === "dark" ? "light" : "dark";

      document.documentElement.setAttribute("data-theme", targetTheme);
      localStorage.setItem("antigravity_theme", targetTheme);
      updateThemeToggleUI(targetTheme);
      
      // Mermaid 및 테마 의존형 그래픽에 리렌더링 이벤트 전송
      window.dispatchEvent(new CustomEvent("themeChanged", { detail: targetTheme }));
    });
  });
}

function updateThemeToggleUI(theme) {
  const themeToggles = document.querySelectorAll(".theme-toggle");
  themeToggles.forEach(toggle => {
    toggle.innerHTML = theme === "dark" ? "☀️ Mode" : "🌙 Mode";
    toggle.setAttribute("aria-label", theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환");
  });
}

/**
 * ==========================================================================
 * 2. 학습 진척도 추적 및 게이지 시스템
 * ==========================================================================
 */
const DEFAULT_PROGRESS = {
  "chapter-1": { read: false, quizPassed: false },
  "chapter-2": { read: false, quizPassed: false },
  "chapter-3": { read: false, quizPassed: false },
  "chapter-4": { read: false, quizPassed: false },
  "chapter-5": { read: false, quizPassed: false },
  "chapter-6": { read: false, quizPassed: false },
  "chapter-7": { read: false, quizPassed: false },
  "chapter-8": { read: false, quizPassed: false }
};

function initProgress() {
  let progress = localStorage.getItem("antigravity_progress");
  
  if (!progress) {
    progress = JSON.stringify(DEFAULT_PROGRESS);
    localStorage.setItem("antigravity_progress", progress);
  }
  
  const progressObj = JSON.parse(progress);

  // 1. 현재 열려있는 페이지에 따른 진척도 엑티브 탭 하이라이트 매핑
  highlightActiveSidebarItem();

  // 2. 사이드바 체크박스 상태 렌더링 및 클릭 이벤트 바인딩
  const checkboxes = document.querySelectorAll(".sidebar-progress-check");
  checkboxes.forEach(chk => {
    const chId = chk.dataset.chapter;
    if (progressObj[chId] && progressObj[chId].read) {
      chk.checked = true;
    }

    chk.addEventListener("change", (e) => {
      const chKey = e.target.dataset.chapter;
      const dbProgressObj = JSON.parse(localStorage.getItem("antigravity_progress"));
      
      if (!dbProgressObj[chKey]) dbProgressObj[chKey] = { read: false, quizPassed: false };
      dbProgressObj[chKey].read = e.target.checked;
      
      localStorage.setItem("antigravity_progress", JSON.stringify(dbProgressObj));
      
      // 메인 대시보드 게이지 동기화
      updateDashboardGauges();
      
      // 알림 메시지 발송
      showToast(e.target.checked ? "챕터 학습을 완료로 체크했습니다!" : "챕터 학습 체크를 해제했습니다.");
    });
  });

  // 3. 메인 진행률 통계 렌더링
  updateDashboardGauges();
}

function updateDashboardGauges() {
  const progress = JSON.parse(localStorage.getItem("antigravity_progress") || JSON.stringify(DEFAULT_PROGRESS));
  const chapters = Object.keys(progress);
  const totalSteps = chapters.length * 2; // (읽기 완료 + 퀴즈 통과) 각각 1단계씩 산정
  
  let currentSteps = 0;
  chapters.forEach(ch => {
    if (progress[ch].read) currentSteps += 1;
    if (progress[ch].quizPassed) currentSteps += 1;
  });

  const percent = Math.round((currentSteps / totalSteps) * 100) || 0;

  // 1. 인덱스 페이지 상단 원형/선형 프로그레스 바 동기화
  const percentTexts = document.querySelectorAll(".progress-percent-text");
  percentTexts.forEach(el => { el.textContent = `${percent}%`; });

  const progressRing = document.querySelector(".progress-ring__circle");
  if (progressRing) {
    const radius = progressRing.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    progressRing.style.strokeDasharray = `${circumference} ${circumference}`;
    
    const offset = circumference - (percent / 100) * circumference;
    progressRing.style.strokeDashoffset = offset;
  }

  // 2. 챕터별 카드 하위 진척 현황판 개별 렌der 헬퍼
  chapters.forEach(ch => {
    const cardProgressText = document.querySelector(`.card-progress-text[data-chapter="${ch}"]`);
    if (cardProgressText) {
      let status = "시작 전";
      if (progress[ch].read && progress[ch].quizPassed) {
        status = "완료 ✓";
      } else if (progress[ch].read || progress[ch].quizPassed) {
        status = "진행 중";
      }
      cardProgressText.textContent = `진척도: ${status}`;
    }
  });
}

function highlightActiveSidebarItem() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navItems = document.querySelectorAll(".nav-item");

  navItems.forEach(item => {
    const link = item.querySelector("a");
    if (link) {
      const href = link.getAttribute("href");
      if (href === currentPath) {
        item.classList.add("active");
        
        // 해당 챕터의 포인트 컬러를 전역 accent-color 변수로 주입 (글래스 변환 최적화)
        const chapterClass = item.dataset.chapterClass;
        if (chapterClass) {
          const bodyStyle = getComputedStyle(document.documentElement);
          const colorValue = bodyStyle.getPropertyValue(`--${chapterClass}`).trim();
          document.documentElement.style.setProperty("--accent-color", colorValue);
        }
      } else {
        item.classList.remove("active");
      }
    }
  });
}

/**
 * ==========================================================================
 * 3. 용어 사전 사이드 바 모달 제어 (글래스모피즘 팝업)
 * ==========================================================================
 */
function initGlossary() {
  const glossaryModal = document.getElementById("glossary-modal");
  const openButtons = document.querySelectorAll(".btn-open-glossary");
  const closeButton = document.querySelector(".btn-close-glossary");
  const searchInput = document.getElementById("glossary-search");

  if (!glossaryModal) return;

  const toggleGlossary = (forceOpen = null) => {
    const isOpen = glossaryModal.classList.contains("open");
    const targetState = forceOpen !== null ? forceOpen : !isOpen;

    if (targetState) {
      glossaryModal.classList.add("open");
      loadGlossaryContent();
      searchInput.focus();
    } else {
      glossaryModal.classList.remove("open");
    }
  };

  // 1. 마우스 클릭 트리거 연동
  openButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleGlossary(true);
    });
  });

  if (closeButton) {
    closeButton.addEventListener("click", () => toggleGlossary(false));
  }

  // 2. 전역 단축키 Ctrl+K 또는 Cmd+K 팝업 제어 바인딩
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      toggleGlossary();
    }
    // ESC 클릭 시 닫기
    if (e.key === "Escape" && glossaryModal.classList.contains("open")) {
      toggleGlossary(false);
    }
  });

  // 3. 실시간 매칭 검색 입력 필터링
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.toLowerCase().trim();
      filterGlossaryCards(keyword);
    });
  }
}

function loadGlossaryContent() {
  const glossaryList = document.querySelector(".glossary-list");
  if (!glossaryList) return;

  // 캐시된 데이터가 존재하면 즉시 렌더링 진행
  if (glossaryDataCache) {
    renderGlossaryList(glossaryDataCache);
    return;
  }

  glossaryList.innerHTML = "<div class='text-muted' style='font-size:13px; text-align:center;'>사전 불러오는 중...</div>";

  // 로컬 웹 서버로부터 용어 데이터 Fetch 요청
  fetch("assets/glossary.json")
    .then(res => {
      if (!res.ok) throw new Error("Fetch glossary failed.");
      return res.json();
    })
    .then(data => {
      glossaryDataCache = data.terms;
      renderGlossaryList(glossaryDataCache);
    })
    .catch(err => {
      glossaryList.innerHTML = "<div class='text-danger' style='font-size:12px;'>용어 사전을 불러올 수 없습니다. 로컬 서버 상태를 확인해 주세요.</div>";
      console.error(err);
    });
}

function renderGlossaryList(terms) {
  const glossaryList = document.querySelector(".glossary-list");
  if (!glossaryList) return;

  glossaryList.innerHTML = "";
  terms.forEach(term => {
    const card = document.createElement("div");
    card.className = "glossary-card";
    card.dataset.name = term.name.toLowerCase();
    card.dataset.key = term.key.toLowerCase();
    card.dataset.def = term.definition.toLowerCase();

    card.innerHTML = `
      <h4>${term.name}</h4>
      <p class="def">${term.definition}</p>
      <p class="exp">${term.explanation}</p>
    `;
    glossaryList.appendChild(card);
  });
}

function filterGlossaryCards(keyword) {
  const cards = document.querySelectorAll(".glossary-card");
  cards.forEach(card => {
    const name = card.dataset.name;
    const key = card.dataset.key;
    const def = card.dataset.def;

    if (name.includes(keyword) || key.includes(keyword) || def.includes(keyword)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

/**
 * ==========================================================================
 * 4. 데이터베이스 강제 초기화 및 토스트 알림 연동
 * ==========================================================================
 */
function initDatabaseReset() {
  const resetBtn = document.querySelector(".btn-reset");
  if (!resetBtn) return;

  resetBtn.addEventListener("click", (e) => {
    e.preventDefault();
    
    // 이쁘게 가공한 커스텀 Confirm 대화창 흉내
    const confirmMessage = "⚠️ [안내] 데이터베이스(재고, 회원, 누적 주문량 등)를 공장에서 출고된 초기 시드 데이터 상태로 리셋하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.";
    
    if (confirm(confirmMessage)) {
      if (window.mockApi && typeof window.mockApi.resetDatabase === "function") {
        window.mockApi.resetDatabase().then(() => {
          showToast("🔄 Mock DB가 초기 시드 값으로 리셋되었습니다!", "success");
        });
      } else {
        alert("Mock API 모듈이 아직 바인딩되지 않았습니다.");
      }
    }
  });

  // DB 강제 리셋 전역 리스너 바인딩 (다른 챕터에서도 작동 시 화면 갱신 유도용)
  window.addEventListener("mockDbReset", () => {
    // 모든 챕터 내 진척 현황 게이지 전격 리렌더링
    updateDashboardGauges();
  });
}

/**
 * ==========================================================================
 * 5. 공통 헬퍼: 토스트 팝업 에이전트
 * ==========================================================================
 */
function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  
  // 타입에 따른 리액트 테마/백엔드 테마 컬러 매칭
  if (type === "success") {
    toast.style.borderLeftColor = "var(--devops)";
  } else if (type === "warning") {
    toast.style.borderLeftColor = "var(--interview)";
  } else {
    toast.style.borderLeftColor = "var(--accent-color)";
  }

  toast.innerHTML = `
    <span>${message}</span>
    <button style="background:transparent; border:none; color:white; margin-left:12px; cursor:pointer;" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  // 4초 후 페이드아웃 후 완전 제거
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// 전역 호출 허용용 스코핑 노출
window.showToast = showToast;

/**
 * ==========================================================================
 * [v3.1] 6. 상단 읽기 진행률 바
 * ==========================================================================
 * 스크롤 위치에 따라 화면 최상단 가로 막대의 폭을 갱신합니다.
 * 메인 콘텐츠 영역의 스크롤 가능 거리 대비 현재 위치 비율을 계산합니다.
 */
function initReadingProgressBar() {
  // 인덱스 페이지에는 챕터 콘텐츠 영역이 없으므로 스킵
  const concept = document.querySelector(".concept-section");
  if (!concept) return;

  // 진행률 바 엘리먼트가 없으면 생성
  let bar = document.getElementById("reading-progress-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "reading-progress-bar";
    document.body.appendChild(bar);
  }

  let ticking = false;
  const updateBar = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const percent = docHeight > 0 ? Math.min(100, (scrolled / docHeight) * 100) : 0;
    bar.style.width = percent + "%";
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(updateBar);
      ticking = true;
    }
  }, { passive: true });

  updateBar();
}

/**
 * ==========================================================================
 * [v3.1] 7. 우측 스크롤스파이 TOC
 * ==========================================================================
 * 메인 콘텐츠의 모든 <h2 id="..."> 를 수집하여 우측 부유 TOC를 자동 생성합니다.
 * IntersectionObserver로 가시 영역에 들어온 섹션을 실시간 하이라이트합니다.
 */
function initScrollspyTOC() {
  const headings = document.querySelectorAll("main#main-content section[id] > h2, main#main-content > section[id] > h2");
  // section 안의 첫 h2를 잡기 위해 alt 셀렉터
  const allSections = document.querySelectorAll("main#main-content section[id]");
  if (allSections.length < 2) return;  // TOC가 의미 있으려면 최소 2개

  // TOC 컨테이너 생성
  const toc = document.createElement("aside");
  toc.id = "scrollspy-toc";
  toc.innerHTML = '<h4>이 챕터 목차</h4><ul></ul>';
  const list = toc.querySelector("ul");

  const linkMap = new Map();  // section id -> <a>
  allSections.forEach(section => {
    const h2 = section.querySelector("h2");
    if (!h2) return;
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#" + section.id;
    a.textContent = h2.textContent.replace(/^\d+\.\s*/, "").trim();
    a.addEventListener("click", (e) => {
      e.preventDefault();
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    li.appendChild(a);
    list.appendChild(li);
    linkMap.set(section.id, a);
  });
  document.body.appendChild(toc);

  // IntersectionObserver로 가시 섹션 추적
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = linkMap.get(entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        linkMap.forEach(a => a.classList.remove("active"));
        link.classList.add("active");
      }
    });
  }, { rootMargin: "-30% 0px -65% 0px", threshold: 0 });

  allSections.forEach(section => observer.observe(section));
}

/**
 * ==========================================================================
 * [v3.1] 8. 글로서리 hover 툴팁
 * ==========================================================================
 * data-term="용어키" 또는 .term[data-term] 속성이 부여된 단어에 마우스 오버하면
 * 글로서리 사전에서 정의를 찾아 부동 툴팁을 표시합니다.
 */
function initGlossaryTooltips() {
  const termEls = document.querySelectorAll("[data-term]");
  if (termEls.length === 0) return;

  // 툴팁 엘리먼트 생성
  let tooltip = document.getElementById("term-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "term-tooltip";
    document.body.appendChild(tooltip);
  }

  const showTooltip = async (el) => {
    const key = el.dataset.term;
    if (!key) return;

    // 글로서리 데이터 로드 (캐시 활용)
    if (!glossaryDataCache) {
      try {
        const res = await fetch("assets/glossary.json");
        const data = await res.json();
        glossaryDataCache = data.terms || data;
      } catch (e) {
        return;
      }
    }

    const term = glossaryDataCache.find(t =>
      t.key && t.key.toLowerCase() === key.toLowerCase()
    );
    if (!term) return;

    tooltip.innerHTML = `<strong>${term.name}</strong>${term.definition}`;

    // 위치 계산: 요소 바로 아래
    const rect = el.getBoundingClientRect();
    tooltip.style.left = Math.min(rect.left, window.innerWidth - 340) + "px";
    tooltip.style.top = (rect.bottom + 8) + "px";
    tooltip.classList.add("visible");
  };

  const hideTooltip = () => tooltip.classList.remove("visible");

  termEls.forEach(el => {
    el.addEventListener("mouseenter", () => showTooltip(el));
    el.addEventListener("mouseleave", hideTooltip);
    el.addEventListener("focus", () => showTooltip(el));
    el.addEventListener("blur", hideTooltip);
  });
}

/**
 * ==========================================================================
 * [v3.1] 9. 챕터 하단 이전/다음 네비게이션 자동 생성
 * ==========================================================================
 * 현재 페이지 파일명을 CHAPTER_SEQUENCE에서 찾아 이전/다음 챕터 링크를 생성하고
 * 메인 콘텐츠 하단에 자동 삽입합니다.
 */
function initChapterPager() {
  const currentFile = (window.location.pathname.split("/").pop() || "").toLowerCase();
  const idx = CHAPTER_SEQUENCE.findIndex(c => c.file === currentFile);
  if (idx === -1) return;  // 인덱스 페이지 등은 제외

  const main = document.querySelector("main#main-content");
  if (!main) return;
  // 이미 있는 경우 중복 생성 방지
  if (main.querySelector(".chapter-pager")) return;

  const prev = idx > 0 ? CHAPTER_SEQUENCE[idx - 1] : null;
  const next = idx < CHAPTER_SEQUENCE.length - 1 ? CHAPTER_SEQUENCE[idx + 1] : null;

  const pager = document.createElement("nav");
  pager.className = "chapter-pager";
  pager.setAttribute("aria-label", "챕터 이동 네비게이션");

  pager.innerHTML = `
    <a class="pager-prev ${prev ? "" : "pager-disabled"}" href="${prev ? prev.file : "#"}">
      <span class="pager-label">← 이전 챕터</span>
      <span class="pager-title">${prev ? prev.title : "처음 챕터입니다"}</span>
    </a>
    <a class="pager-next ${next ? "" : "pager-disabled"}" href="${next ? next.file : "#"}">
      <span class="pager-label">다음 챕터 →</span>
      <span class="pager-title">${next ? next.title : "마지막 챕터입니다"}</span>
    </a>
  `;

  // concept-section 다음에 추가 (또는 main 끝에)
  const concept = main.querySelector(".concept-section");
  if (concept) {
    concept.appendChild(pager);
  } else {
    main.appendChild(pager);
  }
}
