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
});
