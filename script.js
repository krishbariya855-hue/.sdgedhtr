// =========================================================================
// MAHIVERSE GLOBLE - CORE INTERACTIVE ENGINE (HIGH-PERFORMANCE V5)
// =========================================================================

console.log("MAHIVERSE GLOBLE Engine Loaded Successfully");

// Quick Toast Notification Function
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

const WHATSAPP_NUMBER = "916354179230";
let cart = JSON.parse(localStorage.getItem("mahiverse_cart")) || [];
let activeStep = 1; 
let appliedDiscountPercent = 0;
let activeCouponCode = "";
let currentReviewIndex = 0;

const SPICE_REVIEWS = [
    { name: "Rajesh K. (Gourmet Catering)", text: "The dehydrated garlic powder has an incredibly rich aroma. Perfect consistency for our restaurant bases!", stars: "⭐⭐⭐⭐⭐" },
    { name: "Ananya Patel (Home Chef)", text: "Switched to Mahiverse for onion powder. 100% natural flavor, no artificial clumping at all. Highly recommend!", stars: "⭐⭐⭐⭐⭐" },
    { name: "Marcus T. (Global Imports Ltd)", text: "Excellent industrial packaging parameters. Kept moisture at 0% during bulk ocean freight transit.", stars: "⭐⭐⭐⭐⭐" }
];

// 1. ADD TO CART DIRECT CALL (UPDATED WITH DIRECT PAYMENT REDIRECT SUPPOR)
window.addToCartDirect = function(productId, productName) {
    let cardElement = null;
    let select = null;

    // Locate the select dropdown based on product ID or closest parent card
    if (productId.includes("garlic")) {
        select = document.getElementById("garlic-select") || document.querySelector(".card[data-id*='garlic'] select");
    } else if (productId.includes("onion")) {
        select = document.getElementById("onion-select") || document.querySelector(".card[data-id*='onion'] select");
    }

    if (!select) {
        select = document.querySelector(".weight-select") || document.getElementById("weightSelect") || document.querySelector("select");
    }
    
    if (!select) {
        alert("Error: Packaging selector dropdown menu not found!");
        return;
    }

    const weight = select.value;

    // Check if user selected Bulk Inquiry
    if (weight === "Commercial Bulk Order") {
        alert("For commercial bulk cargo orders, please contact us directly or request an export invoice.");
        return;
    }

    // Determine Product Key for Razorpay Lookup
    let cleanProd = productId.includes("garlic") ? "garlic" : (productId.includes("onion") ? "onion" : productId);
    
    // Check if direct Razorpay checkout exists for this selection
    const paymentLinks = {
        // --- DEHYDRATED GARLIC POWDER ---
        'garlic_200g Standard Pack': 'https://rzp.io/rzp/ETXHz31H', // ₹180
        'garlic_500g Value Pack':    'https://rzp.io/rzp/Givlc2EY', // ₹420
        'garlic_1kg Chef Pack':      'https://rzp.io/rzp/w3np7334', // ₹780

        // --- DEHYDRATED RED ONION POWDER ---
        'onion_200g Standard Pack':  'https://rzp.io/rzp/eg5bisxW', // ₹160
        'onion_500g Value Pack':     'https://rzp.io/rzp/KS9Lfgbv', // ₹380
        'onion_1kg Chef Pack':       'https://rzp.io/rzp/JCS6EVv'   // ₹690
    };

    const linkKey = cleanProd + '_' + weight;

    if (paymentLinks[linkKey]) {
        // Redirect directly to Razorpay Link
        window.location.href = paymentLinks[linkKey];
        return;
    }

    // Fallback to local cart storage if no payment link matched
    const option = select.options[select.selectedIndex];
    const price = Number(option.getAttribute("data-price") || option.dataset.price || 0);
    const key = productId + "-" + weight;

    const existingItem = cart.find(item => item.key === key);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            key: key, id: productId, name: productName, weight: weight, price: price, quantity: 1
        });
    }

    localStorage.setItem("mahiverse_cart", JSON.stringify(cart));
    activeStep = 1; 
    updateCartUI();

    showToast(`✓ ${productName} added to cart!`);

    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add("open");
        cartOverlay.classList.add("show");
    }
    
    setTimeout(runAddonInjections, 50);
};

