/**
 * Login Page JavaScript
 * Handles login form submission and validation
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
        // Redirect to home or intended page
        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
        window.location.href = redirectUrl;
        return;
    }

    // Initialize login form
    initLoginForm();
    initPasswordToggle();
    initSocialLogin();
});

/**
 * Initialize login form
 */
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    // Load saved email if "Remember Me" was checked
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
        emailInput.value = savedEmail;
        rememberMeCheckbox.checked = true;
    }

    // Real-time validation
    emailInput.addEventListener('blur', function() {
        validateEmail(this.value);
    });

    passwordInput.addEventListener('blur', function() {
        validatePassword(this.value);
    });

    // Clear errors on input
    emailInput.addEventListener('input', function() {
        clearError('emailError');
    });

    passwordInput.addEventListener('input', function() {
        clearError('passwordError');
    });

    // Form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Clear previous errors
        clearAllErrors();

        // Get form values
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;

        // Validate inputs
        let isValid = true;

        if (!validateEmail(email)) {
            isValid = false;
        }

        if (!validatePassword(password)) {
            isValid = false;
        }

        if (!isValid) {
            return;
        }

        // Show loading state
        setLoadingState(loginBtn, true);

        try {
            // Attempt login
            const response = await authService.loginUser(email, password);

            if (response.success) {
                // Handle "Remember Me"
                if (rememberMe) {
                    localStorage.setItem('remembered_email', email);
                } else {
                    localStorage.removeItem('remembered_email');
                }

                // Show success message
                showAlert('success', 'Login successful! Redirecting...');

                // Redirect after short delay
                setTimeout(() => {
                    const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
                    window.location.href = redirectUrl;
                }, 1500);
            }
        } catch (error) {
            console.error('Login error:', error);
            showAlert('error', error.message || 'Login failed. Please check your credentials.');
            setLoadingState(loginBtn, false);
        }
    });
}

/**
 * Initialize password toggle
 */
function initPasswordToggle() {
    const toggleBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            
            // Update icon
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
}

/**
 * Initialize social login buttons
 */
function initSocialLogin() {
    const googleBtn = document.querySelector('.btn-google');
    const facebookBtn = document.querySelector('.btn-facebook');

    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            showAlert('info', 'Google login will be implemented soon!');
            // TODO: Implement Google OAuth
        });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            showAlert('info', 'Facebook login will be implemented soon!');
            // TODO: Implement Facebook OAuth
        });
    }
}

/**
 * Validate email
 */
function validateEmail(email) {
    const emailError = document.getElementById('emailError');
    
    if (!email) {
        showError('emailError', 'Email is required');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('emailError', 'Please enter a valid email address');
        return false;
    }

    clearError('emailError');
    return true;
}

/**
 * Validate password
 */
function validatePassword(password) {
    const passwordError = document.getElementById('passwordError');
    
    if (!password) {
        showError('passwordError', 'Password is required');
        return false;
    }

    if (password.length < 6) {
        showError('passwordError', 'Password must be at least 6 characters');
        return false;
    }

    clearError('passwordError');
    return true;
}

/**
 * Show error message
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Add error class to input
        const input = errorElement.previousElementSibling;
        if (input && input.tagName === 'INPUT') {
            input.classList.add('error');
        } else if (input && input.classList.contains('password-input-wrapper')) {
            input.querySelector('input').classList.add('error');
        }
    }
}

/**
 * Clear error message
 */
function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        
        // Remove error class from input
        const input = errorElement.previousElementSibling;
        if (input && input.tagName === 'INPUT') {
            input.classList.remove('error');
        } else if (input && input.classList.contains('password-input-wrapper')) {
            input.querySelector('input').classList.remove('error');
        }
    }
}

/**
 * Clear all errors
 */
function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });

    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(input => {
        input.classList.remove('error');
    });
}

/**
 * Set loading state for button
 */
function setLoadingState(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');

    if (isLoading) {
        button.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';
    } else {
        button.disabled = false;
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

/**
 * Show alert message
 */
function showAlert(type, message) {
    const alertContainer = document.getElementById('alertContainer');
    
    // Remove existing alerts
    alertContainer.innerHTML = '';

    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span class="alert-icon">${getAlertIcon(type)}</span>
        <span class="alert-message">${message}</span>
        <button class="alert-close" onclick="this.parentElement.remove()">×</button>
    `;

    alertContainer.appendChild(alert);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentElement) {
            alert.remove();
        }
    }, 5000);
}

/**
 * Get alert icon based on type
 */
function getAlertIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || 'ℹ';
}

/**
 * Handle authentication state changes
 */
window.addEventListener('userLoggedIn', function(event) {
    console.log('User logged in:', event.detail.user);
    
    // Update UI if needed
    updateCartCount();
});

/**
 * Update cart count
 */
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
}

// Initialize cart count on page load
updateCartCount();

// Made with Bob
