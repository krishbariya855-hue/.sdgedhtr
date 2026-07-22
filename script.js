// =========================================================================
// MAHIVERSE GLOBLE - UNIVERSAL MULTI-ITEM CART & INTERACTIVE ENGINE
// =========================================================================

console.log("MAHIVERSE GLOBLE Engine Loaded Successfully");

const WHATSAPP_NUMBER = "916354179230";
let cart = JSON.parse(localStorage.getItem("mahiverse_cart")) || [];
let appliedDiscountPercent = 0;
let activeCouponCode = "";
let currentReviewIndex = 0;

const SPICE_REVIEWS = [
    { name: "Rajesh K. (Gourmet Catering)", text: "The dehydrated garlic powder has an incredibly rich aroma. Perfect consistency for our restaurant bases!", stars: "⭐⭐⭐⭐⭐" },
    { name: "Ananya Patel (Home Chef)", text: "Switched to Mahiverse for onion powder. 100% natural flavor, no artificial clumping at all. Highly recommend!", stars: "⭐⭐⭐⭐⭐" },
    { name: "Marcus T. (Global Imports Ltd)", text: "Excellent industrial packaging parameters. Kept moisture at 0% during bulk ocean freight transit.", stars: "⭐⭐⭐⭐⭐" }
];

// 1. UNIVERSAL ADD TO CART FUNCTION (Opens Slide-out Window on Right)
window.addToCartDirect = function(productId, productName, selectId) {
    const select = document.getElementById(selectId) || document.querySelector(`.card[data-id="${productId}"] select`) || document.querySelector("select");

    if (!select) {
        alert("Please select a pack size first.");
        return;
    }

    const weight = select.value;
    const selectedOption = select.options[select.selectedIndex];
    const price = Number(selectedOption.getAttribute("data-price") || selectedOption.dataset.price || 0);
    const key = productId + "_" + weight;

    if (weight.includes("Bulk") || weight.includes("Commercial")) {
        alert("For commercial bulk cargo orders, please contact us directly on WhatsApp or request an export quote!");
        return;
    }

    // Check if item already exists in cart
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

    // Save state to Local Storage
    localStorage.setItem("mahiverse_cart", JSON.stringify(cart));
    
    // Refresh Cart UI
    updateCartUI();

    // Trigger Popup Toast
    showToast(`✓ ${productName} added to cart!`);

    // SLIDE OPEN THE RIGHT SIDE CART WINDOW INSTANTLY
    openCartSidebar();
};

// 2. OPEN & CLOSE SIDEBAR DRAWER
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

// 3. CART DISPLAY RENDERER
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

    // Apply Coupon Discount if available
    if (appliedDiscountPercent > 0) {
        let discountAmount = Math.round((totalPrice * appliedDiscountPercent) / 100);
        totalPrice = totalPrice - discountAmount;
    }

    if (cartCount) cartCount.textContent = totalItems;
    if (totalAmountSpan) totalAmountSpan.textContent = `₹${totalPrice}`;

    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="empty-msg">Your cart is currently empty.</p>';
    }
}

// 4. REMOVE ITEM FROM CART
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem("mahiverse_cart", JSON.stringify(cart));
    updateCartUI();
};

