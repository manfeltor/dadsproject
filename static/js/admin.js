/* admin.js — Admin dashboard */
console.log("✅ admin.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", e => {
      e.preventDefault();
      if (confirm("Logout from admin?")) {
        window.location.href = "/";
      }
    });
  }
});
