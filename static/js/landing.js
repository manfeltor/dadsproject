/* landing.js — Storefront logic (API-based product loading)
   Features:
   - Loads products from /api/products/ with pagination
   - Filters: search, rubro (via buttons), category (dropdown), sort
   - Cart in localStorage
   - Product quick view modal
   - Checkout modal (logged-in vs guest)
*/

/* CSRF helper */
function getCSRFToken() {
  const name = "csrftoken=";
  const decoded = decodeURIComponent(document.cookie);
  const parts = decoded.split(";");
  for (let p of parts) {
    let c = p.trim();
    if (c.startsWith(name)) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}


/* ---------- Config: API endpoint & page size ---------- */

const API_URL = "/api/products/"; // adjust to your actual endpoint

// Expected JSON response shape (example):
// {
//   "results": [
//      {
//        "id": 1,
//        "name": "House Blend 340g",
//        "price": 12.5,
//        "short_description": "Balanced medium roast...",
//        "long_description": "Optional detailed text",
//        "image": "https://... or /media/..."
//      },
//      ...
//   ],
//   "page": 1,
//   "total_pages": 3,
//   "rubros": [
//      {"id": 1, "name": "Coffee", "slug": "coffee"},
//      {"id": 2, "name": "Snacks", "slug": "snacks"}
//   ],
//   "categories": [
//      {"id": 10, "name": "Whole Beans", "slug": "whole-beans", "rubro_id": 1},
//      ...
//   ]
// }

/* ---------- Simple helpers ---------- */

function formatMoney(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function debounce(fn, delay = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

/* ---------- State ---------- */

const storageKey = "bb_cart";

let cart = JSON.parse(localStorage.getItem(storageKey) || "[]");

const urlParams = new URLSearchParams(window.location.search);

let state = {
  products: [],
  page: Number(urlParams.get("page")) || 1,
  totalPages: 1,
  search: urlParams.get("search") || "",
  rubro: urlParams.get("rubro") || "",      // rubro slug
  category: urlParams.get("category") || "",// category slug
  sort: urlParams.get("sort") || "default",
  rubros: [],
  categories: [], // all categories; we filter client-side per rubro
  isLoading: false
};

/* ---------- DOM Elements ---------- */

const productGrid = document.getElementById("productGrid");
const categoriesBar = document.getElementById("categories");
const categoryFilter = document.getElementById("categoryFilter");
const paginationEl = document.getElementById("pagination");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

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

const productModal = document.getElementById("productModal");
const productModalBody = document.getElementById("productModalBody");
const closeProductModal = document.getElementById("closeProductModal");

/* ---------- URL sync ---------- */

function syncURL() {
  const params = new URLSearchParams();
  if (state.search) params.set("search", state.search);
  if (state.rubro) params.set("rubro", state.rubro);
  if (state.category) params.set("category", state.category);
  if (state.sort && state.sort !== "default") params.set("sort", state.sort);
  if (state.page && state.page !== 1) params.set("page", state.page);

  const qs = params.toString();
  const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState({}, "", newUrl);
}

/* ---------- Cart persistence ---------- */

function saveCart() {
  localStorage.setItem(storageKey, JSON.stringify(cart));
}

/* ---------- Cart calculations & rendering ---------- */

function cartTotals() {
  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item.price || 0);
    return sum + price * item.qty;
  }, 0);
  const shipping = subtotal === 0 ? 0 : subtotal >= 30 ? 0 : 4.5;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

function renderCart() {
  const totalCount = cart.reduce((s, i) => s + i.qty, 0);
  cartCountEl.textContent = totalCount;

  cartItemsEl.innerHTML = "";

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p style="color:var(--muted)">Your cart is empty.</p>`;
  } else {
    cart.forEach(item => {
      const el = document.createElement("div");
      el.className = "cart-item";
      el.innerHTML = `
        <img src="${item.image || ""}" alt="${item.name}" />
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <div>
              <strong>${item.name}</strong>
              <div style="color:var(--muted);font-size:.9rem">${formatMoney(item.price)} ea</div>
            </div>
            <div style="text-align:right">
              <div style="font-weight:600">${formatMoney(item.price * item.qty)}</div>
              <button class="btn" data-id="${item.id}" data-action="remove">Remove</button>
            </div>
          </div>

          <div style="margin-top:8px;display:flex;gap:8px;align-items:center">
            <div class="qty-control">
              <button class="btn" data-id="${item.id}" data-action="dec">−</button>
              <div style="min-width:28px;text-align:center">${item.qty}</div>
              <button class="btn" data-id="${item.id}" data-action="inc">+</button>
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

  // button handlers in cart
  cartItemsEl.querySelectorAll("button").forEach(btn => {
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    btn.addEventListener("click", () => {
      if (action === "remove") removeFromCart(id);
      if (action === "dec") {
        const cur = cart.find(c => String(c.id) === String(id));
        updateQty(id, (cur?.qty || 1) - 1);
      }
      if (action === "inc") {
        const cur = cart.find(c => String(c.id) === String(id));
        updateQty(id, (cur?.qty || 0) + 1);
      }
    });
  });
}

function addToCart(product, qty = 1) {
  if (!product) return;
  const id = product.id;
  const existing = cart.find(i => String(i.id) === String(id));
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      id,
      qty,
      name: product.name,
      price: product.price,
      image: product.image,
      short_description: product.short_description
    });
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => String(i.id) !== String(id));
  saveCart();
  renderCart();
}

