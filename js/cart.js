// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartCount();
    }

    loadCart() {
        const cart = localStorage.getItem('ambicaCart');
        return cart ? JSON.parse(cart) : [];
    }

    saveCart() {
        localStorage.setItem('ambicaCart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.showNotification('Product added to cart!', 'success');
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.showNotification('Product removed from cart', 'info');
    }

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    getItems() {
        return this.items;
    }

    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTax(subtotal) {
        return subtotal * 0.18; // 18% GST
    }

    getShipping() {
        const subtotal = this.getSubtotal();
        return subtotal > 10000 ? 0 : 200; // Free shipping above ₹10,000
    }

    getTotal() {
        const subtotal = this.getSubtotal();
        const tax = this.getTax(subtotal);
        const shipping = this.getShipping();
        return subtotal + tax + shipping;
    }

    clearCart() {
        this.items = [];
        this.saveCart();
    }

    updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
        const count = this.getItemCount();
        cartCountElements.forEach(element => {
            if (element) {
                element.textContent = count;
                element.style.display = count > 0 ? 'flex' : 'none';
            }
        });
    }

    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.cart-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `cart-notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);

        // Add styles if not already present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .cart-notification {
                    position: fixed;
                    top: 100px;
                    right: 20px;
                    background: white;
                    padding: 15px 25px;
                    border-radius: 5px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                }
                .cart-notification.success {
                    border-left: 4px solid #28a745;
                }
                .cart-notification.info {
                    border-left: 4px solid #17a2b8;
                }
                .cart-notification i {
                    font-size: 20px;
                }
                .cart-notification.success i {
                    color: #28a745;
                }
                .cart-notification.info i {
                    color: #17a2b8;
                }
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Add to cart function (called from product cards)
async function addToCart(productId) {
    const productManager = new ProductManager();
    await productManager.loadProducts();
    const product = productManager.getProductById(productId);
    
    if (product) {
        cart.addItem(product);
    }
}

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const items = cart.getItems();
    
    if (!cartItemsContainer) return;
    
    if (items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Add some beautiful bangles to your cart!</p>
                <a href="shop.html" class="btn btn-primary">Continue Shopping</a>
            </div>
        `;
        return;
    }
    
    cartItemsContainer.innerHTML = items.map(item => `
        <div class="cart-item" data-product-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/placeholder.jpg'">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-category">${item.category}</p>
                <p class="cart-item-price">₹${item.price.toLocaleString()}</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <input type="number" value="${item.quantity}" min="1" onchange="updateCartQuantity(${item.id}, this.value)">
                <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <div class="cart-item-total">
                ₹${(item.price * item.quantity).toLocaleString()}
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Update cart quantity
function updateCartQuantity(productId, quantity) {
    cart.updateQuantity(productId, parseInt(quantity));
    renderCartItems();
    updateCartSummary();
}

// Remove from cart
function removeFromCart(productId) {
    cart.removeItem(productId);
    renderCartItems();
    updateCartSummary();
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.getSubtotal();
    const tax = cart.getTax(subtotal);
    const shipping = cart.getShipping();
    const total = cart.getTotal();
    
    const subtotalElement = document.getElementById('cartSubtotal');
    const taxElement = document.getElementById('cartTax');
    const shippingElement = document.getElementById('cartShipping');
    const totalElement = document.getElementById('cartTotal');
    
    if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toLocaleString()}`;
    if (taxElement) taxElement.textContent = `₹${tax.toLocaleString()}`;
    if (shippingElement) {
        shippingElement.textContent = shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`;
    }
    if (totalElement) totalElement.textContent = `₹${total.toLocaleString()}`;
}

// Initialize cart page
function initCartPage() {
    renderCartItems();
    updateCartSummary();
}

// Initialize checkout page
function initCheckoutPage() {
    const items = cart.getItems();
    const orderItemsContainer = document.getElementById('orderItems');
    
    if (orderItemsContainer && items.length > 0) {
        orderItemsContainer.innerHTML = items.map(item => `
            <div class="order-item">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/placeholder.jpg'">
                <div class="order-item-details">
                    <h4>${item.name}</h4>
                    <p>Quantity: ${item.quantity}</p>
                </div>
                <div class="order-item-price">₹${(item.price * item.quantity).toLocaleString()}</div>
            </div>
        `).join('');
    }
    
    updateCartSummary();
}

// Export cart data for checkout
function getCartData() {
    return {
        items: cart.getItems(),
        subtotal: cart.getSubtotal(),
        tax: cart.getTax(cart.getSubtotal()),
        shipping: cart.getShipping(),
        total: cart.getTotal()
    };
}

// Made with Bob
