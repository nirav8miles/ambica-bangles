/**
 * Forgot Password Page JavaScript
 * Handles password reset request
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize forgot password form
    initForgotPasswordForm();
    updateCartCount();
});

/**
 * Initialize forgot password form
 */
function initForgotPasswordForm() {
    const form = document.getElementById('forgotPasswordForm');
    const submitBtn = document.getElementById('submitBtn');
    const emailInput = document.getElementById('email');
    const resendLink = document.getElementById('resendLink');

    // Real-time validation
    emailInput.addEventListener('blur', function() {
        validateEmail(this.value);
    });

    emailInput.addEventListener('input', function() {
        clearError('emailError');
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Clear previous errors
        clearAllErrors();

        // Get email value
        const email = emailInput.value.trim();

        // Validate email
        if (!validateEmail(email)) {
            return;
        }

        // Show loading state
        setLoadingState(submitBtn, true);

        try {
            // Send password reset request
            const response = await authService.forgotPassword(email);

            if (response.success) {
                // Hide form and show success message
                form.style.display = 'none';
                const successMessage = document.getElementById('successMessage');
                successMessage.style.display = 'block';
                document.getElementById('sentEmail').textContent = email;

                // Store email for resend
                sessionStorage.setItem('reset_email', email);
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            showAlert('error', error.message || 'Failed to send reset link. Please try again.');
            setLoadingState(submitBtn, false);
        }
    });

    // Resend link
    if (resendLink) {
        resendLink.addEventListener('click', async function() {
            const email = sessionStorage.getItem('reset_email');
            
            if (!email) {
                showAlert('error', 'Session expired. Please try again.');
                return;
            }

            this.disabled = true;
            this.textContent = 'Sending...';

            try {
                const response = await authService.forgotPassword(email);
                
                if (response.success) {
                    showAlert('success', 'Reset link sent successfully!');
                }
            } catch (error) {
                console.error('Resend error:', error);
                showAlert('error', error.message || 'Failed to resend link.');
            } finally {
                this.disabled = false;
                this.textContent = 'resend the link';
            }
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

// Made with Bob
