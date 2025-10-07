/* ============================
   Food Factory — Frontend App
   - Menu rendering
   - Cart (client-side)
   - Tracking + ETA
   - Payment + Rating modals
   ============================ */

(function () {
  /* -----------------------
     Menu data (you can extend)
  ------------------------*/
  const menuData = [
  // Pizza
  { type: 'pizza', id: 101, name: 'Farmhouse Delight', desc: 'Bell peppers, olives, onions, and mushrooms', price: 429.00, time: 25, img: 'https://media-assets.swiggy.com/swiggy/image/upload/f_auto,q_auto,fl_lossy/f9701b4e9e6aae4febe5e52c9f5e36f9' },
  { type: 'pizza', id: 102, name: 'Paneer Tikka Pizza', desc: 'Marinated paneer, capsicum, and onion', price: 459.00, time: 25, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqqGq8s3mMnngBbuS3B7_qaUgC4tql6q43UqZ1C5nLLYwLnENERzjoSfQKrEMqfrgQ3x8&usqp=CAU' },
  { type: 'pizza', id: 103, name: 'Mexican Green Wave', desc: 'Jalapenos, corn, and fresh herbs', price: 399.00, time: 25, img: 'https://soupaddict.com/wp-content/uploads/2016/04/mexican-pizza-7723-3-042316.jpg' },

  // Burgers
  { type: 'burger', id: 201, name: 'Spicy Chicken Burger', desc: 'Grilled chicken patty with spicy mayo', price: 319.00, time: 15, img: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80' },
  { type: 'burger', id: 202, name: 'Classic Veg Burger', desc: 'Crispy veggie patty with lettuce and tomato', price: 279.00, time: 15, img: 'https://vps029.manageserver.in/menu/wp-content/uploads/2024/10/download-6.jpeg' },
  { type: 'burger', id: 203, name: 'Cheese Blast Burger', desc: 'Double cheese with grilled beef patty', price: 369.00, time: 15, img: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=500&q=80' },

  // Pasta
  { type: 'pasta', id: 301, name: 'Penne Arrabbiata', desc: 'Spicy tomato sauce with penne', price: 329.00, time: 20, img: 'https://www.kitchensanctuary.com/wp-content/uploads/2023/07/Penne-alarrabiata-square-FS.jpg' },
  { type: 'pasta', id: 302, name: 'Creamy Mushroom Pasta', desc: 'Rich mushroom sauce with fettuccine', price: 359.00, time: 20, img: 'https://assets.bonappetit.com/photos/5d4ddd602c815a00080f9771/3:2/w_3131,h_2087,c_limit/BA-0919-Creamy-Pasta-Crispy-Mushroom-Playbook.jpg' },

  // Desserts
  { type: 'dessert', id: 401, name: 'Strawberry Cheesecake', desc: 'Smooth cheesecake topped with fresh strawberries', price: 219.00, time: 10, img: 'https://drivemehungry.com/wp-content/uploads/2022/07/strawberry-cheesecake-11.jpg' },
  { type: 'dessert', id: 402, name: 'Brownie Sundae', desc: 'Warm brownie with ice cream and chocolate sauce', price: 239.00, time: 10, img: 'https://bigycloud.relationshop.net/RSData/recipes/06102021085440_Brownie_Sundae_400x400.jpg' },
  { type: 'dessert', id: 403, name: 'Mango Mousse', desc: 'Light and airy mango mousse dessert', price: 199.00, time: 10, img: 'https://www.tashasartisanfoods.com/blog/wp-content/uploads/2023/05/The-Best-Mango-Mousse-Recipe-3-Ingredients-FEATURE-9.jpeg' }
];


  let currentOrderIdCounter = 1000;
  function getNewOrderId() {
    return `#${currentOrderIdCounter++}`;
  }

  /* -----------------------
     App state & helpers
  ------------------------*/
  const state = {
    items: menuData.slice(),
    cart: [],
    tracker: { step: 0, orderId: null, deliveryTime: 0, interval: null },
    selectedPayment: null,
    currentRating: 0
  };

  const qs = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));

  /* -----------------------
     Render menu & categories
  ------------------------*/
  function renderFoodGrid(items) {
    const grid = qs('#foodGrid');
    if (!grid) return;
    grid.innerHTML = items.map(i => createFoodCardHTML(i)).join('');
  }

  function createFoodCardHTML(i) {
    return `
      <article class="food-item" data-id="${i.id}" data-category="${i.type}">
        <img loading="lazy" src="${i.img}" alt="${i.name}" />
        <h3>${i.name}</h3>
        <div class="food-description">${i.desc}</div>
        <div class="food-details">
          <div class="price">₹${i.price.toFixed(2)}</div>
          <div class="delivery-time">${i.time} min</div>
        </div>
        <button class="add-btn" data-add="${i.id}">Add to Cart</button>
      </article>
    `;
  }

  /* -----------------------
     Cart operations
  ------------------------*/
  function addToCart(id) {
    const menuItem = state.items.find(x => x.id === id);
    if (!menuItem) return;
    const exist = state.cart.find(c => c.id === id);
    if (exist) exist.quantity++;
    else state.cart.push({ id, name: menuItem.name, price: menuItem.price, time: menuItem.time, quantity: 1 });
    updateCartUI();
  }

  function updateQuantity(id, change) {
    const idx = state.cart.findIndex(c => c.id === id);
    if (idx === -1) return;
    state.cart[idx].quantity += change;
    if (state.cart[idx].quantity <= 0) state.cart.splice(idx, 1);
    updateCartUI();
  }

  function clearCart() {
    state.cart = [];
    updateCartUI();
  }

  function getCartTotal() {
    return state.cart.reduce((s, it) => s + it.price * it.quantity, 0);
  }

  function getCartTotalItems() {
    return state.cart.reduce((s, it) => s + it.quantity, 0);
  }

  function getCartMaxDeliveryTime() {
    if (!state.cart.length) return 0;
    return Math.max(...state.cart.map(i => i.time));
  }

  function updateCartUI() {
    const cartCountEl = qs('#cartCount');
    const cartItemsEl = qs('#cartItems');
    const cartTotalEl = qs('#cartTotal');
    const checkoutBtn = qs('#checkoutBtn');

    const totalQty = getCartTotalItems();
    cartCountEl.textContent = totalQty;
    cartCountEl.style.display = totalQty > 0 ? 'inline-block' : 'none';

    if (state.cart.length === 0) {
      cartItemsEl.innerHTML = '<div class="empty">Your cart is empty</div>';
      cartTotalEl.textContent = 'Total: ₹0.00';
      checkoutBtn.style.display = 'none';
    } else {
      cartItemsEl.innerHTML = state.cart.map(it => `
        <div class="cart-item" data-id="${it.id}">
          <div style="flex:1">
            <div class="cart-name">${it.name}</div>
            <div class="small muted">₹${it.price.toFixed(2)} × ${it.quantity}</div>
          </div>
          <div class="qty">
            <button data-change="-1" data-id="${it.id}">-</button>
            <div>${it.quantity}</div>
            <button data-change="1" data-id="${it.id}">+</button>
          </div>
          <div style="min-width:72px;text-align:right;font-weight:700">₹${(it.price * it.quantity).toFixed(2)}</div>
        </div>
      `).join('');
      cartTotalEl.textContent = `Total: ₹${getCartTotal().toFixed(2)}`;
      checkoutBtn.style.display = 'block';
    }
  }

  /* -----------------------
     Drawer & Modal helpers
  ------------------------*/
  function openDrawer(el) { el.classList.add('open'); el.setAttribute('aria-hidden','false'); }
  function closeDrawer(el){ el.classList.remove('open'); el.setAttribute('aria-hidden','true'); }
  function toggleDrawer(el){ el.classList.toggle('open'); el.setAttribute('aria-hidden', !el.classList.contains('open')); }

  function openModal(mod){ mod.classList.add('open'); mod.setAttribute('aria-hidden','false'); }
  function closeModal(mod){ mod.classList.remove('open'); mod.setAttribute('aria-hidden','true'); }

  /* -----------------------
     Tracking logic
  ------------------------*/
  function startTracking(deliveryTime, orderId) {
    // reset
    stopTrackingInterval();
    state.tracker.step = 1;
    state.tracker.deliveryTime = deliveryTime;
    state.tracker.orderId = orderId;
    state.tracker.interval = setInterval(trackingTick, 8000);
    renderTracking();
    // show tracking drawer and icon
    const trackingDrawer = qs('#trackingDrawer');
    const trackingIcon = qs('#trackingIcon');
    openDrawer(trackingDrawer);
    trackingIcon.classList.add('active');
  }

  function trackingTick() {
    if (state.tracker.step < 4) {
      state.tracker.step++;
      renderTracking();
    } else {
      // finished
      stopTrackingInterval();
      completeDelivery();
    }
  }

  function stopTrackingInterval() {
    if (state.tracker.interval) {
      clearInterval(state.tracker.interval);
      state.tracker.interval = null;
    }
  }

  function renderTracking() {
    const steps = qsa('#trackingSteps .tracking-step');
    steps.forEach(s => {
      const n = Number(s.getAttribute('data-step'));
      if (n <= state.tracker.step) s.classList.add('completed'); else s.classList.remove('completed');
    });
    // estimate
    const estimate = qs('#deliveryEstimate');
    if (!estimate) return;
    if (state.tracker.step === 1) estimate.textContent = state.tracker.deliveryTime;
    if (state.tracker.step === 2) estimate.textContent = Math.max(10, state.tracker.deliveryTime - 10);
    if (state.tracker.step === 3) estimate.textContent = Math.max(5, state.tracker.deliveryTime - 15);
    if (state.tracker.step >= 4) estimate.textContent = 0;
  }

  function completeDelivery() {
    // show notification
    const notif = qs('#deliveryNotification');
    notif.classList.add('show');
    setTimeout(() => notif.classList.remove('show'), 4800);

    // close drawer & reset state after a moment
    setTimeout(() => {
      closeDrawer(qs('#trackingDrawer'));
      // open rating modal
      openRatingModal(state.tracker.orderId || '#000');
      state.tracker.step = 0;
      state.tracker.orderId = null;
      state.tracker.deliveryTime = 0;
      qs('#trackingIcon').classList.remove('active');
      renderTracking();
    }, 700);
  }

  /* -----------------------
    Payment & Rating
  ------------------------*/
  function openPaymentModal() {
    if (state.cart.length === 0) {
      alert('Add items first!');
      return;
    }
    state.selectedPayment = null;
    qsa('.payment-option').forEach(el => el.classList.remove('selected'));
    openModal(qs('#paymentModal'));
  }

  function payNow() {
    if (!state.selectedPayment) { alert('Select a payment method'); return; }
    const orderId = getNewOrderId();
    const deliveryTime = getCartMaxDeliveryTime();
    // clear cart & start tracking
    clearCart();
    closeModal(qs('#paymentModal'));
    startTracking(deliveryTime, orderId);
    alert(`Order placed!\nPayment: ${state.selectedPayment}\nOrder ID: ${orderId}`);
  }

  function openRatingModal(orderId) {
    qs('#orderIdDisplay').textContent = `Order: ${orderId}`;
    state.currentRating = 0;
    qsa('#starRating span').forEach(s => s.classList.remove('selected'));
    qs('#feedbackText').value = '';
    openModal(qs('#ratingModal'));
  }

  function submitFeedback() {
    if (state.currentRating === 0) { alert('Please select rating'); return; }
    const orderIdText = qs('#orderIdDisplay').textContent;
    const feedback = qs('#feedbackText').value.trim();
    console.log('Feedback:', { order: orderIdText, rating: state.currentRating, comment: feedback || '—' });
    alert('Thanks for your feedback!');
    closeModal(qs('#ratingModal'));
  }

  /* -----------------------
     Search, Filter & Events
  ------------------------*/
  function setupEventDelegation() {
    // Add to cart from grid
    document.body.addEventListener('click', (e) => {
      const addBtn = e.target.closest('[data-add]');
      if (addBtn) {
        const id = Number(addBtn.getAttribute('data-add'));
        addToCart(id);
        // open cart briefly
        openDrawer(qs('#cartDrawer'));
        return;
      }

      // cart quantity +/- buttons
      const changeBtn = e.target.closest('[data-change]');
      if (changeBtn) {
        const id = Number(changeBtn.getAttribute('data-id'));
        const change = Number(changeBtn.getAttribute('data-change'));
        updateQuantity(id, change);
        return;
      }
    });

    // category chips
    qs('#categoryButtons').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      qsa('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.getAttribute('data-cat');
      if (cat === 'all') renderFoodGrid(state.items);
      else renderFoodGrid(state.items.filter(i => i.type === cat));
    });

    // cart toggle
    qs('#cartToggleBtn').addEventListener('click', () => {
      toggleDrawer(qs('#cartDrawer'));
      // ensure tracking closed
      closeDrawer(qs('#trackingDrawer'));
    });
    qs('#closeCart').addEventListener('click', () => closeDrawer(qs('#cartDrawer')));

    // tracking icon & drawer
    qs('#trackingIcon').addEventListener('click', () => {
      // only open if tracking started
      if (state.tracker.step === 0) {
        alert('No active order. Place an order to start tracking.');
        return;
      }
      toggleDrawer(qs('#trackingDrawer'));
      closeDrawer(qs('#cartDrawer'));
    });
    qs('#closeTracking').addEventListener('click', () => closeDrawer(qs('#trackingDrawer')));

    // payment modal
    qs('#checkoutBtn').addEventListener('click', openPaymentModal);
    qs('#closePaymentModal').addEventListener('click', () => closeModal(qs('#paymentModal')));
    qs('#payNowBtn').addEventListener('click', payNow);
    qsa('.payment-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        qsa('.payment-option').forEach(x => x.classList.remove('selected'));
        opt.classList.add('selected');
        state.selectedPayment = opt.getAttribute('data-method');
      });
    });

    // rating modal
    qs('#closeRatingModal').addEventListener('click', () => closeModal(qs('#ratingModal')));
    qs('#submitFeedbackBtn').addEventListener('click', submitFeedback);
    qsa('#starRating span').forEach(st => {
      st.addEventListener('click', () => {
        state.currentRating = Number(st.getAttribute('data-rating'));
        qsa('#starRating span').forEach(s => {
          s.classList.toggle('selected', Number(s.getAttribute('data-rating')) <= state.currentRating);
        });
      });
    });

    // search
    qs('#searchInput').addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) return renderFoodGrid(state.items);
      renderFoodGrid(state.items.filter(i => (i.name + ' ' + i.desc).toLowerCase().includes(q)));
    });

    // clicks outside to close modals/drawers (small UX nicety)
    document.addEventListener('click', (e) => {
      const modalOpen = !!e.target.closest('.modal.open') || !!e.target.closest('.drawer.open');
      // (no automatic close here to avoid frustration) — handled by close buttons
    });

    // keyboard: esc to close modals/drawers
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        closeModal(qs('#paymentModal'));
        closeModal(qs('#ratingModal'));
        closeDrawer(qs('#cartDrawer'));
        closeDrawer(qs('#trackingDrawer'));
      }
    });
  }

  /* -----------------------
     Initial setup
  ------------------------*/
  function init() {
    renderFoodGrid(state.items);
    updateCartUI();
    setupEventDelegation();
    // hide cart count if 0
    qs('#cartCount').style.display = 'none';
  }

  // expose some functions for inline usage (if needed)
  window.app = {
    addToCart: (id) => addToCart(id),
    openPaymentModal,
    openRatingModal,
    submitFeedback
  };

  // init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else init();

})();