// 2. STEP SWITCHER CONTROL
window.setCheckoutStep = function(stepNumber) {
    if (stepNumber === 1) {
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
    setTimeout(runAddonInjections, 50);
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

    cart.forEach(item => {
        totalItems += item.quantity;
        totalPrice += item.price * item.quantity;
    });

    const cartCount = document.getElementById("cart-count");
    if (cartCount) cartCount.textContent = totalItems;

    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
        if (formContainer) formContainer.innerHTML = ""; 
        if (cartSidebar) {
            const cartFooter = cartSidebar.querySelector(".cart-footer");
            if (cartFooter) cartFooter.innerHTML = `<div class="cart-total-row"><span>Estimated Total:</span><span id="cart-total-amount">₹0</span></div>`;
        }
        return;
    }

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
                    <button class="btn-step-advance" onclick="window.setCheckoutStep(2)">Proceed to Delivery Form →</button>
                `;
            }
        }
    } else if (activeStep === 2) {
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
                let finalPrice = totalPrice;
                if (appliedDiscountPercent > 0) {
                    let discountAmount = Math.round((totalPrice * appliedDiscountPercent) / 100);
                    finalPrice = totalPrice - discountAmount;
                }
                cartFooter.innerHTML = `
                    <div class="cart-total-row">
                        <span>Total Due:</span>
                        <span id="cart-total-amount">₹${finalPrice}</span>
                    </div>
                    <div class="payment-selector-wrapper">
                        <button id="upi-checkout-btn" class="checkout-btn-premium btn-upi-checkout">⚡ Pay Instant via UPI</button>
                        <button id="whatsapp-checkout-btn" class="checkout-btn-premium btn-intl-checkout">🌐 International Invoice</button>
                    </div>
                `;
            }
        }
    }
}

window.generateOrderString = function() {
    let orderDetails = "";
    let total = 0;
    cart.forEach((item, i) => {
        const amount = item.price * item.quantity;
        total += amount;
        orderDetails += `${i + 1}. ${item.name}\n   Weight: ${item.weight}\n   Quantity: ${item.quantity}\n`;
        orderDetails += item.price === 0 ? "   Price: Bulk Order Inquiry\n\n" : `   Amount: ₹${amount}\n\n`;
    });
    if (appliedDiscountPercent > 0 && activeCouponCode) {
        let discountAmount = Math.round((total * appliedDiscountPercent) / 100);
        total = total - discountAmount;
        orderDetails += `🎫 COUPON APPLIED: ${activeCouponCode} (-${appliedDiscountPercent}%)\n`;
        orderDetails += `📉 Discount Deduction: -₹${discountAmount}\n\n`;
    }
    return { orderDetails, total };
};

// 4. UNIFIED CAPTURE HIERARCHY EVENT LISTENER (Zero Thread Blocking)
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
            setTimeout(runAddonInjections, 50);
        });
    }

    if (closeCart) closeCart.addEventListener("click", closeCartPanel);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCartPanel);

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

    // Single Master Event Delegation Router
    document.body.addEventListener("click", (e) => {
        const targetId = e.target.id;
        const targetClass = e.target.classList;

        if (targetClass.contains("remove-item-btn")) {
            const index = parseInt(e.target.dataset.index);
            cart.splice(index, 1);
            localStorage.setItem("mahiverse_cart", JSON.stringify(cart));
            updateCartUI();
            setTimeout(runAddonInjections, 50);
            return;
        }

        if (targetId === "upi-checkout-btn" || targetId === "whatsapp-checkout-btn") {
            if (cart.length === 0) { alert("Your cart is empty!"); return; }
            
            const name = document.getElementById("cust-name")?.value.trim();
            const phone = document.getElementById("cust-phone")?.value.trim();
            const email = document.getElementById("cust-email")?.value.trim();
            const address = document.getElementById("cust-address")?.value.trim();

            if (!name || !phone || !email || !address) { alert("Please fill out all delivery fields first!"); return; }
            if (phone.length !== 10) { alert("⚠️ Warning: Enter a valid 10-digit mobile number!"); return; }
            if (address.length < 15) { alert("⚠️ Warning: Shipping address is too short!"); return; }

            const { orderDetails, total } = window.generateOrderString();
            let backupMsg = `MAHIVERSE GLOBLE ORDER PROFILE:\n\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\nITEMS:\n${orderDetails}Total: ₹${total}`;
            backupOrderToClipboard(backupMsg);

            if (targetId === "upi-checkout-btn") {
                const upiUrl = `upi://pay?pa=moddyroy4@okaxis&pn=${encodeURIComponent('MAHIVERSE GLOBLE')}&am=${total}&cu=INR&tn=${encodeURIComponent('Mahiverse Order')}`;
                let message = `Hello MAHIVERSE GLOBLE! 🌿\n\nAn instant UPI payment has been processed:\n\n📋 DETAILS:\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\n🛒 ORDER:\n${orderDetails}Total Paid: ₹${total}`;
                window.open(upiUrl, "_self");
                setTimeout(() => { window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank"); }, 1000);
            } else {
                let message = `Hello MAHIVERSE GLOBLE! 🌿\n\nI want to check an export invoice profile:\n\n📋 DETAILS:\nName: ${name}\nPhone: ${phone}\nAddress: ${address}\n\n🛒 ORDER:\n${orderDetails}Estimated Total: ₹${total}`;
                window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
            }
            return;
        }

        if (targetId === "apply-coupon-btn") {
            const inputCode = document.getElementById("coupon-input")?.value.trim().toUpperCase();
            if (inputCode === "PURE10") {
                appliedDiscountPercent = 10; activeCouponCode = inputCode;
                showCouponStatus("Success! 10% discount applied.", "#14532d");
            } else if (inputCode === "WELCOME50") {
                appliedDiscountPercent = 5; activeCouponCode = inputCode;
                showCouponStatus("Success! 5% discount applied.", "#14532d");
            } else {
                appliedDiscountPercent = 0; activeCouponCode = "";
                showCouponStatus("Invalid coupon code.", "#c0392b");
            }
            let rawTotal = 0;
            cart.forEach(item => { rawTotal += item.price * item.quantity; });
            let finalPrice = rawTotal - Math.round((rawTotal * appliedDiscountPercent) / 100);
            const totalAmountSpan = document.getElementById("cart-total-amount");
            if (totalAmountSpan) totalAmountSpan.textContent = `₹${finalPrice}`;
            return;
        }

        if (targetId === "whatsapp-checkout-btn") {
            const banner = document.getElementById("export-notice-banner");
            if (banner) banner.style.display = "block";
        } else if (targetId === "upi-checkout-btn") {
            const banner = document.getElementById("export-notice-banner");
            if (banner) banner.style.display = "none";
        }
    });

    updateCartUI();
});

