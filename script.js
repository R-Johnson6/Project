const PRODUCTS = [
  {
    id: "sourdough",
    name: "Sourdough Loaf",
    category: "Breads",
    price: "$7",
    description: "Naturally leavened, crusty exterior, open crumb."
  },
  {
    id: "country",
    name: "Country Loaf",
    category: "Breads",
    price: "$6",
    description: "Hearty everyday loaf made with local flour."
  },
  {
    id: "baguette",
    name: "Baguette",
    category: "Breads",
    price: "$5",
    description: "Classic French-style baguette, baked fresh daily."
  },
  {
    id: "croissant",
    name: "Butter Croissant",
    category: "Pastries",
    price: "$4",
    description: "Flaky, layered, and buttery."
  },
  {
    id: "muffin",
    name: "Blueberry Muffin",
    category: "Pastries",
    price: "$3",
    description: "Moist muffin packed with local berries."
  },
  {
    id: "layer-cake",
    name: "Seasonal Layer Cake",
    category: "Pastries",
    price: "$28",
    description: "Three-layer cake, flavor changes weekly."
  }
];

/* ========== Favorites (array managed via localStorage) ========== */
const FAVORITES_KEY = "nsb_favorites";
const CONTACT_KEY = "nsb_contact";

function getFavorites() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveFavorites(favoritesArray) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesArray));
}

function isFavorite(productId) {
  return getFavorites().includes(productId);
}

function toggleFavorite(productId) {
  let favorites = getFavorites();
  if (favorites.includes(productId)) {
    favorites = favorites.filter(id => id !== productId);
  } else {
    favorites.push(productId);
  }
  saveFavorites(favorites);
  return favorites;
}

/* ========== Render helpers ========== */
function findProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}

function renderFavoritesPanel() {
  const panel = document.getElementById("favorites-panel");
  if (!panel) return;

  const favorites = getFavorites();
  const listEl = document.getElementById("favorites-list");
  const emptyEl = document.getElementById("favorites-empty");

  listEl.innerHTML = "";

  if (favorites.length === 0) {
    emptyEl.style.display = "block";
    listEl.style.display = "none";
    return;
  }

  emptyEl.style.display = "none";
  listEl.style.display = "block";

  favorites.forEach(id => {
    const product = findProductById(id);
    if (!product) return;

    const li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${product.name}</strong> – ${product.price}</span>
      <button type="button" class="remove-fav" data-id="${product.id}" aria-label="Remove ${product.name} from favorites">Remove</button>
    `;
    listEl.appendChild(li);
  });

  // Attach remove handlers
  listEl.querySelectorAll(".remove-fav").forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      toggleFavorite(id);
      updateFavoriteButtons();
      renderFavoritesPanel();
    });
  });
}

function updateFavoriteButtons() {
  document.querySelectorAll(".fav-btn").forEach(btn => {
    const id = btn.getAttribute("data-id");
    if (isFavorite(id)) {
      btn.classList.add("is-favorite");
      btn.textContent = "In Favorites";
    } else {
      btn.classList.remove("is-favorite");
      btn.textContent = "Add to Favorites";
    }
  });
}

function renderProductCards() {
  const container = document.getElementById("product-list");
  if (!container) return;

  container.innerHTML = "";

  // Group by category using an object
  const byCategory = {};
  PRODUCTS.forEach(p => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });

  Object.keys(byCategory).forEach(category => {
    const section = document.createElement("section");
    section.innerHTML = `<h3>${category}</h3>`;

    byCategory[category].forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <h3>${product.name}</h3>
        <p>${product.description} <strong>${product.price}</strong></p>
        <button type="button" class="fav-btn" data-id="${product.id}">Add to Favorites</button>
      `;
      section.appendChild(card);
    });

    container.appendChild(section);
  });

  // Attach toggle handlers
  container.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      toggleFavorite(id);
      updateFavoriteButtons();
      renderFavoritesPanel();
    });
  });

  updateFavoriteButtons();
}

/* ========== Contact form: validation + storage ========== */
function getStoredContact() {
  try {
    const raw = localStorage.getItem(CONTACT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function saveContactDetails(name, email) {
  localStorage.setItem(CONTACT_KEY, JSON.stringify({ name, email }));
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + "-error");
  if (field) field.classList.remove("invalid");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.classList.remove("visible");
  }
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(fieldId + "-error");
  if (field) field.classList.add("invalid");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add("visible");
  }
}

function isValidEmail(value) {
  // Simple practical pattern for course purposes
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(value);
}

function validateContactForm() {
  let isValid = true;

  // Clear previous errors
  ["name", "email", "pickup", "type", "details"].forEach(clearFieldError);

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const pickup = document.getElementById("pickup").value;
  const type = document.getElementById("type").value;
  const details = document.getElementById("details").value.trim();

  // 1. Required field checks
  if (!name) {
    showFieldError("name", "Please enter your name.");
    isValid = false;
  } else if (name.length < 2) {
    showFieldError("name", "Name must be at least 2 characters.");
    isValid = false;
  }

  // 2. Email format validation
  if (!email) {
    showFieldError("email", "Please enter your email address.");
    isValid = false;
  } else if (!isValidEmail(email)) {
    showFieldError("email", "Please enter a valid email (example: you@email.com).");
    isValid = false;
  }

  // 3. Required date
  if (!pickup) {
    showFieldError("pickup", "Please choose a pickup date.");
    isValid = false;
  }

  if (!type) {
    showFieldError("type", "Please select a request type.");
    isValid = false;
  }

  if (!details) {
    showFieldError("details", "Please tell us what you need.");
    isValid = false;
  } else if (details.length < 10) {
    showFieldError("details", "Please provide at least 10 characters so we can help you.");
    isValid = false;
  }

  return isValid;
}

function handleFormSubmit(event) {
  event.preventDefault();

  const successEl = document.getElementById("form-success");
  if (successEl) successEl.classList.remove("visible");

  if (!validateContactForm()) {
    const firstInvalid = document.querySelector(".invalid");
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  saveContactDetails(name, email);

  if (successEl) {
    successEl.textContent = "Thank you! Your request has been recorded. We will reply soon.";
    successEl.classList.add("visible");
  }

  document.getElementById("pickup").value = "";
  document.getElementById("type").value = "";
  document.getElementById("details").value = "";
  document.getElementById("allergy").value = "";
}

function prefillContactForm() {
  const stored = getStoredContact();
  if (!stored) return;

  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");
  if (nameField && stored.name) nameField.value = stored.name;
  if (emailField && stored.email) emailField.value = stored.email;
}

function initProductsPage() {
  renderProductCards();
  renderFavoritesPanel();
}

function initContactPage() {
  prefillContactForm();

  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }

  ["name", "email", "pickup", "type", "details"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => clearFieldError(id));
      el.addEventListener("change", () => clearFieldError(id));
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("product-list")) {
    initProductsPage();
  }
  if (document.getElementById("contact-form")) {
    initContactPage();
  }
});
