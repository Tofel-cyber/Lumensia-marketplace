// ================================
// SAFE PI INIT (AMAN DI VERCEL)
// ================================
if (typeof Pi !== "undefined") {
  Pi.init({
    version: "2.0",
    api_url: "https://api.minepi.com/",
    sandbox: false // MODE PRODUKSI
  });
} else {
  console.warn("Pi SDK tidak tersedia. Mode preview aktif.");
}

// ================================
// ELEMENT DOM
// ================================
const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const totalPrice = document.getElementById("total-price");

let cart = [];

// ================================
// DATA PRODUK
// ================================
const products = [
  { id: 1, name: "Beras Premium 5kg", price: 0.01, img: "images/beras.jpg", category: "Kebutuhan Pokok" },
  { id: 2, name: "Gula Pasir 1kg", price: 0.01, img: "images/gula-pasir.jpg", category: "Kebutuhan Pokok" },
  { id: 3, name: "Minyak Goreng 1L", price: 0.01, img: "images/minyak-goreng.jpg", category: "Kebutuhan Pokok" },
  { id: 4, name: "Pasta Gigi", price: 0.01, img: "images/pasta-gigi.jpg", category: "Kebutuhan Pokok" },
  { id: 5, name: "Sabun Mandi", price: 0.01, img: "images/sabun.jpg", category: "Kebutuhan Pokok" },
  { id: 6, name: "Sampo", price: 0.01, img: "images/sampo.jpg", category: "Kebutuhan Pokok" },
  { id: 7, name: "Rokok", price: 0.01, img: "images/rokok.jpg", category: "Kebutuhan Pokok" },
  { id: 8, name: "Meja", price: 0.01, img: "images/meja.jpg", category: "Furnitur" },
  { id: 9, name: "Kursi", price: 0.01, img: "images/kursi.jpg", category: "Furnitur" },
  { id: 10, name: "HP Android", price: 0.01, img: "images/hp-android.jpg", category: "Elektronik" },
  { id: 11, name: "Laptop", price: 0.01, img: "images/laptop.jpg", category: "Elektronik" },
  { id: 12, name: "Cincin Emas", price: 0.01, img: "images/cincin-emas.jpg", category: "Fashion" },
  { id: 13, name: "Kalung", price: 0.01, img: "images/kalung.jpg", category: "Fashion" }
];

// ================================
// RENDER PRODUK
// ================================
function renderProducts() {
  productList.innerHTML = "";

  products.forEach(p => {
    const productDiv = document.createElement("div");
    productDiv.classList.add("product");

    productDiv.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>Harga: ${p.price} π</p>
      <button onclick="addToCart(${p.id})">Beli</button>
    `;

    productList.appendChild(productDiv);
  });
}

// ================================
// TAMBAH KE KERANJANG
// ================================
function addToCart(id) {
  const product = products.find(p => p.id === id);
  cart.push(product);
  updateCart();
}

// ================================
// UPDATE KERANJANG
// ================================
function updateCart() {
  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} - ${item.price} π
      <button onclick="removeFromCart(${index})">Hapus</button>
    `;
    cartItems.appendChild(li);
    total += item.price;
  });

  cartCount.textContent = cart.length;
  totalPrice.textContent = total.toFixed(2);
}

// ================================
// HAPUS DARI KERANJANG
// ================================
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

// ================================
// CHECKOUT PI (AMAN DI BROWSER)
// ================================
function checkout() {
  if (cart.length === 0) {
    alert("Keranjang belanja kosong!");
    return;
  }

  const totalPi = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);
  const memo = `Pembelian ${cart.length} item dari Lumensia Marketplace. Total: ${totalPi} Pi.`;

  if (typeof Pi === "undefined") {
    alert("Pi Browser tidak terdeteksi. Mode demo aktif.");
    return;
  }

  Pi.requestPayment({
    amount: totalPi,
    memo: memo,
  }, (payment) => {
    alert(`Pembayaran berhasil! ID: ${payment.identifier}`);
    cart = [];
    updateCart();
  }, (error) => {
    console.error(error);
    alert(`Pembayaran dibatalkan. Error: ${error.message}`);
  });
}

// ================================
// LOAD AWAL
// ================================
renderProducts();