function updateQty(id, qty) {
  const item = cart.find(i => String(i.id) === String(id));
  if (!item) return;
  item.qty = Math.max(0, qty);
  if (item.qty === 0) {
    removeFromCart(id);
  } else {
    saveCart();
    renderCart();
  }
}

/* ---------- Product rendering & filters ---------- */

function renderRubros() {
  if (!categoriesBar) return;
  categoriesBar.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.className = "btn";
  allBtn.textContent = "All";
  allBtn.dataset.rubro = "";
  if (!state.rubro) allBtn.classList.add("primary");
  allBtn.addEventListener("click", () => {
    state.rubro = "";
    state.category = "";
    state.page = 1;
    syncURL();
    fetchProducts();
  });
  categoriesBar.appendChild(allBtn);

  state.rubros.forEach(r => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = r.name;
    btn.dataset.rubro = r.slug;
    if (state.rubro === r.slug) btn.classList.add("primary");
    btn.addEventListener("click", () => {
      state.rubro = r.slug;
      state.category = "";
      state.page = 1;
      syncURL();
      fetchProducts();
    });
    categoriesBar.appendChild(btn);
  });
}

function renderCategoryFilter() {
  if (!categoryFilter) return;

  if (!state.rubro) {
    categoryFilter.disabled = true;
    categoryFilter.innerHTML = `<option value="">All</option>`;
    return;
  }

  // find rubro id by slug
  const currentRubro = state.rubros.find(r => r.slug === state.rubro);
  if (!currentRubro) {
    categoryFilter.disabled = true;
    categoryFilter.innerHTML = `<option value="">All</option>`;
    return;
  }

  const relevantCats = state.categories.filter(
    c => String(c.rubro_id) === String(currentRubro.id)
  );

  categoryFilter.disabled = false;
  categoryFilter.innerHTML = `<option value="">All</option>`;
  relevantCats.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat.slug;
    opt.textContent = cat.name;
    if (state.category === cat.slug) opt.selected = true;
    categoryFilter.appendChild(opt);
  });
}

/* Products grid */

