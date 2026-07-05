// DOM SELECTORS
const sendBtn = document.getElementById("textSentBtn");
const quizViewContainer = document.getElementById("quiz-view-container");
const quizPreviewContainer = document.getElementById("quiz-container");
const timeInput = document.getElementById("time");
const textInput = document.getElementById("textInput");
const quizNumberInput = document.getElementById("quiz-number");
const loading = document.getElementById("loading");
const bgMusic = document.getElementById("bg-music");
const audio = document.getElementById("audio");
const audioSource = document.getElementById("audio-source");

// Difficulty explanation mapping used for prompt generation
const difficultyLevel = {
  easy: "Easy - Recall basic facts and definitions.",
  medium: "Medium - Test understanding and application.",
  hard: "Hard - Test analysis, comparison, and reasoning based on the material.",
};

// APPLICATION STATE
let quizArray = []; // All generated questions across sessions
let quizID = 0; // Incremental ID for each generated quiz
let selectedMusic = ""; // Currently selected background music

// CHAT INPUT HANDLER
// Allows Enter key to trigger quiz generation (Shift+Enter = new line)
function handleChatKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    generateQuiz();
  }
}

// TEXTAREA AUTO RESIZE
// Dynamically adjusts input height based on content
function autogrow(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 96) + "px";
}

// AUDIO HELPERS
// Stop current audio playback and reset source
function stopAudio() {
  el.audio.pause();
  el.audioSource.src = "";
  el.audio.load();
}

// Load and play selected background music
function playAudio(name) {
  el.audio.pause();

  el.audioSource.src = `/bg music/${encodeURIComponent(name)}.mp3`;
  el.audio.load();

  el.audio.addEventListener(
    "canplay",
    () => {
      const p = el.audio.play();
      // Prevent autoplay-related console errors
      if (p)
        p.catch((error) => {
          console.info("Playback layout deferral note:", error.message);
        });
    },
    { once: true },
  );
}

// MUSIC SELECT HANDLER
// Updates background music when user selects a track
bgMusic.addEventListener("change", async (e) => {
  selectedMusic = e.target.value;

  // If no music selected, stop playback
  if (!selectedMusic) {
    stopAudio();
    return;
  }

  playAudio(selectedMusic);
});

// QUIZ GENERATION CORE LOGIC
async function generateQuiz() {
  const time = tiemInput.value;
  const text = textInput.value.trim();
  const quizNumber = quizNumberInput.value || 10;

  // Prevent empty input generation
  if (!text) return;

  // Extract previously generated questions to avoid duplicates
  const pastQuestionSentences = quizArray.map((q) => q.question);

  // Format exclusion list for AI prompt clarity
  const cleanExclusionList =
    pastQuestionSentences.length > 0
      ? pastQuestionSentences.map((q, i) => `${i + 1}. "${q}"`).join("\n")
      : "None (This is the first generation batch).";

  // Disable UI while generating
  sendBtn.disabled = true;
  loading.classList.remove("hidden");
  quizPreviewContainer.classList.add("hidden");

  const questionType = document.getElementById("quiz-type").value;
  const mode = document.getElementById("mode").value;
  const difficulty = difficultyLevel[mode] || difficultyLevel.medium;

  // AI SYSTEM PROMPT
  // Large structured prompt instructing model output format
  const systemPrompt = `
  Output Requirements:
  Return ONLY a single, valid JSON object following this exact structure. The array must contain a natural, unpredictable mix of your chosen question types based on the user's settings. 

  Ensure the "answer" is strictly an integer index (0, 1, 2, or 3) matching the correct position in your "options" array.

  Example Mixed Schema Format:
  {
    "title": "A creative title for this specific study deck",
    "questions": [
      {
        "id": 1,
        "type": "multiple-choice",
        "question": "A 4-option conceptual check question?",
        "options": ["Plausible Distractor A", "Correct Answer Choice", "Plausible Distractor C", "Plausible Distractor D"],
        "answer": 1,
        "explanation": "Detailed breakdown of why choice index 1 is factually correct.",
        "difficulty": "medium"
      },
      {
        "id": 2,
        "type": "true-false",
        "question": "A clear, factual True or False statement based on the text?",
        "options": ["True", "False"],
        "answer": 0,
        "explanation": "Contextual reason proving why this statement is True.",
        "difficulty": "medium"
      }
    ]
  }

  CRITICAL MIX VARIETY RULES:
  1. SHUFFLE THE TYPES: Do not follow a rigid pattern (like alternating MC, TF, MC, TF). Radically randomize the order of your question array cards so the structure remains completely unpredictable.
  2. DO NOT use text strings or matching letters for the "answer" parameter; it must strictly be the numerical array index integer (0 to 3 for multiple-choice, 0 or 1 for true-false).
  3. If the total requested Number of Quizzes is exactly 1 and the type setting is mixed, randomly select only one format to output.
  4. Strictly generate exactly ${quizNumber} questions in total—no more, no less.
  5. Do not include markdown formatting tags (like \`\`\`json) or any conversational text before or after the JSON payload string.

  Study Material: ${text}
  Difficulty Level: ${difficulty}
  Number of Quizzes: ${quizNumber}
  Question Type Setting: ${questionType}
  Excluded Questions List (NEVER REPEAT THESE): 
  ${cleanExclusionList}

  `;

  try {
    // Send prompt to backend AI endpoint
    const res = await fetch("/quizGenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: systemPrompt }),
    });
    const data = await res.json();

    // Parse AI response JSON string
    const quizData = JSON.parse(data.quiz);

    // Store generated questions globally
    quizArray.push(...quizData.questions);
    quizData.time = time;
    console.log(quizData);

    // Increment quiz session ID
    quizID++;

    // Save to local storage for later retrieval
    localStorage.setItem(`QuestionSuit${quizID}`, JSON.stringify(quizData));

    // Create UI preview card for generated quiz
    createPreviewBox(quizData.title, quizData.questions, quizID);
  } catch (error) {
    console.log(error);
  } finally {
    // Re-enable UI after generation
    sendBtn.disabled = false;
    loading.classList.add("hidden");
    quizPreviewContainer.classList.remove("hidden");
  }
}

// QUIZ PREVIEW CARD CREATION
function createPreviewBox(title, questions, currentBoxId) {
  if (!quizPreviewContainer) return;

  const previewBox = document.createElement("div");
  previewBox.className = "quiz-preview-box";
  previewBox.style.cursor = "pointer";

  previewBox.innerHTML = `
  <h3 class="preview-header">✨ Quiz Ready! (${title})</h3>
  <p class="preview-text">Generated <strong>${questions.length} questions</strong> based on your requirements.
  <br><span class="preview-link">Click here to start the quiz →
  `;

  // Navigate to quiz view on click
  previewBox.onclick = () => {
    window.location.href = `/renderQuiz?id=${currentBoxId}&source=local&music=${selectedMusic}`;
  };
  quizPreviewContainer.appendChild(previewBox);

  // Smooth scroll into view after rendering
  setTimeout(() => {
    previewBox.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, 50);
}
