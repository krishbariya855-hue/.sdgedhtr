// =========================================================================
// MAHIVERSE GLOBLE - FIREBASE & RAZORPAY CHECKOUT ENGINE
// =========================================================================

console.log("MAHIVERSE GLOBLE Engine Loaded Successfully");

// 1. FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyCn_Ab4_-99%219zE9Qf1yj05bj7vpwrI",
  authDomain: "mahiverse-globle.firebaseapp.com",
  projectId: "mahiverse-globle",
  storageBucket: "mahiverse-globle.firebasestorage.app",
  messagingSenderId: "351496017152",
  appId: "1:351496017152:web:226bf771535d08614080d",
  measurementId: "G-GJ1YQJ325A"
};

// Initialize Firebase, Firestore & Analytics
if (typeof firebase !== "undefined") {
    firebase.initializeApp(firebaseConfig);
    var db = firebase.firestore();
    
    // Step 3: Initialize Analytics if supported
    if (firebase.analytics) {
        var analytics = firebase.analytics();
        console.log("Firebase Analytics initialized");
    }
}
}

const RAZORPAY_KEY_ID = "rzp_live_TGTWYtkzRnCuwX"; 
const WHATSAPP_NUMBER = "916354179230";

let cart = JSON.parse(localStorage.getItem("mahiverse_cart")) || [];

// 2. ADD TO CART FUNCTION
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

// 3. CART DRAWER CONTROLS
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

// 4. UPDATE CART UI
function updateCartUI() {
    const itemsContainer = document.getElementById("cart-items-container") || document.querySelector(".cart-items-body");
    const cartCount = document.getElementById("cart-count");
    const totalAmountSpan = document.getElementById("cart-total-amount");

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
    }
}

// 5. REMOVE ITEM FROM CART
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem("mahiverse_cart", JSON.stringify(cart));
    updateCartUI();
};

// 6. STANDALONE CHECKOUT PAGE HANDLER (CHECKOUT.HTML)
window.triggerRazorpayWithAddress = function(fullName, phone, fullAddress, grandTotal) {
    let itemsSummary = "";
    cart.forEach(item => {
        itemsSummary += `${item.name} (${item.weight}) x${item.quantity}; `;
    });

    const options = {
        "key": RAZORPAY_KEY_ID,
        "amount": grandTotal * 100, 
        "currency": "INR",
        "name": "MAHIVERSE GLOBLE",
        "description": "Order: " + itemsSummary.slice(0, 80),
        "image": "favicon.png.jpeg.png",
        "prefill": {
            "name": fullName,
            "contact": phone
        },
        "handler": function (response) {
            const paymentId = response.razorpay_payment_id;

            // Save order document directly to Cloud Firestore
            if (typeof db !== "undefined") {
                db.collection("orders").add({
                    paymentId: paymentId,
                    customerName: fullName,
                    customerPhone: phone,
                    shippingAddress: fullAddress,
                    items: cart,
                    totalPaid: grandTotal,
                    orderStatus: "Processing",
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    console.log("Order saved to Firestore!");
                }).catch((error) => {
                    console.error("Firestore error: ", error);
                });
            }

            alert("✅ Payment Successful!\nPayment ID: " + paymentId);

            // Construct WhatsApp Order Message
            let successMsg = `Hello MAHIVERSE GLOBLE! 🌿\n\nI placed an order on your website!\n\n💳 *Payment ID:* ${paymentId}\n💳 *Total Paid:* ₹${grandTotal}\n\n📍 *SHIPPING ADDRESS:*\nName: ${fullName}\nPhone: ${phone}\nAddress: ${fullAddress}\n\n🛒 *ITEMS ORDERED:*\n`;
            
            cart.forEach((item, i) => {
                successMsg += `${i + 1}. ${item.name} (${item.weight}) x ${item.quantity} = ₹${item.price * item.quantity}\n`;
            });

            // Clear Cart & LocalStorage
            cart = [];
            localStorage.removeItem("mahiverse_cart");
            
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(successMsg)}`, "_blank");
            window.location.href = "index.html";
        },
        "theme": { "color": "#14532d" }
    };

    const rzp = new Razorpay(options);
    rzp.open();
};

// 7. TOAST NOTIFICATION
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

// 8. EVENT LISTENERS
document.addEventListener("DOMContentLoaded", () => {
    const cartIcon = document.getElementById("cart-icon-nav");
    const closeCart = document.getElementById("close-cart");
    const cartOverlay = document.getElementById("cart-overlay");
    const menuToggle = document.getElementById("menu-toggle");
    const navbar = document.getElementById("navbar");

    if (cartIcon) cartIcon.addEventListener("click", (e) => { e.preventDefault(); openCartSidebar(); });
    if (closeCart) closeCart.addEventListener("click", closeCartSidebar);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCartSidebar);

    if (menuToggle && navbar) {
        menuToggle.addEventListener("click", () => {
            navbar.classList.toggle("active");
        });
    }

    updateCartUI();
});
