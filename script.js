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
    
    // UI Elements Selector Matrix
    const cartIcon = document.getElementById("cart-icon-nav");
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");
    const closeCart = document.getElementById("close-cart");
    const cartItemsContainer = document.getElementById("cart-items-container");
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

            // Auto reveal sidebar panel on successful item insertion
            if (cartSidebar && cartOverlay) {
                cartSidebar.classList.add("open");
                cartOverlay.classList.add("show");
            }
        });
    });

    // Unified UI Tracker & Dual Payment Button Injector
    function updateCartUI() {
        if (!cartItemsContainer) return;
        cartItemsContainer.innerHTML = "";

        let totalItems = 0;
        let totalPrice = 0;

        // Calculate layout totals first
        cart.forEach((item) => {
            totalItems += item.quantity;
            totalPrice += item.price * item.quantity;
        });

        // Synchronize Top Navbar Counter Component
        if (cartCount) cartCount.textContent = totalItems;

        // Condition Check: Empty State Manifestation
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

        // Render Cart Array Stack Items
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

        // Rebuild Dynamic Payment UI blocks with accurate math metrics
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

    // Processing helpers to generate plain text receipts
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

    // Handle Active Item Removals via Delegation
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

    // ROUTE 1: UPI Gateway Handler (Locked to Axis Bank VPA target)
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "upi-checkout-btn") {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            const { orderDetails, total } = generateOrderString();
            
            const upiAddress = "moddyroy4@okaxis"; 
            const merchantName = "MAHIVERSE GLOBLE";
            const transactionNote = encodeURIComponent(`Mahiverse Globle Order Purchase`);
            
            const upiUrl = `upi://pay?pa=${upiAddress}&pn=${encodeURIComponent(merchantName)}&am=${total}&cu=INR&tn=${transactionNote}`;
            
            let message = `Hello MAHIVERSE GLOBLE! 🌿\n\nI am completing my payment order via UPI:\n\n${orderDetails}Total Amount Paid: ₹${total}\n\nTransaction target opened: ${upiUrl}\n\nPlease verify settlement status and confirm shipping. Thank you!`;
            
            // Fire native operational app application context
            window.open(upiUrl, "_self");
            
            // Launch corresponding tracking confirmation message context window
            setTimeout(() => {
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
            }, 1000);
        }
    });

    // ROUTE 2: WhatsApp Manual Invoice / Export Option
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

    // Initial mount initialization execution
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
// PERFORMANCE LOAD TIMERS
// ===========================================
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
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
