// =========================================================================
// MAHIVERSE GLOBLE - LIVE RAZORPAY & DELIVERY ADDRESS ENGINE
// =========================================================================

console.log("MAHIVERSE GLOBLE Engine Loaded Successfully");

const RAZORPAY_KEY_ID = "rzp_live_TGTWYtkzRnCuwX"; 
const WHATSAPP_NUMBER = "916354179230";

let cart = JSON.parse(localStorage.getItem("mahiverse_cart")) || [];

// 1. ADD TO CART FUNCTION
window.addToCartDirect = function(productId, productName, selectId) {
    let select = selectId ? document.getElementById(selectId) : null;
    if (!select) {
        const card = document.querySelector(`.card[data-id="${productId}"]`);
        if (card) select = card.querySelector('select');
    }

    if (!select) {
        alert("Please select a pack size first.");
        return;
    }

    const weight = select.value;
    const selectedOption = select.options[select.selectedIndex];
    
    let price = Number(selectedOption.getAttribute("data-price") || 0);
    if (!price || price === 0) {
        const match = selectedOption.textContent.match(/₹\s*(\d+)/);
        if (match) price = Number(match[1]);
    }

    if (weight.includes("Bulk") || weight.includes("Commercial")) {
        alert("For commercial bulk cargo orders, please contact us directly on WhatsApp or request an export quote!");
        return;
    }

    const key = productId + "_" + weight;

    const existingItem = cart.find(item => item.key === key);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            key: key,
            id: productId,
            name: productName,
            weight: weight,
            price: price,
            quantity: 1
        });
    }

    localStorage.setItem("mahiverse_cart", JSON.stringify(cart));
    updateCartUI();
    showToast(`✓ ${productName} added to cart!`);
    openCartSidebar();
};

// 2. OPEN & CLOSE CART DRAWER
function openCartSidebar() {
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add("open");
        cartOverlay.classList.add("show");
    }
}

function closeCartSidebar() {
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.remove("open");
        cartOverlay.classList.remove("show");
    }
}

// 3. CART RENDER ENGINE & FORM VISIBILITY
function updateCartUI() {
    const itemsContainer = document.getElementById("cart-items-container") || document.querySelector(".cart-items-body");
    const cartCount = document.getElementById("cart-count");
    const totalAmountSpan = document.getElementById("cart-total-amount");
    const addressForm = document.getElementById("delivery-address-form");

    if (!itemsContainer) return;

    itemsContainer.innerHTML = "";
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach((item, index) => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>${item.weight} (Qty: ${item.quantity})</p>
                <p><strong>₹${item.price * item.quantity}</strong></p>
            </div>
            <button class="remove-item-btn" onclick="removeFromCart(${index})">Remove</button>
        `;
        itemsContainer.appendChild(div);
    });

    if (cartCount) cartCount.textContent = totalItems;
    if (totalAmountSpan) totalAmountSpan.textContent = `₹${totalPrice}`;

    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="empty-msg">Your cart is currently empty.</p>';
        if (addressForm) addressForm.style.display = "none";
    } else {
        if (addressForm) addressForm.style.display = "block";
    }
}

// 4. REMOVE ITEM FROM CART
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem("mahiverse_cart", JSON.stringify(cart));
    updateCartUI();
};

// 5. CHECKOUT WITH ADDRESS VALIDATION & RAZORPAY
function triggerRazorpayPayment() {
    if (cart.length === 0) {
        alert("Your cart is empty! Add products before paying.");
        return;
    }

    // Read Delivery Address Input Values
    const nameInput = document.getElementById("cust-name");
    const phoneInput = document.getElementById("cust-phone");
    const addressInput = document.getElementById("cust-address");

    const name = nameInput ? nameInput.value.trim() : "";
    const phone = phoneInput ? phoneInput.value.trim() : "";
    const address = addressInput ? addressInput.value.trim() : "";

    // Validate inputs before launching Razorpay
    if (!name || !phone || !address) {
        alert("Please fill in your Full Name, Phone Number, and Shipping Address before proceeding to payment.");
        return;
    }

    let grandTotal = 0;
    let itemsSummary = "";

    cart.forEach(item => {
        grandTotal += item.price * item.quantity;
        itemsSummary += `${item.name} (${item.weight}) x${item.quantity}; `;
    });

    if (grandTotal <= 0) {
        alert("Invalid cart total.");
        return;
    }

    const options = {
        "key": RAZORPAY_KEY_ID,
        "amount": grandTotal * 100, // Amount in paise
        "currency": "INR",
        "name": "MAHIVERSE GLOBLE",
        "description": "Order: " + itemsSummary.slice(0, 80),
        "image": "favicon.png.jpeg.png",
        "prefill": {
            "name": name,
            "contact": phone
        },
        "handler": function (response) {
            alert("✅ Payment Successful!\nPayment ID: " + response.razorpay_payment_id);

            // Construct WhatsApp Order Message with Address + Payment ID
            let successMsg = `Hello MAHIVERSE GLOBLE! 🌿\n\nI completed my order payment on your website!\n\n💳 *Razorpay Payment ID:* ${response.razorpay_payment_id}\n💳 *Total Paid:* ₹${grandTotal}\n\n📍 *DELIVERY ADDRESS:*\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\n🛒 *ITEMS PAID:*\n`;
            
            cart.forEach((item, i) => {
                successMsg += `${i + 1}. ${item.name} (${item.weight}) x ${item.quantity} = ₹${item.price * item.quantity}\n`;
            });

            // Reset Cart
            cart = [];
            localStorage.removeItem("mahiverse_cart");
            updateCartUI();
            closeCartSidebar();

            // Clear Input Fields
            if (nameInput) nameInput.value = "";
            if (phoneInput) phoneInput.value = "";
            if (addressInput) addressInput.value = "";

            // Open WhatsApp with complete details
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(successMsg)}`, "_blank");
        },
        "theme": {
            "color": "#14532d"
        }
    };

    const rzp = new Razorpay(options);
    rzp.open();
}

