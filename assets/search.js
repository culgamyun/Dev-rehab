/**
 * Antigravity Fashion Search Engine (search.js)
 * --------------------------------------------
 * [Visual dynamic DOM indexing workflow]
 * 
 * 1. Read & Build Index:
 *    [Search Input Focus] ──► Check sessionStorage.antigravity_search_index
 *                                   │
 *                      ┌────────────┴────────────┐
 *                      ▼ (Exists)                ▼ (Not Exists)
 *                 Load Cached JSON         Promise.all(fetch 15 HTMLs)
 *                      │                         │
 *                      │                         ▼
 *                      │                   [DOMParser] ──► Parse <section> & ID
 *                      │                         │
 *                      ▼                         ▼
 *                 [Lunr Index] ◄─────────── Create document array ──► [sessionStorage]
 * 
 * 2. Real-time Filter:
 *    Type 'JPA' ──► query Lunr ──► Render floating glass list ──► Click ──► chapter-2.html#n-plus-1
 */

const INDEX_PAGES = [
  "chapter-1.html", "chapter-2.html", "chapter-3.html", "chapter-4.html",
  "chapter-5.html", "chapter-6.html", "chapter-7.html", "chapter-8.html",
  "appendix-test.html", "appendix-interview.html", "appendix-algorithm.html",
  "appendix-ai.html", "appendix-e.html", "appendix-f.html", "appendix-g.html",
  "chapter-r0.html", "chapter-r1.html", "chapter-r2.html", "chapter-r3.html", "chapter-r4.html", "chapter-r5.html", "chapter-r6.html", "chapter-r7.html", "chapter-r8.html"
];

let searchIndexData = null; // 원본 파싱 도큐먼트 배열
let lunrIndex = null;        // Lunr 인덱스 인스턴스

document.addEventListener("DOMContentLoaded", () => {
  initSearchUI();
});

/**
 * 1. 검색 관련 UI 이벤트 바인딩
 */
function initSearchUI() {
  const searchInput = document.querySelector(".search-input");
  if (!searchInput) return;

  // 검색 결과를 노출할 반투명 글래스 플로팅 컨테이너 생성
  const searchResults = document.createElement("div");
  searchResults.id = "search-results-floating";
  searchResults.className = "glass-panel";
  searchResults.style.position = "absolute";
  searchResults.style.top = "50px";
  searchResults.style.right = "0";
  searchResults.style.width = "400px";
  searchResults.style.maxHeight = "400px";
  searchResults.style.overflowY = "auto";
  searchResults.style.display = "none";
  searchResults.style.zIndex = "999";
  searchResults.style.padding = "16px";
  searchResults.style.borderRadius = "12px";
  searchResults.style.fontSize = "13px";

  searchInput.parentElement.appendChild(searchResults);

  // 검색창 포커스 시 즉시 백그라운드 실시간 인덱싱 개시 (sessionStorage 캐시 활용)
  searchInput.addEventListener("focus", () => {
    ensureSearchIndexBuilt();
  });

  // 키 입력 시 실시간 매칭 검색 수행
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    if (!query) {
      searchResults.style.display = "none";
      return;
    }
    executeSearch(query, searchResults);
  });

  // 검색창 영역 밖을 마우스 클릭하면 플로팅 창 숨기기
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = "none";
    }
  });
}

/**
 * 2. 세션스토리지 캐시 검증 기반 동적 검색 인덱스 빌드
 */
