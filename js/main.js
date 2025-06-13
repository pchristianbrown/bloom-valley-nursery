document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const alertBox = document.getElementById('alertBox');
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  // Dark Mode Setup
  const toggle = document.querySelector('.toggle-dark-mode');
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark" || (!currentTheme && prefersDark.matches)) {
    body.classList.add("dark-mode");
  }

  toggle?.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const mode = body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", mode);
  });

  // Show alert banner
  function showAlert(msg) {
    if (!alertBox) return;
    alertBox.textContent = msg;
    alertBox.classList.add('show');
    setTimeout(() => alertBox.classList.remove('show'), 4000);
  }

  // Weather API
  const weatherEl = document.querySelector('.weather-info');
  const apiKey = 'be22a0c8076d16188c505b061943bc9a';
  const defaultLat = 38.8951;
  const defaultLon = -77.0364;

  function showWeather(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`)
      .then(res => res.json())
      .then(data => {
        weatherEl.textContent = `${data.name}: ${Math.round(data.main.temp)}°F, ${data.weather[0].description}`;
      })
      .catch(() => {
        weatherEl.textContent = "Weather unavailable";
      });
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => showWeather(pos.coords.latitude, pos.coords.longitude),
      () => showWeather(defaultLat, defaultLon)
    );
  } else {
    showWeather(defaultLat, defaultLon);
  }

  // Subscribe
  const subscribeForm = document.getElementById('subscribe-form');
  subscribeForm?.addEventListener('submit', e => {
    e.preventDefault();
    showAlert('Thank you for subscribing.');
    subscribeForm.reset();
  });

  // Contact form
  const contactForm = document.getElementById('contact-form');
  contactForm?.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(contactForm));
    localStorage.setItem('customOrder', JSON.stringify(data));
    showAlert('Thank you for your message');
    contactForm.reset();
  });

  // Add to Cart
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      const item = button.dataset.itemId;
      let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
      cart.push(item);
      sessionStorage.setItem('cart', JSON.stringify(cart));
      showAlert('Item added to the cart');
    });
  });

  // View Cart
  const viewCartBtn = document.getElementById('view-cart');
  const modal = document.getElementById('cartModal');
  const closeBtn = document.querySelector('.close-btn');

  function updateCartModal() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const cartList = modal.querySelector('ul');
    cartList.innerHTML = '';

    cart.forEach((item, index) => {
      const li = document.createElement('li');
      li.textContent = item;
      const removeBtn = document.createElement('button');
      removeBtn.textContent = 'Remove';
      removeBtn.style.marginLeft = '1rem';
      removeBtn.addEventListener('click', () => {
        cart.splice(index, 1);
        sessionStorage.setItem('cart', JSON.stringify(cart));
        updateCartModal();
      });
      li.appendChild(removeBtn);
      cartList.appendChild(li);
    });

    if (cart.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Your cart is empty.';
      cartList.appendChild(li);
    }
  }

  viewCartBtn?.addEventListener('click', () => {
    updateCartModal();
    modal.classList.add('show');
  });

  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('show');
  });

  // Clear Cart
  document.getElementById('clear-cart')?.addEventListener('click', () => {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    if (cart.length > 0) {
      sessionStorage.removeItem('cart');
      updateCartModal();
      showAlert('Cart cleared');
    } else {
      showAlert('No items to clear.');
    }
  });

  // Process Order
  document.getElementById('process-order')?.addEventListener('click', () => {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    if (cart.length > 0) {
      sessionStorage.removeItem('cart');
      updateCartModal();
      showAlert('Thank you for your order');
    } else {
      showAlert('Cart is empty.');
    }
  });

  // Map updates for community.html
  document.querySelectorAll('[data-map]')?.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const coords = e.target.dataset.map;
      const map = document.getElementById('main-map');
      if (coords && map) {
        map.src = `https://maps.google.com/maps?q=${coords}&z=15&output=embed`;
      }
    });
  });
});