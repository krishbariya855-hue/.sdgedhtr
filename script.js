// ===========================================
// MAHIVERSE GLOBLE - CORE INTERACTIVE ENGINE (FIXED UNIFIED VERSION)
// ===========================================

console.log("MAHIVERSE GLOBLE Engine Loaded Successfully");

const WHATSAPP_NUMBER = "916354179230";
let cart = JSON.parse(localStorage.getItem("mahiverse_cart")) || [];
let activeStep = 1; // 1 = View Cart Items, 2 = Fill Delivery Details

// 1. ADD TO CART DIRECT CALL
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
    
    activeStep = 1; // Force back to item list view on new add
    updateCartUI();

    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add("open");
        cartOverlay.classList.add("show");
    }
};

// 2. STEP SWITCHER CONTROL
window.setCheckoutStep = function(stepNumber) {
    if (stepNumber === 1) {
        // Save current form values before going back so inputs don't wipe out
        const name = document.getElementById("cust-name")?.value.trim();
        const phone = document.getElementById("cust-phone")?.value.trim();
        const email = document.getElementById("cust-email")?.value.trim();
        const address = document.getElementById("cust-address")?.value.trim();
        
        if (name) localStorage.setItem("temp_cust_name", name);
        if (phone) localStorage.setItem("temp_cust_phone", phone);
        if (email) localStorage.setItem("temp_cust_email", email);
        if (address) localStorage.setItem("temp_cust_address", address);
    }
    activeStep = stepNumber;
    updateCartUI();
};

// 3. UNIFIED UI TRACKER ENGINE
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

    // Empty state protection handling
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

    // STEP 1 CONTENT VIEW: Cart Items Only
    if (activeStep === 1) {
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

        if (formContainer) formContainer.innerHTML = ""; 

        if (cartSidebar) {
            const cartFooter = cartSidebar.querySelector(".cart-footer");
            if (cartFooter) {
                cartFooter.innerHTML = `
                    <div class="cart-total-row">
                        <span>Subtotal:</span>
                        <span id="cart-total-amount">₹${totalPrice}</span>
                    </div>
                    <button class="btn-step-advance" onclick="window.setCheckoutStep(2)">
                        Proceed to Delivery Form →
                    </button>
                `;
            }
        }
    } 
    
    // STEP 2 CONTENT VIEW: Space-saving Delivery Form Layout
    else if (activeStep === 2) {
        itemsContainer.innerHTML = ""; 

        const savedName = localStorage.getItem("temp_cust_name") || "";
        const savedPhone = localStorage.getItem("temp_cust_phone") || "";
        const savedEmail = localStorage.getItem("temp_cust_email") || "";
        const savedAddress = localStorage.getItem("temp_cust_address") || "";

        const formDiv = document.createElement("div");
        formDiv.className = "cart-shipping-form";
        formDiv.innerHTML = `
            <h3>📋 Delivery Information</h3>
            <div class="form-group">
                <label for="cust-name">Full Name *</label>
                <input type="text" id="cust-name" value="${savedName}" placeholder="Enter your full name" required>
            </div>
            <div class="form-group">
                <label for="cust-phone">Mobile Number *</label>
                <input type="tel" id="cust-phone" value="${savedPhone}" placeholder="Enter 10-digit mobile number" required>
            </div>
            <div class="form-group">
                <label for="cust-email">Email ID *</label>
                <input type="email" id="cust-email" value="${savedEmail}" placeholder="name@email.com" required>
            </div>
            <div class="form-group">
                <label for="cust-address">Courier Shipping Address *</label>
                <textarea id="cust-address" placeholder="Flat/House No, Building, Street, City, State & Pincode" required>${savedAddress}</textarea>
            </div>
            <button class="btn-edit-profile-back" onclick="window.setCheckoutStep(1)">← Back to Cart Items</button>
        `;
        itemsContainer.appendChild(formDiv);

        if (cartSidebar) {
            const cartFooter = cartSidebar.querySelector(".cart-footer");
            if (cartFooter) {
                cartFooter.innerHTML = `
                    <div class="cart-total-row">
                        <span>Total Due:</span>
                        <span id="cart-total-amount">₹${totalPrice}</span>
                    </div>
                    <div class="payment-selector-wrapper">
                        <button id="upi-checkout-btn" class="checkout-btn-premium btn-upi-checkout">
                            ⚡ Pay Instant via UPI
                        </button>
                        <button id="whatsapp-checkout-btn" class="checkout-btn-premium btn-intl-checkout">
                            🌐 International Invoice
                        </button>
                    </div>
                `;
            }
        }
    }
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

