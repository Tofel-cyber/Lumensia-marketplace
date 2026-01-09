// ======================================
// INIT PI SDK + AUTH
// ======================================
let piAuth = null;
let isProcessingPayment = false; // Flag untuk cegah multiple payment

if (typeof Pi !== "undefined") {
  Pi.init({
    version: "2.0",
    sandbox: true // true untuk testnet, false untuk mainnet
  });

  const scopes = ["payments"];

  function onIncompletePaymentFound(payment) {
    console.log("Incomplete payment ditemukan:", payment);
    // Kirim ke backend untuk resolve incomplete payment
    fetch("/api/incomplete-payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: payment.identifier })
    })
    .then(res => res.json())
    .then(data => {
      console.log("Incomplete payment resolved:", data);
      alert("Pembayaran yang belum selesai telah di-resolve. Silakan coba checkout lagi.");
    })
    .catch(err => {
      console.error("Error resolving incomplete payment:", err);
      alert("Ada pembayaran yang belum selesai. Hubungi support.");
    });
  }

  Pi.authenticate(scopes, onIncompletePaymentFound)
    .then((auth) => {
      console.log("Pi authenticated:", auth);
      piAuth = auth;
    })
    .catch((err) => {
      console.error("Auth error:", err);
      alert("Gagal autentikasi Pi. Pastikan Anda di Pi Browser.");
    });
} else {
  console.warn("Pi SDK tidak tersedia. Buka marketplace di Pi Browser.");
}

// ======================================
// ELEMENT DOM
// ======================================
const productList = document.getElementById("product-list");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const totalPrice = document.getElementById("total-price");

let cart = [];

// ======================================
// DATA PRODUK
// ======================================
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

// ======================================
// RENDER PRODUK
// ======================================
function renderProducts() {
  productList.innerHTML = "";
  products.forEach((p) => {
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

// ======================================
// KERANJANG
// ======================================
function addToCart(id) {
  const product = products.find((p) => p.id === id);
  cart.push(product);
  updateCart();
}

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

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

// ======================================
// CALLBACK PEMBAYARAN → BACKEND
// ======================================
const paymentCallbacks = {
  onReadyForServerApproval: async function (paymentId) {
    console.log("Ready for approval:", paymentId);
    try {
      const res = await fetch("/api/payment-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId })
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Approve failed:", data);
        alert("Approve gagal di server. Coba lagi.");
        isProcessingPayment = false; // Reset flag
      } else {
        console.log("Approve ok:", data);
      }
    } catch (e) {
      console.error("Approve error:", e);
      alert("Error koneksi saat approve. Coba lagi.");
      isProcessingPayment = false; // Reset flag
    }
  },

  onReadyForServerCompletion: async function (paymentId, txid) {
    console.log("Ready for completion:", paymentId, txid);
    try {
      const res = await fetch("/api/payment-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, txid })
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Complete failed:", data);
        alert("Complete gagal di server. Coba lagi.");
        isProcessingPayment = false; // Reset flag
      } else {
        console.log("Complete ok:", data);
        alert("Pembayaran selesai! Terima kasih.");
        cart = []; // Reset cart HANYA jika sukses
        updateCart();
        isProcessingPayment = false; // Reset flag
      }
    } catch (e) {
      console.error("Complete error:", e);
      alert("Error koneksi saat complete. Coba lagi.");
      isProcessingPayment = false; // Reset flag
    }
  },

  onCancel: function (paymentId) {
    console.log("Payment cancelled:", paymentId);
    alert("Pembayaran dibatalkan.");
    isProcessingPayment = false; // Reset flag
  },

  onError: function (error, payment) {
    console.error("Payment error:", error, payment);
    alert("Terjadi error pembayaran: " + error.message);
    isProcessingPayment = false; // Reset flag
  }
};

// ======================================
// CHECKOUT PI
// ======================================
function checkout() {
  if (cart.length === 0) {
    alert("Keranjang belanja kosong!");
    return;
  }

  if (typeof Pi === "undefined") {
    alert("Pi Browser tidak terdeteksi. Buka marketplace melalui Pi Browser.");
    return;
  }

  if (isProcessingPayment) {
    alert("Pembayaran sedang diproses. Tunggu sebentar.");
    return;
  }

  isProcessingPayment = true; // Set flag

  const amount = parseFloat(
    cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)
  );
  const memo = `Pembelian ${cart.length} item dari Lumensia Marketplace. Total: ${amount} Pi.`;
  const metadata = { items: cart };

  const paymentData = { amount, memo, metadata };

  Pi.createPayment(paymentData, paymentCallbacks);
}

// ======================================
// LOAD AWAL HALAMAN
// ======================================
document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
});