/* users.js — Users admin table */
console.log("👥 users.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("usersTable");
  if (!table) return;
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const tbody = table.querySelector("tbody");
  const headers = table.querySelectorAll("th[data-field]");
  let currentSort = { field: null, direction: 1 };

  headers.forEach(header => {
    header.addEventListener("click", () => {
      const field = header.dataset.field;
      if (currentSort.field === field) currentSort.direction *= -1;
      else { currentSort.field = field; currentSort.direction = 1; }

      headers.forEach(h => h.querySelector(".sort-indicator").textContent = "");
      header.querySelector(".sort-indicator").textContent = currentSort.direction === 1 ? "▲" : "▼";

      const rows = Array.from(tbody.querySelectorAll("tr"));
      const sorted = rows.sort((a,b)=>{
        const aVal = a.children[header.cellIndex].innerText.trim().toLowerCase();
        const bVal = b.children[header.cellIndex].innerText.trim().toLowerCase();
        if (!isNaN(aVal) && !isNaN(bVal)) return (Number(aVal)-Number(bVal))*currentSort.direction;
        return aVal.localeCompare(bVal)*currentSort.direction;
      });

      tbody.innerHTML = "";
      sorted.forEach(r => tbody.appendChild(r));
    });
  });
});
