// URL PARAMETERS
// Extract quiz ID and data source from URL
const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get("id");
const source = urlParams.get("source") || "local";
// Safety check for missing quiz ID
if (!quizId) {
  console.error("No Quiz Id found in the page link layout!");
}

// DOM SELECTORS
// Frequently used DOM elements
const el = {
  questionTxt: document.getElementById("question-text"),
  optionsBox: document.getElementById("options-container"),
  progressText: document.getElementById("progress-text"),
  progressFill: document.getElementById("progress-bar-fill"),
  feedbackBox: document.getElementById("feedback-panel"),
  feedbackStatus: document.getElementById("feedback-status"),
  feedbackExplain: document.getElementById("feedback-explanation"),
  prevBtn: document.getElementById("prev-btn"),
  nextBtn: document.getElementById("next-btn"),
  saveBtn: document.querySelector(".save-btn"),
  retakeBtn: document.querySelector(".retake"),
  quizActiveBox: document.getElementById("quiz-active-box"),
  resultsBox: document.getElementById("quiz-results-box"),
  timer: document.getElementById("timer"),
  timerContainer: document.getElementById("timer-container"),
  audio: document.getElementById("audio"),
  audioSource: document.getElementById("audio-source"),
};

// APPLICATION STATE
const state = {
  questions: [], // quiz questions array
  currentIdx: 0, // current question index
  userSelections: [], // user answers per question
  music: "", // background music file name
  time: 30, // time per question (default 30s)
  timeLeft: 30, // countdown timer value
  timerInterval: null, // interval reference for timer
};

// INITIALIZE QUIZ
// Fetch quiz data from DB or localStorage and initialize state
async function initQuiz() {
  try {
    if (source === "db") {
      // Load quiz from backend database
      const res = await fetch(`/fetchingMongoDBdata/${quizId}`);
      if (!res.ok) throw new Error("Failed to retrieve quiz data from server.");
      const data = await res.json();
      state.questions = data.questions || [];
      state.time = data.time || 30;
      state.music = data.music || "";
      console.log(state.music);
    } else {
      // Load quiz from localStorage
      const rawData = JSON.parse(localStorage.getItem(`QuestionSuit${quizId}`));
      state.music = urlParams.get("music") || "";
      state.questions = rawData?.questions || rawData || [];
      state.time = rawData.time || 30;
    }

    // Validate quiz data
    if (!state.questions || state.questions.length === 0) {
      throw new Error("No questions found for this quiz record configuration.");
    }

    // Initialize user answers array
    state.userSelections = new Array(state.questions.length).fill(undefined);
    loadMusic();
    loadQuestion();
  } catch (error) {
    console.error("Quiz Initialization Error:", error);
    el.questionTxt.innerText = "Error loading quiz data. Please try again.";
  }
}

// BACKGROUND MUSIC
function loadMusic() {
  el.audioSource.setAttribute(
    "src",
    `/bg music/${encodeURIComponent(state.music)}.mp3`,
  );
  el.audio.load();
  el.audio.addEventListener(
    "canplay",
    () => {
      playPromise = el.audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Catch block prevents console crashes from browser security blockades
          console.info("Playback layout deferral note:", error.message);
        });
      }
    },
    { once: true },
  );
}

// QUESTION LOADING FLOW
function loadQuestion() {
  const q = state.questions[state.currentIdx];
  stopTimer();
  resetTimer();
  renderQuestion(q);
  renderOption(q);
  renderProgress();

  // If already answered, show feedback instead of restarting timer
  if (state.userSelections[state.currentIdx] !== undefined) {
    showFeedback(state.userSelections[state.currentIdx]);
  } else {
    startTimer();
  }
}

// RENDER QUESTION UI
function renderQuestion(q) {
  // 1. Render layout details & progress
  el.questionTxt.innerText = q.question;
  el.optionsBox.innerHTML = "";

  // Reset control visibility states
  el.feedbackBox.className = "hidden";
  el.nextBtn.classList.add("hidden");

  // Handle previous button state
  if (state.currentIdx === 0) {
    el.prevBtn.disabled = true;
    el.prevBtn.classList.add("disabled");
  } else {
    el.prevBtn.disabled = false;
    el.prevBtn.classList.remove("disabled");
  }
}

// RENDER OPTIONS
function renderOption(q) {
  q.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "option-item notranslate";
    btn.innerText = opt;
    // Handle option selection
    btn.onclick = () => selectOption(index);
    el.optionsBox.appendChild(btn);
  });
}

// PROGRESS BAR
function renderProgress() {
  el.progressText.innerText = `Question ${state.currentIdx + 1} of ${state.questions.length}`;

  el.progressFill.style.width = `${((state.currentIdx + 1) / state.questions.length) * 100}%`;
}

// USER ANSWER HANDLING
function selectOption(selectedIndex) {
  // Store user selection choice
  state.userSelections[state.currentIdx] = selectedIndex;
  showFeedback(selectedIndex);
}

// FEEDBACK SYSTEM
function showFeedback(selectedIndex) {
  stopTimer();
  const q = state.questions[state.currentIdx];
  const optionButtons = el.optionsBox.querySelectorAll(".option-item");

  // Disable all options so they cannot click multiple times
  optionButtons.forEach((btn, idx) => {
    btn.disabled = true;
    // Highlight correct choice green
    if (idx === q.answer) btn.classList.add("correct");
    // Highlight chosen selection red if it was wrong
    if (idx === selectedIndex && selectedIndex !== q.answer)
      btn.classList.add("incorrect");
  });

  renderFeedbackPanel(q, selectedIndex);
  updateNextButton();
}

