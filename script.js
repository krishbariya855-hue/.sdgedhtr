// ===========================================
// MAHIVERSE GLOBLE - CORE INTERACTIVE ENGINE
// Unified Two-Step Shopping Cart, Animations & UI Handlers
// ===========================================

console.log("MAHIVERSE GLOBLE Engine Loaded Successfully");

// 1. Global Configurations
const WHATSAPP_NUMBER = "916354179230";
let cart = JSON.parse(localStorage.getItem("mahiverse_cart")) || [];
let activeStep = 1; // Track wizard state: 1 = View Cart / Details Form, 2 = Summary & Payment

// GLOBALLY EXPOSED TRIGGER: Inline markup action path handlers
window.addToCartDirect = function(productId, productName) {
    console.log("Direct Cart Addition Triggered For:", productId);
    
    const select = document.querySelector(".weight-select") || 
                   document.getElementById("weightSelect") || 
                   document.querySelector("select");
    
    if (!select) {
        alert("Error: Packaging selector dropdown menu not found!");
        return;
    }

    const weight = select.value;
    const option = select.options[select.selectedIndex];
    const price = Number(option.getAttribute("data-price") || option.dataset.price || 0);
    const key = productId + "-" + weight;

    const existingItem = cart.find(item => item.key === key);
    if (existingItem) {
        existingItem.quantity++;
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
    
    // Default to Step 1 screen presentation frame when loading new choices
    activeStep = 1;
    updateCartUI();

    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add("open");
        cartOverlay.classList.add("show");
    }
};

// Wizard Tab Visibility Controller
window.setCheckoutStep = function(stepNumber) {
    if (stepNumber === 2) {
        // Validate shipping input fields first before advancing the screen frame layout
        const name = document.getElementById("cust-name")?.value.trim();
        const phone = document.getElementById("cust-phone")?.value.trim();
        const email = document.getElementById("cust-email")?.value.trim();
        const address = document.getElementById("cust-address")?.value.trim();

        if (!name || !phone || !email || !address) {
            alert("Please fill out all delivery information fields before moving to payment channels!");
            return;
        }
    }
    activeStep = stepNumber;
    updateCartUI();
};

// Unified UI Tracker, Shipping Form Injector & Two-Step Frame Engine
function updateCartUI() {
    const itemsContainer = document.getElementById("cart-items-container") || document.querySelector(".cart-items-body");
    if (!itemsContainer) return;
    itemsContainer.innerHTML = "";

    const formContainer = document.getElementById("cart-shipping-form-container");
    const cartSidebar = document.getElementById("cart-sidebar");
    let totalItems = 0;
    let totalPrice = 0;

    cart.forEach((item) => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
    });

    const cartCount = document.getElementById("cart-count");
    if (cartCount) cartCount.textContent = totalItems;

    // Empty State Check
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

    // STEP 1 CONTENT VIEW ENGINE
    if (activeStep === 1) {
        // Render Chosen Product Summary Items List Row Metrics
        cart.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.weight} (Qty: ${item.quantity})</p>
                    <p><strong>₹${item.price * item.quantity}</strong></p>
                </div>
                <button class="remove-item-btn" data-index="${index}">Remove</button>
            `;
            itemsContainer.appendChild(div);
        });

        // Ensure the delivery information entry form is showing below selection items
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

        // Render Wizard Next Window Control Anchor Trigger
        if (cartSidebar) {
            const cartFooter = cartSidebar.querySelector(".cart-footer");
            if (cartFooter) {
                cartFooter.innerHTML = `
                    <div class="cart-total-row">
                        <span>Subtotal:</span>
                        <span id="cart-total-amount">₹${totalPrice}</span>
                    </div>
                    <button class="btn-step-advance" onclick="window.setCheckoutStep(2)">
                        Proceed to Payment Options Details →
                    </button>
                `;
            }
        }
    } 
    
    // STEP 2 CONTENT VIEW ENGINE (Payment Window)
    else if (activeStep === 2) {
        // Read out collected delivery fields safely
        const name = document.getElementById("cust-name")?.value || "";
        const phone = document.getElementById("cust-phone")?.value || "";
        const address = document.getElementById("cust-address")?.value || "";

        // Replace product rows list view with a condensed address header profile context summary layout card
        itemsContainer.innerHTML = `
            <div class="shipping-summary-profile">
                <h4>📍 Shipping Summary Profile</h4>
                <p><strong>Deliver To:</strong> ${name}</p>
                <p><strong>Contact Tel:</strong> ${phone}</p>
                <p><strong>Address:</strong> ${address}</p>
                <button class="btn-edit-profile-back" onclick="window.setCheckoutStep(1)">✏️ Modify Delivery Details</button>
            </div>
        `;

        // Empty out input blocks to look perfectly packed and clean
        if (formContainer) formContainer.innerHTML = "";

        // Inject active, operational check-out routing path option buttons into cart base wrapper viewport
        if (cartSidebar) {
            const cartFooter = cartSidebar.querySelector(".cart-footer");
            if (cartFooter) {
                cartFooter.innerHTML = `
                    <div class="cart-total-row">
                        <span>Total Due Settlement:</span>
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
}

