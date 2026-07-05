// DOM SELECTORS
// Frequently used DOM elements
const el = {
  cardBox: document.getElementById("card-box"),
  message: document.getElementById("message"),

  overlayEdit: document.getElementById("overlay-edit"),
  overlayDelete: document.getElementById("overlay-delete"),

  quizName: document.getElementById("quiz-name"),
  warningText: document.getElementById("warning-text"),
  time: document.getElementById("time"),

  confirmBtn: document.getElementById("confirm-btn"),
  cancelBtn: document.getElementById("cancel-btn"),

  yesBtn: document.getElementById("yes-btn"),
  noBtn: document.getElementById("no-btn"),

  bgMusic: document.getElementById("bg-music"),
  audio: document.getElementById("audio"),
  audioSource: document.getElementById("audio-source"),
};

// APPLICATION STATE
const state = {
  results: window.results, // Quiz data passed from backend
  activeCardElement: null, // Currently selected card element
  activeQuizData: null, // Currently selected quiz object
  activeQuizIndex: null, // Current quiz index in array
  selectedMusic: "", // Music selected in edit modal
};

// INITIAL PAGE RENDERING
// Display empty state if no quizzes exist
function init() {
  if (!state.results || state.results.quizzes.length === 0) {
    showEmptyState();
  } else {
    // Clear placeholder message
    el.message.innerText = "";

    // Generate a card for every saved quiz
    state.results.quizzes.forEach((q, idx) => {
      createQuizCard(q, idx);
    });
  }
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

// QUIZ CARD CREATION
// Create a single quiz card and bind all event listeners
function createQuizCard(q, idx) {
  const quizCard = document.createElement("div");
  quizCard.className = "quizCard";

  // Format MongoDB timestamp into a readable date
  const formattedDate = q.createdAt
    ? new Date(q.createdAt).toLocaleDateString()
    : "Unknown Date";

  quizCard.innerHTML = `
    <div class="quizTitle"></div>
    <div class="information-container">
      <div class="quizMeta">
        <span>📄 ${q.questions ? q.questions.length : 0} Questions</span> • 
        <span>📅 Saved on ${formattedDate}</span>
      </div>
      <div class="buttons">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
      </div>
    </div>
  `;

  quizCard.querySelector(".quizTitle").textContent = q.title;
  el.cardBox.appendChild(quizCard);

  bindCardEvents(quizCard, q, idx);
}

// Bind event to each card
function bindCardEvents(card, q, idx) {
  card.onclick = () => {
    window.location.href = `/renderQuiz?id=${idx}&source=db&music=${q.music}`;
  };

  // EDIT BUTTON
  card.querySelector(".edit-btn").onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    state.activeCardElement = card;
    state.activeQuizData = q;
    state.activeQuizIndex = idx;

    el.warningText.innerHTML = "";
    el.quizName.value = q.title;

    el.overlayEdit.classList.add("show");
  };

  // DELETE BUTTON
  card.querySelector(".delete-btn").onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    state.activeCardElement = card;
    state.activeQuizIndex = idx;

    el.overlayDelete.classList.add("show");
  };
}

// Show message if empty
function showEmptyState() {
  el.message.innerHTML = `
    You haven't saved any quizzes yet!
    <div class="create-btn-container">
      <form action="/create" method="GET">
        <button class="create-btn">Create One</button>
      </form>
    </div>
  `;
}

// REINDEX CARDS AFTER DELETION
// Keep frontend indexes synchronized with MongoDB indexes
function recalculateCardIndexes() {
  const remainingCards = el.cardBox.querySelectorAll(".quizCard");

  remainingCards.forEach((card, newIdx) => {
    card.dataset.currentIndex = newIdx;

    // Update quiz navigation links
    card.onclick = () => {
      window.location.href = `/renderQuiz?id=${newIdx}&source=db`;
    };

    const editBtn = card.querySelector(".edit-btn");
    const deleteBtn = card.querySelector(".delete-btn");

    // Rebind edit button
    editBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.activeCardElement = card;
      state.activeQuizIndex = newIdx;

      // Fetch updated quiz data
      if (state.results && state.results.quizzes)
        state.activeQuizData = state.results.quizzes[newIdx];
      el.warningText.innerHTML = "";
      el.quizName.value = card.querySelector(".quizTitle").textContent;
      el.overlayEdit.classList.add("show");
    };

    // Rebind delete button
    deleteBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      state.activeCardElement = card;
      state.activeQuizIndex = newIdx;
      el.overlayDelete.classList.add("show");
    };
  });
}

// BACKGROUND MUSIC SELECTION
el.bgMusic.addEventListener("change", async (e) => {
  state.selectedMusic = e.target.value;

  // Stop audio if user clears selection
  if (!state.selectedMusic) {
    stopAudio();
    return;
  }
  playAudio(state.selectedMusic);
});

// EDIT OVERLAY CONTROLS
// Close edit modal
el.cancelBtn.onclick = () => {
  el.overlayEdit.classList.remove("show");
  el.audio.pause();
};

// Save edited quiz
el.confirmBtn.onclick = async (e) => {
  e.preventDefault();
  const title = el.quizName.value.trim();
  const newTime = el.time.value;

  // Validate title input
  if (title.length === 0) {
    el.warningText.innerHTML = `Please give a new name for the quiz!`;
    return;
  }

  el.confirmBtn.disabled = true;
  el.confirmBtn.innerText = "Saving...";

  const payload = {
    title: title,
    time: newTime,
    quizIndex: state.activeQuizIndex,
    music: state.selectedMusic,
  };

  try {
    const res = await fetch("/editingQuiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    // Update frontend immediately without page refresh
    if (res.ok && data.success) {
      el.overlayEdit.classList.remove("show");
      if (state.activeCardElement && state.activeQuizData) {
        state.activeCardElement.querySelector(".quizTitle").textContent = title;
        state.activeQuizData.title = title;
      }
    } else {
      throw new Error(data.error || "Database rejection encountered");
    }
  } catch (error) {
    console.error("Failed to upload save packet:", error);
  } finally {
    el.confirmBtn.disabled = false;
    el.confirmBtn.innerText = "OK";
    el.audio.pause();
  }
};

// DELETE OVERLAY CONTROLS
// Close delete modal
el.noBtn.onclick = () => {
  el.overlayDelete.classList.remove("show");
};

// Confirm deletion
el.yesBtn.onclick = async () => {
  el.yesBtn.disabled = true;
  el.yesBtn.innerText = "Deleting...";
  try {
    const res = await fetch("/deletingQuiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizIndex: state.activeQuizIndex }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      // Animate card removal
      state.activeCardElement.style.transition = "all 0.3s ease";
      state.activeCardElement.style.opacity = "0";
      state.activeCardElement.style.transform = "scale(0.9)";
      el.overlayDelete.classList.remove("show");

      setTimeout(() => {
        state.activeCardElement.remove();

        // Keep frontend data aligned with MongoDB
        if (state.results && state.results.quizzes) {
          state.results.quizzes.splice(state.activeQuizIndex, 1);
        }

        // Recalculate all remaining indexes
        recalculateCardIndexes();

        // Show empty state if no quizzes remain
        if (el.cardBox.children.length === 1) {
          showEmptyState();
        }
      }, 300);
    } else {
      throw new Error(
        data.error || "Server rejected deletion schema update instructions.",
      );
    }
  } catch (error) {
    console.error("Failed to execute deletion operation:", error);
    alert(`Could not delete quiz: ${error.message}`);
  } finally {
    el.yesBtn.disabled = false;
    el.yesBtn.innerText = "Yes";
  }
};

init();
