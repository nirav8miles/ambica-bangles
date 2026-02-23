// Products Data Management
class ProductManager {
    constructor() {
        this.products = [];
        this.loadProducts();
    }

    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            this.products = await response.json();
            return this.products;
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }

    getAllProducts() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(product => product.id === parseInt(id));
    }

    getProductsByCategory(category) {
        if (!category || category === 'all') {
            return this.products;
        }
        return this.products.filter(product => product.category === category);
    }

    getFeaturedProducts(limit = 8) {
        return this.products.slice(0, limit);
    }

    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    sortProducts(products, sortBy) {
        const sorted = [...products];
        
        switch(sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sorted.sort((a, b) => b.price - a.price);
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case 'newest':
                return sorted.reverse();
            default:
                return sorted;
        }
    }

    filterProducts(products, filters) {
        let filtered = [...products];

        // Filter by price range
        if (filters.minPrice !== undefined) {
            filtered = filtered.filter(p => p.price >= filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
            filtered = filtered.filter(p => p.price <= filters.maxPrice);
        }

        // Filter by availability
        if (filters.inStock) {
            filtered = filtered.filter(p => p.inStock);
        }

        return filtered;
    }
}

// Product Card Renderer
function renderProductCard(product) {
    const badge = product.badge ? `<span class="product-badge ${product.badge}">${product.badge}</span>` : '';
    const originalPrice = product.originalPrice ? `<span style="text-decoration: line-through; color: #999; font-size: 18px; margin-right: 10px;">₹${product.originalPrice.toLocaleString()}</span>` : '';
    
    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='assets/images/placeholder.jpg'">
                ${badge}
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    ${originalPrice}
                    ₹${product.price.toLocaleString()}
                </div>
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="quick-view-btn" onclick="viewProduct(${product.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Load Featured Products on Homepage
async function loadFeaturedProducts() {
    const productManager = new ProductManager();
    await productManager.loadProducts();
    
    const featuredProducts = productManager.getFeaturedProducts(8);
    const container = document.getElementById('featuredProducts');
    
    if (container) {
        container.innerHTML = featuredProducts.map(product => renderProductCard(product)).join('');
    }
}

// View Product Details
function viewProduct(productId) {
    window.location.href = `product.html?id=${productId}`;
}

// Format Currency
function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
} else {
    loadFeaturedProducts();
}

// Made with Bob
