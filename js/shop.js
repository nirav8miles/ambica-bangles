// Shop Page JavaScript
let productManager;
let currentProducts = [];
let filteredProducts = [];

// Initialize shop page
document.addEventListener('DOMContentLoaded', async function() {
    productManager = new ProductManager();
    await productManager.loadProducts();
    
    // Check for search query or category from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    const categoryParam = urlParams.get('cat');
    
    if (searchQuery) {
        currentProducts = productManager.searchProducts(searchQuery);
        document.getElementById('searchInput').value = searchQuery;
    } else if (categoryParam) {
        currentProducts = productManager.getProductsByCategory(categoryParam);
        // Set the category radio button
        const categoryRadio = document.querySelector(`input[name="category"][value="${categoryParam}"]`);
        if (categoryRadio) {
            categoryRadio.checked = true;
        }
    } else {
        currentProducts = productManager.getAllProducts();
    }
    
    filteredProducts = [...currentProducts];
    displayProducts(filteredProducts);
    
    // Setup event listeners
    setupFilters();
});

// Display products
function displayProducts(products) {
    const container = document.getElementById('shopProducts');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    if (products.length === 0) {
        container.innerHTML = '';
        noResults.style.display = 'block';
        resultsCount.textContent = '0';
        return;
    }
    
    noResults.style.display = 'none';
    resultsCount.textContent = products.length;
    
    container.innerHTML = products.map(product => renderProductCard(product)).join('');
}

// Setup filters
function setupFilters() {
    // Category filter
    const categoryRadios = document.querySelectorAll('input[name="category"]');
    categoryRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'all') {
                currentProducts = productManager.getAllProducts();
            } else {
                currentProducts = productManager.getProductsByCategory(this.value);
            }
            applyFilters();
        });
    });
    
    // Price filter
    const applyPriceBtn = document.getElementById('applyPriceFilter');
    if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', applyFilters);
    }
    
    // In stock filter
    const inStockCheckbox = document.getElementById('inStockOnly');
    if (inStockCheckbox) {
        inStockCheckbox.addEventListener('change', applyFilters);
    }
    
    // Sort
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sorted = productManager.sortProducts(filteredProducts, this.value);
            displayProducts(sorted);
        });
    }
    
    // Clear filters
    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllFilters);
    }
}

// Apply filters
function applyFilters() {
    const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
    const inStockOnly = document.getElementById('inStockOnly').checked;
    
    filteredProducts = currentProducts.filter(product => {
        // Price filter
        if (product.price < minPrice || product.price > maxPrice) {
            return false;
        }
        
        // Stock filter
        if (inStockOnly && !product.inStock) {
            return false;
        }
        
        return true;
    });
    
    // Apply current sort
    const sortBy = document.getElementById('sortBy').value;
    if (sortBy !== 'default') {
        filteredProducts = productManager.sortProducts(filteredProducts, sortBy);
    }
    
    displayProducts(filteredProducts);
}

// Clear all filters
function clearAllFilters() {
    // Reset category to all
    const allRadio = document.querySelector('input[name="category"][value="all"]');
    if (allRadio) {
        allRadio.checked = true;
    }
    
    // Clear price inputs
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    
    // Uncheck in stock
    document.getElementById('inStockOnly').checked = false;
    
    // Reset sort
    document.getElementById('sortBy').value = 'default';
    
    // Reset products
    currentProducts = productManager.getAllProducts();
    filteredProducts = [...currentProducts];
    displayProducts(filteredProducts);
}

// Made with Bob
