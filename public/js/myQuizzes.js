const results = window.results;
const cardBox = document.getElementById("card-box");
const message = document.getElementById("message");
const confirmBtn = document.getElementById("confirm-btn");
const cancelBtn = document.getElementById("cancel-btn");
const overlayEditBox = document.getElementById("overlay-edit");
const quizName = document.getElementById("quiz-name");
const warningText = document.getElementById("warning-text");
const overlayDeleteBox = document.getElementById("overlay-delete");
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");

let activeCardElement = null;
let activeQuizData = null;
let activeQuizIndex = null;

if (!results || !results.quizzes || results.quizzes.length === 0) {
  message.innerHTML = `
  You haven't saved any quizzes yet!
  <div class="create-btn-container">
    <form action="/create" method="GET">
        <button class="create-btn"> Create One</button>
    </form>
</div>`;
} else {
  message.innerText = "";

  results.quizzes.forEach((q, idx) => {
    createQuizCard(q, idx);
  });
}

// Helper function to build a card and cleanly bind its up-to-date index references
function createQuizCard(q, idx) {
  const quizCard = document.createElement("div");
  quizCard.className = "quizCard";

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
        <button class="edit-btn">Edit Name</button>
        <button class="delete-btn">Delete</button>
      </div>
    </div>
  `;

  quizCard.querySelector(".quizTitle").textContent = q.title;
  cardBox.appendChild(quizCard);

  // Bind the index dynamically to the click navigation link
  quizCard.onclick = () => {
    window.location.href = `/renderQuiz?id=${idx}&source=db`;
  };

  const editBtn = quizCard.querySelector(".edit-btn");
  const deleteBtn = quizCard.querySelector(".delete-btn");

  editBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    activeCardElement = quizCard;
    activeQuizData = q;
    activeQuizIndex = idx;
    warningText.innerHTML = "";
    quizName.value = q.title;
    overlayEditBox.classList.add("show");
  };

  deleteBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    activeCardElement = quizCard;
    activeQuizIndex = idx;
    overlayDeleteBox.classList.add("show");
  };

  // Attach the current valid array index straight onto the HTML element wrapper object
  quizCard.dataset.currentIndex = idx;
}

// Function to realign all frontend elements to match MongoDB indexes perfectly after a deletion
function recalculateCardIndexes() {
  const remainingCards = cardBox.querySelectorAll(".quizCard");

  remainingCards.forEach((card, newIdx) => {
    card.dataset.currentIndex = newIdx;

    // Update main card redirect click reference
    card.onclick = () => {
      window.location.href = `/renderQuiz?id=${newIdx}&source=db`;
    };

    // Re-bind the click events to pass the corrected index position to our global variables
    const editBtn = card.querySelector(".edit-btn");
    const deleteBtn = card.querySelector(".delete-btn");

    editBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      activeCardElement = card;
      activeQuizIndex = newIdx;
      // Re-fetch correct data object out of state if edited multiple times
      if (results && results.quizzes) activeQuizData = results.quizzes[newIdx];
      warningText.innerHTML = "";
      quizName.value = card.querySelector(".quizTitle").textContent;
      overlayEditBox.classList.add("show");
    };

    deleteBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      activeCardElement = card;
      activeQuizIndex = newIdx;
      overlayDeleteBox.classList.add("show");
    };
  });
}

cancelBtn.onclick = () => {
  overlayEditBox.classList.remove("show");
};

confirmBtn.onclick = async (e) => {
  e.preventDefault();
  const title = quizName.value.trim();
  if (title.length === 0) {
    warningText.innerHTML = `Please give a new name for the quiz!`;
    return;
  }

  if (activeQuizData && title === activeQuizData.title) {
    warningText.innerHTML = `Please choose a different name from the current one!`;
    return;
  }

  confirmBtn.disabled = true;
  confirmBtn.innerText = "Saving...";

  const payload = {
    title: title,
    quizIndex: activeQuizIndex,
  };

  try {
    const res = await fetch("/editingQuizName", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      overlayEditBox.classList.remove("show");
      if (activeCardElement && activeQuizData) {
        activeCardElement.querySelector(".quizTitle").textContent = title;
        activeQuizData.title = title;
      }
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

noBtn.onclick = () => {
  overlayDeleteBox.classList.remove("show");
};

yesBtn.onclick = async () => {
  yesBtn.disabled = true;
  yesBtn.innerText = "Deleting...";
  try {
    const res = await fetch("/deletingQuiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizIndex: activeQuizIndex }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      activeCardElement.style.transition = "all 0.3s ease";
      activeCardElement.style.opacity = "0";
      activeCardElement.style.transform = "scale(0.9)";
      overlayDeleteBox.classList.remove("show");

      setTimeout(() => {
        activeCardElement.remove();

        // 1. Keep frontend local array data aligned with MongoDB's array length modifications
        if (results && results.quizzes) {
          results.quizzes.splice(activeQuizIndex, 1);
        }

        // 2. FIXED: Re-index remaining elements to prevent multi-delete mismatches
        recalculateCardIndexes();

        // 3. Fallback empty state handler check
        if (cardBox.children.length === 1) {
          message.innerHTML = `
                  You haven't saved any quizzes yet!
                  <div class="create-btn-container">
                    <form action="/create" method="GET">
                      <button class="create-btn"> Create One</button>
                    </form>
                  </div>`;
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
    yesBtn.disabled = false;
    yesBtn.innerText = "Yes";
  }
};
