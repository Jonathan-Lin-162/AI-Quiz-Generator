// GLOBAL VARIABLES
// Stores the current password strength score (0–4)
let score = 0;

// DOM SELECTORS
// Form panels
const signInPanel = document.getElementById("panel-signin");
const signUpPanel = document.getElementById("panel-signup");
// Header tabs
const signInTab = document.getElementById("tab-signin");
const signUpTab = document.getElementById("tab-signup");

// Password strength indicator bars
const bars = [
  document.getElementById("b1"),
  document.getElementById("b2"),
  document.getElementById("b3"),
  document.getElementById("b4"),
];

// PASSWORD STRENGTH COLORS
const colors = [
  "#e06c6c", // 1 Bar: Weak (Soft Red)
  "#ffb266", // 2 Bars: Fair (Orange)
  "#ffdb4d", // 3 Bars: Good (Yellow)
  "#6cc48a", // 4 Bars: Strong (Green)
];

// PAGE SWITCHING
// Toggle between Sign In and Sign Up panels
function show(page) {
  if (page === "signin") {
    // Activate Sign In panel
    signUpPanel.classList.remove("active");
    signInPanel.classList.add("active");

    // Update tab styles
    signUpTab.classList.remove("active");
    signInTab.classList.add("active");
  } else {
    // Activate Sign Up panel
    signInPanel.classList.remove("active");
    signUpPanel.classList.add("active");

    // Update tab styles
    signInTab.classList.remove("active");
    signUpTab.classList.add("active");
  }
}

// PASSWORD VISIBILITY TOGGLE
// Reusable helper for show/hide password buttons
function setupPasswordToggle(inputFieldId, eyeOpenId, eyeClosedId) {
  const field = document.getElementById(inputFieldId);
  const eyeOpen = document.getElementById(eyeOpenId);
  const eyeClose = document.getElementById(eyeClosedId);

  // Show password
  eyeClose.addEventListener("click", () => {
    field.type = "text";
    eyeClose.style.display = "none";
    eyeOpen.style.display = "block";
  });

  // Hide password
  eyeOpen.addEventListener("click", () => {
    field.type = "password";
    eyeClose.style.display = "block";
    eyeOpen.style.display = "none";
  });
}

// PASSWORD STRENGTH CHECKER
// Evaluate password complexity and update UI bars
function strength(password) {
  // Reset all bars to their default appearance
  bars.forEach((bar) => {
    if (bar) bar.style.background = "rgba(0, 0, 0, 0.05)";
  });

  // Exit early if password field is empty
  if (!password) return;

  score = 0;

  // Strength rules
  if (password.length >= 6) score++; // Basic length check
  if (password.length >= 10) score++; // Strong length bonus
  if (/[A-Z]/.test(password)) score++; // Contains uppercase characters
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++; // Contains numbers or symbols

  // Determine the color corresponding to the score
  const targetColor = colors[score - 1] || "#e06c6c";

  // Fill the appropriate number of bars
  for (let i = 0; i < score; i++) {
    if (bars[i]) {
      bars[i].style.background = targetColor;
    }
  }
}

// ERROR MESSAGE DISPLAY
// Show validation errors above the signup form
function showSignupError(message) {
  const flashSignup = document.getElementById("flash-signup");

  flashSignup.innerHTML = `
    <div
      class="alert alert-danger"
      style="
        color:#e06c6c;
        margin-bottom:15px;
        font-weight:bold;
        padding:10px;
        background:rgba(224,108,108,0.1);
        border-radius:4px;
      "
    >
      ${message}
    </div>
  `;

  // Automatically scroll to the error message
  flashSignup.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
}

// PAGE INITIALIZATION
// Run setup code after all HTML elements have loaded
document.addEventListener("DOMContentLoaded", () => {
  // PASSWORD TOGGLE SETUP
  // Login password field
  setupPasswordToggle("signin-pw", "eye-open-signin", "eye-closed-signin");

  // Signup password field
  setupPasswordToggle("signup-pw", "eye-open-signup", "eye-closed-signup");

  // Confirm password field
  setupPasswordToggle("confirm-pw", "eye-open-confirm", "eye-closed-confirm");

  const signupForm = document.getElementById("signup-form");

  // SIGNUP FORM VALIDATION
  if (signupForm) {
    signupForm.addEventListener("submit", (event) => {
      const flashSignup = document.getElementById("flash-signup");
      const passwordField = document.getElementById("signup-pw");
      const confirmField = document.getElementById("confirm-pw");

      // Prevent crashes if required elements are missing
      if (!flashSignup || !passwordField || !confirmField) return;

      const password = passwordField.value;
      const confirmPassword = confirmField.value;

      // PASSWORD STRENGTH VALIDATION
      if (score < 3) {
        // Stop form submission
        event.preventDefault();

        showSignupError(
          "Password is too weak! Please include mixed cases, numbers, or symbols.",
        );
        return;
      }

      // PASSWORD MATCH VALIDATION
      if (password !== confirmPassword) {
        // Stop form submission
        event.preventDefault();

        showSignupError("Passwords do not match!");
        return;
      }

      // If execution reaches here, the form submits normally
    });
  }
});
