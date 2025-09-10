const productList = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const checkoutBtn = document.getElementById("checkout-btn");
const categoryList = document.getElementById("category-list");

let cart = [];

const products = [
    { _id: "1", name: "Beras Premium 5kg", price: 1, category: "Kebutuhan Pokok", description: "Beras kualitas terbaik untuk konsumsi harian", img: "https://images.pexels.com/photos/664537/pexels-photo-664537.jpeg" },
    { _id: "2", name: "Minyak Goreng 2L", price: 1, category: "Kebutuhan Pokok", description: "Minyak goreng sehat, cocok untuk memasak sehari-hari", img: "https://images.pexels.com/photos/404567/pexels-photo-404567.jpeg" },
    { _id: "3", name: "Sabun Mandi", price: 1, category: "Kebutuhan Pokok", description: "Sabun mandi wangi dan lembut untuk kulit", img: "https://images.pexels.com/photos/264606/pexels-photo-264606.jpeg" },
    { _id: "4", name: "Pasta Gigi", price: 1, category: "Kebutuhan Pokok", description: "Pasta gigi anti plak dan menjaga gigi tetap putih", img: "https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg" },
    { _id: "5", name: "Rokok Filter", price: 1, category: "Kebutuhan Pokok", description: "Rokok filter ringan", img: "https://images.pexels.com/photos/164695/pexels-photo-164695.jpeg" },
    { _id: "6", name: "Meja Kayu", price: 1, category: "Kebutuhan Pokok", description: "Meja kayu solid untuk rumah atau kantor", img: "https://images.pexels.com/photos/5699593/pexels-photo-5699593.jpeg" },
    { _id: "7", name: "Kursi Kayu", price: 1, category: "Kebutuhan Pokok", description: "Kursi kayu nyaman untuk ruang tamu atau meja makan", img: "https://images.pexels.com/photos/1866149/pexels-photo-1866149.jpeg" },
    { _id: "8", name: "Sarung Kudus", price: 1, category: "Kebutuhan Pokok", description: "Sarung asli Kudus berkualitas tinggi, nyaman dan awet untuk aktivitas sehari-hari", img: "https://images.pexels.com/photos/4492114/pexels-photo-4492114.jpeg" }
];



const categories = ["All", "Kebutuhan Pokok"];

categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    if(cat === "All") btn.classList.add("active");
    btn.onclick = () => filterCategory(cat, btn);
    categoryList.appendChild(btn);
});

function filterCategory(category, btnClicked) {
    document.querySelectorAll(".categories button").forEach(b => b.classList.remove("active"));
    btnClicked.classList.add("active");

    let filtered = category === "All" ? products : products.filter(p => p.category === category);
    displayProducts(filtered);
}

function displayProducts(list) {
    productList.innerHTML = "";
    list.forEach(product => {
        const div = document.createElement("div");
        div.className = "product";
        div.innerHTML = `
            <img src="${product.img}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p>Harga: 1 Pi</p>
            <button onclick="addToCart('${product._id}')">Tambah ke Keranjang</button>
        `;
        productList.appendChild(div);
    });
}

function addToCart(id) {
    const product = products.find(p => p._id === id);
    cart.push(product);
    cartCount.textContent = cart.length;
}

checkoutBtn.addEventListener("click", () => {
    if(cart.length === 0) return alert("Keranjang kosong!");
    const totalPi = cart.length; // karena setiap produk 1 Pi
    alert(`Total pembayaran: ${totalPi} Pi`);
});


displayProducts(products);
