let score = 0;

function show(page) {
  // 1. Fetch DOM elements for both form panels
  const signInPanel = document.getElementById("panel-signin");
  const signUpPanel = document.getElementById("panel-signup");

  // 2. Fetch DOM elements for the top header tab selectors
  const signInTab = document.getElementById("tab-signin");
  const signUpTab = document.getElementById("tab-signup");

  if (page === "signin") {
    // Toggle active layout classes on the main panels
    signUpPanel.classList.remove("active");
    signInPanel.classList.add("active");

    // Toggle purple underline state styles on the headers
    signUpTab.classList.remove("active");
    signInTab.classList.add("active");
  } else {
    // Toggle active layout classes on the main panels
    signInPanel.classList.remove("active");
    signUpPanel.classList.add("active");

    // Toggle purple underline state styles on the headers
    signInTab.classList.remove("active");
    signUpTab.classList.add("active");
  }
}

function setupPasswordToggle(inputFieldId, eyeOpenId, eyeClosedId) {
  const field = document.getElementById(inputFieldId);
  const eyeOpen = document.getElementById(eyeOpenId);
  const eyeClose = document.getElementById(eyeClosedId);

  eyeClose.addEventListener("click", () => {
    eyeClose.style.display = "none";
    eyeOpen.style.display = "block";
    field.type = "text";
  });

  eyeOpen.addEventListener("click", () => {
    eyeClose.style.display = "block";
    eyeOpen.style.display = "none";
    field.type = "password";
  });
}

// Initialize all three toggle systems safely once the page loads
document.addEventListener("DOMContentLoaded", () => {
  // 1. Monitor Login Password
  setupPasswordToggle("signin-pw", "eye-open-signin", "eye-closed-signin");

  // 2. Monitor Signup Password
  setupPasswordToggle("signup-pw", "eye-open-signup", "eye-closed-signup");

  // 3. Monitor Signup Confirm Password
  setupPasswordToggle("confirm-pw", "eye-open-confirm", "eye-closed-confirm");

  const signupForm = document.getElementById("signup-form");

  if (signupForm) {
    signupForm.addEventListener("submit", (event) => {
      const flashSignup = document.getElementById("flash-signup");
      const passwordField = document.getElementById("signup-pw");
      const confirmField = document.getElementById("confirm-pw");

      // Safety check: verify elements exist so the script doesn't crash
      if (!flashSignup || !passwordField || !confirmField) return;

      const password = passwordField.value;
      const confirmPassword = confirmField.value;

      // 1. STRENGTH CHECK: Block if score is too low or password is under 8 chars
      if (score < 3) {
        event.preventDefault(); // CRITICAL: Tells the browser to freeze form submission!

        flashSignup.innerHTML =
          "<div class='alert alert-danger' style='color: #e06c6c; margin-bottom: 15px; font-weight: bold; padding: 10px; background: rgba(224,108,108,0.1); border-radius: 4px;'>" +
          "Password is too weak! Please include mixed cases, numbers, or symbols." +
          "</div>";

        flashSignup.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return; // Exit out of the function
      }

      // 2. MISMATCH CHECK: Block if passwords don't match
      if (password !== confirmPassword) {
        event.preventDefault(); // Freeze submission again

        flashSignup.innerHTML =
          "<div class='alert alert-danger' style='color: #e06c6c; margin-bottom: 15px; font-weight: bold; padding: 10px; background: rgba(224,108,108,0.1); border-radius: 4px;'>" +
          "Passwords do not match!" +
          "</div>";

        flashSignup.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
      }

      // If code reaches this point without calling event.preventDefault(),
      // the browser naturally submits the data to app.js
    });
  }
});

function strength(password) {
  // 1. Gather reference links to the 4 visual DOM bars
  const b1 = document.getElementById("b1");
  const b2 = document.getElementById("b2");
  const b3 = document.getElementById("b3");
  const b4 = document.getElementById("b4");
  const bars = [b1, b2, b3, b4];

  // 2. Baseline Reset: Revert all bars to an empty translucent state if field is empty
  bars.forEach((bar) => {
    if (bar) bar.style.background = "rgba(0, 0, 0, 0.05)";
  });

  if (!password) return;

  // 3. Evaluation Engine: Check string complexity constraints
  score = 0;

  if (password.length >= 6) score++; // Basic length check
  if (password.length >= 10) score++; // Strong length bonus
  if (/[A-Z]/.test(password)) score++; // Contains uppercase characters
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++; // Contains numbers or symbols

  // 4. Color Mapping Dictionary Array (Weak -> Strong)
  const colors = [
    "#e06c6c", // 1 Bar: Weak (Soft Red)
    "#ffb266", // 2 Bars: Fair (Orange)
    "#ffdb4d", // 3 Bars: Good (Yellow)
    "#6cc48a", // 4 Bars: Strong (Green)
  ];

  // Choose the feedback hue matching the score rank
  const targetColor = colors[score - 1] || "#e06c6c";

  // 5. Render States: Paint the corresponding bars up to the score limit
  for (let i = 0; i < score; i++) {
    if (bars[i]) {
      bars[i].style.background = targetColor;
    }
  }
}

function validateSignupForm() {
  const flashSignup = document.getElementById("flash-signup");

  if (score < 3) {
    flashSignup.innerHTML =
      "<div class='alert alert-danger'  style='color: red; margin-bottom: 15px;'>Password is too weak! Please include mixed cases, numbers, or symbols.</div>";
    return false;
  }
  return true;
}