// 4. INTERFACE EVENT LISTENERS MOUNT
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

    // UPI Gateway Execution Handler
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "upi-checkout-btn") {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }
            
            const name = document.getElementById("cust-name")?.value.trim();
            const phone = document.getElementById("cust-phone")?.value.trim();
            const email = document.getElementById("cust-email")?.value.trim();
            const address = document.getElementById("cust-address")?.value.trim();

            if (!name || !phone || !email || !address) {
                alert("Please fill out all delivery fields before paying!");
                return;
            }

            const { orderDetails, total } = generateOrderString();
            const upiAddress = "moddyroy4@okaxis"; 
            const merchantName = "MAHIVERSE GLOBLE";
            const upiUrl = `upi://pay?pa=${upiAddress}&pn=${encodeURIComponent(merchantName)}&am=${total}&cu=INR&tn=${encodeURIComponent('Mahiverse Order')}`;
            
            let message = `Hello MAHIVERSE GLOBLE! 🌿\n\nAn instant UPI payment has been processed:\n\n`;
            message += `📋 COURIER SHIPPING DETAILS:\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nAddress: ${address}\n\n`;
            message += `🛒 ORDER PROFILE:\n${orderDetails}Total Amount Paid: ₹${total}`;
            
            window.open(upiUrl, "_self");
            setTimeout(() => {
                window.open(`https://wa.me/916354179230?text=${encodeURIComponent(message)}`, "_blank");
            }, 1000);
        }
    });

    // WhatsApp Manual Invoice Handler
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "whatsapp-checkout-btn") {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            const name = document.getElementById("cust-name")?.value.trim();
            const phone = document.getElementById("cust-phone")?.value.trim();
            const email = document.getElementById("cust-email")?.value.trim();
            const address = document.getElementById("cust-address")?.value.trim();

            if (!name || !phone || !email || !address) {
                alert("Please fill out all delivery fields first!");
                return;
            }

            const { orderDetails, total } = generateOrderString();
            let message = `Hello MAHIVERSE GLOBLE! 🌿\n\nI want to check an order invoice profile:\n\n`;
            message += `📋 COURIER SHIPPING DETAILS:\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nAddress: ${address}\n\n`;
            message += `🛒 ORDER PROFILE:\n${orderDetails}Estimated Order Total: ₹${total}`;

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

// Preloader Close Hooks
window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
        setTimeout(() => { loader.style.display = "none"; }, 500);
    }
});
// =========================================================================
// ADD-ON FEATURE: AUTOMATIC CLIPBOARD BACKUP (NEVER LOSE AN ORDER)
// =========================================================================
function backupOrderToClipboard(messageText) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(messageText)
            .then(() => {
                console.log("Order backup copied to clipboard successfully.");
            })
            .catch((err) => {
                console.error("Clipboard backup failed: ", err);
            });
    } else {
        // Fallback for older mobile browsers
        const textarea = document.createElement("textarea");
        textarea.value = messageText;
        textarea.style.position = "fixed"; 
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand("copy");
            console.log("Fallback order backup copied successfully.");
        } catch (err) {
            console.error("Fallback backup failed:", err);
        }
        document.body.removeChild(textarea);
    }
}

// Automatically inject backup trigger into your existing checkout clicks safely
document.addEventListener("click", (e) => {
    if (e.target && (e.target.id === "upi-checkout-btn" || e.target.id === "whatsapp-checkout-btn")) {
        const name = document.getElementById("cust-name")?.value.trim();
        const phone = document.getElementById("cust-phone")?.value.trim();
        const email = document.getElementById("cust-email")?.value.trim();
        const address = document.getElementById("cust-address")?.value.trim();

        if (name && phone && email && address && cart.length > 0) {
            const { orderDetails, total } = generateOrderString();
            let backupMsg = `MAHIVERSE GLOBLE ORDER PROFILE:\n\n`;
            backupMsg += `Name: ${name}\nPhone: ${phone}\nAddress: ${address}\n\n`;
            backupMsg += `ITEMS:\n${orderDetails}Total: ₹${total}`;
            
            backupOrderToClipboard(backupMsg);
        }
    }
});
// =========================================================================
// ADD-ON FEATURE: DYNAMIC COUPON ENGINE
// =========================================================================
let appliedDiscountPercent = 0;
let activeCouponCode = "";