// Input Field Parsing Logic
function getShippingDetails() {
    const name = document.getElementById("cust-name")?.value.trim();
    const phone = document.getElementById("cust-phone")?.value.trim();
    const email = document.getElementById("cust-email")?.value.trim();
    const address = document.getElementById("cust-address")?.value.trim();

    // If step 2 elements have wiped values out, fallback cleanly to reading text element summaries
    if (activeStep === 2) {
        return {
            name: "Verified Customer Profile",
            phone: "Attached to Order Document",
            email: "Attached",
            address: "Specified Destination"
        };
    }

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

// 2. DOM Content Loaded Dependent UI Observers
document.addEventListener("DOMContentLoaded", () => {
    const cartIcon = document.getElementById("cart-icon-nav");
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");
    const closeCart = document.getElementById("close-cart");
    const menuToggle = document.getElementById("menu-toggle");
    const navbar = document.getElementById("navbar");
    const backToTop = document.getElementById("backToTop");

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

    // ROUTE 1: UPI Gateway Handler Execution Engine
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "upi-checkout-btn") {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            const { orderDetails, total } = generateOrderString();
            const upiAddress = "moddyroy4@okaxis"; 
            const merchantName = "MAHIVERSE GLOBLE";
            const upiUrl = `upi://pay?pa=${upiAddress}&pn=${encodeURIComponent(merchantName)}&am=${total}&cu=INR&tn=${encodeURIComponent('Mahiverse Order')}`;
            
            let message = `Hello MAHIVERSE GLOBLE! 🌿\n\nAn instant UPI payment has been processed via checkout application desk framework.\n\n`;
            message += `🛒 ORDER ITEM SELECTION MATRIX:\n${orderDetails}Total Amount Settled: ₹${total}\n\nPayment channel transaction target requested successfully. Please cross-reference status desk logs and issue delivery courier details. Thank you!`;
            
            window.open(upiUrl, "_self");
            setTimeout(() => {
                window.open(`https://wa.me/916354179230?text=${encodeURIComponent(message)}`, "_blank");
            }, 1000);
        }
    });

    // ROUTE 2: WhatsApp Manual Invoice Export Engine
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "whatsapp-checkout-btn") {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            const { orderDetails, total } = generateOrderString();
            let message = `Hello MAHIVERSE GLOBLE! 🌿\n\nI am forwarding an order validation invoice profile request.\n\n`;
            message += `🛒 ORDER ITEM SELECTION MATRIX:\n${orderDetails}Estimated Cargo Valuation: ₹${total}\n\nPlease cross-reference terms and verify stock logistics dispatch dates. Thank you!`;

            window.open(`https://wa.me/916354179230?text=${encodeURIComponent(message)}`, "_blank");
        }
    });

    updateCartUI();

    if (menuToggle && navbar) {
        menuToggle.addEventListener("click", () => { navbar.classList.toggle("active"); });
    }

    if (backToTop) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) { backToTop.style.display = "flex"; } else { backToTop.style.display = "none"; }
        });
        backToTop.addEventListener("click", () => { window.scrollTo({ top: 0, behavior: "smooth" }); });
    }
});

// Preloader Execution Hooks
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        setTimeout(() => { loader.style.display = "none"; }, 500);
    }
});