// 5. ASYNC ADD-ON INJECTIONS ENGINE
function runAddonInjections() {
    if (cart.length === 0) return;
    
    const addressField = document.getElementById("cust-address");
    const phoneField = document.getElementById("cust-phone");
    if (addressField && !document.getElementById("address-char-counter")) {
        const counterDiv = document.createElement("div");
        counterDiv.id = "address-char-counter";
        counterDiv.style.cssText = "font-size:11px; color:#666; text-align:right; margin-top:2px; font-weight:500;";
        counterDiv.textContent = `Characters: ${addressField.value.length} / 30 minimum recommended`;
        addressField.parentNode.appendChild(counterDiv);
        addressField.addEventListener("input", () => {
            const currentLen = addressField.value.length;
            counterDiv.textContent = `Characters: ${currentLen} / 30 minimum recommended`;
            counterDiv.style.color = currentLen >= 30 ? "#14532d" : "#c0392b";
        });
    }
    if (phoneField) {
        phoneField.setAttribute("maxlength", "10");
        phoneField.addEventListener("input", () => { phoneField.value = phoneField.value.replace(/[^0-9]/g, ""); });
    }

    const totalRow = document.querySelector(".cart-total-row");
    if (totalRow && !document.getElementById("coupon-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.id = "coupon-wrapper";
        wrapper.style.margin = "10px 0 20px 0";
        wrapper.innerHTML = `
            <div style="display:flex; gap:8px; margin-bottom:10px;">
                <input type="text" id="coupon-input" placeholder="Enter Coupon Code" style="flex:1; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:13px; text-transform:uppercase;">
                <button id="apply-coupon-btn" style="background:#14532d; color:white; border:none; padding:0 15px; border-radius:8px; font-weight:600; font-size:13px; cursor:pointer;">Apply</button>
            </div>
            <div id="coupon-status-msg" style="font-size:12px; font-weight:600; display:none;"></div>
        `;
        totalRow.parentNode.insertBefore(wrapper, totalRow);
        if (activeCouponCode) {
            document.getElementById("coupon-input").value = activeCouponCode;
            showCouponStatus(`Code ${activeCouponCode} Applied!`, "#14532d");
        }
    }

    const paymentWrapper = document.querySelector(".payment-selector-wrapper");
    if (paymentWrapper && !document.getElementById("export-notice-banner")) {
        const noticeDiv = document.createElement("div");
        noticeDiv.id = "export-notice-banner";
        noticeDiv.style.cssText = "margin-top:12px; padding:12px; background:#f4f0e6; border-left:4px solid #D4AF37; border-radius:4px; display:none; text-align:left;";
        noticeDiv.innerHTML = `<p style="font-size:12px; color:#2c1a04; font-weight:500; margin:0; line-height:1.4;">🌐 <strong>International Trade Notice:</strong> For global cargo bulk distributions, customized commercial invoices are generated out-of-box via WhatsApp including containerized shipping rates (FOB/CIF) and global wire details.</p>`;
        paymentWrapper.appendChild(noticeDiv);
    }

    const itemsBody = document.getElementById("cart-items-container") || document.querySelector(".cart-items-body");
    if (itemsBody && activeStep === 1 && !document.getElementById("review-carousel-wrapper")) {
        const reviewWrapper = document.createElement("div");
        reviewWrapper.id = "review-carousel-wrapper";
        reviewWrapper.style.cssText = "margin-top:25px; padding:15px; background:#faf8f4; border-radius:14px; border:1px solid #eef2ed; text-align:center;";
        reviewWrapper.innerHTML = `
            <div style="font-size:11px; font-weight:700; color:#14532d; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">✨ Verified Buyer Feedback</div>
            <div id="live-review-stars" style="font-size:14px; margin-bottom:6px;">${SPICE_REVIEWS[currentReviewIndex].stars}</div>
            <p id="live-review-text" style="font-size:13px; color:#555; font-style:italic; min-height:40px; margin-bottom:8px; padding:0 10px;">"${SPICE_REVIEWS[currentReviewIndex].text}"</p>
            <div id="live-review-author" style="font-size:11px; font-weight:700; color:#2c1a04;">— ${SPICE_REVIEWS[currentReviewIndex].name}</div>
        `;
        itemsBody.appendChild(reviewWrapper);
        startReviewRotation();
    }
}

function showCouponStatus(msg, color) {
    const msgDiv = document.getElementById("coupon-status-msg");
    if (msgDiv) { msgDiv.textContent = msg; msgDiv.style.color = color; msgDiv.style.display = "block"; }
}

function startReviewRotation() {
    if (window.reviewInterval) clearInterval(window.reviewInterval);
    window.reviewInterval = setInterval(() => {
        const textNode = document.getElementById("live-review-text");
        const authorNode = document.getElementById("live-review-author");
        const starsNode = document.getElementById("live-review-stars");
        if (textNode && authorNode && starsNode) {
            currentReviewIndex = (currentReviewIndex + 1) % SPICE_REVIEWS.length;
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

function backupOrderToClipboard(messageText) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(messageText);
    } else {
        const textarea = document.createElement("textarea");
        textarea.value = messageText; textarea.style.position = "fixed";
        document.body.appendChild(textarea); textarea.select();
        try { document.execCommand("copy"); } catch (err) {}
        document.body.removeChild(textarea);
    }
}

const loader = document.getElementById("loader");
if (loader) {
    loader.style.opacity = "0"; loader.style.visibility = "hidden"; loader.style.display = "none";
}

// ==========================================================================
// MAHIVERSE GLOBLE - REAL-TIME SEARCH & PORTFOLIO FILTER ENGINE
// ==========================================================================
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('product-search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-grid .card');

    function filterProducts() {
        const searchWord = searchInput.value.toLowerCase().trim();
        const activeFilter = document.querySelector('.filter-btn.active').getAttribute('data-filter');

        productCards.forEach(card => {
            const productName = card.querySelector('h3').textContent.toLowerCase();
            const productDesc = card.querySelector('p').textContent.toLowerCase();
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

// ==========================================================================
// MAHIVERSE GLOBLE - INTERACTIVE HIGH-PERFORMANCE FAQ ENGINE
// ==========================================================================
document.addEventListener('DOMContentLoaded', function() {
    const faqTriggers = document.querySelectorAll('.faq-trigger');

    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const currentItem = this.parentElement;
            const contentBlock = this.nextElementSibling;
            const iconElement = this.querySelector('.faq-icon');

            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== currentItem) {
                    item.querySelector('.faq-content').style.maxHeight = null;
                    item.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
                    item.querySelector('.faq-icon').textContent = '+';
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

// Direct standalone function backup
function buyNow(productId, selectId) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;

    const selectedValue = selectElement.value;

    const paymentLinks = {
        // --- DEHYDRATED GARLIC POWDER ---
        'garlic_200g Standard Pack': 'https://rzp.io/rzp/ETXHz31H', // ₹180
        'garlic_500g Value Pack':    'https://rzp.io/rzp/Givlc2EY', // ₹420
        'garlic_1kg Chef Pack':      'https://rzp.io/rzp/w3np7334', // ₹780

        // --- DEHYDRATED RED ONION POWDER ---
        'onion_200g Standard Pack':  'https://rzp.io/rzp/eg5bisxW', // ₹160
        'onion_500g Value Pack':     'https://rzp.io/rzp/KS9Lfgbv', // ₹380
        'onion_1kg Chef Pack':       'https://rzp.io/rzp/JCS6EVv'   // ₹690
    };

    const linkKey = productId + '_' + selectedValue;

    if (paymentLinks[linkKey]) {
        window.location.href = paymentLinks[linkKey];
    } else if (selectedValue === 'Commercial Bulk Order') {
        alert('For commercial bulk cargo orders, please contact us directly.');
    } else {
        alert('Please select a valid option.');
    }
}
function triggerRazorpayCheckout() {
    const { orderDetails, total } = window.generateOrderString();

    if (total <= 0) {
        alert("Your cart is empty!");
        return;
    }

    var options = {
        "key": "YOUR_RAZORPAY_KEY_ID", // Replace with your Razorpay Key ID
        "amount": total * 100, // Amount in paise (e.g. ₹500 = 50000)
        "currency": "INR",
        "name": "MAHIVERSE GLOBLE",
        "description": "Multi-item Spice Order",
        "image": "favicon.png.jpeg.png",
        "handler": function (response) {
            alert("Payment Successful! Payment ID: " + response.razorpay_payment_id);
            // Clear cart upon successful payment
            localStorage.removeItem("mahiverse_cart");
            location.reload();
        },
        "prefill": {
            "name": document.getElementById("cust-name")?.value || "",
            "email": document.getElementById("cust-email")?.value || "",
            "contact": document.getElementById("cust-phone")?.value || ""
        },
        "theme": {
            "color": "#14532d"
        }
    };

    var rzp1 = new Razorpay(options);
    rzp1.open();
}
