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
    
    // UI Elements
   // ===========================================
    // UPGRADED SHOPPING CART INTERFACE ENGINE
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

    // Add To Cart Engine
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
    addToCartButtons.forEach(button => {
        button.addEventListener("click", () => {
            const card = button.closest(".card");
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

    // Unified UI Tracker & Button Injector (Fixes the ₹0 Bug)
    function updateCartUI() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = "";

        let totalItems = 0;
        let totalPrice = 0;

        // Calculate totals first
        cart.forEach((item) => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;
        });

        // Sync Nav Counter
        if (cartCount) cartCount.textContent = totalItems;

        // Render Cart items list
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
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
            cartItemsContainer.appendChild(div);
        });

        // Dynamically rebuild the footer with the CORRECT price math totals injected
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

    // Helper to generate text receipt strings
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

    // Handle Item Deletion Events
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("remove-item-btn")) {
                const index = parseInt(e.target.dataset.index);
                cart.splice(index, 1);
                localStorage.setItem("mahiverse_cart", JSON.stringify(cart));
                updateCartUI();
            }
        });
    }

    // ROUTE 1: UPI Button Action Handler (Locked to moddyroy4@okaxis)
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "upi-checkout-btn") {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            const { orderDetails, total } = generateOrderString();
            
            // Fixed Configuration Details linked to Axis Account
            const upiAddress = "moddyroy4@okaxis"; 
            const merchantName = "MAHIVERSE GLOBLE";
            const transactionNote = encodeURIComponent(`Mahiverse Globle Order Purchase`);
            
            const upiUrl = `upi://pay?pa=${upiAddress}&pn=${encodeURIComponent(merchantName)}&am=${total}&cu=INR&tn=${transactionNote}`;
            
            let message = `Hello MAHIVERSE GLOBLE! 🌿\n\nI am completing my payment order via UPI:\n\n${orderDetails}Total Amount Paid: ₹${total}\n\nTransaction target opened: ${upiUrl}\n\nPlease verify settlement status and confirm shipping. Thank you!`;
            
            // Fire native UPI intent routing links
            window.open(upiUrl, "_self");
            
            // Redirect smoothly to WhatsApp order matching desk after 1 second delay
            setTimeout(() => {
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
            }, 1000);
        }
    });

    // ROUTE 2: WhatsApp Manual Invoice Action Handler
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "whatsapp-checkout-btn") {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            const { orderDetails, total } = generateOrderString();
            
            let message = `Hello MAHIVERSE GLOBLE! 🌿\n\nI want to place the following order request:\n\n${orderDetails}`;
            message += `Estimated Order Total: ₹${total}\n\n`;
            message += "Please confirm availability, bulk terms, and payment invoice details. Thank you!";

            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
        }
    });

    // Initial load mount run
    updateCartUI();
            localStorage.setItem("mahiverse_cart", JSON.stringify(cart));
            updateCartUI();

            // Slide open the cart panel on addition
            if (cartSidebar && cartOverlay) {
                cartSidebar.classList.add("open");
                cartOverlay.classList.add("show");
            }
        });
    });

    // Update Cart UI Manifest
    function updateCartUI() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = "";

        let totalItems = 0;
        let totalPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
            if (cartCount) cartCount.textContent = "0";
            if (cartTotal) cartTotal.textContent = "₹0";
            return;
        }

        cart.forEach((item, index) => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;

            const div = document.createElement("div");
            div.className = "cart-item";
            div.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.weight}</p>
                    <p>Qty: ${item.quantity}</p>
                    <p><strong>₹${item.price * item.quantity}</strong></p>
                </div>
                <button class="remove-item-btn" data-index="${index}">
                    🗑️ Remove
                </button>
            `;
            cartItemsContainer.appendChild(div);
        });

        if (cartCount) cartCount.textContent = totalItems;
        if (cartTotal) cartTotal.textContent = "₹" + totalPrice;
    }

    // Remove Item Engine Execution
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener("click", (e) => {
            const btn = e.target.closest(".remove-item-btn");
            if (!btn) return;

            const index = parseInt(btn.dataset.index);
            cart.splice(index, 1);
            localStorage.setItem("mahiverse_cart", JSON.stringify(cart));
            updateCartUI();
        });
    }

 // Premium Dual-Route Checkout Engine (Domestic UPI & International Export)
    if (cartItemsContainer) {
        // Find the checkout container or footer to place buttons dynamically
        const cartFooter = document.querySelector(".cart-footer");
        
        if (cartFooter) {
            // Replace old single button layout with clean dual selector container
            cartFooter.innerHTML = `
                <div class="cart-total-row">
                    <span>Estimated Total:</span>
                    <span id="cart-total-amount">₹0</span>
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

    // Function to process cart data into message strings
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

    // Action ROUTE 1: UPI Gateway Handler
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "upi-checkout-btn") {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            const { orderDetails, total } = generateOrderString();
            
            // Generate standard UPI merchant link configuration
            const upiAddress = "mahiversegloble@gmail.com"; 
            const merchantName = "MAHIVERSE GLOBLE";
            const transactionNote = encodeURIComponent(`Order Delivery Purchase`);
            
            // Standardizing the mobile deep-linking protocol string
            const upiUrl = `upi://pay?pa=${upiAddress}&pn=${encodeURIComponent(merchantName)}&am=${total}&cu=INR&tn=${transactionNote}`;
            
            // Logically route order metrics straight to WhatsApp verification window
            let message = `Hello MAHIVERSE GLOBLE! 🌿\n\nI just initiated an instant UPI payment transaction:\n\n${orderDetails}Estimated Order Total: ₹${total}\n\nApp Transaction Link Opened: ${upiUrl}\n\nPlease verify settlement status and confirm shipping tracking details. Thank you!`;
            
            // Fire both execution contexts
            window.open(upiUrl, "_self"); // Fires native local processing app directly on customer's phone
            setTimeout(() => {
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
            }, 1000);
        }
    });

    // Action ROUTE 2: Export Invoice Handler
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "whatsapp-checkout-btn") {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            const { orderDetails, total } = generateOrderString();
            
            let message = `Hello MAHIVERSE GLOBLE! 🌿\n\nI want to place the following international export/bulk order request:\n\n${orderDetails}`;
            message += `Estimated Order Total: ₹${total}\n\n`;
            message += "Please confirm availability, custom packaging profiles, and commercial shipping payment details. Thank you!";

            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
        }
    });
    // Initialize UI Sync on Mount
    updateCartUI();

    // ===========================================
    // NAVIGATION & INTERFACE HOOKS
    // ===========================================
    
    if (menuToggle && navbar) {
        menuToggle.addEventListener("click", () => {
            navbar.classList.toggle("active");
        });
    }

    if (backToTop) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 300) {
                backToTop.style.display = "flex";
                backToTop.style.justifyContent = "center";
                backToTop.style.alignItems = "center";
            } else {
                backToTop.style.display = "none";
            }
        });

        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // ===========================================
    // PREMIUM IMAGE POPUP MODAL
    // ===========================================
    const productImages = document.querySelectorAll(".card img, .product-img-container img");
    const imageModal = document.getElementById("imageModal");
    const modalImage = document.getElementById("modalImage");
    const closeImage = document.querySelector(".close-image");

    if (productImages.length && imageModal && modalImage) {
        productImages.forEach(img => {
            img.style.cursor = "zoom-in";
            img.addEventListener("click", () => {
                imageModal.style.display = "flex";
                modalImage.src = img.src;
            });
        });
    }

    if (closeImage && imageModal) {
        closeImage.addEventListener("click", () => {
            imageModal.style.display = "none";
        });
    }

    window.addEventListener("click", (e) => {
        if (imageModal && e.target === imageModal) {
            imageModal.style.display = "none";
        }
    });

});

// ===========================================
// PERFORMANCE LOAD TIMERS (RUNS OUTSIDE DOM READY)
// ===========================================

// Preloader Execution Fix
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        // Smoothly fade out the premium loader transition
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        setTimeout(() => {
            loader.style.display = "none";
        }, 500);
    }
});

// Scroll Reveal Intersection Matrix
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, { threshold: 0.1 });

const hiddenElements = document.querySelectorAll(
    ".hero-section, .trust-section, .stats-section, .products-showcase, .process-gallery, .reviews, .about-brief, .faq, .contact-section"
);

hiddenElements.forEach((el) => {
    el.classList.add("hidden");
    observer.observe(el);
});
