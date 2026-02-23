// Category Page JavaScript
let productManager;
let currentCategory = '';

// Category names mapping
const categoryNames = {
    'heritage': 'Heritage Sets',
    'ad': 'AD Sets',
    'lct': 'LCT Sets',
    'kundan': 'Kundan Sets',
    'necklaces': 'Necklaces'
};

const categoryDescriptions = {
    'heritage': 'Traditional designs celebrating our rich cultural heritage',
    'ad': 'American Diamond jewelry for contemporary brides',
    'lct': 'Elegant LCT stone collections for special occasions',
    'kundan': 'Premium Kundan jewelry with authentic craftsmanship',
    'necklaces': 'Beautiful necklace sets to complement any outfit'
};

// Initialize category page
document.addEventListener('DOMContentLoaded', async function() {
    productManager = new ProductManager();
    await productManager.loadProducts();
    
    // Get category from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentCategory = urlParams.get('cat') || 'all';
    
    // Update page title and description
    updatePageHeader();
    
    // Load products for this category
    loadCategoryProducts();
    
    // Setup sort functionality
    setupSort();
});

// Update page header with category info
function updatePageHeader() {
    const titleElement = document.getElementById('categoryTitle');
    const descElement = document.getElementById('categoryDescription');
    
    if (currentCategory && currentCategory !== 'all') {
        const categoryName = categoryNames[currentCategory] || 'Products';
        const categoryDesc = categoryDescriptions[currentCategory] || 'Explore our collection';
        
        if (titleElement) titleElement.textContent = categoryName;
        if (descElement) descElement.textContent = categoryDesc;
    }
}

// Load products for the category
function loadCategoryProducts() {
    let products = [];
    
    if (currentCategory === 'all') {
        products = productManager.getAllProducts();
    } else {
        products = productManager.getProductsByCategory(currentCategory);
    }
    
    displayProducts(products);
}

// Display products
function displayProducts(products) {
    const container = document.getElementById('categoryProducts');
    const noResults = document.getElementById('noResults');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        if (resultsCount) resultsCount.textContent = '0';
        return;
    }
    
    if (noResults) noResults.style.display = 'none';
    if (resultsCount) resultsCount.textContent = products.length;
    
    container.innerHTML = products.map(product => renderProductCard(product)).join('');
}

// Setup sort functionality
function setupSort() {
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            let products = [];
            
            if (currentCategory === 'all') {
                products = productManager.getAllProducts();
            } else {
                products = productManager.getProductsByCategory(currentCategory);
            }
            
            const sorted = productManager.sortProducts(products, this.value);
            displayProducts(sorted);
        });
    }
}

// Made with Bob
