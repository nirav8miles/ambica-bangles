/**
 * Register Page JavaScript
 * Handles registration form submission, validation, and OTP verification
 */

let registrationData = null;
let resendTimer = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (authService.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize registration form
    initRegisterForm();
    initOtpForm();
    initPasswordToggles();
    initSocialLogin();
});

/**
 * Initialize registration form
 */
function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');

    // Real-time validation
    const fields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
    fields.forEach(field => {
        const input = document.getElementById(field);
        if (input) {
            input.addEventListener('blur', function() {
                validateField(field, this.value);
            });

            input.addEventListener('input', function() {
                clearError(field + 'Error');
            });
        }
    });

    // Form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Clear previous errors
        clearAllErrors();

        // Get form values
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            agreeTerms: document.getElementById('agreeTerms').checked
        };

        // Validate all fields
        let isValid = true;

        if (!validateField('firstName', formData.firstName)) isValid = false;
        if (!validateField('lastName', formData.lastName)) isValid = false;
        if (!validateField('email', formData.email)) isValid = false;
        if (formData.phone && !validateField('phone', formData.phone)) isValid = false;
        if (!validateField('password', formData.password)) isValid = false;
        if (!validateField('confirmPassword', formData.confirmPassword, formData.password)) isValid = false;
        if (!validateField('agreeTerms', formData.agreeTerms)) isValid = false;

        if (!isValid) {
            return;
        }

        // Show loading state
        setLoadingState(registerBtn, true);

        try {
            // Store registration data
            registrationData = formData;

            // Attempt registration
            const response = await authService.registerUser({
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            if (response.success && response.requiresOtp) {
                // Show success message
                showAlert('success', 'Registration successful! Please verify your email.');

                // Switch to OTP form
                setTimeout(() => {
                    showOtpForm(formData.email, response.userId);
                }, 1500);
            } else if (response.success) {
                // Registration complete without OTP
                showAlert('success', 'Registration successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showAlert('error', error.message || 'Registration failed. Please try again.');
            setLoadingState(registerBtn, false);
        }
    });
}

/**
 * Initialize OTP form
 */
function initOtpForm() {
    const otpForm = document.getElementById('otpForm');
    const verifyBtn = document.getElementById('verifyBtn');
    const resendBtn = document.getElementById('resendOtpBtn');
    const backToRegister = document.getElementById('backToRegister');

    // OTP input handling
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        // Auto-focus next input
        input.addEventListener('input', function(e) {
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        // Handle backspace
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });

        // Only allow numbers
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    });

    // OTP form submission
    otpForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get OTP value
        const otp = Array.from(otpInputs).map(input => input.value).join('');

        if (otp.length !== 6) {
            showError('otpError', 'Please enter the complete 6-digit code');
            return;
        }

        // Show loading state
        setLoadingState(verifyBtn, true);

        try {
            // Get userId from session storage
            const pendingReg = JSON.parse(sessionStorage.getItem('pending_registration'));
            
            if (!pendingReg || !pendingReg.userId) {
                throw new Error('Registration session expired. Please register again.');
            }

            // Verify OTP
            const response = await authService.verifyOtp(pendingReg.userId, otp);

            if (response.success) {
                showAlert('success', 'Email verified successfully! Redirecting...');

                // Redirect to home page
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        } catch (error) {
            console.error('OTP verification error:', error);
            showAlert('error', error.message || 'Invalid OTP. Please try again.');
            setLoadingState(verifyBtn, false);
            
            // Clear OTP inputs
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        }
    });

    // Resend OTP
    resendBtn.addEventListener('click', async function() {
        if (this.disabled) return;

        try {
            const pendingReg = JSON.parse(sessionStorage.getItem('pending_registration'));
            
            if (!pendingReg || !pendingReg.userId) {
                throw new Error('Registration session expired. Please register again.');
            }

            await authService.resendOtp(pendingReg.userId);
            showAlert('success', 'OTP sent successfully!');

            // Start resend timer
            startResendTimer();
        } catch (error) {
            console.error('Resend OTP error:', error);
            showAlert('error', error.message || 'Failed to resend OTP. Please try again.');
        }
    });

    // Back to registration
    backToRegister.addEventListener('click', function(e) {
        e.preventDefault();
        showRegisterForm();
    });
}

