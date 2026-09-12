// ---- State ----
let allProducts = [];      // full list loaded from the API, never mutated after load
let favourites = new Set(); // holds product ids that are marked as favourite
let searchTerm = "";
let sortMode = "default";
let showFavOnly = false;

// ---- DOM references ----
const statusEl = document.getElementById("status");
const gridEl = document.getElementById("grid");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");
const favOnlyBtn = document.getElementById("favOnlyBtn");
const favCountEl = document.getElementById("favCount");

// ---- Load products from the API ----
async function loadProducts() {
  statusEl.textContent = "Loading...";
  statusEl.classList.remove("error");
  statusEl.style.display = "block";
  gridEl.innerHTML = "";

  try {
    const response = await fetch("https://dummyjson.com/products?limit=100");

    if (!response.ok) {
      throw new Error("Bad response: " + response.status);
    }

    const data = await response.json();
    allProducts = data.products || [];

    statusEl.style.display = "none";
    render();
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Sorry, we couldn't load the products. Please check your connection and try again.";
    statusEl.classList.add("error");
    statusEl.style.display = "block";
  }
}

// ---- Filtering, sorting, and rendering ----
function getVisibleProducts() {
  let list = allProducts;

  if (searchTerm.trim() !== "") {
    const term = searchTerm.trim().toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(term));
  }

  if (showFavOnly) {
    list = list.filter((p) => favourites.has(p.id));
  }

  // Sort on a copy so we don't mutate the filtered array in place
  list = [...list];
  if (sortMode === "price-asc") {
    list.sort((a, b) => a.price - b.price);
  } else if (sortMode === "price-desc") {
    list.sort((a, b) => b.price - a.price);
  }

  return list;
}

function render() {
  const visible = getVisibleProducts();
  gridEl.innerHTML = "";

  if (visible.length === 0) {
    const msg = document.createElement("p");
    msg.className = "empty-message";
    msg.textContent = showFavOnly
      ? "You haven't favourited any products yet."
      : "No products match your search.";
    gridEl.appendChild(msg);
    updateFavCount();
    return;
  }

  const fragment = document.createDocumentFragment();

  visible.forEach((product) => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = product.thumbnail;
    img.alt = product.title;
    img.loading = "lazy";

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("p");
    title.className = "card-title";
    title.textContent = product.title;

    const price = document.createElement("p");
    price.className = "card-price";
    price.textContent = "$" + product.price;

    const favBtn = document.createElement("button");
    favBtn.type = "button";
    const isFav = favourites.has(product.id);
    favBtn.className = "fav-btn" + (isFav ? " active" : "");
    favBtn.textContent = isFav ? "♥ Favourited" : "♡ Favourite";
    favBtn.addEventListener("click", () => toggleFavourite(product.id));

    body.appendChild(title);
    body.appendChild(price);
    body.appendChild(favBtn);

    card.appendChild(img);
    card.appendChild(body);
    fragment.appendChild(card);
  });

  gridEl.appendChild(fragment);
  updateFavCount();
}

function toggleFavourite(productId) {
  if (favourites.has(productId)) {
    favourites.delete(productId);
  } else {
    favourites.add(productId);
  }
  render();
}

function updateFavCount() {
  const count = favourites.size;
  favCountEl.textContent = "♥ " + count + (count === 1 ? " favourite" : " favourites");
}

// ---- Event listeners ----
searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value;
  render();
});

sortSelect.addEventListener("change", (e) => {
  sortMode = e.target.value;
  render();
});

favOnlyBtn.addEventListener("click", () => {
  showFavOnly = !showFavOnly;
  favOnlyBtn.classList.toggle("active", showFavOnly);
  favOnlyBtn.textContent = showFavOnly ? "Show all products" : "Show favourites only";
  render();
});

// ---- Start ----
loadProducts();
