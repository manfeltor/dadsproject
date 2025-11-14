/* shop.js — Storefront logic */
console.log("🛍️ shop.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const productGrid = document.getElementById("productGrid");
  const cartButton = document.getElementById("cartButton");
  const cartSidebar = document.getElementById("cartSidebar");
  const closeCartBtn = document.getElementById("closeCart");
  const cartItemsEl = document.getElementById("cartItems");
  const cartCountEl = document.getElementById("cartCount");
  const subtotalEl = document.getElementById("subtotal");
  const shippingEl = document.getElementById("shipping");
  const totalEl = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const checkoutModal = document.getElementById("checkoutModal");
  const closeCheckout = document.getElementById("closeCheckout");
  const checkoutForm = document.getElementById("checkoutForm");
  const orderSummaryEl = document.getElementById("orderSummary");
  const searchInput = document.getElementById("searchInput");
  const sortSelect = document.getElementById("sortSelect");
  const categoriesEl = document.getElementById("categories");
  const productModal = document.getElementById("productModal");
  const productModalBody = document.getElementById("productModalBody");
  const closeProductModal = document.getElementById("closeProductModal");

  if (!productGrid) return; // safety: only run on shop pages

  /* ------------ Data ------------ */
  const products = [
    { id: "c1", name: "House Blend 340g", price: 12.5, category: "Coffee", image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop", description: "Balanced medium roast. Notes of chocolate & almond. 340g bag." },
    { id: "c2", name: "Single Origin Ethiopia 250g", price: 16.0, category: "Coffee", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop", description: "Bright and floral single-origin. Light roast, 250g." },
    { id: "s1", name: "Chocolate Almond Bar", price: 3.25, category: "Snack", image: "https://images.unsplash.com/photo-1589712232433-0a0b0c9a57f4?q=80&w=800&auto=format&fit=crop", description: "Crunchy almonds with dark chocolate." },
    { id: "s2", name: "Blueberry Muffin", price: 2.75, category: "Snack", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop", description: "Freshly baked muffin with blueberries." },
    { id: "b1", name: "Cold Brew Bottle 500ml", price: 4.5, category: "Beverage", image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop", description: "Ready-to-drink cold brew." }
  ];

  /* ------------ Cart ------------ */
  const storageKey = "bb_cart";
  let cart = JSON.parse(localStorage.getItem(storageKey) || "[]");

  function saveCart() {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }

  function formatMoney(n) {
    return `$${n.toFixed(2)}`;
  }

  function findProduct(id) {
    return products.find(p => p.id === id);
  }

  /* ------------ Category rendering ------------ */
  function renderCategories() {
    const cats = ["All", ...Array.from(new Set(products.map(p => p.category)))];
    categoriesEl.innerHTML = "";
    cats.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.textContent = cat;
      btn.dataset.cat = cat;
      if (cat === "All") btn.classList.add("primary");
      btn.addEventListener("click", () => {
        Array.from(categoriesEl.children).forEach(c => c.classList.remove("primary"));
        btn.classList.add("primary");
        applyFilters();
      });
      categoriesEl.appendChild(btn);
    });
  }

  let currentCategory = "All";

  function getFilteredProducts() {
    const q = searchInput.value.trim().toLowerCase();
    let list = products.filter(p => {
      const matchesCat = currentCategory === "All" || p.category === currentCategory;
      const matchesQuery = !q || (p.name + " " + p.description).toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });

    const sort = sortSelect.value;
    if (sort === "price-asc") list.sort((a,b)=>a.price-b.price);
    if (sort === "price-desc") list.sort((a,b)=>b.price-a.price);
    if (sort === "name-asc") list.sort((a,b)=>a.name.localeCompare(b.name));
    return list;
  }

  function applyFilters(){
    const activeBtn = Array.from(categoriesEl.children).find(b => b.classList.contains("primary"));
    currentCategory = activeBtn ? activeBtn.dataset.cat : "All";
    renderProducts();
  }

  /* ------------ Render products ------------ */
  function renderProducts() {
    const list = getFilteredProducts();
    productGrid.innerHTML = "";
    if (list.length === 0) {
      productGrid.innerHTML = `<p style="grid-column:1/-1;color:var(--muted)">No products found.</p>`;
      return;
    }

    list.forEach(p => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.image}" alt="${p.name}" loading="lazy" />
        <div class="card-body">
          <h4>${p.name}</h4>
          <p class="muted">${p.description}</p>
          <div class="meta">
            <div><strong>${formatMoney(p.price)}</strong></div>
            <div style="display:flex;gap:8px;align-items:center">
              <button class="btn" data-id="${p.id}" data-action="quick">View</button>
              <button class="btn primary" data-id="${p.id}" data-action="add">Add</button>
            </div>
          </div>
        </div>
      `;
      productGrid.appendChild(card);
    });
  }

  /* ------------ Cart functions ------------ */
  function addToCart(id, qty=1) {
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty += qty;
    else cart.push({ id, qty });
    saveCart();
    renderCart();
  }

  function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
  }

  function updateQty(id, qty) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(0, qty);
    if (item.qty === 0) removeFromCart(id);
    saveCart();
    renderCart();
  }

  function cartTotals() {
    const subtotal = cart.reduce((sum, item) => {
      const p = findProduct(item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
    const shipping = subtotal === 0 ? 0 : subtotal >= 30 ? 0 : 4.5;
    const total = subtotal + shipping;
    return { subtotal, shipping, total };
  }

  function renderCart() {
    const totalCount = cart.reduce((s,i)=>s+i.qty,0);
    cartCountEl.textContent = totalCount;
    cartItemsEl.innerHTML = "";

    if (cart.length === 0) {
      cartItemsEl.innerHTML = `<p style="color:var(--muted)">Your cart is empty.</p>`;
    } else {
      cart.forEach(i => {
        const p = findProduct(i.id);
        if (!p) return;
        const el = document.createElement("div");
        el.className = "cart-item";
        el.innerHTML = `
          <img src="${p.image}" alt="${p.name}" />
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <div>
                <strong>${p.name}</strong>
                <div style="color:var(--muted);font-size:.9rem">${formatMoney(p.price)} ea</div>
              </div>
              <div style="text-align:right">
                <div style="font-weight:600">${formatMoney(p.price * i.qty)}</div>
                <button class="btn" data-id="${p.id}" data-action="remove">Remove</button>
              </div>
            </div>
            <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
              <div class="qty-control">
                <button class="btn" data-id="${p.id}" data-action="dec">−</button>
                <div style="min-width:28px;text-align:center">${i.qty}</div>
                <button class="btn" data-id="${p.id}" data-action="inc">+</button>
              </div>
            </div>
          </div>`;
        cartItemsEl.appendChild(el);
      });
    }

    const {subtotal, shipping, total} = cartTotals();
    subtotalEl.textContent = formatMoney(subtotal);
    shippingEl.textContent = formatMoney(shipping);
    totalEl.textContent = formatMoney(total);

    cartItemsEl.querySelectorAll("button").forEach(btn=>{
      const id = btn.dataset.id;
      const action = btn.dataset.action;
      btn.addEventListener("click", ()=>{
        if (action === "remove") removeFromCart(id);
        if (action === "dec") updateQty(id, (cart.find(c=>c.id===id)?.qty || 1) - 1);
        if (action === "inc") updateQty(id, (cart.find(c=>c.id===id)?.qty || 0) + 1);
      });
    });
  }

  /* ------------ Event wiring ------------ */
  if (cartButton) cartButton.addEventListener("click", ()=>cartSidebar.classList.add("open"));
  if (closeCartBtn) closeCartBtn.addEventListener("click", ()=>cartSidebar.classList.remove("open"));
  if (checkoutBtn) checkoutBtn.addEventListener("click", ()=>{ renderOrderSummary(); checkoutModal.classList.remove("hidden"); });
  if (closeCheckout) closeCheckout.addEventListener("click", ()=>checkoutModal.classList.add("hidden"));
  if (searchInput) searchInput.addEventListener("input", ()=>renderProducts());
  if (sortSelect) sortSelect.addEventListener("change", ()=>renderProducts());

  document.addEventListener("click", (e)=>{
    const btn = e.target.closest("button");
    if (!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (!action) return;
    if (action === "add") addToCart(id, 1);
    else if (action === "quick") openProductModal(id);
  });

  /* ------------ Checkout ------------ */
  function renderOrderSummary() {
    if (!orderSummaryEl) return;
    const {subtotal, shipping, total} = cartTotals();
    let html = `<h4>Items</h4>`;
    if (cart.length === 0) html += "<p>(cart is empty)</p>";
    else {
      html += `<ul style="padding-left:18px">`;
      cart.forEach(i=>{
        const p = findProduct(i.id);
        if (!p) return;
        html += `<li>${i.qty} × ${p.name} — ${formatMoney(p.price * i.qty)}</li>`;
      });
      html += `</ul>`;
    }
    html += `<div style="margin-top:10px">
      <div><strong>Subtotal:</strong> ${formatMoney(subtotal)}</div>
      <div><strong>Shipping:</strong> ${formatMoney(shipping)}</div>
      <div style="margin-top:6px"><strong>Total:</strong> ${formatMoney(total)}</div>
    </div>`;
    orderSummaryEl.innerHTML = html;
  }

  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const nameInput = checkoutForm.querySelector("#name");
      if (!nameInput) {
        alert("You need an account to place an order. Please request one first.");
        window.location.href = "/contact/";
        return;
      }
      alert("✅ Order placed! (Simulated)");
      cart = [];
      saveCart();
      renderCart();
      checkoutModal.classList.add("hidden");
    });
  }

  /* ------------ Quick view modal ------------ */
  function openProductModal(id) {
    const p = findProduct(id);
    if (!p) return;
    productModalBody.innerHTML = `
      <div style="display:grid;grid-template-columns:200px 1fr;gap:16px;align-items:start">
        <img src="${p.image}" alt="${p.name}" style="width:100%;border-radius:8px;object-fit:cover" />
        <div>
          <h3>${p.name}</h3>
          <p style="color:var(--muted)">${p.description}</p>
          <p style="font-weight:700;margin-top:8px">${formatMoney(p.price)}</p>
          <div style="margin-top:12px;display:flex;gap:8px">
            <button class="btn primary" id="pvAdd">Add to cart</button>
            <button class="btn" id="pvClose">Close</button>
          </div>
        </div>
      </div>`;
    productModal.classList.remove("hidden");
    document.getElementById("pvAdd").addEventListener("click", ()=>{
      addToCart(id, 1);
      productModal.classList.add("hidden");
    });
    document.getElementById("pvClose").addEventListener("click", ()=>productModal.classList.add("hidden"));
  }

  if (closeProductModal) closeProductModal.addEventListener("click", ()=>productModal.classList.add("hidden"));

  /* ------------ Init ------------ */
  function init() {
    renderCategories();
    renderProducts();
    renderCart();
  }
  init();
});
