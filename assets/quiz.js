/**
 * Antigravity Fashion Quiz System Engine (quiz.js)
 * ------------------------------------------------
 * [Visual Grading Flow Chart]
 * 
 * 1. Multiple Choice (MCQ):
 *    Option Click ──► Check correct index ──► Add [correct] or [incorrect] CSS class
 *                                                   │
 *                                                   ▼ (Slide Down)
 *                                           Reveal .quiz-explanation
 * 
 * 2. Code Completion:
 *    Type Code ──► Submit Click ──► normalizeString(typedCode) (Strips spaces & formatting)
 *                                           │
 *                                           ▼ (Check keys)
 *                          Contains mustContain && Excludes mustNotContain
 *                                           │
 *                      ┌────────────────────┴────────────────────┐
 *                      ▼ (Success)                               ▼ (Fail)
 *               Show Success Card                        Show Error Card with Hint
 * 
 * 3. Pass System:
 *    Score >= 80% ──► set quizPassed: true in LocalStorage ──► updateDashboardGauges() ──► Celebrate Toast 🎉
 */

const quizEngine = {
  /**
   * 퀴즈 엔진 마운트 및 렌더링
   * @param {string} containerId - 퀴즈를 렌더링할 타겟 div의 ID (예: 'quiz-wrapper')
   * @param {Array} quizzes - 챕터별 퀴즈 정보 배열 (MCQ 3개 + Code 2개)
   * @param {string} chapterKey - 챕터 식별 키 (예: 'chapter-1')
   */
  render(containerId, quizzes, chapterKey) {
    // [SRS v3.3] 렌더 시 이 챕터 문항을 복습 뱅크(localStorage)에 자동 등록.
    // 흩어진 인라인 퀴즈를 비침투적으로 한곳에 모으는 캐시 (원본 배열은 그대로 단일 출처).
    registerToReviewBank(chapterKey, quizzes);

    const container = document.getElementById(containerId);
    if (!container) return;

    // 해당 챕터의 누적 퀴즈 상태 초기 레포트 생성
    const userAnswers = new Array(quizzes.length).fill(null);

    container.innerHTML = "";
    
    const header = document.createElement("div");
    header.style.marginBottom = "20px";
    header.innerHTML = `
      <h3 style="font-size: 20px; font-weight:800; border-left: 4px solid var(--accent-color); padding-left: 12px;">🎯 실무 자가 진단 퀴즈 (자가 평가)</h3>
      <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">객관식 3문항 + 실무 코드 완성형 2문항으로 구성되어 있으며, 80% (4개) 이상 맞히면 합격 처리됩니다.</p>
    `;
    container.appendChild(header);

    const quizListContainer = document.createElement("div");
    quizListContainer.className = "quiz-container";
    container.appendChild(quizListContainer);

    quizzes.forEach((quiz, index) => {
      const card = document.createElement("div");
      card.className = "glass-panel quiz-card";
      card.dataset.index = index;

      // 1. 객관식 퀴즈 렌더러 (MCQ)
      if (quiz.type === "mcq") {
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; padding:2px 8px; border-radius:10px; background:rgba(255,255,255,0.06); font-weight:600; color:var(--accent-color);">Question 0${index + 1} (객관식)</span>
            <span class="quiz-status-badge text-muted" style="font-size:12px; font-weight:700;">풀이 전</span>
          </div>
          <h4>Q. ${quiz.question}</h4>
          <div class="quiz-options">
            ${quiz.options.map((opt, oIdx) => `
              <button class="quiz-option" data-option="${oIdx}">${opt}</button>
            `).join("")}
          </div>
          <div class="quiz-explanation">
            <strong>💡 정답 상세 해설:</strong><br>
            <span style="display:block; margin-top:4px;">${quiz.explanation}</span>
          </div>
        `;

        // 객관식 선택 버튼 리스너
        const options = card.querySelectorAll(".quiz-option");
        options.forEach(btn => {
          btn.addEventListener("click", (e) => {
            const selectedIdx = parseInt(e.target.dataset.option);
            
            // 이미 이 문제를 통과한 상태면 반응 안 함
            if (userAnswers[index] === true) return;

            const explanationBox = card.querySelector(".quiz-explanation");
            const badge = card.querySelector(".quiz-status-badge");

            explanationBox.style.display = "block";

            if (selectedIdx === quiz.correct) {
              // 정답 처리
              e.target.classList.add("correct");
              badge.textContent = "정답 ✓";
              badge.className = "quiz-status-badge text-success";
              badge.style.color = "var(--devops)";
              
              // 다른 옵션 잠금
              options.forEach(opt => opt.disabled = true);
              userAnswers[index] = true;
              
              checkPassingCriteria(userAnswers, quizzes.length, chapterKey);
            } else {
              // 오답 처리
              e.target.classList.add("incorrect");
              badge.textContent = "오답 ✗";
              badge.className = "quiz-status-badge text-danger";
              badge.style.color = "var(--interview)";
              userAnswers[index] = false;
            }
          });
        });
      }

      // 2. 실무 코드 완성형 퀴즈 렌더러 (Code)
      if (quiz.type === "code") {
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <span style="font-size:11px; padding:2px 8px; border-radius:10px; background:rgba(255,255,255,0.06); font-weight:600; color:var(--accent-color);">Question 0${index + 1} (실무 코드 완성)</span>
            <span class="quiz-status-badge text-muted" style="font-size:12px; font-weight:700;">풀이 전</span>
          </div>
          <h4 style="margin-bottom:8px;">Q. ${quiz.prompt}</h4>
          <textarea class="code-quiz-input" placeholder="// 여기에 올바른 자바 또는 리액트 코드를 입력하세요...">${quiz.starter}</textarea>
          
          <div style="display:flex; gap:12px; margin-top:12px;">
            <button class="btn-submit-quiz">정답 제출하기</button>
            <button class="btn-sidebar btn-view-solution" style="padding:8px 14px; font-size:12.5px; border-radius:8px; width:auto;">정답 예시 보기</button>
          </div>
          
          <div class="quiz-explanation" style="margin-top:16px;">
            <strong>🟢 모범 답안 가이드:</strong>
            <pre class="language-${quiz.language}" style="margin-top:8px;"><code class="language-${quiz.language}">${escapeHtml(quiz.solution)}</code></pre>
            <strong style="display:block; margin-top:8px;">💡 출제 및 설계 의도 해설:</strong>
            <span style="display:block; margin-top:4px;">${quiz.explanation}</span>
          </div>
        `;

        const textarea = card.querySelector(".code-quiz-input");
        const submitBtn = card.querySelector(".btn-submit-quiz");
        const solutionBtn = card.querySelector(".btn-view-solution");
        const explanationBox = card.querySelector(".quiz-explanation");
        const badge = card.querySelector(".quiz-status-badge");

        // 정답 예시 보기 토글
        solutionBtn.addEventListener("click", () => {
          const isVisible = explanationBox.style.display === "block";
          explanationBox.style.display = isVisible ? "none" : "block";
          // 코드 하이라이트 트리거
          if (window.Prism) {
            window.Prism.highlightAllUnder(explanationBox);
          }
        });

        // 정답 검증 및 채점 실행
        submitBtn.addEventListener("click", () => {
          if (userAnswers[index] === true) return; // 이미 정답 맞췄으면 통과

          const codeText = textarea.value;
          const checkResult = gradeCodeQuiz(codeText, quiz.validator);

          explanationBox.style.display = "block";
          if (window.Prism) {
            window.Prism.highlightAllUnder(explanationBox);
          }

          if (checkResult.success) {
            // 채점 성공
            textarea.disabled = true;
            submitBtn.disabled = true;
            badge.textContent = "정답 ✓";
            badge.className = "quiz-status-badge text-success";
            badge.style.color = "var(--devops)";
            userAnswers[index] = true;

            showToast("🎉 정답입니다! 작성된 코드가 실무 요구 조건을 충족합니다.", "success");
            checkPassingCriteria(userAnswers, quizzes.length, chapterKey);
          } else {
            // 채점 실패
            badge.textContent = "조건 미달 ✗";
            badge.className = "quiz-status-badge text-danger";
            badge.style.color = "var(--interview)";
            userAnswers[index] = false;

            // 오류 힌트 노출
            showToast(`❌ 조건 미달: ${checkResult.reason}`, "warning");
          }
        });
      }

      quizListContainer.appendChild(card);
    });
  }
};

