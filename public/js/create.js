const sendBtn = document.getElementById("textSentBtn");
const quizViewContainer = document.getElementById("quiz-view-container");
const quizPreviewContainer = document.getElementById("quiz-container");
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

async function generateQuiz() {
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

  const questionType = document.getElementById("quiz-type").value;
  const mode = document.getElementById("mode").value;
  const difficulty = difficultyLevel[mode] || difficultyLevel.medium;

  const systemPrompt = `You are an expert educational quiz generator.

Your task is to create accurate, high-quality quiz questions based ONLY on the provided study material.

Rules:
1. Use only information found in the provided content.
2. Do not invent facts or add outside knowledge.
3. Focus on the most important concepts, definitions, processes, and relationships.
4. Generate clear and unambiguous questions.
5. Avoid duplicate or repetitive questions.
6. Ensure incorrect options are plausible but clearly incorrect.
7. Questions should test understanding, not simple keyword matching.
8. Keep explanations concise and educational.
9. If the content is insufficient, generate general questions about that content.
10. Maintain academic integrity and factual accuracy.

Question Requirements:
- Generate multiple-choice questions.
- Each question must have exactly 4 options.
- Only one option can be correct.
- Randomize the position of the correct answer.
- Include a short explanation for the correct answer.

Difficulty Levels: ${difficulty}


Output Requirements:
Return ONLY valid JSON in the following format:

Multiple-Choice Question Type:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "correct index e.g. 1 for B",
      "explanation": "Brief explanation",
      "difficulty": "medium"
    }
  ]
}

True/False Question Type:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": [
        "True",
        "False"
      ],
      "answer": "correct index e.g. 1 for False",
      "explanation": "Brief explanation",
      "difficulty": "medium"
    }
  ]
}

Do not include markdown.
Do not include code blocks.
Do not include additional text outside the JSON.
Do not repeat the questions.

Study Material: ${text}
Number of Quizzes: ${quizNumber}
Question Type: ${questionType}
Excluded Questions List (NEVER REPEAT THESE): ${cleanExclusionList}`;
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
    quizID++;
    localStorage.setItem(
      `QuestionSuit${quizID}`,
      JSON.stringify(quizData.questions),
    );
    createPreviewBox(quizData.questions, quizID);
  } catch (error) {
    console.log(error);
  } finally {
    sendBtn.disabled = false;
  }
}

function createPreviewBox(questions, currentBoxId) {
  if (!quizPreviewContainer) return;

  const previewBox = document.createElement("div");
  previewBox.className = "quiz-preview-box";
  previewBox.style.cursor = "pointer";

  previewBox.innerHTML = `
  <h3 class="preview-header">✨ Quiz Ready! (Suit ${currentBoxId})</h3>
  <p class="preview-text">Generated <strong>${questions.length} questions</strong> based on your requirements.
  <br><span class="preview-link">Click here to start the quiz →
  `;

  previewBox.onclick = () => {
    window.location.href = `/renderQuiz?id=${currentBoxId}`;
  };
  quizPreviewContainer.appendChild(previewBox);
}
