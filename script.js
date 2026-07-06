// ==========================================
// Mahiverse Globle - Cart & Weights Logic
// ==========================================

let cart = [];

// DOM Elements
const cartIconNav = document.getElementById("cart-icon-nav");
const cartSidebar = document.getElementById("cart-sidebar");
const cartOverlay = document.getElementById("cart-overlay");
const closeCartBtn = document.getElementById("close-cart");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartCount = document.getElementById("cart-count");
const whatsappCheckoutBtn = document.getElementById("whatsapp-checkout-btn");

// Open & Close Cart Panel
if(cartIconNav) {
    cartIconNav.addEventListener("click", (e) => {
        e.preventDefault();
        cartSidebar.classList.add("open");
        cartOverlay.classList.add("show");
    });
}

function closeCart() {
    if(cartSidebar) cartSidebar.classList.remove("open");
    if(cartOverlay) cartOverlay.classList.remove("show");
}

if(closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
if(cartOverlay) cartOverlay.addEventListener("click", closeCart);

// Add Items to Cart Logic
const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
addToCartButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        const card = e.target.closest(".card");
        const id = card.getAttribute("data-id");
        const name = card.getAttribute("data-name");
        const weightSelect = card.querySelector(".weight-select");
        const selectedWeight = weightSelect.value;
        
        const itemKey = `${id}-${selectedWeight}`;
        
        // Check if exact item/weight combo exists
        const existingItem = cart.find(item => item.key === itemKey);
        if(existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                key: itemKey,
                name: name,
                weight: selectedWeight,
                quantity: 1
            });
        }
        
        updateCartUI();
        // Automatically slide open cart to show confirmation
        cartSidebar.classList.add("open");
        cartOverlay.classList.add("show");
    });
});

// Update Cart View interface
function updateCartUI() {
    if(!cartItemsContainer || !cartCount) return;
    
    cartItemsContainer.innerHTML = "";
    let totalItems = 0;
    
    if(cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        cartCount.textContent = "0";
        return;
    }
    
    cart.forEach((item, index) => {
        totalItems += item.quantity;
        
        const itemRow = document.createElement("div");
        itemRow.classList.add("cart-item");
        itemRow.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>Weight: ${item.weight} | Qty: ${item.quantity}</p>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart(${index})"><i class="fas fa-trash"></i></button>
        `;
        cartItemsContainer.appendChild(itemRow);
    });
    
    cartCount.textContent = totalItems;
}

// Global removal function
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
};

// WhatsApp Order compilation & dynamic link redirection
if(whatsappCheckoutBtn) {
    whatsappCheckoutBtn.addEventListener("click", () => {
        if(cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
        
        let message = "Hello Mahiverse Globle! 🌿%0AI want to place an order:%0A%0A";
        cart.forEach((item, i) => {
            message += `${i+1}. *${item.name}* (${item.weight}) — Qty: ${item.quantity}%0A`;
        });
        message += "%0APlease provide total pricing and payment UPI details to confirm my order! 🙏";
        
        window.open(`https://wa.me/916354179230?text=${message}`, "_blank");
    });
}

// Cards Intersection Observer Animation
const cards = document.querySelectorAll(".card");
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0px)";
        }
    });
}, { threshold: 0.05 });

cards.forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = "all 0.6s ease-out";
    observer.observe(card);
});
