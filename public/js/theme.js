// THEME TOGGLE ELEMENTS
const toggle = document.getElementById("theme-toggle");
const icon = toggle.querySelector("i");

// INITIAL THEME LOAD
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  icon.classList.replace("fa-moon", "fa-sun");
}

// THEME TOGGLE HANDLER
toggle.addEventListener("click", () => {
  // Toggle dark mode class on body
  document.body.classList.toggle("dark-mode");

  // Check current theme state
  const isDark = document.body.classList.contains("dark-mode");

  localStorage.setItem("theme", isDark ? "dark" : "light");

  // Update icon state dynamically
  icon.classList.toggle("fa-moon", !isDark);
  icon.classList.toggle("fa-sun", isDark);
});
