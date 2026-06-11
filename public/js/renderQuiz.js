const urlParams = new URLSearchParams(window.location.search);
const quizId = urlParams.get("id");
console.log(quizId);
if (!quizId) {
  console.error("No Quiz Id found in the page link layout!");
}

// Pull text string out and turn it back into an object
const questions = JSON.parse(localStorage.getItem(`QuestionSuit${quizId}`));
console.log(questions); // Output: { questions: [...] }

let currentIdx = 0;
// Array tracking user choices matching question indices. stores: undefined (unanswered), or index value
let userSelections = new Array(questions.length).fill(undefined);

// DOM Selectors
const questionTxt = document.getElementById("question-text");
const optionsBox = document.getElementById("options-container");
const progressText = document.getElementById("progress-text");
const progressFill = document.getElementById("progress-bar-fill");
const feedbackBox = document.getElementById("feedback-panel");
const feedbackStatus = document.getElementById("feedback-status");
const feedbackExplain = document.getElementById("feedback-explanation");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");

function loadQuestion() {
  const q = questions[currentIdx];

  // 1. Render layout details & progress
  progressText.innerText = `Question ${currentIdx + 1} of ${questions.length}`;
  progressFill.style.width = `${((currentIdx + 1) / questions.length) * 100}%`;
  questionTxt.innerText = q.question;
  optionsBox.innerHTML = "";

  // Reset control visibility states
  feedbackBox.className = "hidden";
  nextBtn.classList.add("hidden");
  prevBtn.disabled = currentIdx === 0;

  // 2. Generate button selections
  q.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "option-item";
    btn.innerText = opt;
    btn.onclick = () => selectOption(index);
    optionsBox.appendChild(btn);
  });

  // 3. Keep state integrity: If user has previously answered this question, visually display it
  if (userSelections[currentIdx] !== undefined) {
    showFeedback(userSelections[currentIdx]);
  }
}

function selectOption(selectedIndex) {
  // Store user selection choice
  userSelections[currentIdx] = selectedIndex;
  showFeedback(selectedIndex);
}

function showFeedback(selectedIndex) {
  const q = questions[currentIdx];
  const optionButtons = optionsBox.querySelectorAll(".option-item");

  // Disable all options so they cannot click multiple times
  optionButtons.forEach((btn, idx) => {
    btn.setAttribute("disabled", "true");
    // Highlight correct choice green
    if (idx === q.answer) btn.classList.add("correct");
    // Highlight chosen selection red if it was wrong
    if (idx === selectedIndex && selectedIndex !== q.answer)
      btn.classList.add("incorrect");
  });

  // Configure content inside explanation box panel
  feedbackBox.className = ""; // Remove hidden class
  if (selectedIndex === q.answer) {
    feedbackStatus.innerText = "✅ Correct!";
    feedbackBox.className = "correct-style";
  } else {
    feedbackStatus.innerText = "❌ Incorrect";
    feedbackBox.className = "incorrect-style";
  }
  feedbackExplain.innerHTML = `<strong>Explanation:</strong> <span class="exp"></span>`;
  feedbackExplain.querySelector(".exp").innerText = `${q.explanation}`;

  // Show step button progress route
  nextBtn.classList.remove("hidden");
  if (currentIdx === questions.length - 1) {
    nextBtn.innerText = "View Final Summary";
  } else {
    nextBtn.innerText = "Next Question";
  }
}

// Navigation event handlers
nextBtn.onclick = () => {
  if (currentIdx < questions.length - 1) {
    currentIdx++;
    loadQuestion();
  } else {
    showFinalResults();
  }
};

prevBtn.onclick = () => {
  if (currentIdx > 0) {
    currentIdx--;
    loadQuestion();
  }
};

function showFinalResults() {
  document.getElementById("quiz-active-box").classList.add("hidden");
  const resultsBox = document.getElementById("quiz-results-box");
  resultsBox.classList.remove("hidden");

  let totalCorrect = 0;
  const summaryContainer = document.getElementById("summary-cards-container");
  summaryContainer.innerHTML = "";

  questions.forEach((q, idx) => {
    const chosenIdx = userSelections[idx];
    const isCorrect = chosenIdx === q.answer;
    if (isCorrect) totalCorrect++;

    const card = document.createElement("div");
    card.className = `summary-card ${isCorrect ? "passed" : "failed"}`;
    card.innerHTML = `
    <h4 class="q-title"></h4>
    <p><strong>Your Answer:</strong> <span class="user-ans"></span> (<span class="status-lbl"></span>)</p>
    <p><strong>Correct Answer:</strong> <span class="correct-ans"></span></p>
    <p class="exp-text" style="font-size:14px; color:#555;"></p>
`;
    card.querySelector(".q-title").textContent = `Q${idx + 1}: ${q.question}`;
    card.querySelector(".user-ans").textContent =
      chosenIdx !== undefined ? q.options[chosenIdx] : "Skipped";
    card.querySelector(".status-lbl").textContent = isCorrect
      ? "Correct"
      : "Incorrect";
    card.querySelector(".correct-ans").textContent = q.options[q.answer];
    card.querySelector(".exp-text").textContent = q.explanation;
    summaryContainer.appendChild(card);
  });

  document.getElementById("score-summary").innerHTML = `
        <h3 style="font-size:24px; color:hsl(261deg 80% 48%);">
            You scored ${totalCorrect} out of ${questions.length}!
        </h3>
    `;
}

async function saveQuiz() {
  const overlayBox = document.getElementById("overlay");
  const confirmBtn = document.getElementById("confirm-btn");
  const cancelBtn = document.getElementById("cancel-btn");
  overlayBox.classList.add("show");

  cancelBtn.addEventListener("click", () => {
    overlayBox.classList.remove("show");
  });

  confirmBtn.addEventListener("click", () => {
    const quizName = document.getElementById("quiz-name").value;
  });
}

// Kick off initialization logic
loadQuestion();
