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
  var META_KEY = "antigravity_srs_meta";

  // 하루에 새로 꺼내는 '처음 보는' 카드 상한 (복습 폭주 방지).
  // 이미 학습한 카드의 복습(due 도래분)은 이 상한과 무관하게 전부 노출된다.
  var DAILY_NEW_LIMIT = 15;

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }
  function addDaysISO(days) {
    var d = new Date();
    d.setDate(d.getDate() + (days || 0));
    return d.toISOString().slice(0, 10);
  }
  function yesterdayISO() {
    return addDaysISO(-1);
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

    /** 일자 메타 { date, newToday, streak, lastStudyDate } */
    getMeta: function () {
      return safeParse(META_KEY, { date: null, newToday: 0, streak: 0, lastStudyDate: null });
    },
    saveMeta: function (meta) {
      try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) {}
    },

    /** 오늘 남은 '신규 카드' 예산 (상한 - 오늘 이미 꺼낸 신규수) */
    getNewBudget: function () {
      var meta = this.getMeta();
      var used = (meta.date === todayISO()) ? (meta.newToday || 0) : 0;
      return Math.max(0, DAILY_NEW_LIMIT - used);
    },

    /**
     * 오늘 복습 대상 카드.
     *  - 복습분(이미 학습, due 도래): 전부 포함
     *  - 신규분(이력 없음): 오늘 남은 신규 예산만큼만 포함 → 폭주 방지
     */
    getDueCards: function () {
      var state = this.getState();
      var today = todayISO();
      var review = [], fresh = [];
      this.getAllCards().forEach(function (c) {
        var st = state[c.id];
        if (!st) fresh.push(c);
        else if ((st.due || today) <= today) review.push(c);
      });
      return review.concat(fresh.slice(0, this.getNewBudget()));
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
      var isNew = !state[id];   // 이번 채점이 '처음 보는 카드'인지
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

      this._recordStudyDay(isNew);
      return c;
    },

    /** 채점 1건당 호출 — 오늘 신규수 누적 + 연속 복습일(streak) 갱신 */
    _recordStudyDay: function (countedNew) {
      var meta = this.getMeta();
      var today = todayISO();
      // 날이 바뀌면 신규 카운터 리셋
      if (meta.date !== today) { meta.date = today; meta.newToday = 0; }
      if (countedNew) meta.newToday = (meta.newToday || 0) + 1;
      // 연속일: 오늘 첫 학습일 때만 갱신
      if (meta.lastStudyDate !== today) {
        meta.streak = (meta.lastStudyDate === yesterdayISO()) ? (meta.streak || 0) + 1 : 1;
        meta.lastStudyDate = today;
      }
      this.saveMeta(meta);
    },

    /** 현재 살아있는 연속 복습일. 어제까지만 유효(오늘/어제), 끊기면 0 */
    getStreak: function () {
      var meta = this.getMeta();
      if (!meta.lastStudyDate) return 0;
      if (meta.lastStudyDate === todayISO() || meta.lastStudyDate === yesterdayISO()) {
        return meta.streak || 0;
      }
      return 0;
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

    /** SRS 스케줄/메타 초기화 (뱅크는 보존) */
    resetSchedule: function () {
      try { localStorage.removeItem(SRS_KEY); } catch (e) {}
      try { localStorage.removeItem(META_KEY); } catch (e) {}
    }
  };

  global.srs = srs;
})(window);
