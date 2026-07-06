console.log("Mahiverse Globle core engine running!");

// Initialize Shopping Cart array
let cart = [];

document.addEventListener("DOMContentLoaded", () => {
    // DOM Selectors
    const cartIconNav = document.getElementById("cart-icon-nav");
    const cartSidebar = document.getElementById("cart-sidebar");
    const cartOverlay = document.getElementById("cart-overlay");
    const closeCartBtn = document.getElementById("close-cart");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartCount = document.getElementById("cart-count");
    const cartTotalAmount = document.getElementById("cart-total-amount");
    const whatsappCheckoutBtn = document.getElementById("whatsapp-checkout-btn");

    // Open Cart Panel
    if (cartIconNav) {
        cartIconNav.addEventListener("click", (e) => {
            e.preventDefault();
            if (cartSidebar) cartSidebar.classList.add("open");
            if (cartOverlay) cartOverlay.classList.add("show");
        });
    }

    // Close Cart Panel Function
    function closeCart() {
        if (cartSidebar) cartSidebar.classList.remove("open");
        if (cartOverlay) cartOverlay.classList.remove("show");
    }

    if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCart);

    // Add to Cart Click Engine
    const addToCartButtons = document.querySelectorAll(".add-to-cart-btn");
    addToCartButtons.forEach(button => {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            const card = e.target.closest(".card");
            if (!card) return;

            const id = card.getAttribute("data-id");
            const name = card.getAttribute("data-name");
            
            const weightSelect = card.querySelector(".weight-select");
            const selectedWeight = weightSelect ? weightSelect.value : "Standard";
            
            // Extract prices dynamically from data-price attributes
            const selectedOption = weightSelect ? weightSelect.options[weightSelect.selectedIndex] : null;
            const price = selectedOption ? parseFloat(selectedOption.getAttribute("data-price")) : 0;

            const itemKey = `${id}-${selectedWeight}`;

            // Add or increment quantities inside array
            const existingItem = cart.find(item => item.key === itemKey);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    key: itemKey,
                    name: name,
                    weight: selectedWeight,
                    price: price,
                    quantity: 1
                });
            }

            updateCartUI();
            
            // Display cart sidebar feedback animation
            if (cartSidebar) cartSidebar.classList.add("open");
            if (cartOverlay) cartOverlay.classList.add("show");
        });
    });

    // Update UI Elements and Calculate running total
    function updateCartUI() {
        if (!cartItemsContainer || !cartCount || !cartTotalAmount) return;

        cartItemsContainer.innerHTML = "";
        let totalItems = 0;
        let totalPrice = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-msg">Your cart is empty.</p>';
            cartCount.textContent = "0";
            cartTotalAmount.textContent = "₹0";
            return;
        }

        cart.forEach((item, index) => {
            totalItems += item.quantity;
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;

            const priceLabel = item.price === 0 ? "Bulk Request" : `₹${item.price} (₹${itemTotal})`;

            const itemRow = document.createElement("div");
            itemRow.classList.add("cart-item");
            itemRow.innerHTML = `
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Weight: ${item.weight} | Qty: ${item.quantity}</p>
                    <p style="color: #25D366; font-weight:500;">${priceLabel}</p>
                </div>
                <button class="remove-item-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
            `;
            cartItemsContainer.appendChild(itemRow);
        });

        cartCount.textContent = totalItems;
        cartTotalAmount.textContent = `₹${totalPrice}`;

        // Re-attach removal listener triggers inside UI scope
        document.querySelectorAll(".remove-item-btn").forEach(btn => {
            btn.addEventListener("click", (el) => {
                const targetIdx = parseInt(el.target.closest(".remove-item-btn").getAttribute("data-index"));
                cart.splice(targetIdx, 1);
                updateCartUI();
            });
        });
    }

    // Order Compilation Hook for WhatsApp Checkout API
    if (whatsappCheckoutBtn) {
        whatsappCheckoutBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("Your cart is empty!");
                return;
            }

            let message = "Hello Mahiverse Globle! 🌿%0AI want to place an order:%0A%0A";
            let grandTotal = 0;
            
            cart.forEach((item, i) => {
                const lineTotal = item.price * item.quantity;
                grandTotal += lineTotal;
                
                if(item.price === 0) {
                    message += `${i+1}. *${item.name}* (${item.weight}) — Qty: ${item.quantity} [Bulk Quote Needed]%0A`;
                } else {
                    message += `${i+1}. *${item.name}* (${item.weight}) — Qty: ${item.quantity} (₹${lineTotal})%0A`;
                }
            });
            
            message += `%0A*Total Estimated Value:* ₹${grandTotal}`;
            message += "%0APlease verify availability and send payment details! 🙏";

            window.open(`https://wa.me/916354179230?text=${message}`, "_blank");
        });
    }
});