function ensureSearchIndexBuilt() {
  if (lunrIndex) return; // 이미 인메모리 로딩 완료 시 통과

  const cachedIndex = sessionStorage.getItem("antigravity_search_index");

  if (cachedIndex) {
    console.log("Loading search index from sessionStorage cache...");
    searchIndexData = JSON.parse(cachedIndex);
    buildLunrIndex(searchIndexData);
    return;
  }

  console.log("No cache found. Performing dynamic DOM indexing in background...");
  showToast("🔍 다중 챕터 검색 엔진 초기화 중 (최초 1회)", "info");

  const parser = new DOMParser();

  // 15개 HTML 파일 병렬 비동기 fetch 수행
  const fetchPromises = INDEX_PAGES.map(url => {
    return fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        return res.text();
      })
      .then(htmlText => {
        const doc = parser.parseFromString(htmlText, "text/html");
        const title = doc.querySelector("h1") ? doc.querySelector("h1").textContent.trim() : url;
        const documents = [];

        // 챕터 내의 각 <section id="..."> 요소를 찾아 쪼개어 정밀 인덱싱
        const sections = doc.querySelectorAll("section[id]");
        sections.forEach(sec => {
          const secTitle = sec.querySelector("h2, h3") ? sec.querySelector("h2, h3").textContent.trim() : "개념";
          
          // 가독성을 떨어뜨리는 코드 스니펫 영역을 배제하고 한글 텍스트만 추출
          const clonedSec = sec.cloneNode(true);
          clonedSec.querySelectorAll("pre, code, script").forEach(el => el.remove());
          const cleanText = clonedSec.textContent.replace(/\s+/g, " ").trim();

          documents.push({
            id: `${url}#${sec.id}`,
            chapter: title,
            section: secTitle,
            body: cleanText
          });
        });

        // 만약 section 구조가 없더라도 본문 전체를 백업용으로 캐치
        if (documents.length === 0) {
          const bodyText = doc.body.textContent.replace(/\s+/g, " ").trim();
          documents.push({
            id: url,
            chapter: title,
            section: "전체보기",
            body: bodyText
          });
        }

        return documents;
      })
      .catch(err => {
        console.warn(`Could not index page ${url}:`, err);
        return [];
      });
  });

  Promise.all(fetchPromises).then(results => {
    // 2차원 배열 평탄화 (Flat)
    searchIndexData = results.flat();
    
    // 브라우저 세션에 직렬화 저장하여 중복 로딩 완벽 방어
    sessionStorage.setItem("antigravity_search_index", JSON.stringify(searchIndexData));
    
    // Lunr 색인 개시
    buildLunrIndex(searchIndexData);
    showToast("🔍 검색 인덱싱 완료! 실시간 검색이 준비되었습니다.", "success");
  });
}

function buildLunrIndex(docs) {
  // lunr 라이브러리가 로드되었는지 확인
  if (typeof lunr === "undefined") {
    console.error("Lunr.js is not loaded yet.");
    return;
  }

  lunrIndex = lunr(function () {
    this.ref("id");
    this.field("chapter");
    this.field("section");
    this.field("body");

    docs.forEach(doc => {
      this.add(doc);
    });
  });
  console.log(`Lunr search engine index compiled with ${docs.length} sections.`);
}

/**
 * 3. Lunr 엔진을 사용한 정밀 쿼리 및 결과 렌더링
 */
function executeSearch(query, resultsContainer) {
  if (!lunrIndex) {
    resultsContainer.innerHTML = "<div class='text-muted' style='font-size:12px;'>인덱스 준비 중입니다. 잠시 후 다시 입력해 주세요...</div>";
    resultsContainer.style.display = "block";
    return;
  }

  // 검색 쿼리에 와일드카드 자동 부여하여 초성/부분 일치 매칭 보강
  const results = lunrIndex.search(`*${query}*`);

  if (results.length === 0) {
    resultsContainer.innerHTML = "<div class='text-muted' style='font-size:12px; text-align:center;'>검색 결과가 없습니다. 😢</div>";
    resultsContainer.style.display = "block";
    return;
  }

  resultsContainer.innerHTML = "";
  resultsContainer.style.display = "block";

  // 상위 6개 매칭 항목 출력
  const topResults = results.slice(0, 6);
  topResults.forEach(res => {
    const doc = searchIndexData.find(d => d.id === res.ref);
    if (!doc) return;

    // 본문에서 검색어가 겹치는 핵심 스니펫 발췌 (Snippet 추출)
    const queryLower = query.toLowerCase();
    const bodyLower = doc.body.toLowerCase();
    const matchIdx = bodyLower.indexOf(queryLower);
    
    let snippet = doc.body.substring(0, 80) + "...";
    if (matchIdx !== -1) {
      const start = Math.max(0, matchIdx - 20);
      const end = Math.min(doc.body.length, matchIdx + 60);
      snippet = "..." + doc.body.substring(start, end).replace(
        new RegExp(query, "gi"),
        match => `<mark style="background-color:rgba(241,196,15,0.4); color:inherit; font-weight:bold; border-radius:2px; padding:0 2px;">${match}</mark>`
      ) + "...";
    }

    const item = document.createElement("div");
    item.style.borderBottom = "1px solid var(--border-color)";
    item.style.paddingBottom = "10px";
    item.style.marginBottom = "10px";
    item.style.cursor = "pointer";

    // 결과 템플릿 렌더링
    item.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; font-weight:700; color:var(--text-color);">
        <span>${doc.section}</span>
        <span style="font-size:10px; padding:2px 6px; border-radius:10px; background:rgba(255,255,255,0.06); font-weight:500; color:var(--text-muted);">${doc.chapter}</span>
      </div>
      <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">${snippet}</div>
    `;

    // 마우스 클릭 시 특정 챕터의 특정 해시 ID로 초정밀 핀포인트 워프 실행
    item.addEventListener("click", () => {
      window.location.href = doc.id;
    });

    resultsContainer.appendChild(item);
  });
}