// FEEDBACK PANEL UI
function renderFeedbackPanel(q, selectedIndex) {
  // Configure content inside explanation box panel
  el.feedbackBox.className = ""; // Remove hidden class
  if (selectedIndex === q.answer) {
    el.feedbackStatus.innerText = "✅ Correct!";
    el.feedbackBox.className = "correct-style";
  } else {
    el.feedbackStatus.innerText = "❌ Incorrect";
    el.feedbackBox.className = "incorrect-style";
  }
  el.feedbackExplain.innerHTML = `<strong>Explanation:</strong> <span class="exp"></span>`;
  el.feedbackExplain.querySelector(".exp").innerText = `${q.explanation}`;
}

// NEXT BUTTON STATE
function updateNextButton() {
  el.nextBtn.classList.remove("hidden");
  if (state.currentIdx === state.questions.length - 1) {
    el.nextBtn.innerText = "View Final Summary";
  } else {
    el.nextBtn.innerText = "Next Question";
  }
}

// FINAL RESULTS SCREEN
function showFinalResults() {
  if (source === "db") {
    el.saveBtn.classList.add("hidden");
  } else {
    el.saveBtn.classList.remove("hidden");
  }

  el.quizActiveBox.classList.add("hidden");
  el.resultsBox.classList.remove("hidden");

  let totalCorrect = 0;
  const summaryContainer = document.getElementById("summary-cards-container");
  summaryContainer.innerHTML = "";

  // Build result cards for each question
  state.questions.forEach((q, idx) => {
    const chosenIdx = state.userSelections[idx];
    const isCorrect = chosenIdx === q.answer;
    if (isCorrect) totalCorrect++;

    const card = document.createElement("div");
    card.className = `summary-card ${isCorrect ? "passed" : "failed"}`;
    card.innerHTML = `
    <h4 class="q-title"></h4>
    <p><strong>Your Answer:</strong> <span class="user-ans"></span> <span class="status-lbl"></span></p>
    <p><strong>Correct Answer:</strong> <span class="correct-ans"></span></p>
    <p class="exp-text" style="font-size:14px; color:#555;"></p>
`;
    card.querySelector(".q-title").textContent = `Q${idx + 1}: ${q.question}`;
    card.querySelector(".user-ans").textContent =
      chosenIdx == "skipped" ? "Skipped" : q.options[chosenIdx];
    if (chosenIdx != "skipped") {
      card.querySelector(".status-lbl").textContent = isCorrect
        ? "(Correct)"
        : "(Incorrect)";
    }
    card.querySelector(".correct-ans").textContent = q.options[q.answer];
    card.querySelector(".exp-text").textContent = q.explanation;
    summaryContainer.appendChild(card);
  });

  document.getElementById("score-summary").innerHTML = `
        <h3 style="font-size:24px; color:hsl(261deg 80% 48%);">
            You scored ${totalCorrect} out of ${state.questions.length}!
        </h3>
    `;
}

// RETAKE QUIZ
function retake() {
  state.userSelections = new Array(state.questions.length).fill(undefined);
  state.currentIdx = 0;
  el.quizActiveBox.classList.remove("hidden");
  el.resultsBox.classList.add("hidden");
  loadQuestion();
}

// SAVE QUIZ TO DATABASE
async function saveQuiz() {
  const overlayBox = document.getElementById("overlay");
  const quizName = document.getElementById("quiz-name");
  const confirmBtn = document.getElementById("confirm-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  const warningText = document.getElementById("warning-text");
  overlayBox.classList.add("show");

  // Cancel button
  cancelBtn.onclick = () => {
    overlayBox.classList.remove("show");
  };

  // Confirm save
  confirmBtn.onclick = async (e) => {
    e.preventDefault();
    if (quizName.value.trim().length === 0) {
      warningText.innerHTML = `Please give a name for the quiz!`;
      quizName.value = "";
      return;
    }

    confirmBtn.disabled = true;
    confirmBtn.innerText = "Saving...";

    const payload = {
      title: quizName.value,
      time: state.time,
      questions: state.questions,
      music: state.music,
    };

    try {
      const res = await fetch("/savingQuiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        overlayBox.classList.remove("show");
      } else {
        throw new Error(data.error || "Database rejection encountered");
      }
    } catch (error) {
      console.error("Failed to upload save packet:", error);
    } finally {
      confirmBtn.disabled = false;
      confirmBtn.innerText = "OK";
    }
  };
}

// TIMER SYSTEM
function resetTimer() {
  state.timeLeft = state.time;
}

function startTimer() {
  stopTimer();
  updateTimerDisplay();
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    updateTimerDisplay();
    if (state.timeLeft <= 5) el.timerContainer.classList.add("warning");
    if (state.timeLeft <= 0) selectOption("skipped");
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  el.timerContainer.classList.remove("warning");
}

function updateTimerDisplay() {
  el.timer.textContent = `${state.timeLeft}s`;
}

// NAVIGATION BUTTONS
el.nextBtn.onclick = () => {
  if (state.currentIdx < state.questions.length - 1) {
    state.currentIdx++;
    loadQuestion();
  } else {
    stopTimer();
    showFinalResults();
  }
};

el.prevBtn.onclick = () => {
  if (state.currentIdx > 0) {
    state.currentIdx--;
    loadQuestion();
  }
};

// Kick off initialization logic
initQuiz();
