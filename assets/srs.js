/**
 * Antigravity Fashion — 간격 반복 복습 엔진 (srs.js)  [v3.3]
 * --------------------------------------------------------
 * SM-2 알고리즘 기반 SRS(Spaced Repetition System).
 *
 *  - 복습 카드 출처: localStorage["antigravity_review_bank"]
 *      → quiz.js 의 quizEngine.render() 가 각 챕터 렌더 시 자동 등록 (비침투적 캐시).
 *        원본 인라인 퀴즈 배열이 단일 출처이고, 뱅크는 파생 캐시일 뿐.
 *  - 스케줄 상태: localStorage["antigravity_srs"]
 *      → { [cardId]: { interval, ease, reps, due, lapses, last } }
 *
 *  날짜는 일(day) 단위 ISO 문자열("YYYY-MM-DD")로 저장 → 문자열 비교로 due 판정.
 *  공개 API: window.srs.{ getBank, getAllCards, getDueCards, getDueCount,
 *                          grade, getStats, getState, resetSchedule }
 */
(function (global) {
  "use strict";

  var BANK_KEY = "antigravity_review_bank";
  var SRS_KEY = "antigravity_srs";

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }
  function addDaysISO(days) {
    var d = new Date();
    d.setDate(d.getDate() + (days || 0));
    return d.toISOString().slice(0, 10);
  }
  function safeParse(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) || fallback) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  var srs = {
    /** 복습 뱅크 원본 { chapterKey: [card, ...] } */
    getBank: function () {
      return safeParse(BANK_KEY, {});
    },

    /** 모든 복습 카드를 1차원 배열로 (각 카드에 .id, .chapter 포함) */
    getAllCards: function () {
      var bank = this.getBank();
      var cards = [];
      Object.keys(bank).forEach(function (ch) {
        (bank[ch] || []).forEach(function (q) {
          if (q && q.id) cards.push(q);
        });
      });
      return cards;
    },

    getState: function () {
      return safeParse(SRS_KEY, {});
    },
    saveState: function (state) {
      try {
        localStorage.setItem(SRS_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn("[SRS] 상태 저장 실패:", e);
      }
    },

    /** 오늘 복습 대상 카드 (학습 이력 없는 신규 카드는 즉시 대상) */
    getDueCards: function () {
      var state = this.getState();
      var today = todayISO();
      return this.getAllCards().filter(function (c) {
        var st = state[c.id];
        if (!st) return true;
        return (st.due || today) <= today;
      });
    },
    getDueCount: function () {
      return this.getDueCards().length;
    },

    /**
     * SM-2 채점. quality 매핑: 2=다시, 3=어려움, 4=보통, 5=쉬움
     * - quality < 3 : reps 리셋, interval 1일, lapses 증가
     * - quality >=3 : reps 증가, interval 1 → 6 → interval*EF, EF 재계산
     */
    grade: function (id, quality) {
      if (!id) return null;
      var state = this.getState();
      var c = state[id] || { interval: 0, ease: 2.5, reps: 0, due: null, lapses: 0, last: null };
      quality = Math.max(0, Math.min(5, quality));

      if (quality < 3) {
        c.reps = 0;
        c.interval = 1;
        c.lapses = (c.lapses || 0) + 1;
      } else {
        c.reps = (c.reps || 0) + 1;
        if (c.reps === 1) c.interval = 1;
        else if (c.reps === 2) c.interval = 6;
        else c.interval = Math.round((c.interval || 1) * (c.ease || 2.5));

        var ef = (c.ease || 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        c.ease = Math.max(1.3, ef);
      }
      c.due = addDaysISO(c.interval);
      c.last = todayISO();
      state[id] = c;
      this.saveState(state);
      return c;
    },

    /** 통계 { total, learned, due } */
    getStats: function () {
      var cards = this.getAllCards();
      var state = this.getState();
      var learned = 0;
      cards.forEach(function (c) {
        if (state[c.id] && state[c.id].reps > 0) learned++;
      });
      return { total: cards.length, learned: learned, due: this.getDueCards().length };
    },

    /** glossary.json의 용어를 복습 카드(type:"term")로 뱅크에 병합 (비동기) */
    ensureGlossaryCards: function (cb) {
      var self = this;
      fetch("assets/glossary.json")
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var terms = (data && data.terms) || [];
          var bank = self.getBank();
          bank["glossary"] = terms.map(function (t) {
            return {
              id: "term-" + t.key,
              chapter: "glossary",
              srcChapter: t.chapter,
              type: "term",
              key: t.key,
              name: t.name,
              definition: t.definition,
              explanation: t.explanation
            };
          });
          try { localStorage.setItem("antigravity_review_bank", JSON.stringify(bank)); } catch (e) {}
          if (typeof cb === "function") cb();
        })
        .catch(function (e) {
          console.warn("[SRS] 글로서리 카드 로드 실패:", e);
          if (typeof cb === "function") cb();
        });
    },

    /** SRS 스케줄만 초기화 (뱅크는 보존) */
    resetSchedule: function () {
      try { localStorage.removeItem(SRS_KEY); } catch (e) {}
    }
  };

  global.srs = srs;
})(window);