// 6. TOAST NOTIFICATION
function showToast(message) {
    let toast = document.getElementById("cart-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "cart-toast";
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: #14532d;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 30px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 100000;
            transition: opacity 0.3s ease;
            opacity: 0;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";

    setTimeout(() => {
        toast.style.opacity = "0";
    }, 2500);
}

// 7. EVENT LISTENERS
document.addEventListener("DOMContentLoaded", () => {
    const cartIcon = document.getElementById("cart-icon-nav");
    const closeCart = document.getElementById("close-cart");
    const cartOverlay = document.getElementById("cart-overlay");
    const menuToggle = document.getElementById("menu-toggle");
    const navbar = document.getElementById("navbar");
    const razorpayBtn = document.getElementById("razorpay-checkout-btn");
    const whatsappBtn = document.getElementById("whatsapp-checkout-btn");

    if (cartIcon) cartIcon.addEventListener("click", (e) => { e.preventDefault(); openCartSidebar(); });
    if (closeCart) closeCart.addEventListener("click", closeCartSidebar);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCartSidebar);

    if (menuToggle && navbar) {
        menuToggle.addEventListener("click", () => {
            navbar.classList.toggle("active");
        });
    }

    if (razorpayBtn) {
        razorpayBtn.addEventListener("click", triggerRazorpayPayment);
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            const name = document.getElementById("cust-name") ? document.getElementById("cust-name").value.trim() : "";
            const phone = document.getElementById("cust-phone") ? document.getElementById("cust-phone").value.trim() : "";
            const address = document.getElementById("cust-address") ? document.getElementById("cust-address").value.trim() : "";

            let message = "Hello MAHIVERSE GLOBLE! 🌿\n\nI would like to place an order for the following items:\n\n";
            let total = 0;

            cart.forEach((item, i) => {
                const amount = item.price * item.quantity;
                total += amount;
                message += `${i + 1}. ${item.name} (${item.weight}) x ${item.quantity} = ₹${amount}\n`;
            });

            message += `\nTotal Estimated Price: ₹${total}\n`;

            if (name || phone || address) {
                message += `\n📍 *DELIVERY DETAILS:*\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n`;
            }

            message += `\nPlease confirm availability and payment details!`;

            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
        });
    }

    updateCartUI();
});
