/* user_list.js — sorting for Users Administration table */

console.log("✅ user_list.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("usersTable");
  if (!table) return;

  const tbody = table.querySelector("tbody");
  const headers = table.querySelectorAll("th[data-field]");

  let currentSort = { field: null, direction: 1 }; // 1 asc, -1 desc

  headers.forEach(header => {
    header.addEventListener("click", () => {
      const field = header.dataset.field;

      // toggle direction if same column
      if (currentSort.field === field) {
        currentSort.direction *= -1;
      } else {
        currentSort.field = field;
        currentSort.direction = 1;
      }

      // reset indicators
      headers.forEach(h => h.querySelector(".sort-indicator").textContent = "");
      header.querySelector(".sort-indicator").textContent =
        currentSort.direction === 1 ? "▲" : "▼";

      const rows = Array.from(tbody.querySelectorAll("tr"));

      const sorted = rows.sort((a, b) => {
        const aVal = a.children[header.cellIndex].innerText.trim().toLowerCase();
        const bVal = b.children[header.cellIndex].innerText.trim().toLowerCase();

        const bothNumeric = !isNaN(aVal) && !isNaN(bVal);
        if (bothNumeric) {
          return (Number(aVal) - Number(bVal)) * currentSort.direction;
        }

        return aVal.localeCompare(bVal) * currentSort.direction;
      });

      tbody.innerHTML = "";
      sorted.forEach(row => tbody.appendChild(row));
    });
  });
});