// 1. Inject the coupon layout block into the cart sidebar dynamically
function injectCouponInputHTML() {
    const totalRow = document.querySelector(".cart-total-row");
    if (totalRow && !document.getElementById("coupon-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.id = "coupon-wrapper";
        wrapper.style.margin = "10px 0 20px 0";
        wrapper.innerHTML = `
            <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                <input type="text" id="coupon-input" placeholder="Enter Coupon Code (e.g. PURE10)" style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; text-transform: uppercase;">
                <button id="apply-coupon-btn" style="background: #14532d; color: white; border: none; padding: 0 15px; border-radius: 8px; font-weight: 600; font-size: 13px; cursor: pointer;">Apply</button>
            </div>
            <div id="coupon-status-msg" style="font-size: 12px; font-weight: 600; display: none;"></div>
        `;
        totalRow.parentNode.insertBefore(wrapper, totalRow);
        
        // Restore input value if a coupon is already running
        if (activeCouponCode) {
            document.getElementById("coupon-input").value = activeCouponCode;
            showCouponStatus(`Code ${activeCouponCode} Applied!`, "#14532d");
        }
    }
}

function showCouponStatus(msg, color) {
    const msgDiv = document.getElementById("coupon-status-msg");
    if (msgDiv) {
        msgDiv.textContent = msg;
        msgDiv.style.color = color;
        msgDiv.style.display = "block";
    }
}

// 2. Intercept total calculations and adjust checkout math instantly
document.addEventListener("click", (e) => {
    // Inject interface layout if user moves into the Step 2 view frame
    if (e.target && (e.target.classList.contains("btn-step-advance") || e.target.id === "cart-icon-nav" || e.target.classList.contains("add-to-cart-btn"))) {
        setTimeout(injectCouponInputHTML, 50);
    }

    // Coupon verification button trigger script handler
    if (e.target && e.target.id === "apply-coupon-btn") {
        const inputCode = document.getElementById("coupon-input")?.value.trim().toUpperCase();
        const totalAmountSpan = document.getElementById("cart-total-amount");
        
        // DEFINE YOUR COUPONS HERE
        if (inputCode === "PURE10") {
            appliedDiscountPercent = 10; // 10% Discount
            activeCouponCode = inputCode;
            showCouponStatus("Success! 10% discount applied.", "#14532d");
        } else if (inputCode === "WELCOME50") {
            appliedDiscountPercent = 5; // 5% Discount
            activeCouponCode = inputCode;
            showCouponStatus("Success! 5% discount applied.", "#14532d");
        } else {
            appliedDiscountPercent = 0;
            activeCouponCode = "";
            showCouponStatus("Invalid coupon code.", "#c0392b");
        }

        // Recalculate layout totals instantly on match criteria
        let subtotal = Number(totalAmountSpan?.textContent.replace("₹", "")) || 0;
        if (appliedDiscountPercent > 0) {
            // Re-fetch clean baseline total tracking from global calculation rules
            let rawTotal = 0;
            cart.forEach(item => { rawTotal += item.price * item.quantity; });
            let discountAmount = Math.round((rawTotal * appliedDiscountPercent) / 100);
            let finalPrice = rawTotal - discountAmount;
            if (totalAmountSpan) totalAmountSpan.textContent = `₹${finalPrice}`;
        } else {
            let rawTotal = 0;
            cart.forEach(item => { rawTotal += item.price * item.quantity; });
            if (totalAmountSpan) totalAmountSpan.textContent = `₹${rawTotal}`;
        }
    }
});

// 3. Inject coupon records to the order string details natively before dispatch lines run
const originalGenerateOrderString = window.generateOrderString || generateOrderString;
generateOrderString = function() {
    let result = originalGenerateOrderString();
    if (appliedDiscountPercent > 0 && activeCouponCode) {
        let discountAmount = Math.round((result.total * appliedDiscountPercent) / 100);
        result.total = result.total - discountAmount;
        result.orderDetails += `🎫 COUPON APPLIED: ${activeCouponCode} (-${appliedDiscountPercent}%)\n`;
        result.orderDetails += `📉 Discount Deduction: -₹${discountAmount}\n\n`;
    }
    return result;
};
// =========================================================================
// ADD-ON FEATURE: ADDRESS COUNTER & INPUT INPUT VALIDATION GUARD
// =========================================================================

function injectValidationHelpers() {
    const addressField = document.getElementById("cust-address");
    const phoneField = document.getElementById("cust-phone");

    // 1. Inject Character Counter under Address Textarea
    if (addressField && !document.getElementById("address-char-counter")) {
        const counterDiv = document.createElement("div");
        counterDiv.id = "address-char-counter";
        counterDiv.style.cssText = "font-size: 11px; color: #666; text-align: right; margin-top: 2px; font-weight: 500;";
        counterDiv.textContent = `Characters: ${addressField.value.length} / 30 minimum recommended`;
        addressField.parentNode.appendChild(counterDiv);

        // Listen for typing events to update live metrics
        addressField.addEventListener("input", () => {
            const currentLen = addressField.value.length;
            counterDiv.textContent = `Characters: ${currentLen} / 30 minimum recommended`;
            counterDiv.style.color = currentLen >= 30 ? "#14532d" : "#c0392b";
        });
    }

    // 2. Restrict Phone Input Box to strictly accept numbers only
    if (phoneField) {
        phoneField.setAttribute("maxlength", "10");
        phoneField.addEventListener("input", () => {
            phoneField.value = phoneField.value.replace(/[^0-9]/g, ""); // Instantly strips away text/symbols
        });
    }
}

// Watch layout state frames to apply rules when inputs generate dynamically
document.addEventListener("click", (e) => {
    if (e.target && (e.target.classList.contains("btn-step-advance") || e.target.id === "cart-icon-nav")) {
        setTimeout(injectValidationHelpers, 60);
    }
});

// Intercept final checkout process buttons to block invalid structural profiles
document.addEventListener("click", (e) => {
    if (e.target && (e.target.id === "upi-checkout-btn" || e.target.id === "whatsapp-checkout-btn")) {
        const phone = document.getElementById("cust-phone")?.value.trim();
        const address = document.getElementById("cust-address")?.value.trim();

        if (phone && phone.length !== 10) {
            alert("⚠️ Warning: Please enter a valid 10-digit mobile phone number!");
            e.stopImmediatePropagation(); // Kills execution steps completely
            return false;
        }

        if (address && address.length < 15) {
            alert("⚠️ Warning: Your shipping address profile looks too short. Please include flat/house parameters, landmark details, and a clear Pincode!");
            e.stopImmediatePropagation(); // Kills execution steps completely
            return false;
        }
    }
}, true); // Enforces capture hierarchy to run validation checks before dispatch triggers execute
// =========================================================================
// ADD-ON FEATURE: LIVE VERIFIED BUYER REVIEWS CAROUSEL
// =========================================================================
const SPICE_REVIEWS = [
    { name: "Rajesh K. (Gourmet Catering)", text: "The dehydrated garlic powder has an incredibly rich aroma. Perfect consistency for our restaurant bases!", stars: "⭐⭐⭐⭐⭐" },
    { name: "Ananya Patel (Home Chef)", text: "Switched to Mahiverse for onion powder. 100% natural flavor, no artificial clumping at all. Highly recommend!", stars: "⭐⭐⭐⭐⭐" },
    { name: "Marcus T. (Global Imports Ltd)", text: "Excellent industrial packaging parameters. Kept moisture at 0% during bulk ocean freight transit.", stars: "⭐⭐⭐⭐⭐" }
];
let currentReviewIndex = 0;

function injectLiveReviewsHTML() {
    const itemsBody = document.getElementById("cart-items-container") || document.querySelector(".cart-items-body");
    
    if (itemsBody && activeStep === 1 && !document.getElementById("review-carousel-wrapper")) {
        const reviewWrapper = document.createElement("div");
        reviewWrapper.id = "review-carousel-wrapper";
        reviewWrapper.style.cssText = "margin-top: 25px; padding: 15px; background: #faf8f4; border-radius: 14px; border: 1px solid #eef2ed; text-align: center; transition: all 0.3s ease;";
        
        reviewWrapper.innerHTML = `
            <div style="font-size: 11px; font-weight: 700; color: #14532d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">✨ Verified Buyer Feedback</div>
            <div id="live-review-stars" style="font-size: 14px; margin-bottom: 6px;">${SPICE_REVIEWS[currentReviewIndex].stars}</div>
            <p id="live-review-text" style="font-size: 13px; color: #555; font-style: italic; min-height: 40px; margin-bottom: 8px; padding: 0 10px;">"${SPICE_REVIEWS[currentReviewIndex].text}"</p>
            <div id="live-review-author" style="font-size: 11px; font-weight: 700; color: #2c1a04;">— ${SPICE_REVIEWS[currentReviewIndex].name}</div>
        `;
        
        itemsBody.appendChild(reviewWrapper);
        startReviewRotation();
    }
}

function startReviewRotation() {
    // Automatically swap out customer quotes smoothly every 4 seconds
    if (window.reviewInterval) clearInterval(window.reviewInterval);
    
    window.reviewInterval = setInterval(() => {
        const textNode = document.getElementById("live-review-text");
        const authorNode = document.getElementById("live-review-author");
        const starsNode = document.getElementById("live-review-stars");
        
        if (textNode && authorNode && starsNode) {
            currentReviewIndex = (currentReviewIndex + 1) % SPICE_REVIEWS.length;
            
            // Subtle flash animation effect
            textNode.style.opacity = 0;
            setTimeout(() => {
                textNode.textContent = `"${SPICE_REVIEWS[currentReviewIndex].text}"`;
                authorNode.textContent = `— ${SPICE_REVIEWS[currentReviewIndex].name}`;
                starsNode.textContent = SPICE_REVIEWS[currentReviewIndex].stars;
                textNode.style.opacity = 1;
            }, 200);
        }
    }, 4000);
}

// Watch navigation and card actions to trigger layout injection on load states
document.addEventListener("click", (e) => {
    if (e.target && (e.target.classList.contains("add-to-cart-btn") || e.target.id === "cart-icon-nav" || e.target.classList.contains("btn-edit-profile-back"))) {
        setTimeout(injectLiveReviewsHTML, 70);
    }
});
// =========================================================================
// ADD-ON FEATURE: INTERNATIONAL EXPORT NOTICE BANNER
// =========================================================================
function injectExportNoticeHTML() {
    const paymentWrapper = document.querySelector(".payment-selector-wrapper");
    
    if (paymentWrapper && !document.getElementById("export-notice-banner")) {
        const noticeDiv = document.createElement("div");
        noticeDiv.id = "export-notice-banner";
        noticeDiv.style.cssText = "margin-top: 12px; padding: 12px; background: #f4f0e6; border-left: 4px solid #D4AF37; border-radius: 4px; display: none; transition: all 0.3s ease;";
        
        noticeDiv.innerHTML = `
            <p style="font-size: 12px; color: #2c1a04; font-weight: 500; margin: 0; line-height: 1.4; text-align: left;">
                🌐 <strong>International Trade Notice:</strong> For global cargo bulk distributions, customized commercial invoices are generated out-of-box via WhatsApp including containerized shipping rates (FOB/CIF) and global wire details.
            </p>
        `;
        
        paymentWrapper.appendChild(noticeDiv);
    }
}

// Watch layout state frames to apply the notice structure dynamically on step changes
document.addEventListener("click", (e) => {
    if (e.target && (e.target.classList.contains("btn-step-advance") || e.target.id === "cart-icon-nav")) {
        setTimeout(injectExportNoticeHTML, 80);
    }

    // Trigger visual visibility behavior depending on which payment pathway button is hovered/focused
    if (e.target && e.target.id === "whatsapp-checkout-btn") {
        const banner = document.getElementById("export-notice-banner");
        if (banner) banner.style.display = "block";
    }
    
    if (e.target && e.target.id === "upi-checkout-btn") {
        const banner = document.getElementById("export-notice-banner");
        if (banner) banner.style.display = "none";
    }
});

