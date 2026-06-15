// Shared app logic: cart, partials, rendering
(function(){
  const C = window.SHOP;
  const fmt = n => `${C.currency}${Number(n).toLocaleString('en-PH',{minimumFractionDigits:0})}`;
  window.fmt = fmt;

  /* ---------- Cart ---------- */
  const CART_KEY = "fbe_cart";
  function getCart(){ try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
  function saveCart(c){ localStorage.setItem(CART_KEY, JSON.stringify(c)); updateCartBadge(); }
  function addToCart(id, qty=1){
    const p = window.PRODUCTS.find(x=>x.id===id); if(!p) return;
    const cart = getCart();
    const found = cart.find(i=>i.id===id);
    if(found) found.qty = Math.min(99, found.qty + qty);
    else cart.push({id, qty});
    saveCart(cart);
    toast(`${p.name} added to cart`);
  }
  function updateQty(id, qty){
    const cart = getCart();
    const it = cart.find(i=>i.id===id); if(!it) return;
    it.qty = Math.max(1, Math.min(99, qty));
    saveCart(cart);
  }
  function removeFromCart(id){
    saveCart(getCart().filter(i=>i.id!==id));
  }
  function cartCount(){ return getCart().reduce((s,i)=>s+i.qty,0); }
  function cartSubtotal(){
    return getCart().reduce((s,i)=>{
      const p = window.PRODUCTS.find(x=>x.id===i.id);
      return s + (p ? p.price * i.qty : 0);
    },0);
  }
  function updateCartBadge(){
    document.querySelectorAll(".cart-count").forEach(el=>{
      const c = cartCount();
      el.textContent = c;
      el.style.display = c>0 ? "flex" : "none";
    });
  }
  window.Cart = { get:getCart, add:addToCart, update:updateQty, remove:removeFromCart,
                  count:cartCount, subtotal:cartSubtotal, save:saveCart, clear:()=>saveCart([]) };

  /* ---------- Toast ---------- */
  function toast(msg){
    let t = document.querySelector(".toast");
    if(!t){ t = document.createElement("div"); t.className="toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(()=>t.classList.remove("show"), 2200);
  }
  window.toast = toast;

  /* ---------- Header / Footer partials ---------- */
  function buildHeader(active=""){
    return `
      <header class="site-header">
        <nav class="nav" aria-label="Main">
          <a href="index.html" class="brand">
            <img src="assets/logo.png" alt="${C.name} logo" width="42" height="42">
            <div>
              <span class="brand-sub">Cebu City</span>
              <span class="brand-name">Flower By Ellyse</span>
            </div>
          </a>
          <ul class="nav-links" id="navLinks">
            <li><a href="index.html"   class="${active==='home'?'active':''}">Home</a></li>
            <li><a href="shop.html"    class="${active==='shop'?'active':''}">Shop</a></li>
            <li><a href="about.html"   class="${active==='about'?'active':''}">About</a></li>
            <li><a href="contact.html" class="${active==='contact'?'active':''}">Contact</a></li>
            <li><a href="faq.html"     class="${active==='faq'?'active':''}">FAQ</a></li>
          </ul>
          <div class="nav-actions">
            <a href="cart.html" class="icon-btn" aria-label="Cart">
              🛍️<span class="cart-count">0</span>
            </a>
            <button class="hamburger" id="hamburger" aria-label="Menu">☰</button>
          </div>
        </nav>
      </header>`;
  }
  function buildFooter(){
    return `
      <footer class="site-footer">
        <div class="container foot-grid">
          <div class="foot-brand">
            <a href="index.html" class="brand">
              <img src="assets/logo.png" alt="" width="42" height="42">
              <div><span class="brand-sub" style="color:#caa9b4">Cebu City</span>
              <span class="brand-name">Flower By Ellyse</span></div>
            </a>
            <p>Fresh, hand-tied bouquets delivered with love across Cebu City. Open daily for every special occasion.</p>
            <div class="socials">
              <a href="https://wa.me/${C.whatsapp}" aria-label="WhatsApp">💬</a>
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Instagram">◎</a>
            </div>
          </div>
          <div>
            <h4>Shop</h4>
            <ul class="foot-list">
              <li><a href="shop.html">All Bouquets</a></li>
              <li><a href="shop.html?cat=birthday">Birthday</a></li>
              <li><a href="shop.html?cat=anniversary">Anniversary</a></li>
              <li><a href="shop.html?cat=wedding">Wedding</a></li>
              <li><a href="shop.html?cat=valentine">Valentine's</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul class="foot-list">
              <li><a href="about.html">About Us</a></li>
              <li><a href="contact.html">Contact</a></li>
              <li><a href="faq.html">FAQs</a></li>
              <li><a href="cart.html">Cart</a></li>
            </ul>
          </div>
          <div>
            <h4>Visit Us</h4>
            <ul class="foot-list">
              <li>${C.address}</li>
              <li><a href="tel:${C.phoneRaw}">${C.phone}</a></li>
              <li><a href="mailto:${C.email}">${C.email}</a></li>
              <li>Open daily · 8:00 AM – 8:00 PM</li>
            </ul>
          </div>
        </div>
        <div class="foot-bottom container">
          © ${new Date().getFullYear()} ${C.name}. All rights reserved.
        </div>
      </footer>`;
  }
  window.mountChrome = function(active){
    const h = document.getElementById("site-header");
    const f = document.getElementById("site-footer");
    if(h) h.outerHTML = buildHeader(active);
    if(f) f.outerHTML = buildFooter();
    updateCartBadge();
    const burger = document.getElementById("hamburger");
    const links = document.getElementById("navLinks");
    if(burger && links){ burger.addEventListener("click", ()=> links.classList.toggle("open")); }
  };

  /* ---------- Product card ---------- */
  window.productCard = function(p){
    return `
      <article class="product">
        <div class="product-media">
          <a href="product.html?id=${p.id}"><img src="${p.img}" alt="${p.name}" loading="lazy"></a>
          ${p.tag?`<span class="product-tag">${p.tag}</span>`:""}
          <a class="quick-view" href="product.html?id=${p.id}">Quick view →</a>
        </div>
        <div class="product-body">
          <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
          <p class="product-desc">${p.short}</p>
          <div class="product-foot">
            <span class="price">${fmt(p.price)}${p.old?`<small>${fmt(p.old)}</small>`:""}</span>
            <button class="btn btn-primary btn-sm" data-add="${p.id}">Add</button>
          </div>
        </div>
      </article>`;
  };

  /* ---------- Global delegated handlers ---------- */
  document.addEventListener("click", e=>{
    const addBtn = e.target.closest("[data-add]");
    if(addBtn){ addToCart(addBtn.dataset.add, 1); }
  });

  updateCartBadge();
})();
