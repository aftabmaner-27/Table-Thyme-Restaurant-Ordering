(function () {
  "use strict";

  const STORE_KEY = "tableThymeDemo_v1";
  const ADMIN_AUTH_KEY = "tableThymeAdminAuthenticated";
  const ADMIN_USERNAME = "amadmin";
  const ADMIN_PASSWORD = "amadmin27";
  const TAX_RATE = 0.05;
  const CATEGORIES = ["All", "Starters", "Main Course", "Indian Food", "Chinese", "Pizza", "Burgers", "Beverages", "Desserts", "Special Offers"];
  const image = (id, w) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w || 700}&q=80`;
  const isAdminPage = /(?:^|\/)admin\.html$/i.test(location.pathname);
  const seed = {
    restaurant: { name: "Table & Thyme", tableId: 5 },
    tables: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, name: String(i + 1).padStart(2, "0"), seats: i < 4 ? 2 : 4, status: i === 4 ? "Occupied" : i === 8 ? "Reserved" : "Available" })),
    menu: [
      { id: 101, name: "Truffle Parmesan Fries", category: "Starters", description: "Crispy hand-cut fries, parmesan, herbs and truffle aioli.", price: 8.5, type: "Veg", available: true, image: image("photo-1573080496219-bb080dd4f877"), variants: [{ name: "Regular", price: 0 }, { name: "Large", price: 3 }], extras: [{ name: "Truffle aioli", price: 1.5 }, { name: "Extra parmesan", price: 1 }] },
      { id: 102, name: "Burrata & Heirloom Tomato", category: "Starters", description: "Creamy burrata, seasonal tomatoes, basil oil and sourdough.", price: 13, type: "Veg", available: true, image: image("photo-1608039829572-78524f79c4c7"), variants: [], extras: [{ name: "Sourdough toast", price: 2 }] },
      { id: 103, name: "Wild Mushroom Risotto", category: "Main Course", description: "Slow-stirred arborio rice, wild mushrooms and aged parmesan.", price: 19, type: "Veg", available: true, image: image("photo-1476124369491-e7addf5db371"), variants: [{ name: "Regular", price: 0 }, { name: "Large", price: 5 }], extras: [{ name: "Extra parmesan", price: 1.5 }, { name: "Grilled chicken", price: 4 }] },
      { id: 104, name: "Butter Chicken", category: "Indian Food", description: "Tandoor chicken in a silky tomato and cashew curry.", price: 18, type: "Non-Veg", available: true, image: image("photo-1603894584373-5ac82b2ae398"), variants: [], extras: [{ name: "Garlic naan", price: 3 }, { name: "Extra cheese", price: 1.5 }] },
      { id: 105, name: "Chilli Garlic Noodles", category: "Chinese", description: "Wok-tossed noodles with seasonal vegetables and chilli.", price: 14, type: "Veg", available: true, image: image("photo-1585032226651-759b368d7246"), variants: [{ name: "Regular", price: 0 }, { name: "Large", price: 4 }], extras: [{ name: "Tofu", price: 3 }, { name: "Extra chilli", price: 0.5 }] },
      { id: 106, name: "Margherita Pizza", category: "Pizza", description: "San Marzano tomato, fior di latte and fresh basil.", price: 16, type: "Veg", available: true, image: image("photo-1574071318508-1cdbab80d002"), variants: [{ name: "10 inch", price: 0 }, { name: "14 inch", price: 6 }], extras: [{ name: "Extra cheese", price: 2 }, { name: "Olives", price: 1 }] },
      { id: 107, name: "Smash House Burger", category: "Burgers", description: "Double smashed beef, sharp cheddar, pickles and house sauce.", price: 17, type: "Non-Veg", available: true, image: image("photo-1568901346375-23c9450c58cd"), variants: [], extras: [{ name: "Bacon", price: 3 }, { name: "Extra cheese", price: 1.5 }] },
      { id: 108, name: "Mango Lassi", category: "Beverages", description: "Chilled yoghurt drink blended with ripe Alphonso mango.", price: 6, type: "Veg", available: true, image: image("photo-1551024709-8f23befc6f87"), variants: [{ name: "Regular", price: 0 }, { name: "Large", price: 2 }], extras: [] },
      { id: 109, name: "Basque Cheesecake", category: "Desserts", description: "Burnt-top vanilla cheesecake with a soft, creamy centre.", price: 9, type: "Veg", available: true, image: image("photo-1508737027454-e6454ef45afd"), variants: [], extras: [{ name: "Berry compote", price: 2 }, { name: "Vanilla ice cream", price: 2.5 }] },
      { id: 110, name: "Date Night Set", category: "Special Offers", description: "Two mains, a shared starter and two house lemonades.", price: 42, type: "Veg", available: true, image: image("photo-1547592180-85f173990554"), variants: [], extras: [{ name: "Add dessert for two", price: 8 }] }
    ],
    orders: [],
    cart: [],
    customer: { name: "", phone: "" },
    discount: 0
  };
  let state = loadState();
  let page = isAdminPage ? (isAdminAuthenticated() ? "dashboard" : "admin-login") : "menu";
  let category = "All";
  let search = "";
  let menuAdminCategory = "All categories";
  let orderFilter = "All";
  let selectedOrderId = null;
  let modalCleanup = null;

  function isAdminAuthenticated() {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
  }
  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY));
      if (!saved || !Array.isArray(saved.menu) || !Array.isArray(saved.tables)) return structuredClone(seed);
      return Object.assign(structuredClone(seed), saved);
    } catch (error) {
      console.error("Could not load saved restaurant data.", error);
      return structuredClone(seed);
    }
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
    catch (error) { console.error("Could not save restaurant data.", error); toast("Could not save your changes. Check browser storage.", true); }
  }
  const money = n => `$${Number(n || 0).toFixed(2)}`;
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeImage = src => esc(src || image("photo-1547592180-85f173990554"));
  const byId = id => document.getElementById(id);
  const cartQty = () => state.cart.reduce((n, item) => n + item.quantity, 0);
  const getTable = id => state.tables.find(t => Number(t.id) === Number(id));
  const currentTable = () => getTable(state.restaurant.tableId) || state.tables[0];
  const statusClass = status => `status status-${String(status || "").toLowerCase().replace(/\s+/g, "-")}`;
  const addOnsTotal = item => (item.extras || []).reduce((n, x) => n + x.price, 0);
  const lineTotal = item => (item.price + addOnsTotal(item)) * item.quantity;
  const cartSubtotal = () => state.cart.reduce((n, item) => n + lineTotal(item), 0);
  const cartTax = () => cartSubtotal() * TAX_RATE;
  const cartDiscount = () => cartSubtotal() * (Number(state.discount || 0) / 100);
  const cartTotal = () => Math.max(0, cartSubtotal() + cartTax() - cartDiscount());

  function toast(message, error) {
    const node = document.createElement("div");
    node.className = `toast${error ? " error" : ""}`;
    node.textContent = message;
    byId("toast-root").appendChild(node);
    setTimeout(() => node.remove(), 3000);
  }
  function navigate(next, hash) {
    if (isAdminPage && next !== "admin-login" && !isAdminAuthenticated()) next = "admin-login";
    page = next;
    if (hash !== false) history.replaceState(null, "", `#${next}`);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function updateHeader() {
    const table = currentTable();
    byId("header-table").textContent = `Table ${table ? table.name : "—"}`;
    byId("cart-count").textContent = cartQty();
    const logout = byId("admin-logout");
    if (logout) logout.classList.toggle("hidden", !isAdminAuthenticated());
    document.querySelectorAll(".nav-link[data-page]").forEach(button => button.classList.toggle("active", button.dataset.page === page));
  }
  function render() {
    updateHeader();
    const root = byId("app");
    if (isAdminPage && !isAdminAuthenticated() && page !== "admin-login") page = "admin-login";
    if (page === "admin-login") root.innerHTML = renderAdminLogin();
    else if (page === "menu") root.innerHTML = renderMenu();
    else if (page === "cart") root.innerHTML = renderCart();
    else if (page === "checkout") root.innerHTML = renderCheckout();
    else if (page === "tracking") root.innerHTML = renderTracking();
    else if (["dashboard", "tables", "menu-admin", "orders", "billing"].includes(page)) root.innerHTML = renderAdmin();
    else root.innerHTML = renderMenu();
    if (page === "tables" || ["dashboard", "tables"].includes(page)) setTimeout(() => window.RestaurantQR && window.RestaurantQR.renderAll(), 0);
  }

  function renderAdminLogin() {
    return `<section class="admin-login"><div class="card panel"><div class="admin-login-mark">T<span>&</span></div><span class="eyebrow">Table & Thyme / Admin</span><h1>Welcome back</h1><p class="muted">Sign in to manage your restaurant.</p><form id="admin-login-form"><div class="field"><label for="admin-username">Username</label><input id="admin-username" name="username" autocomplete="username" required autofocus></div><div class="field"><label for="admin-password">Password</label><input id="admin-password" name="password" type="password" autocomplete="current-password" required></div><p id="admin-login-error" class="admin-login-error hidden" role="alert">Incorrect username or password.</p><button class="btn btn-primary btn-block" type="submit">Sign in</button></form></div></section>`;
  }

  function renderMenu() {
    const filtered = state.menu.filter(item => item.available && (category === "All" || item.category === category) && (!search || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(search.toLowerCase())));
    return `<section class="hero"><div class="hero-content"><span class="eyebrow">A little something delicious</span><h1>Good food.<br>Better together.</h1><p>Seasonal plates, familiar favourites and a table waiting just for you.</p><button class="btn btn-primary" data-scroll-menu>Explore the menu <span>↓</span></button>    <div class="hero-meta"><span>✦ Fresh, locally sourced</span><span>◷ 20–30 min</span><span>⌖ Table ${esc(currentTable()?.name || "—")}</span></div><button class="btn btn-plain btn-sm" data-scan-qr style="margin-top:16px">▦ Scan table QR</button></div></section>
      <div class="section-heading"><div><span class="eyebrow">Made with care</span><h2 class="section-title">Find your favourite</h2><p>Browse the menu and make it your own.</p></div><div class="search-field"><span class="search-icon">⌕</span><input id="menu-search" value="${esc(search)}" placeholder="Search dishes..." aria-label="Search menu"></div></div>
      <div class="category-row">${CATEGORIES.map(c => `<button class="category-pill${category === c ? " active" : ""}" data-category="${esc(c)}">${esc(c)}</button>`).join("")}</div>
      <div class="food-grid">${filtered.length ? filtered.map(renderFoodCard).join("") : `<div class="card empty-state" style="grid-column:1/-1"><div class="empty-icon">🍽️</div><h3>No dishes found</h3><p>Try a different search or category.</p></div>`}</div>
      <div class="notice-strip">✦ <span>Everything is prepared fresh. Let us know about allergies or dietary requirements when you order.</span></div>`;
  }
  function renderFoodCard(item) {
    const inCart = state.cart.find(x => x.menuId === item.id);
    return `<article class="card food-card"><div class="food-image-wrap"><img class="food-image" src="${safeImage(item.image)}" alt="${esc(item.name)}" loading="lazy"><span class="food-tag ${item.type === "Non-Veg" ? "nonveg" : ""}"><span class="veg-icon"></span>${esc(item.type)}</span></div><div class="food-info"><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><div class="food-bottom"><span class="price">${money(item.price)} <small> · ${esc(item.category)}</small></span>${inCart ? `<div class="quantity-control"><button data-quick-qty="${inCart.key}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${inCart.quantity}</span><button data-quick-qty="${inCart.key}" data-delta="1" aria-label="Increase quantity">+</button></div>` : `<button class="btn btn-primary btn-sm" data-customize="${item.id}">＋ Add</button>`}</div></div></article>`;
  }

  function renderCart() {
    if (!state.cart.length) return `<section class="card empty-state"><div class="empty-icon">🛍️</div><h2>Your table is waiting</h2><p>Your cart is empty. Find something delicious on the menu.</p><button class="btn btn-primary" data-page="menu">Browse the menu</button></section>`;
    return `<div class="section-heading"><div><span class="eyebrow">Your selection</span><h1 style="font-size:35px">Your order</h1><p>Everything is made fresh, just for you.</p></div><button class="btn btn-plain" data-page="menu">← Back to menu</button></div><div class="columns"><section class="card panel"><div class="section-heading"><h2 class="section-title">Your items <span class="muted small">(${cartQty()})</span></h2></div>${state.cart.map(renderCartLine).join("")}<button class="text-button" data-clear-cart>Clear cart</button></section><aside class="card panel"><h3>Order summary</h3>${renderTotals()}<div class="field" style="margin-top:18px"><label for="discount-code">Promo code</label><div style="display:flex;gap:7px"><input id="discount-code" placeholder="Try THYME10" style="min-width:0;flex:1;border:1px solid var(--line);border-radius:9px;padding:10px"><button class="btn btn-light btn-sm" data-apply-discount>Apply</button></div></div><button class="btn btn-primary btn-block" data-page="checkout">Continue to checkout →</button><p class="muted small" style="text-align:center;margin:12px 0 0">Taxes calculated at checkout.</p></aside></div>`;
  }
  function renderCartLine(item) {
    return `<div class="cart-line"><img class="cart-thumb" src="${safeImage(item.image)}" alt=""><div><h3>${esc(item.name)}</h3><div class="muted">${esc(item.variant || "Regular")}${item.extras.length ? ` · ${item.extras.map(x => esc(x.name)).join(", ")}` : ""}${item.spice ? ` · ${esc(item.spice)}` : ""}${item.notes ? `<br>Note: ${esc(item.notes)}` : ""}</div><div class="quantity-control" style="margin-top:10px"><button data-cart-qty="${item.key}" data-delta="-1">−</button><span>${item.quantity}</span><button data-cart-qty="${item.key}" data-delta="1">+</button><button class="text-button" data-remove="${item.key}">Remove</button></div></div><div class="cart-line-side"><span class="cart-total">${money(lineTotal(item))}</span><button class="text-button" data-edit-item="${item.key}">Edit</button></div></div>`;
  }
  function renderTotals(order) {
    const sub = order ? order.subtotal : cartSubtotal();
    const tax = order ? order.tax : cartTax();
    const discount = order ? order.discount : cartDiscount();
    const total = order ? order.total : cartTotal();
    return `<div class="summary-row"><span>Subtotal</span><strong>${money(sub)}</strong></div><div class="summary-row"><span>GST (${Math.round(TAX_RATE * 100)}%)</span><strong>${money(tax)}</strong></div>${discount ? `<div class="summary-row discount"><span>Discount</span><strong>−${money(discount)}</strong></div>` : ""}<div class="summary-row total"><span>Total</span><strong>${money(total)}</strong></div>`;
  }
  function renderCheckout() {
    if (!state.cart.length) return `<section class="card empty-state"><h2>Nothing to check out yet</h2><button class="btn btn-primary" data-page="menu">Browse menu</button></section>`;
    const table = currentTable();
    return `<div class="section-heading"><div><span class="eyebrow">Almost there</span><h1 style="font-size:35px">Checkout</h1><p>Review your details and send your order to the kitchen.</p></div></div><form id="checkout-form" class="columns"><section class="card panel"><h2 class="section-title" style="margin-bottom:18px">Your details</h2><div class="field-grid"><div class="field"><label for="customer-name">Your name *</label><input id="customer-name" name="name" required minlength="2" value="${esc(state.customer.name)}" placeholder="e.g. Alex Morgan"></div><div class="field"><label for="customer-phone">Mobile number *</label><input id="customer-phone" name="phone" required pattern="[\\d \\+\\(\\)\\-]{7,18}" value="${esc(state.customer.phone)}" placeholder="+1 555 010 1234"></div></div><div class="field"><label for="table-select">Table number *</label><select id="table-select" name="tableId" required>${state.tables.map(t => `<option value="${t.id}" ${t.id === Number(state.restaurant.tableId) ? "selected" : ""}>Table ${esc(t.name)} · ${t.seats} seats</option>`).join("")}</select></div><div class="field"><label for="order-notes">Anything else for the kitchen?</label><textarea id="order-notes" name="notes" placeholder="Allergies, special requests..."></textarea></div><div class="field"><label>Payment method</label><div class="radio-options"><label class="radio-card"><input type="radio" name="payment" value="Pay at Table" checked><span>Pay at Table<small>We’ll bring the bill when you’re ready.</small></span></label><label class="radio-card"><input type="radio" name="payment" value="Cash at Counter"><span>Cash at Counter<small>Settle your bill at the counter.</small></span></label><label class="radio-card"><input type="radio" name="payment" value="Online Payment"><span>Online payment<small>Demo only — no real payment will be taken.</small></span></label></div></div></section><aside class="card panel"><h3>Order summary</h3>${state.cart.map(i => `<div class="summary-row"><span>${i.quantity} × ${esc(i.name)}</span><strong>${money(lineTotal(i))}</strong></div>`).join("")}<div style="border-top:1px solid var(--line);margin:14px 0">${renderTotals()}</div><button class="btn btn-primary btn-block" type="submit">Place order · ${money(cartTotal())}</button><p class="muted small" style="text-align:center;margin:12px 0 0">By placing your order you agree to our house rules.</p></aside></form>`;
  }
  function renderTracking(orderId) {
    const order = orderId ? state.orders.find(o => o.id === orderId) : state.orders.slice().reverse().find(o => o.customer.phone === state.customer.phone) || state.orders[state.orders.length - 1];
    if (!order) return `<section class="card empty-state"><div class="empty-icon">⏱️</div><h2>No active order yet</h2><p>Your order progress will show here as soon as you place one.</p><button class="btn btn-primary" data-page="menu">Explore the menu</button></section>`;
    const statuses = ["Order Placed", "Order Accepted", "Preparing", "Ready to Serve", "Served"];
    const current = Math.max(0, statuses.indexOf(order.status));
    const active = order.status !== "Rejected";
    return `<div class="tracking-layout"><div class="order-banner"><span class="eyebrow" style="color:#fff">Thanks for ordering with us</span><h2>We’re on it, ${esc(order.customer.name)}!</h2><div class="muted">Order <strong>#${esc(order.number)}</strong> · Table ${esc(order.tableName)} · ${new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div></div><section class="card panel" style="margin-bottom:18px"><div class="section-heading"><div><span class="eyebrow">Live order updates</span><h2 class="section-title">${order.status === "Rejected" ? "Order couldn't be accepted" : esc(order.status)}</h2></div><span class="${statusClass(order.status)}">${esc(order.status)}</span></div>${order.status === "Rejected" ? `<div class="inline-note">Please speak to a member of our team for assistance.</div>` : `<div class="tracking-steps">${statuses.map((s, i) => `<div class="step ${active && i < current ? "done" : ""} ${active && i === current ? "current" : ""}"><div class="step-dot">${i < current ? "✓" : i + 1}</div>${s.replace("Order ", "")}</div>`).join("")}</div>`}<p class="muted small">${order.status === "Served" ? "Enjoy your meal!" : `Estimated preparation time: ${order.estimate} minutes. We’ll update your status as your meal progresses.`}</p></section><section class="card panel"><h3>Order summary</h3>${order.items.map(i => `<div class="summary-row"><span>${i.quantity} × ${esc(i.name)} <small class="muted">${i.extras.length ? ` · ${i.extras.map(x => esc(x.name)).join(", ")}` : ""}</small></span><strong>${money(lineTotal(i))}</strong></div>`).join("")}<div style="border-top:1px solid var(--line);margin-top:12px">${renderTotals(order)}</div></section><div style="text-align:center;margin-top:20px"><button class="btn btn-plain" data-page="menu">Order something else</button></div></div>`;
  }

  const ADMIN_LINKS = [{ id: "dashboard", icon: "⌂", name: "Overview" }, { id: "orders", icon: "▤", name: "Orders" }, { id: "tables", icon: "▦", name: "Tables & QR" }, { id: "menu-admin", icon: "☷", name: "Menu" }, { id: "billing", icon: "$", name: "Billing" }];
  function renderAdmin() {
    const title = ADMIN_LINKS.find(x => x.id === page)?.name || "Overview";
    return `<div class="admin-layout"><aside class="card admin-sidebar"><div class="sidebar-label">RESTAURANT</div>${ADMIN_LINKS.map(x => `<button class="sidebar-link ${page === x.id ? "active" : ""}" data-admin-page="${x.id}"><span class="side-icon">${x.icon}</span>${x.name}</button>`).join("")}<div class="sidebar-label" style="margin-top:10px">CUSTOMER VIEW</div>${isAdminPage ? `<a class="sidebar-link" href="index.html"><span class="side-icon">↗</span>Open menu</a>` : `<button class="sidebar-link" data-page="menu"><span class="side-icon">↗</span>Open menu</button>`}</aside><section><div class="admin-header"><div><span class="eyebrow">Table & Thyme / Admin</span><h1>${title}</h1><p>${page === "dashboard" ? "Here’s what’s happening at your restaurant today." : `Manage your restaurant ${title.toLowerCase()}.`}</p></div>${page === "tables" ? `<button class="btn btn-primary" data-add-table>＋ Add table</button>` : page === "menu-admin" ? `<button class="btn btn-primary" data-add-menu>＋ Add item</button>` : ""}</div>${page === "dashboard" ? renderDashboard() : page === "tables" ? renderTables() : page === "menu-admin" ? renderMenuAdmin() : page === "orders" ? renderOrders() : renderBilling()}</section></div>`;
  }
  function renderDashboard() {
    const today = new Date().toDateString();
    const todayOrders = state.orders.filter(o => new Date(o.createdAt).toDateString() === today);
    const revenue = todayOrders.filter(o => o.paymentStatus === "Paid" || o.status === "Served").reduce((n, o) => n + o.total, 0);
    const occupied = state.tables.filter(t => t.status === "Occupied").length;
    const pending = state.orders.filter(o => ["Order Placed", "Order Accepted", "Preparing"].includes(o.status)).length;
    const stats = [["Total tables", state.tables.length, "▦", "Restaurant floor"], ["Available", state.tables.filter(t => t.status === "Available").length, "✓", "Ready for guests"], ["Occupied", occupied, "♙", "Currently dining"], ["Total orders", state.orders.length, "▤", "All time"], ["Pending orders", pending, "◷", "Need attention"], ["Today's revenue", money(revenue), "$", "Paid / served today"]];
    const recent = state.orders.slice().reverse().slice(0, 5);
    const popular = state.menu.map(m => ({ menu: m, count: state.orders.flatMap(o => o.items).filter(i => i.menuId === m.id).reduce((n, i) => n + i.quantity, 0) })).sort((a, b) => b.count - a.count).slice(0, 4);
    return `<div class="stats-grid">${stats.map(s => `<article class="card stat-card"><div class="stat-top"><span>${s[0]}</span><span class="stat-icon">${s[2]}</span></div><div class="stat-value">${s[1]}</div><div class="stat-note">${s[3]}</div></article>`).join("")}</div><div class="admin-content-grid"><section class="card table-card"><div class="section-heading"><div><h3>Recent orders</h3><p class="small muted">Latest activity</p></div><button class="text-button" data-admin-page="orders">View all →</button></div>${recent.length ? `<div class="table-wrap"><table><thead><tr><th>Order</th><th>Guest</th><th>Table</th><th>Total</th><th>Status</th></tr></thead><tbody>${recent.map(o => `<tr><td>#${esc(o.number)}</td><td>${esc(o.customer.name)}</td><td>${esc(o.tableName)}</td><td>${money(o.total)}</td><td><span class="${statusClass(o.status)}">${esc(o.status)}</span></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state" style="padding:25px"><p>No orders yet.</p></div>`}</section><section class="card table-card"><h3>Sales overview</h3><p class="small muted">Revenue by day · last 7 days</p>${renderChart()}</section><section class="card table-card" style="grid-column:1/-1"><h3>Popular dishes</h3>${popular.length ? popular.map(x => `<div class="popular-item"><img src="${safeImage(x.menu.image)}" alt=""><div><strong>${esc(x.menu.name)}</strong><small>${x.count} ordered</small></div><strong style="margin-left:auto">${money(x.menu.price)}</strong></div>`).join("") : `<p class="muted small">Menu favourites will appear here as orders come in.</p>`}</section></div>`;
  }
  function renderChart() {
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
    const values = days.map(d => state.orders.filter(o => new Date(o.createdAt).toDateString() === d.toDateString()).reduce((n, o) => n + o.total, 0));
    const max = Math.max(...values, 1);
    return `<div class="bar-chart">${days.map((d, i) => `<div class="bar-column"><div class="bar" title="${money(values[i])}" style="height:${Math.max(values[i] ? values[i] / max * 95 : 3, 3)}%"></div><span class="bar-label">${d.toLocaleDateString(undefined, { weekday: "short" })}</span></div>`).join("")}</div>`;
  }
  function renderTables() {
    return `<div class="card panel"><div class="toolbar"><div class="muted small">Manage floor plan, table status and QR codes.</div><select id="table-filter"><option>All</option><option>Available</option><option>Occupied</option><option>Reserved</option><option>Billing Pending</option></select></div><div class="table-grid">${state.tables.map(t => `<article class="card table-tile" data-table-tile="${t.id}"><div style="display:flex;justify-content:space-between"><span class="eyebrow">TABLE</span><span class="${statusClass(t.status)}">${esc(t.status)}</span></div><div class="table-number">#${esc(t.name)}</div><div class="muted small">${t.seats} seats</div><div id="qr-${t.id}" class="qr-card" style="padding:12px 0;gap:10px"><div class="qr-canvas" data-qr-for="${t.id}" data-qr-size="90"></div><div class="small muted">Scan to open menu<br>for table ${esc(t.name)}</div></div><div class="table-tile-actions"><button class="btn btn-plain btn-sm" data-edit-table="${t.id}">Edit</button><button class="btn btn-light btn-sm" data-print-qr="${t.id}">Print</button><button class="btn btn-light btn-sm" data-download-qr="${t.id}">Download</button></div><div class="table-tile-actions" style="margin-top:6px"><select aria-label="Table status" data-table-status="${t.id}" style="flex:1;border:1px solid var(--line);border-radius:8px;padding:7px;font-size:11px">${["Available", "Occupied", "Reserved", "Billing Pending"].map(s => `<option ${t.status === s ? "selected" : ""}>${s}</option>`).join("")}</select><button class="btn btn-danger btn-sm" data-delete-table="${t.id}" aria-label="Delete table">×</button></div></article>`).join("")}</div></div>`;
  }
  function renderMenuAdmin() {
    const items = state.menu.filter(m => (!search || `${m.name} ${m.category}`.toLowerCase().includes(search.toLowerCase())) && (menuAdminCategory === "All categories" || m.category === menuAdminCategory));
    return `<div class="card panel"><div class="toolbar"><div class="search-field"><span class="search-icon">⌕</span><input id="admin-menu-search" value="${esc(search)}" placeholder="Search menu items"></div><select id="admin-category-filter"><option ${menuAdminCategory === "All categories" ? "selected" : ""}>All categories</option>${CATEGORIES.slice(1).map(c => `<option ${menuAdminCategory === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select><span class="muted small">${items.length} items</span></div><div class="table-wrap"><table><thead><tr><th>Dish</th><th>Category</th><th>Price</th><th>Type</th><th>Availability</th><th>Actions</th></tr></thead><tbody>${items.map(m => `<tr><td><div style="display:flex;align-items:center;gap:9px"><img src="${safeImage(m.image)}" style="width:38px;height:38px;object-fit:cover;border-radius:8px"><strong>${esc(m.name)}</strong></div></td><td>${esc(m.category)}</td><td>${money(m.price)}</td><td>${esc(m.type)}</td><td><span class="${m.available ? "status status-available" : "status status-rejected"}">${m.available ? "Available" : "Disabled"}</span></td><td><div class="action-group"><button class="btn btn-plain btn-sm" data-edit-menu="${m.id}">Edit</button><button class="btn ${m.available ? "btn-light" : "btn-primary"} btn-sm" data-toggle-menu="${m.id}">${m.available ? "Disable" : "Enable"}</button><button class="btn btn-danger btn-sm" data-delete-menu="${m.id}">Delete</button></div></td></tr>`).join("")}</tbody></table></div></div>`;
  }
  function renderOrders() {
    const statuses = ["All", "Order Placed", "Order Accepted", "Preparing", "Ready to Serve", "Served", "Rejected"];
    const orders = state.orders.slice().reverse().filter(o => orderFilter === "All" || o.status === orderFilter);
    return `<div class="card panel"><div class="toolbar"><select id="order-filter">${statuses.map(s => `<option ${orderFilter === s ? "selected" : ""}>${s}</option>`).join("")}</select><span class="muted small">${orders.length} orders</span><button class="btn btn-plain btn-sm" style="margin-left:auto" data-print-orders>Print order list</button></div><div class="table-wrap"><table><thead><tr><th>Order</th><th>Time</th><th>Guest</th><th>Table</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead><tbody>${orders.length ? orders.map(o => `<tr><td><strong>#${esc(o.number)}</strong></td><td>${new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td><td>${esc(o.customer.name)}<br><small class="muted">${esc(o.customer.phone)}</small></td><td>${esc(o.tableName)}</td><td>${o.items.reduce((n, i) => n + i.quantity, 0)}</td><td>${money(o.total)}</td><td><span class="${statusClass(o.status)}">${esc(o.status)}</span></td><td><div class="action-group">${o.status === "Order Placed" ? `<button class="btn btn-primary btn-sm" data-order-status="${o.id}" data-status="Order Accepted">Accept</button><button class="btn btn-danger btn-sm" data-order-status="${o.id}" data-status="Rejected">Reject</button>` : `<select data-order-status-select="${o.id}" aria-label="Update status" style="border:1px solid var(--line);border-radius:8px;padding:6px;font-size:10px">${["Order Accepted", "Preparing", "Ready to Serve", "Served", "Rejected"].map(s => `<option ${o.status === s ? "selected" : ""}>${s}</option>`).join("")}</select>`}<button class="btn btn-plain btn-sm" data-view-order="${o.id}">Details</button><button class="btn btn-light btn-sm" data-receipt="${o.id}">Bill</button></div></td></tr>`).join("") : `<tr><td colspan="8" style="text-align:center;padding:30px;color:#999">No orders to show.</td></tr>`}</tbody></table></div></div>`;
  }
  function renderBilling() {
    const orders = state.orders.slice().reverse();
    return `<div class="card panel"><div class="toolbar"><div class="muted small">Review orders, collect payment and print guest bills.</div></div><div class="table-wrap"><table><thead><tr><th>Order</th><th>Guest</th><th>Table</th><th>Subtotal</th><th>GST</th><th>Total</th><th>Payment</th><th>Action</th></tr></thead><tbody>${orders.length ? orders.map(o => `<tr><td>#${esc(o.number)}</td><td>${esc(o.customer.name)}</td><td>${esc(o.tableName)}</td><td>${money(o.subtotal - o.discount)}</td><td>${money(o.tax)}</td><td><strong>${money(o.total)}</strong></td><td><span class="${o.paymentStatus === "Paid" ? "status status-paid" : "status status-pending"}">${esc(o.paymentStatus)}</span></td><td><div class="action-group">${o.paymentStatus !== "Paid" ? `<button class="btn btn-primary btn-sm" data-mark-paid="${o.id}">Mark paid</button>` : ""}<button class="btn btn-plain btn-sm" data-receipt="${o.id}">Print bill</button>${getTable(o.tableId)?.status === "Billing Pending" || getTable(o.tableId)?.status === "Occupied" ? `<button class="btn btn-light btn-sm" data-release-table="${o.id}">Release table</button>` : ""}</div></td></tr>`).join("") : `<tr><td colspan="8" style="text-align:center;padding:30px;color:#999">Bills from customer orders will appear here.</td></tr>`}</tbody></table></div></div>`;
  }

  function openModal(title, body, onReady) {
    closeModal();
    const root = byId("modal-root");
    root.innerHTML = `<div class="modal-backdrop" data-backdrop><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-header"><div><h2>${esc(title)}</h2></div><button class="close-button" data-close-modal aria-label="Close">×</button></div><div class="modal-body">${body}</div></section></div>`;
    root.querySelector("[data-backdrop]").addEventListener("click", e => { if (e.target.hasAttribute("data-backdrop")) closeModal(); });
    root.querySelector("[data-close-modal]").addEventListener("click", closeModal);
    if (onReady) onReady(root.querySelector(".modal"));
    document.addEventListener("keydown", escapeModal);
  }
  function escapeModal(e) { if (e.key === "Escape") closeModal(); }
  function closeModal() {
    byId("modal-root").innerHTML = "";
    document.removeEventListener("keydown", escapeModal);
    if (modalCleanup) { modalCleanup(); modalCleanup = null; }
  }
  function customize(itemId, cartKey) {
    const item = state.menu.find(m => m.id === Number(itemId));
    if (!item) return;
    const old = cartKey ? state.cart.find(x => x.key === cartKey) : null;
    const body = `<img class="modal-image" src="${safeImage(item.image)}" alt=""><p class="muted small">${esc(item.description)}</p><form id="custom-form"><div class="field"><label for="custom-quantity">Quantity</label><input id="custom-quantity" type="number" min="1" max="20" value="${old ? old.quantity : 1}" required></div>${item.variants?.length ? `<div class="field"><label>Choose a size / variant</label><div class="option-list">${item.variants.map((v, i) => `<label class="radio-card"><input type="radio" name="variant" value="${i}" ${old ? old.variant === v.name ? "checked" : "" : i === 0 ? "checked" : ""}><span>${esc(v.name)}</span><span>${v.price ? `+${money(v.price)}` : "Included"}</span></label>`).join("")}</div></div>` : ""}${item.extras?.length ? `<div class="field"><label>Add extras</label><div class="option-list">${item.extras.map((x, i) => `<label class="option-row"><input type="checkbox" name="extra" value="${i}" ${old?.extras.some(y => y.name === x.name) ? "checked" : ""}><span>${esc(x.name)}</span><span>+${money(x.price)}</span></label>`).join("")}</div></div>` : ""}<div class="field"><label for="spice-level">Spice level</label><select id="spice-level"><option ${old?.spice === "Mild" ? "selected" : ""}>Mild</option><option ${old?.spice === "Medium" || !old ? "selected" : ""}>Medium</option><option ${old?.spice === "Hot" ? "selected" : ""}>Hot</option></select></div><div class="field"><label for="item-notes">Special instructions</label><textarea id="item-notes" maxlength="180" placeholder="Any special requests?">${esc(old?.notes || "")}</textarea></div><button class="btn btn-primary btn-block" type="submit">${old ? "Save changes" : "Add to order"} · <span id="custom-price">${money(item.price)}</span></button></form>`;
    openModal(item.name, body, modal => {
      const form = modal.querySelector("#custom-form");
      const quantity = modal.querySelector("#custom-quantity");
      const updatePrice = () => {
        const variant = item.variants?.[Number(form.querySelector('[name="variant"]:checked')?.value || 0)];
        const extras = [...form.querySelectorAll('[name="extra"]:checked')].reduce((n, input) => n + item.extras[Number(input.value)].price, 0);
        modal.querySelector("#custom-price").textContent = money((item.price + (variant?.price || 0) + extras) * Number(quantity.value || 1));
      };
      form.addEventListener("change", updatePrice); quantity.addEventListener("input", updatePrice); updatePrice();
      form.addEventListener("submit", e => {
        e.preventDefault();
        const qty = Number(quantity.value);
        if (!Number.isInteger(qty) || qty < 1 || qty > 20) return toast("Quantity must be between 1 and 20.", true);
        const variant = item.variants?.[Number(form.querySelector('[name="variant"]:checked')?.value || 0)];
        const extras = [...form.querySelectorAll('[name="extra"]:checked')].map(input => item.extras[Number(input.value)]);
        const chosen = { menuId: item.id, name: item.name, image: item.image, price: item.price + (variant?.price || 0), quantity: qty, variant: variant?.name || "Regular", extras, spice: form.querySelector("#spice-level").value, notes: form.querySelector("#item-notes").value.trim() };
        if (old) Object.assign(old, chosen);
        else { chosen.key = `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; state.cart.push(chosen); }
        save(); closeModal(); render(); toast(old ? "Your item was updated." : "Added to your order.");
      });
    });
  }
  function placeOrder(form) {
    const data = new FormData(form);
    const table = getTable(Number(data.get("tableId")));
    if (!table) return toast("Please select a valid table.", true);
    const customer = { name: String(data.get("name")).trim(), phone: String(data.get("phone")).trim() };
    if (customer.name.length < 2 || !/^[0-9+() -]{7,18}$/.test(customer.phone)) return toast("Please check your name and mobile number.", true);
    const number = `${String(Date.now()).slice(-6)}`;
    const order = { id: `ord-${Date.now()}`, number, customer, tableId: table.id, tableName: table.name, items: structuredClone(state.cart), subtotal: cartSubtotal(), tax: cartTax(), discount: cartDiscount(), total: cartTotal(), status: "Order Placed", payment: data.get("payment"), paymentStatus: "Unpaid", notes: String(data.get("notes") || "").trim(), createdAt: new Date().toISOString(), estimate: 25 };
    state.customer = customer;
    state.restaurant.tableId = table.id;
    state.orders.push(order);
    state.cart = [];
    table.status = "Occupied";
    state.discount = 0;
    save();
    selectedOrderId = order.id;
    navigate("tracking");
    toast(`Order #${number} sent to the kitchen.`);
    simulateOrder(order.id);
  }
  function simulateOrder(id) {
    const steps = ["Order Accepted", "Preparing", "Ready to Serve", "Served"];
    steps.forEach((status, index) => setTimeout(() => {
      const order = state.orders.find(o => o.id === id);
      if (!order || order.status === "Rejected" || order.status === "Served") return;
      if (order.status === "Order Placed" || steps.indexOf(order.status) < index) order.status = status;
      if (status === "Served" && order.payment === "Online Payment") order.paymentStatus = "Paid";
      save();
      if (page === "tracking" && selectedOrderId === id) render();
    }, (index + 1) * 12000));
  }
  function changeOrderStatus(orderId, status) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;
    order.status = status;
    if (status === "Rejected") { const t = getTable(order.tableId); if (t) t.status = "Available"; }
    if (status === "Served" && order.payment === "Online Payment") order.paymentStatus = "Paid";
    save(); render(); toast(`Order #${order.number}: ${status}.`);
  }
  function receipt(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (!order) return;
    openModal(`Bill · Order #${order.number}`, `<div class="receipt"><div class="receipt-head"><div class="brand-mark" style="margin:0 auto 12px">T<span>&</span></div><h2>Table & Thyme</h2><p class="muted">Guest bill · Table ${esc(order.tableName)}</p><p class="small muted">${new Date(order.createdAt).toLocaleString()}</p></div><div style="padding:16px 0">${order.items.map(i => `<div class="receipt-line"><span>${i.quantity} × ${esc(i.name)}${i.extras.length ? `<small class="muted"><br>${i.extras.map(x => esc(x.name)).join(", ")}</small>` : ""}</span><strong>${money(lineTotal(i))}</strong></div>`).join("")}<div class="receipt-line"><span>Subtotal</span><span>${money(order.subtotal)}</span></div><div class="receipt-line"><span>GST</span><span>${money(order.tax)}</span></div>${order.discount ? `<div class="receipt-line"><span>Discount</span><span>−${money(order.discount)}</span></div>` : ""}<div class="receipt-line receipt-total"><span>Total payable</span><span>${money(order.total)}</span></div></div><p class="muted small">Payment: ${esc(order.payment)} · ${esc(order.paymentStatus)}</p><div class="no-print" style="text-align:center"><button class="btn btn-primary" data-print-now>Print bill</button></div></div>`);
  }
  function tableForm(id) {
    const table = id ? getTable(id) : null;
    openModal(table ? `Edit table ${table.name}` : "Add a table", `<form id="table-form"><div class="field"><label>Table number *</label><input name="name" required pattern="[A-Za-z0-9\\-]{1,8}" maxlength="8" value="${esc(table?.name || String(state.tables.length + 1).padStart(2, "0"))}"></div><div class="field"><label>Seats *</label><input type="number" name="seats" min="1" max="30" required value="${table?.seats || 4}"></div><div class="field"><label>Status</label><select name="status">${["Available", "Occupied", "Reserved", "Billing Pending"].map(s => `<option ${table?.status === s ? "selected" : ""}>${s}</option>`).join("")}</select></div><button class="btn btn-primary btn-block">Save table</button></form>`, modal => {
      modal.querySelector("#table-form").addEventListener("submit", e => {
        e.preventDefault(); const f = new FormData(e.currentTarget); const name = String(f.get("name")).trim();
        if (state.tables.some(t => t.name.toLowerCase() === name.toLowerCase() && t.id !== table?.id)) return toast("That table number is already in use.", true);
        if (table) Object.assign(table, { name, seats: Number(f.get("seats")), status: f.get("status") });
        else state.tables.push({ id: Math.max(0, ...state.tables.map(t => t.id)) + 1, name, seats: Number(f.get("seats")), status: f.get("status") });
        save(); closeModal(); render(); toast(table ? "Table updated." : "Table added.");
      });
    });
  }
  function menuForm(id) {
    const item = id ? state.menu.find(m => m.id === Number(id)) : null;
    const extrasText = item?.extras?.map(x => `${x.name}:${x.price}`).join(", ") || "";
    openModal(item ? "Edit menu item" : "Add menu item", `<form id="menu-form"><div class="field"><label>Dish name *</label><input name="name" required value="${esc(item?.name || "")}"></div><div class="field-grid"><div class="field"><label>Category</label><select name="category">${CATEGORIES.slice(1).map(c => `<option ${item?.category === c ? "selected" : ""}>${esc(c)}</option>`).join("")}</select></div><div class="field"><label>Price *</label><input name="price" type="number" min="0.01" step="0.01" required value="${item?.price || ""}"></div></div><div class="field"><label>Description</label><textarea name="description" maxlength="240">${esc(item?.description || "")}</textarea></div><div class="field"><label>Image URL</label><input name="image" type="url" value="${esc(item?.image || "")}" placeholder="https://..."></div><div class="field"><label>Or upload a food image (max 1 MB)</label><input name="imageFile" type="file" accept="image/*"></div><div class="field-grid"><div class="field"><label>Dietary type</label><select name="type"><option ${item?.type !== "Non-Veg" ? "selected" : ""}>Veg</option><option ${item?.type === "Non-Veg" ? "selected" : ""}>Non-Veg</option></select></div><div class="field"><label>Availability</label><select name="available"><option value="true" ${item?.available !== false ? "selected" : ""}>Enabled</option><option value="false" ${item?.available === false ? "selected" : ""}>Disabled</option></select></div></div><div class="field"><label>Extras (comma-separated, Name:price)</label><input name="extras" value="${esc(extrasText)}" placeholder="Extra cheese:1.50, Olives:1"></div><button class="btn btn-primary btn-block">Save menu item</button></form>`, modal => {
      let uploadedImage = item?.image || "";
      modal.querySelector('[name="imageFile"]').addEventListener("change", e => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 1024 * 1024) { e.target.value = ""; return toast("Choose an image smaller than 1 MB.", true); }
        const reader = new FileReader();
        reader.onload = () => { if (typeof reader.result === "string") uploadedImage = reader.result; };
        reader.onerror = () => toast("Could not read the selected image.", true);
        reader.readAsDataURL(file);
      });
      modal.querySelector("#menu-form").addEventListener("submit", e => {
        e.preventDefault(); const f = new FormData(e.currentTarget); const price = Number(f.get("price"));
        const extras = String(f.get("extras") || "").split(",").map(x => x.trim()).filter(Boolean).map(x => { const [name, raw] = x.split(":"); return { name: name.trim(), price: Number(raw) }; });
        if (extras.some(x => !x.name || !Number.isFinite(x.price) || x.price < 0)) return toast("Extras must use the format Name:price.", true);
        const data = { name: String(f.get("name")).trim(), category: f.get("category"), price, description: String(f.get("description")).trim(), image: uploadedImage || String(f.get("image")).trim() || image("photo-1547592180-85f173990554"), type: f.get("type"), available: f.get("available") === "true", variants: item?.variants || [], extras };
        if (item) Object.assign(item, data); else state.menu.push({ ...data, id: Date.now() });
        save(); closeModal(); render(); toast(item ? "Menu item updated." : "Menu item added.");
      });
    });
  }
  function showOrder(orderId) {
    const order = state.orders.find(o => o.id === orderId); if (!order) return;
    openModal(`Order #${order.number}`, `<p class="muted">Guest: <strong>${esc(order.customer.name)}</strong> · ${esc(order.customer.phone)} · Table ${esc(order.tableName)}</p>${order.items.map(i => `<div class="cart-line"><img class="cart-thumb" src="${safeImage(i.image)}" alt=""><div><h3>${i.quantity} × ${esc(i.name)}</h3><div class="muted">${esc(i.variant)}${i.extras.length ? ` · ${i.extras.map(x => esc(x.name)).join(", ")}` : ""}<br>${esc(i.notes || "No item notes")}</div></div><div class="cart-total">${money(lineTotal(i))}</div></div>`).join("")}<p><strong>Order note:</strong> ${esc(order.notes || "None")}</p>${renderTotals(order)}<p class="muted small">Payment: ${esc(order.payment)} · ${esc(order.paymentStatus)}</p>`);
  }

  document.addEventListener("click", e => {
    const target = e.target.closest("button");
    if (!target) return;
    if (target.hasAttribute("data-admin-logout")) {
      sessionStorage.removeItem(ADMIN_AUTH_KEY);
      navigate("admin-login");
      return;
    }
    if (target.dataset.page) { navigate(target.dataset.page); return; }
    if (target.dataset.adminPage) { navigate(target.dataset.adminPage); return; }
    if (target.hasAttribute("data-scroll-menu")) { document.querySelector(".category-row")?.scrollIntoView({ behavior: "smooth" }); return; }
    if (target.dataset.category) { category = target.dataset.category; render(); return; }
    if (target.dataset.customize) { customize(target.dataset.customize); return; }
    if (target.dataset.cartQty || target.dataset.quickQty) { updateQuantity(target.dataset.cartQty || target.dataset.quickQty, Number(target.dataset.delta)); return; }
    if (target.dataset.remove) { state.cart = state.cart.filter(x => x.key !== target.dataset.remove); save(); render(); return; }
    if (target.hasAttribute("data-clear-cart")) { state.cart = []; state.discount = 0; save(); render(); return; }
    if (target.dataset.editItem) { const i = state.cart.find(x => x.key === target.dataset.editItem); if (i) customize(i.menuId, i.key); return; }
    if (target.hasAttribute("data-apply-discount")) { const code = byId("discount-code").value.trim().toUpperCase(); if (code === "THYME10") { state.discount = 10; save(); render(); toast("10% discount applied."); } else toast("That promo code is not valid.", true); return; }
    if (target.hasAttribute("data-add-table")) { tableForm(); return; }
    if (target.dataset.editTable) { tableForm(Number(target.dataset.editTable)); return; }
    if (target.dataset.deleteTable) { const t = getTable(Number(target.dataset.deleteTable)); if (t && confirm(`Delete table ${t.name}?`)) { if (state.tables.length === 1) return toast("At least one table is required.", true); state.tables = state.tables.filter(x => x.id !== t.id); if (state.restaurant.tableId === t.id) state.restaurant.tableId = state.tables[0].id; save(); render(); } return; }
    if (target.hasAttribute("data-add-menu")) { menuForm(); return; }
    if (target.dataset.editMenu) { menuForm(target.dataset.editMenu); return; }
    if (target.dataset.deleteMenu) { const m = state.menu.find(x => x.id === Number(target.dataset.deleteMenu)); if (m && confirm(`Delete ${m.name} from the menu?`)) { state.menu = state.menu.filter(x => x.id !== m.id); save(); render(); } return; }
    if (target.dataset.toggleMenu) { const m = state.menu.find(x => x.id === Number(target.dataset.toggleMenu)); if (m) { m.available = !m.available; save(); render(); } return; }
    if (target.dataset.orderStatus) { changeOrderStatus(target.dataset.orderStatus, target.dataset.status); return; }
    if (target.dataset.viewOrder) { showOrder(target.dataset.viewOrder); return; }
    if (target.dataset.receipt) { receipt(target.dataset.receipt); return; }
    if (target.hasAttribute("data-print-now")) { window.print(); return; }
    if (target.dataset.markPaid) { const order = state.orders.find(o => o.id === target.dataset.markPaid); if (order) { order.paymentStatus = "Paid"; const table = getTable(order.tableId); if (table && table.status === "Occupied") table.status = "Billing Pending"; save(); render(); toast("Payment marked as received."); } return; }
    if (target.dataset.releaseTable) { const order = state.orders.find(o => o.id === target.dataset.releaseTable); const table = order && getTable(order.tableId); if (table) { table.status = "Available"; save(); render(); toast(`Table ${table.name} released.`); } return; }
    if (target.dataset.printQr) { window.RestaurantQR?.printTable(Number(target.dataset.printQr)); return; }
    if (target.dataset.downloadQr) { window.RestaurantQR?.downloadTable(Number(target.dataset.downloadQr)); return; }
    if (target.hasAttribute("data-print-orders")) { window.print(); return; }
  });
  function updateQuantity(key, delta) {
    const item = state.cart.find(x => x.key === key); if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) state.cart = state.cart.filter(x => x.key !== key);
    save(); render();
  }
  document.addEventListener("input", e => {
    if (e.target.id === "menu-search" || e.target.id === "admin-menu-search") {
      search = e.target.value; const cursor = e.target.selectionStart; render(); const field = byId(e.target.id); if (field) { field.focus(); field.setSelectionRange(cursor, cursor); }
    }
  });
  document.addEventListener("change", e => {
    if (e.target.id === "table-filter") document.querySelectorAll("[data-table-tile]").forEach(tile => { const status = tile.querySelector(".status").textContent; tile.classList.toggle("hidden", e.target.value !== "All" && status !== e.target.value); });
    if (e.target.id === "admin-category-filter") { menuAdminCategory = e.target.value; render(); }
    if (e.target.id === "order-filter") { orderFilter = e.target.value; render(); }
    if (e.target.dataset.tableStatus) { const table = getTable(Number(e.target.dataset.tableStatus)); if (table) { table.status = e.target.value; save(); render(); toast(`Table ${table.name} is ${table.status.toLowerCase()}.`); } }
    if (e.target.dataset.orderStatusSelect) changeOrderStatus(e.target.dataset.orderStatusSelect, e.target.value);
  });
  document.addEventListener("submit", e => {
    if (e.target.id === "admin-login-form") {
      e.preventDefault();
      const data = new FormData(e.target);
      if (data.get("username") !== ADMIN_USERNAME || data.get("password") !== ADMIN_PASSWORD) {
        byId("admin-login-error").classList.remove("hidden");
        e.target.querySelector("#admin-password").value = "";
        return;
      }
      sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
      navigate("dashboard");
      return;
    }
    if (e.target.id === "checkout-form") { e.preventDefault(); if (!e.target.reportValidity()) return; placeOrder(e.target); }
  });
  window.addEventListener("hashchange", () => { const next = location.hash.slice(1); if (next && next !== page) navigate(next, false); });
  window.addEventListener("storage", event => {
    if (event.key !== STORE_KEY && event.key !== null) return;
    state = loadState();
    window.TableThyme.state = state;
    render();
  });
  window.TableThyme = { state, save, render, currentTable, getTable, money, toast };

  const initialPage = location.hash.slice(1);
  const validPages = isAdminPage ? ["dashboard", "tables", "menu-admin", "orders", "billing"] : ["menu", "cart", "checkout", "tracking", "dashboard", "tables", "menu-admin", "orders", "billing"];
  if (initialPage && validPages.includes(initialPage)) page = initialPage;
  if (isAdminPage && !isAdminAuthenticated()) page = "admin-login";
  const params = new URLSearchParams(location.search);
  const qrTable = params.get("table");
  if (qrTable && getTable(Number(qrTable))) state.restaurant.tableId = Number(qrTable);
  save();
  render();
})();