function renderProducts() {
  if (!productGrid) return;

  if (state.isLoading) {
    productGrid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:20px;">
        Loading products...
      </div>`;
    return;
  }

  if (!state.products.length) {
    productGrid.innerHTML = `
      <p style="grid-column:1/-1;color:var(--muted);padding:20px;">
        No products found.
      </p>`;
    return;
  }

productGrid.innerHTML = "";

state.products.forEach(p => {
  const card = document.createElement("article");
  card.className = "card";

  const desc = p.short_description || p.long_description || "";

  const hasDiscount = p.original_price > p.price;
  const discountPercent = hasDiscount
    ? Math.round(((p.original_price - p.price) / p.original_price) * 100)
    : 0;

  card.innerHTML = `
    <img src="${p.image || ""}" alt="${p.name}" loading="lazy" />
    <div class="card-body">
      <h4>${p.name}</h4>
      <p class="muted">${desc}</p>

      <div class="meta">
        <div>
          ${
            hasDiscount
              ? `
                <div style="display:flex;flex-direction:column;">
                  <span style="font-weight:700;color:var(--accent);">
                    ${formatMoney(p.price)}
                  </span>
                  <span style="text-decoration:line-through;color:var(--muted);font-size:.85rem;">
                    ${formatMoney(p.original_price)}
                  </span>
                  <span style="color:var(--accent);font-size:.85rem;">
                    -${discountPercent}% 
                  </span>
                </div>
              `
              : `<strong>${formatMoney(p.price)}</strong>`
          }
        </div>

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

/* ---------- Pagination ---------- */

function renderPagination() {
  if (!paginationEl) return;

  if (state.totalPages <= 1) {
    paginationEl.innerHTML = "";
    return;
  }

  const page = state.page;
  const total = state.totalPages;

  let html = `<div class="pagination-inner">`;

  if (page > 1) {
    html += `<button class="btn" data-page="${page - 1}">« Prev</button>`;
  }

  // Simple page numbers (limit to ~7 buttons)
  const maxButtons = 7;
  let start = Math.max(1, page - 3);
  let end = Math.min(total, start + maxButtons - 1);
  if (end - start + 1 < maxButtons) {
    start = Math.max(1, end - maxButtons + 1);
  }

  for (let p = start; p <= end; p++) {
    html += `<button class="btn ${p === page ? "primary" : ""}" data-page="${p}">${p}</button>`;
  }

  if (page < total) {
    html += `<button class="btn" data-page="${page + 1}">Next »</button>`;
  }

  html += `</div>`;

  paginationEl.innerHTML = html;

  paginationEl.querySelectorAll("button[data-page]").forEach(btn => {
    btn.addEventListener("click", () => {
      const newPage = Number(btn.dataset.page);
      if (newPage === state.page) return;
      state.page = newPage;
      syncURL();
      fetchProducts();
    });
  });
}

/* ---------- Product modal (quick view) ---------- */

function openProductModal(productId) {
  const product = state.products.find(p => String(p.id) === String(productId));
  if (!product || !productModalBody || !productModal) return;

  const desc = product.long_description || product.short_description || "";

  // ---- Discount logic ----
  const hasDiscount = product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const priceHtml = hasDiscount
    ? `
        <div style="display:flex;flex-direction:column;margin-top:8px;">
          <span style="font-weight:700;color:var(--accent);">
            ${formatMoney(product.price)}
          </span>
          <span style="text-decoration:line-through;color:var(--muted);font-size:.9rem;">
            ${formatMoney(product.original_price)}
          </span>
          <span style="color:var(--accent);font-size:.9rem;">
            -${discountPercent}% ${product.discount_name ? `(${product.discount_name})` : ""}
          </span>
        </div>
      `
    : `
        <p style="font-weight:700;margin-top:8px">
          ${formatMoney(product.price)}
        </p>
      `;

  // ---- Modal HTML ----
  productModalBody.innerHTML = `
    <div style="display:grid;grid-template-columns:200px 1fr;gap:16px;align-items:start">
      <img src="${product.image || ""}" alt="${product.name}"
           style="width:100%;border-radius:8px;object-fit:cover" />

      <div>
        <h3>${product.name}</h3>
        <p style="color:var(--muted)">${desc}</p>

        ${priceHtml}

        <div style="margin-top:12px;display:flex;gap:8px">
          <button class="btn primary" id="pvAdd">Add to cart</button>
          <button class="btn" id="pvClose">Close</button>
        </div>
      </div>
    </div>
  `;

  // ---- Show modal ----
  productModal.classList.remove("hidden");

  // ---- Button bindings ----
  const addBtn = document.getElementById("pvAdd");
  const closeBtn = document.getElementById("pvClose");

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addToCart(product, 1);
      productModal.classList.add("hidden");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      productModal.classList.add("hidden");
    });
  }
}

