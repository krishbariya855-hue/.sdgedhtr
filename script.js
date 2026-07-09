// ===========================================
// MAHIVERSE GLOBLE - CORE INTERACTIVE ENGINE
// Unified Shopping Cart, Animations & UI Handlers
// ===========================================

console.log("MAHIVERSE GLOBLE Engine Loaded Successfully");

// 1. Global Configurations
const WHATSAPP_NUMBER = "916354179230";
let cart = JSON.parse(localStorage.getItem("mahiverse_cart")) || [];

// 2. DOM Content Loaded Dependent Sub-Systems
document.addEventListener("DOMContentLoaded", () => {
    
    // UI Elements Selector Matrix Safely Checked
    const cartIcon = document.getElementById("cart-icon-nav");
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");
    const closeCart = document.getElementById("close-cart");
    const cartCount = document.getElementById("cart-count");
    const menuToggle = document.getElementById("menu-toggle");
    const navbar = document.getElementById("navbar");
    const backToTop = document.getElementById("backToTop");

    // ===========================================
    // SHOPPING CART INTERFACE ENGINE
    // ===========================================
    
    function closeCartPanel() {
        if (cartSidebar) cartSidebar.classList.remove("open");
        if (cartOverlay) cartOverlay.classList.remove("show");
    }

    if (cartIcon && cartSidebar && cartOverlay) {
        cartIcon.addEventListener("click", (e) => {
            e.preventDefault();
            cartSidebar.classList.add("open");
            cartOverlay.classList.add("show");
        });
    }

    if (closeCart) closeCart.addEventListener("click", closeCartPanel);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCartPanel);

    // Add To Cart Operations
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
    addToCartButtons.forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".card") || button.closest(".single-details");
            if (!card) return;

            const id = card.dataset.id;
            const name = card.dataset.name;
            const select = card.querySelector(".weight-select");
            
            if (!select) return;
            const weight = select.value;
            const option = select.options[select.selectedIndex];
            const price = Number(option.dataset.price);
            const key = id + "-" + weight;

            const existingItem = cart.find(item => item.key === key);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                cart.push({
                    key: key,
                    id: id,
                    name: name,
                    weight: weight,
                    price: price,
                    quantity: 1
                });
            }

            localStorage.setItem("mahiverse_cart", JSON.stringify(cart));
            updateCartUI();

            if (cartSidebar && cartOverlay) {
                cartSidebar.classList.add("open");
                cartOverlay.classList.add("show");
            }
        });
    });

    // Unified UI Tracker, Shipping Form Injector & Dynamic Button Sync
    function updateCartUI() {
        const itemsContainer = document.getElementById("cart-items-container") || document.querySelector(".cart-items-body");
        if (!itemsContainer) return;
        itemsContainer.innerHTML = "";

        const formContainer = document.getElementById("cart-shipping-form-container");
        let totalItems = 0;
        let totalPrice = 0;

        cart.forEach((item) => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;
        });

        if (cartCount) cartCount.textContent = totalItems;

        // Condition Check: Empty State
        if (cart.length === 0) {
            itemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
            if (formContainer) formContainer.innerHTML = ""; 
            if (cartSidebar) {
                const cartFooter = cartSidebar.querySelector(".cart-footer");
                if (cartFooter) {
                    cartFooter.innerHTML = `
                        <div class="cart-total-row">
                            <span>Estimated Total:</span>
                            <span id="cart-total-amount">₹0</span>
                        </div>
                    `;
                }
            }
            return;
        }

        // Render Cart Items
        cart.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.weight}</p>
                    <p>Qty: ${item.quantity}</p>
                    <p><strong>₹${item.price * item.quantity}</strong></p>
                </div>
                <button class="remove-item-btn" data-index="${index}">Remove</button>
            `;
            itemsContainer.appendChild(div);
        });

        // Inject Dynamic Shipping Details Form safely
        if (formContainer && !formContainer.querySelector(".cart-shipping-form")) {
            formContainer.innerHTML = `
                <div class="cart-shipping-form">
                    <h3>📋 Delivery Information</h3>
                    <div class="form-group">
                        <label for="cust-name">Full Name *</label>
                        <input type="text" id="cust-name" placeholder="Enter your full name" required>
                    </div>
                    <div class="form-group">
                        <label for="cust-phone">Mobile Number *</label>
                        <input type="tel" id="cust-phone" placeholder="Enter 10-digit mobile number" required>
                    </div>
                    <div class="form-group">
                        <label for="cust-email">Email ID *</label>
                        <input type="email" id="cust-email" placeholder="name@email.com" required>
                    </div>
                    <div class="form-group">
                        <label for="cust-address">Courier Shipping Address *</label>
                        <textarea id="cust-address" placeholder="Flat/House No, Building, Street, City, State & Pincode" required></textarea>
                    </div>
                </div>
            `;
        }

        // Rebuild Dynamic Payment UI blocks
        if (cartSidebar) {
            const cartFooter = cartSidebar.querySelector(".cart-footer");
            if (cartFooter) {
                cartFooter.innerHTML = `
                    <div class="cart-total-row">
                        <span>Estimated Total:</span>
                        <span id="cart-total-amount">₹${totalPrice}</span>
                    </div>
                    <div class="payment-selector-wrapper">
                        <button id="upi-checkout-btn" class="checkout-btn-premium btn-upi-checkout">
                            ⚡ Pay Instant via UPI (GPay/PhonePe)
                        </button>
                        <button id="whatsapp-checkout-btn" class="checkout-btn-premium btn-intl-checkout">
                            🌐 Request International Export Invoice
                        </button>
                    </div>
                `;
            }
        }
    }

    // Input Validation Helper Modality
    function getShippingDetails() {
        const name = document.getElementById("cust-name")?.value.trim();
        const phone = document.getElementById("cust-phone")?.value.trim();
        const email = document.getElementById("cust-email")?.value.trim();
        const address = document.getElementById("cust-address")?.value.trim();

        if (!name || !phone || !email || !address) {
            alert("Please fill out all delivery information fields before checking out!");
            return null;
        }
        return { name, phone, email, address };
    }

    function generateOrderString() {
        let orderDetails = "";
        let total = 0;
        cart.forEach((item, i) => {
            const amount = item.price * item.quantity;
            total += amount;
            orderDetails += `${i + 1}. ${item.name}\n`;
            orderDetails += `   Weight: ${item.weight}\n`;
            orderDetails += `   Quantity: ${item.quantity}\n`;
            orderDetails += item.price === 0 ? "   Price: Bulk Order Inquiry\n\n" : `   Amount: ₹${amount}\n\n`;
        });
        return { orderDetails, total };
    }

    const itemsContainer = document.getElementById("cart-items-container") || document.querySelector(".cart-items-body");
    if (itemsContainer) {
        itemsContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("remove-item-btn")) {
                const index = parseInt(e.target.dataset.index);
                cart.splice(index, 1);
                localStorage.setItem("mahiverse_cart", JSON.stringify(cart));
                updateCartUI();
            }
        });
    }

    // ROUTE 1: UPI Gateway Handler
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "upi-checkout-btn") {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            const shipping = getShippingDetails();
            if (!shipping) return; 

            const { orderDetails, total } = generateOrderString();
            
            const upiAddress = "moddyroy4@okaxis"; 
            const merchantName = "MAHIVERSE GLOBLE";
            const transactionNote = encodeURIComponent(`Mahiverse Globle Order Purchase`);
            
            const upiUrl = `upi://pay?pa=${upiAddress}&pn=${encodeURIComponent(merchantName)}&am=${total}&cu=INR&tn=${transactionNote}`;
            
            let message = `Hello MAHIVERSE GLOBLE! 🌿\n\nI am completing my payment order via UPI:\n\n`;
            message += `📋 COURIER SHIPPING DETAILS:\n`;
            message += `Name: ${shipping.name}\n`;
            message += `Phone: ${shipping.phone}\n`;
            message += `Email: ${shipping.email}\n`;
            message += `Delivery Address: ${shipping.address}\n\n`;
            message += `🛒 ORDER DETAIL PROFILE:\n${orderDetails}Total Amount Settled: ₹${total}\n\nUPI intent launched. Please verify transaction status. Thank you!`;
            
            window.open(upiUrl, "_self");
            
            setTimeout(() => {
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
            }, 1000);
        }
    });

    // ROUTE 2: WhatsApp Manual Invoice
    document.addEventListener("click", (e) => {
        if (e.target &&
