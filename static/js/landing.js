/* landing.js — Page-specific logic for storefront landing page
   Depends on main.js already loaded from base.html
   Contains ONLY the required e-commerce functionality.
*/

console.log("✅ landing.js loaded");

/* ---------------------- Product Data ---------------------- */
const products = [
  {
    id: "c1",
    name: "House Blend 340g",
    price: 12.5,
    category: "Coffee",
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?q=80&w=800&auto=format&fit=crop",
    description: "Balanced medium roast. Notes of chocolate & almond. 340g bag."
  },
  {
    id: "c2",
    name: "Single Origin Ethiopia 250g",
    price: 16.0,
    category: "Coffee",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=800&auto=format&fit=crop",
    description: "Bright and floral single-origin. Light roast, 250g."
  },
  {
    id: "s1",
    name: "Chocolate Almond Bar",
    price: 3.25,
    category: "Snack",
    image: "https://images.unsplash.com/photo-1589712232433-0a0b0c9a57f4?q=80&w=800&auto=format&fit=crop",
    description: "Crunchy almonds with dark chocolate."
  },
  {
    id: "s2",
    name: "Blueberry Muffin",
    price: 2.75,
    category: "Snack",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop",
    description: "Freshly baked muffin with blueberries."
  },
  {
    id: "b1",
    name: "Cold Brew Bottle 500ml",
    price: 4.5,
    category: "Beverage",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop",
    description: "Ready-to-drink cold brew."
  }
];


/* ---------------------- State & Storage ---------------------- */
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


/* ---------------------- DOM Elements ---------------------- */
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


/* ---------------------- Category Buttons ---------------------- */
function renderCategories() {
  const categories = ["All", ...new Set(products.map(p => p.category))];
  categoriesEl.innerHTML = "";

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = cat;
    btn.dataset.cat = cat;

    if (cat === "All") btn.classList.add("primary");

    btn.addEventListener("click", () => {
      [...categoriesEl.children].forEach(b => b.classList.remove("primary"));
      btn.classList.add("primary");
      applyFilters();
    });

    categoriesEl.appendChild(btn);
  });
}

let currentCategory = "All";


/* ---------------------- Product Rendering & Filters ---------------------- */
function getFilteredProducts() {
  const q = searchInput.value.trim().toLowerCase();

  let list = products.filter(p => {
    const matchesCat = currentCategory === "All" || p.category === currentCategory;
    const matchesQuery =
      !q || (p.name + " " + p.description).toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  const sort = sortSelect.value;
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

  return list;
}

function applyFilters() {
  const activeBtn = [...categoriesEl.children].find(b =>
    b.classList.contains("primary")
  );
  currentCategory = activeBtn ? activeBtn.dataset.cat : "All";
  renderProducts();
}

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


/* ---------------------- Cart Logic ---------------------- */
function addToCart(id, qty = 1) {
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
  cartItemsEl.innerHTML = "";

  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = itemCount;

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
        </div>
      `;

      cartItemsEl.appendChild(el);
    });
  }

  const { subtotal, shipping, total } = cartTotals();
  subtotalEl.textContent = formatMoney(subtotal);
  shippingEl.textContent = formatMoney(shipping);
  totalEl.textContent = formatMoney(total);

  cartItemsEl.querySelectorAll("button").forEach(btn => {
    const id = btn.dataset.id;
    const action = btn.dataset.action;

    btn.addEventListener("click", () => {
      if (action === "remove") removeFromCart(id);
      if (action === "dec") {
        const cur = cart.find(c => c.id === id);
        updateQty(id, (cur?.qty || 1) - 1);
      }
      if (action === "inc") {
        const cur = cart.find(c => c.id === id);
        updateQty(id, (cur?.qty || 0) + 1);
      }
    });
  });
}


/* ---------------------- Checkout Summary ---------------------- */
function renderOrderSummary() {
  if (!orderSummaryEl) return;

  const { subtotal, shipping, total } = cartTotals();
  let html = `<h4>Items</h4>`;

  if (cart.length === 0) {
    html += "<p>(cart is empty)</p>";
  } else {
    html += `<ul style="padding-left:18px">`;
    cart.forEach(i => {
      const p = findProduct(i.id);
      if (!p) return;
      html += `<li>${i.qty} × ${p.name} — ${formatMoney(p.price * i.qty)}</li>`;
    });
    html += `</ul>`;
  }

  html += `
    <div style="margin-top:10px">
      <div><strong>Subtotal:</strong> ${formatMoney(subtotal)}</div>
      <div><strong>Shipping:</strong> ${formatMoney(shipping)}</div>
      <div style="margin-top:6px"><strong>Total:</strong> ${formatMoney(total)}</div>
    </div>
  `;

  orderSummaryEl.innerHTML = html;
}


/* ---------------------- Quick View Modal ---------------------- */
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
    </div>
  `;

  productModal.classList.remove("hidden");

  document.getElementById("pvAdd").addEventListener("click", () => {
    addToCart(id, 1);
    productModal.classList.add("hidden");
  });

  document.getElementById("pvClose").addEventListener("click", () =>
    productModal.classList.add("hidden")
  );
}

closeProductModal.addEventListener("click", () =>
  productModal.classList.add("hidden")
);


/* ---------------------- UI Events (Page-specific) ---------------------- */
cartButton.addEventListener("click", () =>
  cartSidebar.classList.add("open")
);

closeCartBtn.addEventListener("click", () =>
  cartSidebar.classList.remove("open")
);

checkoutBtn.addEventListener("click", () => {
  renderOrderSummary();
  checkoutModal.classList.remove("hidden");
});

closeCheckout.addEventListener("click", () =>
  checkoutModal.classList.add("hidden")
);

searchInput.addEventListener("input", () => renderProducts());
sortSelect.addEventListener("change", () => renderProducts());

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (!action) return;

  if (action === "add") addToCart(id);
  if (action === "quick") openProductModal(id);
});


/* ---------------------- Checkout Submission ---------------------- */
if (checkoutForm) {
  checkoutForm.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const nameInput = checkoutForm.querySelector("#name");

    if (!nameInput) {
      alert("You need an account to place an order.");
      window.location.href = "/contact/";
      return;
    }

    const form = new FormData(checkoutForm);
    const order = {
      id: "ORD-" + Date.now().toString(36).toUpperCase(),
      name: form.get("name"),
      email: form.get("email"),
      address: form.get("address"),
      items: cart.map(i => ({ id: i.id, qty: i.qty })),
      totals: cartTotals(),
      placedAt: new Date().toISOString()
    };

    console.log("Simulated order:", order);
    alert(`Order placed! ${order.id}`);

    cart = [];
    saveCart();
    renderCart();
    checkoutModal.classList.add("hidden");
    checkoutForm.reset();
  });
}


/* ---------------------- Initialization ---------------------- */
function initLanding() {
  renderCategories();
  renderProducts();
  renderCart();
}

initLanding();