if (closeProductModal && productModal) {
  closeProductModal.addEventListener("click", () =>
    productModal.classList.add("hidden")
  );
}

/* ---------- Checkout ---------- */

function renderOrderSummary() {
  if (!orderSummaryEl) return;

  const { subtotal, shipping, total } = cartTotals();
  let html = `<h4>Items</h4>`;

  if (cart.length === 0) {
    html += "<p>(cart is empty)</p>";
  } else {
    html += `<ul style="padding-left:18px">`;
    cart.forEach(i => {
      html += `<li>${i.qty} × ${i.name} — ${formatMoney(i.price * i.qty)}</li>`;
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

/* -------------------- REAL CHECKOUT API INTEGRATION -------------------- */

if (checkoutForm) {
  const deliveryMethodInput = document.getElementById("delivery_method");
  const addressRow = document.getElementById("addressRow");
  const addressInput = document.getElementById("address");
  const phoneInput = document.getElementById("phone");
  const noteInput = document.getElementById("note");

  // 🚦 Toggle address field based on delivery method
  if (deliveryMethodInput && addressRow) {
    const toggleAddress = () => {
      if (deliveryMethodInput.value === "delivery") {
        addressRow.style.display = "block";
        addressInput.required = true;
      } else {
        addressRow.style.display = "none";
        addressInput.required = false;
      }
    };
    toggleAddress();
    deliveryMethodInput.addEventListener("change", toggleAddress);
  }

  checkoutForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();

    if (!cart.length) {
      alert("Your cart is empty.");
      return;
    }

    const nameEl = checkoutForm.querySelector("#name");
    const emailEl = checkoutForm.querySelector("#email");

    if (!nameEl || !emailEl) {
      alert("You must be logged in to place an order.");
      return;
    }

    // 🛠 Build payload for backend API
    const payload = {
      delivery_method: deliveryMethodInput.value,
      customer_name: nameEl.value.trim(),
      customer_email: emailEl.value.trim(),
      customer_address: addressInput.value.trim(),
      customer_phone: phoneInput.value.trim(),
      note: noteInput.value.trim(),
      items: cart.map(i => ({
        product_id: i.id,
        quantity: i.qty
      }))
    };

    // 🧪 Client-side validation
    if (!payload.customer_name || !payload.customer_email) {
      alert("Name and email are required.");
      return;
    }
    if (payload.delivery_method === "delivery" && !payload.customer_address) {
      alert("Address is required for delivery.");
      return;
    }

    // 🚀 Call the backend API
    try {
      const res = await fetch("/api/checkout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "X-CSRFToken": getCSRFToken(),   // <-- ADD THIS
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error processing your order.");
        return;
      }

      // 🎉 SUCCESS — Show success modal
      const successModal = document.getElementById("orderSuccessModal");
      const successMsg = document.getElementById("orderSuccessMessage");

      if (successMsg) {
        successMsg.textContent = `Your order #${data.order_id} has been placed successfully!`;
      }

      if (successModal) {
        successModal.classList.remove("hidden");
      }

      // Clear cart
      cart = [];
      saveCart();
      renderCart();

      // Close modal
      checkoutModal.classList.add("hidden");
      checkoutForm.reset();

      // Optional: redirect to "order complete" page later
      // window.location.href = `/order/${data.order_id}/`;

    } catch (err) {
      console.error(err);
      alert("Unexpected error. Please try again.");
    }
  });
}


/* ---------- Global UI events ---------- */

if (cartButton && cartSidebar) {
  cartButton.addEventListener("click", () => cartSidebar.classList.add("open"));
}
if (closeCartBtn && cartSidebar) {
  closeCartBtn.addEventListener("click", () => cartSidebar.classList.remove("open"));
}
if (checkoutBtn && checkoutModal) {
  checkoutBtn.addEventListener("click", () => {
    renderOrderSummary();
    checkoutModal.classList.remove("hidden");
  });
}
if (closeCheckout && checkoutModal) {
  closeCheckout.addEventListener("click", () =>
    checkoutModal.classList.add("hidden")
  );
}

/* Search + sort + category filter */

if (searchInput) {
  searchInput.value = state.search;
  const onSearch = debounce(() => {
    state.search = searchInput.value.trim();
    state.page = 1;
    syncURL();
    fetchProducts();
  }, 400);
  searchInput.addEventListener("input", onSearch);
}

if (sortSelect) {
  sortSelect.value = state.sort;
  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    state.page = 1;
    syncURL();
    fetchProducts();
  });
}

