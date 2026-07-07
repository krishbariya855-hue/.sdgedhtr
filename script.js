// ===============================
// MAHIVERSE GLOBLE
// Shopping Cart Engine
// Part 1
// ===============================

console.log("MAHIVERSE GLOBLE Loaded Successfully");

// WhatsApp Number
const WHATSAPP_NUMBER = "916354179230";

// Cart Array
let cart = JSON.parse(localStorage.getItem("mahiverse_cart")) || [];

// Wait until page loads
document.addEventListener("DOMContentLoaded", () => {

const cartIcon = document.getElementById("cart-icon-nav");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const closeCart = document.getElementById("close-cart");

const cartItemsContainer = document.getElementById("cart-items-container");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total-amount");

const checkoutBtn = document.getElementById("whatsapp-checkout-btn");

// Open Cart
if(cartIcon){

cartIcon.addEventListener("click",(e)=>{

e.preventDefault();

cartSidebar.classList.add("open");

cartOverlay.classList.add("show");

});

}

// Close Cart
function closeCartPanel(){

cartSidebar.classList.remove("open");

cartOverlay.classList.remove("show");

}

if(closeCart){

closeCart.addEventListener("click",closeCartPanel);

}

if(cartOverlay){

cartOverlay.addEventListener("click",closeCartPanel);

}

// Update UI on page load
updateCartUI();// ===============================
// Part 2 - Add To Cart Engine
// ===============================

// Add to Cart Buttons
const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");

addToCartButtons.forEach(button => {

button.addEventListener("click", () => {

const card = button.closest(".card");

const id = card.dataset.id;
const name = card.dataset.name;

const select = card.querySelector(".weight-select");

const weight = select.value;

const option = select.options[select.selectedIndex];

const price = Number(option.dataset.price);

const key = id + "-" + weight;

// Check if already exists
const existingItem = cart.find(item => item.key === key);

if(existingItem){

existingItem.quantity++;

}else{

cart.push({

key:key,

id:id,

name:name,

weight:weight,

price:price,

quantity:1

});

}

// Save Cart
localStorage.setItem(
"mahiverse_cart",
JSON.stringify(cart)
);

// Refresh UI
updateCartUI();

// Open Sidebar
cartSidebar.classList.add("open");
cartOverlay.classList.add("show");

});

});

// ===============================
// Update Cart UI
// ===============================

function updateCartUI(){

if(!cartItemsContainer) return;

cartItemsContainer.innerHTML="";

let totalItems=0;
let totalPrice=0;

if(cart.length===0){

cartItemsContainer.innerHTML=
'<p class="empty-msg">Your cart is empty.</p>';

cartCount.textContent="0";

cartTotal.textContent="₹0";

return;

}

cart.forEach((item,index)=>{

totalItems+=item.quantity;

totalPrice+=item.price*item.quantity;

const div=document.createElement("div");

div.className="cart-item";

div.innerHTML=`

<div class="cart-item-details">

<h4>${item.name}</h4>

<p>${item.weight}</p>

<p>Qty : ${item.quantity}</p>

<p><strong>₹${item.price*item.quantity}</strong></p>

</div>

<button class="remove-item-btn"

data-index="${index}">

<i class="fas fa-trash"></i>

</button>

`;

cartItemsContainer.appendChild(div);

});

cartCount.textContent=totalItems;

cartTotal.textContent="₹"+totalPrice;
}// ===============================
// Part 3 - Remove Items & WhatsApp Checkout
// ===============================

// Remove Item
cartItemsContainer.addEventListener("click",(e)=>{

const btn=e.target.closest(".remove-item-btn");

if(!btn) return;

const index=parseInt(btn.dataset.index);

cart.splice(index,1);

localStorage.setItem(
"mahiverse_cart",
JSON.stringify(cart)
);

updateCartUI();

});

// WhatsApp Checkout

if(checkoutBtn){

checkoutBtn.addEventListener("click",()=>{

if(cart.length===0){

alert("Your cart is empty!");

return;

}

let message="Hello MAHIVERSE GLOBLE! 🌿\n\nI want to place the following order:\n\n";

let total=0;

cart.forEach((item,i)=>{

const amount=item.price*item.quantity;

total+=amount;

message+=`${i+1}. ${item.name}\n`;
message+=`Weight : ${item.weight}\n`;
message+=`Quantity : ${item.quantity}\n`;

if(item.price===0){

message+="Price : Bulk Order\n\n";

}else{

message+=`Amount : ₹${amount}\n\n`;

}

});

message+=`Estimated Total : ₹${total}\n\n`;

message+="Please confirm availability and payment details. Thank you!";

window.open(

`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,

"_blank"

);

});

}

// ===============================
// End Script
// ===============================

});
/* ============================
   SCROLL ANIMATION
============================ */

const observer = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
        if(entry.isIntersecting){
            entry.target.classList.add("show");
        }
    });
});

const hiddenElements = document.querySelectorAll(
".trust-section, .stats-section, .products, .why, .reviews, .about, .faq, .contact"
);

hiddenElements.forEach((el)=>{
    el.classList.add("hidden");
    observer.observe(el);
});
/* ============================
   BACK TO TOP BUTTON
============================ */

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
    if(window.scrollY > 300){
        backToTop.style.display = "flex";
        backToTop.style.justifyContent = "center";
        backToTop.style.alignItems = "center";
    }else{
        backToTop.style.display = "none";
    }
});

backToTop.addEventListener("click", () => {
    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
});
/* ============================
   MOBILE MENU
============================ */

const menuToggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");

menuToggle.addEventListener("click", ()=>{

    navbar.classList.toggle("active");

});
