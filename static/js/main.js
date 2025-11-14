/* main.js — shared logic for all pages */
console.log("✅ main.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  /* ---- Dynamic Year ---- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Generic modal close on ESC / backdrop ---- */
  document.querySelectorAll(".modal").forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal").forEach(m => m.classList.add("hidden"));
    }
  });

  /* ---- Hamburger / user dropdown ---- */
  const menuBtn = document.getElementById("userMenuBtn");
  const menuDropdown = document.getElementById("menuDropdown");
  if (menuBtn && menuDropdown) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menuDropdown.classList.toggle("hidden");
    });
    document.addEventListener("click", (e) => {
      if (!menuDropdown.classList.contains("hidden") && !menuBtn.contains(e.target)) {
        menuDropdown.classList.add("hidden");
      }
    });
  }

  /* ---- Login modal ---- */
  const loginBtn = document.getElementById("loginButton");
  const loginModal = document.getElementById("loginModal");
  const closeLogin = document.getElementById("closeLogin");
  if (loginBtn && loginModal) {
    loginBtn.addEventListener("click", () => loginModal.classList.remove("hidden"));
  }
  if (closeLogin && loginModal) {
    closeLogin.addEventListener("click", () => loginModal.classList.add("hidden"));
  }

  /* ---- Logout confirmation ---- */
  document.addEventListener("click", (e) => {
    const logoutLink = e.target.closest("a.logout");
    if (!logoutLink) return;
    e.preventDefault();
    if (confirm("Are you sure you want to log out?")) {
      const logoutForm = document.getElementById("logoutForm");
      if (logoutForm) logoutForm.submit();
    }
  });
});
