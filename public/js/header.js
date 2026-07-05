// SIDEBAR OPEN ANIMATION
function showSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.style.display = "flex";
  // Small delay ensures the browser registers the display change
  // before applying the transform animation
  setTimeout(() => {
    sidebar.style.transform = "translateX(0)";
  }, 10);
}

// SIDEBAR CLOSE ANIMATION
function closeSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.style.transform = "translateX(100%)";
  // Wait for CSS transition to finish before hiding completely
  setTimeout(() => {
    sidebar.style.display = "none";
  }, 300);
}