/**
 * 코드 작성 퀴즈 정밀 채점 처리 함수
 * (들여쓰기나 띄어쓰기로 오작동하지 않게 완전 정밀 정규화 수행)
 */
function gradeCodeQuiz(code, validator) {
  // 공백 및 줄바꿈을 완전 제거하고 특수기호만 남김
  const cleanCode = code.replace(/\s+/g, "");

  // 1. 필수 포함 키워드 체크
  if (validator.mustContain) {
    for (const keyword of validator.mustContain) {
      const cleanKeyword = keyword.replace(/\s+/g, "");
      if (!cleanCode.includes(cleanKeyword)) {
        return { 
          success: false, 
          reason: `작성하신 코드 내에 필수적으로 '${keyword}' 구문이 포함되어야 합니다.` 
        };
      }
    }
  }

  // 2. 금지 키워드 체크 (예: findAll 회피)
  if (validator.mustNotContain) {
    for (const keyword of validator.mustNotContain) {
      const cleanKeyword = keyword.replace(/\s+/g, "");
      if (cleanCode.includes(cleanKeyword)) {
        return { 
          success: false, 
          reason: `성능상의 보안 제약으로 코드 내에 금지 키워드 '${keyword}'를 사용할 수 없습니다.` 
        };
      }
    }
  }

  return { success: true };
}