if (categoryFilter) {
  categoryFilter.addEventListener("change", () => {
    state.category = categoryFilter.value;
    state.page = 1;
    syncURL();
    fetchProducts();
  });
}

/* Delegate product grid actions: add / quick */

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (!action || !id) return;

  const product = state.products.find(p => String(p.id) === String(id));
  if (!product) return;

  if (action === "add") {
    addToCart(product, 1);
  } else if (action === "quick") {
    openProductModal(id);
  }
});

/* ---------- Data loading from API ---------- */

async function fetchProducts() {
  try {
    state.isLoading = true;
    renderProducts(); // show loading state

    const params = new URLSearchParams();
    params.set("page", state.page);
    params.set("page_size", 40); // limit per page
    if (state.search) params.set("search", state.search);
    if (state.rubro) params.set("rubro", state.rubro);
    if (state.category) params.set("category", state.category);
    if (state.sort && state.sort !== "default") params.set("sort", state.sort);

    const res = await fetch(`${API_URL}?${params.toString()}`, {
      headers: { "Accept": "application/json" }
    });

    if (!res.ok) {
      throw new Error("Failed loading products");
    }

    const data = await res.json();

    state.products = data.results || [];
    state.page = data.page || 1;
    state.totalPages = data.total_pages || 1;
    if (data.rubros) state.rubros = data.rubros;
    if (data.categories) state.categories = data.categories;

    state.isLoading = false;

    renderRubros();
    renderCategoryFilter();
    renderProducts();
    renderPagination();
  } catch (err) {
    console.error(err);
    state.isLoading = false;
    if (productGrid) {
      productGrid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:20px;">
          Error loading products. Please try again later.
        </div>`;
    }
  }
}

/* ---------- Order Success Modal Handlers ---------- */

const orderSuccessModal = document.getElementById("orderSuccessModal");
const closeOrderSuccess = document.getElementById("closeOrderSuccess");
const orderSuccessOk = document.getElementById("orderSuccessOk");

if (closeOrderSuccess && orderSuccessModal) {
  closeOrderSuccess.addEventListener("click", () => {
    orderSuccessModal.classList.add("hidden");
  });
}

if (orderSuccessOk && orderSuccessModal) {
  orderSuccessOk.addEventListener("click", () => {
    orderSuccessModal.classList.add("hidden");
  });
}

// Optional: close on clicking the backdrop
if (orderSuccessModal) {
  orderSuccessModal.addEventListener("click", (e) => {
    if (e.target === orderSuccessModal) {
      orderSuccessModal.classList.add("hidden");
    }
  });
}


/* ---------- Init ---------- */

function initLanding() {
  renderCart();
  fetchProducts();
}

initLanding();
