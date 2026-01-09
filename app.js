/* ===============================
   PRODUCT LIST
================================ */
const products = [
  { id:1,name:"Beras Premium 5kg",price:0.01,img:"https://via.placeholder.com/300x200?text=Beras",category:"Kebutuhan Pokok"},
  { id:2,name:"Gula Pasir 1kg",price:0.01,img:"https://via.placeholder.com/300x200?text=Gula",category:"Kebutuhan Pokok"},
  { id:3,name:"Minyak Goreng 1L",price:0.01,img:"https://via.placeholder.com/300x200?text=Minyak",category:"Kebutuhan Pokok"},
  { id:4,name:"Pasta Gigi",price:0.01,img:"https://via.placeholder.com/300x200?text=Pasta",category:"Kebutuhan Pokok"},
  { id:5,name:"Sabun Mandi",price:0.01,img:"https://via.placeholder.com/300x200?text=Sabun",category:"Kebutuhan Pokok"},
  { id:6,name:"Sampo",price:0.01,img:"https://via.placeholder.com/300x200?text=Sampo",category:"Kebutuhan Pokok"},
  { id:7,name:"Rokok",price:0.01,img:"https://via.placeholder.com/300x200?text=Rokok",category:"Kebutuhan Pokok"},
  { id:8,name:"Meja",price:0.01,img:"https://via.placeholder.com/300x200?text=Meja",category:"Furnitur"},
  { id:9,name:"Kursi",price:0.01,img:"https://via.placeholder.com/300x200?text=Kursi",category:"Furnitur"},
  { id:10,name:"HP Android",price:0.01,img:"https://via.placeholder.com/300x200?text=HP",category:"Elektronik"},
  { id:11,name:"Laptop",price:0.01,img:"https://via.placeholder.com/300x200?text=Laptop",category:"Elektronik"},
  { id:12,name:"Cincin Emas",price:0.01,img:"https://via.placeholder.com/300x200?text=Cincin",category:"Fashion"},
  { id:13,name:"Kalung",price:0.01,img:"https://via.placeholder.com/300x200?text=Kalung",category:"Fashion"}
];

/* ===============================
   GLOBAL STATE
================================ */
let cart=[], piAuth=null, isPaying=false, balance=0;

/* ===============================
   RENDER
================================ */
function renderProducts(){
  const el=document.getElementById("product-list");
  el.innerHTML="";
  products.forEach(p=>{
    el.innerHTML+=`
      <div class="product">
        <img src="${p.img}">
        <h3>${p.name}</h3>
        <p>${p.category}</p>
        <div class="price">${p.price} π</div>
        <button class="btn-primary" onclick="addToCart(${p.id})">Tambah</button>
      </div>`;
  });
}

function addToCart(id){
  cart.push(products.find(p=>p.id===id));
  updateCart();
  showStatus("Produk ditambahkan","success");
}

function updateCart(){
  const list=document.getElementById("cart-items");
  list.innerHTML="";
  let total=0;
  cart.forEach((p,i)=>{
    total+=p.price;
    list.innerHTML+=`
      <li>
        ${p.name} - ${p.price} π
        <button class="btn-danger" onclick="removeItem(${i})">x</button>
      </li>`;
  });
  document.getElementById("cart-count").textContent=cart.length;
  document.getElementById("total-price").textContent=total.toFixed(2);
}

function removeItem(i){
  cart.splice(i,1);
  updateCart();
}

/* ===============================
   PI SDK
================================ */
if(typeof Pi!=="undefined"){
  Pi.init({version:"2.0",api_url:"https://api.minepi.com/",sandbox:true});
  Pi.authenticate(["payments"],()=>{})
    .then(a=>piAuth=a)
    .catch(()=>console.warn("Auth gagal"));
}

async function ensureAuth(){
  try{
    piAuth=await Pi.authenticate(["payments"],()=>{});
    return true;
  }catch{return false;}
}

async function checkBalance(){
  if(!piAuth?.accessToken)return 0;
  const r=await fetch(`https://api.minepi.com/v2/user/balance?accessToken=${piAuth.accessToken}`);
  const d=await r.json();
  balance=Number(d.balance||0);
  return balance;
}

/* ===============================
   CHECKOUT
================================ */
async function checkout(){
  if(isPaying||!cart.length)return;
  showStatus("Cek saldo...","warning");

  await ensureAuth();
  await checkBalance();

  const amount=cart.reduce((s,p)=>s+p.price,0);
  if(balance<amount){
    showStatus("Saldo tidak cukup","error");
    return;
  }

  isPaying=true;
  Pi.createPayment({
    amount,
    memo:"Lumensia Testnet",
    metadata:{cart}
  },{
    onReadyForServerCompletion(){
      showStatus("Pembayaran sukses","success");
      cart=[];
      isPaying=false;
      updateCart();
    },
    onCancel(){isPaying=false},
    onError(e){
      isPaying=false;
      showStatus(e.message,"error");
    }
  });
}

/* ===============================
   UTIL
================================ */
function showStatus(msg,type){
  const d=document.createElement("div");
  d.className=`status ${type}`;
  d.textContent=msg;
  document.body.appendChild(d);
  setTimeout(()=>d.remove(),3000);
}

function emergencyReset(){
  cart=[];
  isPaying=false;
  Pi.clearIncompletePayments?.();
  location.reload();
}

function reAuthAndRefresh(){
  ensureAuth().then(checkBalance);
}

document.addEventListener("DOMContentLoaded",renderProducts);
