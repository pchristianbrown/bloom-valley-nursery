document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.toggle-dark-mode');
  const body = document.body;
  const alertBox = document.getElementById('alertBox');
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  // Initialize theme
  const currentTheme = localStorage.getItem("theme");
  if (currentTheme === "dark" || (!currentTheme && prefersDark.matches)) {
    body.classList.add("dark-mode");
  }

  toggle?.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem("theme", body.classList.contains("dark-mode") ? "dark" : "light");
  });

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

  // Alert message handler
  function showAlert(msg) {
    if (!alertBox) return;
    alertBox.classList.remove('fade-out');
    alertBox.textContent = msg;
    alertBox.classList.add('show');
    //setTimeout(() => alertBox.classList.remove('show'), 8000);
    setTimeout(()=> {
      alertBox.classList.add('fade-out');
      setTimeout(() => {
        alertBox.classList.remove('show', 'fade-out');
      }, 500);
    }, 5000);
  }

  // Subscribe form
  document.getElementById('subscribe-form')?.addEventListener('submit', e => {
    e.preventDefault();
    showAlert('Thank you for subscribing.');
    e.target.reset();
  });

  // Contact form
  document.getElementById('contact-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    localStorage.setItem('customOrder', JSON.stringify(data));
    showAlert('Thank you for your message');
    e.target.reset();
  });

  // Add to Cart
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.dataset.itemId;
      let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
      cart.push(item);
      sessionStorage.setItem('cart', JSON.stringify(cart));
      showAlert('Item added to the cart');
    });
  });

  // View Cart modal logic
  const cartModal = document.getElementById('cartModal');
  const closeBtn = document.querySelector('.close-btn');

  function updateCartModal() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const cartList = cartModal.querySelector('ul');
    cartList.innerHTML = '';

    if (cart.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Your cart is empty.';
      cartList.appendChild(li);
      return;
    }

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
  }

  // Open/Close modal
  document.querySelectorAll('.view-cart').forEach(button => {
    button.addEventListener('click', () => {
      updateCartModal();
      cartModal.classList.add('show');
    });
  });

  closeBtn?.addEventListener('click', () => {
    cartModal.classList.remove('show');
  });

  // Clear Cart (all buttons)
  document.querySelectorAll('.clear-cart').forEach(button => {
    button.addEventListener('click', () => {
      const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
      if (cart.length > 0) {
        sessionStorage.removeItem('cart');
        updateCartModal?.();
        showAlert('Cart cleared');
      } else {
        showAlert('No items to clear.');
      }
    });
  });

  // Process Order (all buttons)
  document.querySelectorAll('.process-order').forEach(button => {
    button.addEventListener('click', () => {
      const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
      if (cart.length > 0) {
        sessionStorage.removeItem('cart');
        updateCartModal?.();
        showAlert('Thank you for your order');
      } else {
        showAlert('Cart is empty.');
      }
    });
  });

  // Map switching (community page)
  document.querySelectorAll('#event-addresses a, #event-addresses-alt a, address a[data-map]').forEach(link => {
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