// 5. TOAST NOTIFICATION
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
            transition: opacity 0.3s ease, transform 0.3s ease;
            opacity: 0;
            pointer-events: none;
        `;
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(-10px)";

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-50%) translateY(0)";
    }, 2500);
}

// 6. DOM LISTENERS & INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
    const cartIcon = document.getElementById("cart-icon-nav");
    const closeCart = document.getElementById("close-cart");
    const cartOverlay = document.getElementById("cart-overlay");
    const menuToggle = document.getElementById("menu-toggle");
    const navbar = document.getElementById("navbar");
    const backToTop = document.getElementById("backToTop");
    const whatsappBtn = document.getElementById("whatsapp-checkout-btn");

    if (cartIcon) cartIcon.addEventListener("click", (e) => { e.preventDefault(); openCartSidebar(); });
    if (closeCart) closeCart.addEventListener("click", closeCartSidebar);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCartSidebar);

    if (menuToggle && navbar) {
        menuToggle.addEventListener("click", (e) => {
            e.preventDefault();
            navbar.classList.toggle("active");
            menuToggle.classList.toggle("active");
        });
    }

    if (backToTop) {
        window.addEventListener("scroll", () => {
            backToTop.style.display = window.scrollY > 300 ? "flex" : "none";
        }, { passive: true });
        backToTop.addEventListener("click", () => { window.scrollTo({ top: 0, behavior: "smooth" }); });
    }

    // WHATSAPP ORDER DIRECT SUBMISSION
    if (whatsappBtn) {
        whatsappBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            let message = "Hello MAHIVERSE GLOBLE! 🌿\n\nI would like to place an order for the following items:\n\n";
            let total = 0;

            cart.forEach((item, i) => {
                const amount = item.price * item.quantity;
                total += amount;
                message += `${i + 1}. ${item.name} (${item.weight}) x ${item.quantity} = ₹${amount}\n`;
            });

            if (appliedDiscountPercent > 0 && activeCouponCode) {
                let discountAmount = Math.round((total * appliedDiscountPercent) / 100);
                total = total - discountAmount;
                message += `\n🎫 Coupon Applied: ${activeCouponCode} (-${appliedDiscountPercent}%)\n`;
            }

            message += `\nTotal Estimated Price: ₹${total}\n\nPlease confirm availability and shipping details!`;

            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
        });
    }

    updateCartUI();
});

// 7. REAL-TIME SEARCH & CATEGORY FILTERING ENGINE
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('product-search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-grid .card');

    function filterProducts() {
        const searchWord = searchInput.value.toLowerCase().trim();
        const activeBtn = document.querySelector('.filter-btn.active');
        const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';

        productCards.forEach(card => {
            const h3 = card.querySelector('h3');
            const p = card.querySelector('p');
            if (!h3 || !p) return;

            const productName = h3.textContent.toLowerCase();
            const productDesc = p.textContent.toLowerCase();
            const cardCategory = card.getAttribute('data-category') || 'all';

            const matchesSearch = productName.includes(searchWord) || productDesc.includes(searchWord);
            const matchesCategory = (activeFilter === 'all') || (cardCategory === activeFilter);

            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
                card.style.opacity = '1';
            } else {
                card.style.display = 'none';
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.style.background = '#fff';
                btn.style.color = '#444';
                btn.style.borderColor = '#ebdcb9';
            });

            this.classList.add('active');
            this.style.background = '#14532d';
            this.style.color = '#fff';
            this.style.borderColor = '#14532d';

            filterProducts();
        });
    });
});

// 8. INTERACTIVE FAQ ACCORDION ENGINE
document.addEventListener('DOMContentLoaded', function() {
    const faqTriggers = document.querySelectorAll('.faq-trigger');

    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const currentItem = this.parentElement;
            const contentBlock = this.nextElementSibling;
            const iconElement = this.querySelector('.faq-icon');

            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== currentItem) {
                    const content = item.querySelector('.faq-content');
                    const icon = item.querySelector('.faq-icon');
                    if (content) content.style.maxHeight = null;
                    if (icon) {
                        icon.style.transform = 'rotate(0deg)';
                        icon.textContent = '+';
                    }
                }
            });

            if (contentBlock.style.maxHeight) {
                contentBlock.style.maxHeight = null;
                iconElement.style.transform = 'rotate(0deg)';
                iconElement.textContent = '+';
            } else {
                contentBlock.style.maxHeight = contentBlock.scrollHeight + "px";
                iconElement.style.transform = 'rotate(45deg)';
                iconElement.textContent = '×';
            }
        });
    });
});

// Preloader close fallback logic
const loader = document.getElementById("loader");
if (loader) {
    loader.style.opacity = "0"; 
    loader.style.visibility = "hidden"; 
    loader.style.display = "none";
}
// =========================================================================
// MAHIVERSE GLOBLE - LIVE RAZORPAY MULTI-ITEM CART ENGINE
// =========================================================================

console.log("MAHIVERSE GLOBLE Engine Loaded Successfully");

// Replace with your new key if you regenerated it in Razorpay Dashboard
const RAZORPAY_KEY_ID = "rzp_live_TGTWYtkzRnCuwX"; 
const WHATSAPP_NUMBER = "916354179230";

let cart = JSON.parse(localStorage.getItem("mahiverse_cart")) || [];

// 1. ADD TO CART FUNCTION
window.addToCartDirect = function(productId, productName, selectId) {
    const select = document.getElementById(selectId) || document.querySelector(`.card[data-id="${productId}"] select`) || document.querySelector("select");

    if (!select) {
        alert("Please select a pack size first.");
        return;
    }

    const weight = select.value;
    const selectedOption = select.options[select.selectedIndex];
    const price = Number(selectedOption.getAttribute("data-price") || selectedOption.dataset.price || 0);
    const key = productId + "_" + weight;

    if (weight.includes("Bulk") || weight.includes("Commercial")) {
        alert("For commercial bulk cargo orders, please contact us directly on WhatsApp or request an export quote!");
        return;
    }

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

// 3. CART RENDER ENGINE
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

// 4. REMOVE ITEM FROM CART
window.removeFromCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem("mahiverse_cart", JSON.stringify(cart));
    updateCartUI();
};

// 5. RAZORPAY MULTI-ITEM CHECKOUT FUNCTION
function triggerRazorpayPayment() {
    if (cart.length === 0) {
        alert("Your cart is empty! Add products before paying.");
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
        "amount": grandTotal * 100, // Total in paise
        "currency": "INR",
        "name": "MAHIVERSE GLOBLE",
        "description": "Order: " + itemsSummary.slice(0, 100),
        "image": "favicon.png.jpeg.png",
        "handler": function (response) {
            alert("✅ Payment Successful!\nPayment ID: " + response.razorpay_payment_id);

            let successMsg = `Hello MAHIVERSE GLOBLE! 🌿\n\nI completed my order payment on your website!\n\n💳 Razorpay Payment ID: ${response.razorpay_payment_id}\n\n🛒 ITEMS PAID:\n`;
            cart.forEach((item, i) => {
                successMsg += `${i + 1}. ${item.name} (${item.weight}) x ${item.quantity} = ₹${item.price * item.quantity}\n`;
            });
            successMsg += `\nTotal Paid: ₹${grandTotal}\n\nPlease confirm dispatch details!`;

            cart = [];
            localStorage.removeItem("mahiverse_cart");
            updateCartUI();
            closeCartSidebar();

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

            let message = "Hello MAHIVERSE GLOBLE! 🌿\n\nI would like to place an order for the following items:\n\n";
            let total = 0;

            cart.forEach((item, i) => {
                const amount = item.price * item.quantity;
                total += amount;
                message += `${i + 1}. ${item.name} (${item.weight}) x ${item.quantity} = ₹${amount}\n`;
            });

            message += `\nTotal Estimated Price: ₹${total}\n\nPlease confirm availability and payment details!`;

            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
        });
    }

    updateCartUI();
});
