const sendBtn = document.getElementById("textSentBtn");
const quizViewContainer = document.getElementById("quiz-view-container");
const quizPreviewContainer = document.getElementById("quiz-container");
const loading = document.getElementById("loading");
const bgMusic = document.getElementById("bg-music");
const audio = document.getElementById("audio");
const audioSource = document.getElementById("audio-source");
const difficultyLevel = {
  easy: "Easy - Recall basic facts and definitions.",
  medium: "Medium - Test understanding and application.",
  hard: "Hard - Test analysis, comparison, and reasoning based on the material.",
};
let quizArray = [];
let quizID = 0;

function handleChatKey(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    generateQuiz();
  }
}

function autogrow(el) {
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 96) + "px";
}

// A persistent controller to halt active audio initialization safely
let playPromise = null;

bgMusic.addEventListener("change", async (e) => {
  const selectedMusic = e.target.value;

  // 1. Handle empty selection
  if (!selectedMusic) {
    audio.pause();
    audioSource.setAttribute("src", "");
    audio.load();
    return;
  }

  // 2. Pause existing playback safely
  audio.pause();

  // 3. Update the tracking sources
  audioSource.setAttribute(
    "src",
    `/bg music/${encodeURIComponent(selectedMusic)}.mp3`,
  );

  // 4. Force browser media engine layout reset
  audio.load();

  // 5. Play only when the browser confirms the source is buffered
  audio.addEventListener(
    "canplay",
    () => {
      playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // Catch block prevents console crashes from browser security blockades
          console.info("Playback layout deferral note:", error.message);
        });
      }
    },
    { once: true },
  ); // { once: true } auto-removes the listener after firing
});

async function generateQuiz() {
  const time = document.getElementById("time").value;
  let text = document.getElementById("textInput").value.trim();
  let quizNumber = document.getElementById("quiz-number").value || 10;
  if (!text) return;

  const pastQuestionSentences = quizArray.flat().map((q) => q.question);

  // Format them as a clean, human-readable list for the system prompt
  const cleanExclusionList =
    pastQuestionSentences.length > 0
      ? pastQuestionSentences.map((q, i) => `${i + 1}. "${q}"`).join("\n")
      : "None (This is the first generation batch).";

  sendBtn.disabled = true;
  loading.classList.remove("hidden");
  quizPreviewContainer.classList.add("hidden");

  const questionType = document.getElementById("quiz-type").value;
  const mode = document.getElementById("mode").value;
  const difficulty = difficultyLevel[mode] || difficultyLevel.medium;

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
Number of Quizzes: ${quizNumber}
Question Type Setting: ${questionType}
Excluded Questions List (NEVER REPEAT THESE): 
${cleanExclusionList}

  `;
  console.log(quizNumber);
  const message = { role: "user", content: systemPrompt };
  try {
    const res = await fetch("/quizGenerate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: systemPrompt }),
    });
    const data = await res.json();
    const quizData = JSON.parse(data.quiz);
    quizArray.push(...quizData.questions);
    quizData.time = time;
    console.log(quizData);
    quizID++;
    localStorage.setItem(`QuestionSuit${quizID}`, JSON.stringify(quizData));
    createPreviewBox(quizData.title, quizData.questions, quizID);
  } catch (error) {
    console.log(error);
  } finally {
    sendBtn.disabled = false;
    loading.classList.add("hidden");
    quizPreviewContainer.classList.remove("hidden");
  }
}

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

  previewBox.onclick = () => {
    window.location.href = `/renderQuiz?id=${currentBoxId}&source=local`;
  };
  quizPreviewContainer.appendChild(previewBox);

  setTimeout(() => {
    previewBox.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, 50);
}