/**
 * Show OTP form
 */
function showOtpForm(email, userId) {
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('otpForm').style.display = 'block';
    document.getElementById('verificationEmail').textContent = email;

    // Focus first OTP input
    document.getElementById('otp1').focus();

    // Start resend timer
    startResendTimer();
}

/**
 * Show registration form
 */
function showRegisterForm() {
    document.getElementById('otpForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
    
    // Clear OTP inputs
    document.querySelectorAll('.otp-input').forEach(input => input.value = '');
    
    // Stop timer
    if (resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
    }
}

/**
 * Start resend timer
 */
function startResendTimer() {
    const resendBtn = document.getElementById('resendOtpBtn');
    const timerDisplay = document.getElementById('resendTimer');
    const timerCount = document.getElementById('timerCount');
    
    let seconds = 60;
    resendBtn.disabled = true;
    timerDisplay.style.display = 'inline';

    if (resendTimer) {
        clearInterval(resendTimer);
    }

    resendTimer = setInterval(() => {
        seconds--;
        timerCount.textContent = seconds;

        if (seconds <= 0) {
            clearInterval(resendTimer);
            resendTimer = null;
            resendBtn.disabled = false;
            timerDisplay.style.display = 'none';
        }
    }, 1000);
}

/**
 * Initialize password toggles
 */
function initPasswordToggles() {
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }

    if (toggleConfirmPassword && confirmPasswordInput) {
        toggleConfirmPassword.addEventListener('click', function() {
            const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
            confirmPasswordInput.type = type;
            this.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
}

/**
 * Initialize social login
 */
function initSocialLogin() {
    const googleBtn = document.querySelector('.btn-google');
    const facebookBtn = document.querySelector('.btn-facebook');

    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            showAlert('info', 'Google sign up will be implemented soon!');
        });
    }

    if (facebookBtn) {
        facebookBtn.addEventListener('click', function() {
            showAlert('info', 'Facebook sign up will be implemented soon!');
        });
    }
}

/**
 * Validate individual field
 */
function validateField(fieldName, value, compareValue = null) {
    const errorId = fieldName + 'Error';

    switch (fieldName) {
        case 'firstName':
        case 'lastName':
            if (!value || value.length < 2) {
                showError(errorId, `${fieldName === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`);
                return false;
            }
            break;

        case 'email':
            if (!value) {
                showError(errorId, 'Email is required');
                return false;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showError(errorId, 'Please enter a valid email address');
                return false;
            }
            break;

        case 'phone':
            if (value) {
                const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
                if (!phoneRegex.test(value)) {
                    showError(errorId, 'Please enter a valid phone number');
                    return false;
                }
            }
            break;

        case 'password':
            if (!value) {
                showError(errorId, 'Password is required');
                return false;
            }
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(value)) {
                showError(errorId, 'Password must be at least 8 characters with uppercase, lowercase, and number');
                return false;
            }
            break;

        case 'confirmPassword':
            if (!value) {
                showError(errorId, 'Please confirm your password');
                return false;
            }
            const password = compareValue || document.getElementById('password').value;
            if (value !== password) {
                showError(errorId, 'Passwords do not match');
                return false;
            }
            break;

        case 'agreeTerms':
            if (!value) {
                showError(errorId, 'You must agree to the terms and conditions');
                return false;
            }
            break;
    }

    clearError(errorId);
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
        let input = errorElement.previousElementSibling;
        if (input && input.tagName === 'INPUT') {
            input.classList.add('error');
        } else if (input && input.classList.contains('password-input-wrapper')) {
            input.querySelector('input').classList.add('error');
        } else if (input && input.classList.contains('checkbox-label')) {
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
        let input = errorElement.previousElementSibling;
        if (input && input.tagName === 'INPUT') {
            input.classList.remove('error');
        } else if (input && input.classList.contains('password-input-wrapper')) {
            input.querySelector('input').classList.remove('error');
        } else if (input && input.classList.contains('checkbox-label')) {
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
