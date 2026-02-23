// Main JavaScript for Ambica Bangles Website

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const searchToggle = document.querySelector('.search-toggle');
    const searchBar = document.querySelector('.search-bar');
    const searchClose = document.querySelector('.search-close');
    const searchInput = document.querySelector('#searchInput');
    const scrollTopBtn = document.querySelector('.scroll-top');

    // Mobile menu toggle
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger icon
            const spans = this.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translateY(8px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                const spans = mobileMenuToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Handle dropdown in mobile
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            link.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            });
        });
    }

    // Search functionality
    if (searchToggle && searchBar) {
        searchToggle.addEventListener('click', function() {
            searchBar.classList.add('active');
            setTimeout(() => searchInput.focus(), 300);
        });
    }

    if (searchClose && searchBar) {
        searchClose.addEventListener('click', function() {
            searchBar.classList.remove('active');
            searchInput.value = '';
        });
    }
    
    // Scroll to top button
    if (scrollTopBtn) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        
        scrollTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Search submit
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });

        const searchSubmit = document.querySelector('.search-submit');
        if (searchSubmit) {
            searchSubmit.addEventListener('click', function() {
                performSearch(searchInput.value);
            });
        }
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Scroll to top button
    createScrollToTopButton();

    // Initialize animations on scroll
    initScrollAnimations();

    // Update active nav link based on current page
    updateActiveNavLink();
});

// Perform search
function performSearch(query) {
    if (query.trim()) {
        window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
    }
}

// Scroll to top button
function createScrollToTopButton() {
    const scrollBtn = document.createElement('button');
    scrollBtn.id = 'scrollToTop';
    scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        z-index: 999;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(scrollBtn);

    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollBtn.style.display = 'flex';
        } else {
            scrollBtn.style.display = 'none';
        }
    });

    // Scroll to top on click
    scrollBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Hover effect
    scrollBtn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'var(--dark-color)';
        this.style.transform = 'translateY(-5px)';
    });

    scrollBtn.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'var(--primary-color)';
        this.style.transform = 'translateY(0)';
    });
}

// Initialize scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Add animation styles to elements
    const animatedElements = document.querySelectorAll('.category-card, .product-card, .feature-card, .instagram-post');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(element);
    });
}

// Update active navigation link
function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// Form validation helper
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
            showFieldError(input, 'This field is required');
        } else {
            input.classList.remove('error');
            removeFieldError(input);
        }

        // Email validation
        if (input.type === 'email' && input.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                input.classList.add('error');
                showFieldError(input, 'Please enter a valid email address');
            }
        }

        // Phone validation
        if (input.type === 'tel' && input.value.trim()) {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(input.value.replace(/\D/g, ''))) {
                isValid = false;
                input.classList.add('error');
                showFieldError(input, 'Please enter a valid 10-digit phone number');
            }
        }
    });

    return isValid;
}

// Show field error
function showFieldError(input, message) {
    removeFieldError(input);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #dc3545; font-size: 14px; margin-top: 5px;';
    input.parentNode.appendChild(errorDiv);
}

// Remove field error
function removeFieldError(input) {
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Add input event listeners for real-time validation
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[required], textarea[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim()) {
                this.classList.remove('error');
                removeFieldError(this);
            }
        });
    });
});

// Loading spinner
function showLoading() {
    const loader = document.createElement('div');
    loader.id = 'pageLoader';
    loader.innerHTML = '<div class="spinner"></div>';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    `;

    const spinnerStyle = document.createElement('style');
    spinnerStyle.textContent = `
        .spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid var(--primary-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(spinnerStyle);
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.remove();
    }
}

// Format price
function formatPrice(price) {
    return `₹${price.toLocaleString('en-IN')}`;
}

// Get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show success message
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 20px 30px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        border-left: 4px solid #28a745;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Show error message
function showErrorMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'error-message';
    messageDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        padding: 20px 30px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        border-left: 4px solid #dc3545;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Initialize page based on current page
window.addEventListener('load', function() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'cart.html') {
        initCartPage();
    } else if (currentPage === 'checkout.html') {
        initCheckoutPage();
    }
});

// Made with Bob