/**
 * 전체 퀴즈 합격 80% 검증기
 */
function checkPassingCriteria(answers, totalQuestions, chapterKey) {
  const correctCount = answers.filter(a => a === true).length;
  const passingScore = Math.ceil(totalQuestions * 0.8); // 80% 이상 맞혀야 함

  if (correctCount >= passingScore) {
    const progress = JSON.parse(localStorage.getItem("antigravity_progress"));
    
    // 이미 이전에 합격한 상태면 중복 축하 생략
    if (progress[chapterKey] && progress[chapterKey].quizPassed) return;

    if (!progress[chapterKey]) progress[chapterKey] = { read: false, quizPassed: false };
    progress[chapterKey].quizPassed = true;

    localStorage.setItem("antigravity_progress", JSON.stringify(progress));

    // 실시간으로 main.js에 정의된 대시보드 게이지 렌더러 함수 연동 호출
    if (typeof window.updateDashboardGauges === "function") {
      window.updateDashboardGauges();
    } else {
      // main.js에 선언된 로직 다이렉트 트리거 시도
      updateDashboardGauges();
    }

    // 🎊 화려한 성과 보상 알림 토스트 발송
    showToast(`🎉 축하합니다! '${chapterKey}' 퀴즈 합격을 통과하여 대시보드 진행률이 차올랐습니다!`, "success");
  }
}

/**
 * 코드 프리뷰 이스케이프 헬퍼
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * [SRS v3.3] 복습 뱅크 등록 헬퍼
 * 챕터 렌더 시 해당 문항 배열을 localStorage["antigravity_review_bank"]에 캐시한다.
 * 각 문항에 안정적인 id(챕터키 + 질문 텍스트 해시)를 부여해 SRS 스케줄과 매칭.
 */
function makeCardId(chapterKey, quiz) {
  const seed = chapterKey + "|" + String((quiz && (quiz.question || quiz.prompt)) || "").slice(0, 100);
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(h, 31) + seed.charCodeAt(i)) | 0;
  }
  return chapterKey + "-" + (h >>> 0).toString(36);
}

function registerToReviewBank(chapterKey, quizzes) {
  if (!chapterKey || !Array.isArray(quizzes)) return;
  try {
    const bank = JSON.parse(localStorage.getItem("antigravity_review_bank") || "{}");
    bank[chapterKey] = quizzes.map(q =>
      Object.assign({ id: makeCardId(chapterKey, q), chapter: chapterKey }, q)
    );
    localStorage.setItem("antigravity_review_bank", JSON.stringify(bank));
  } catch (e) {
    console.warn("[SRS] 복습 뱅크 등록 건너뜀:", e);
  }
}

// 브라우저 전역 노출 바인딩
window.quizEngine = quizEngine;
