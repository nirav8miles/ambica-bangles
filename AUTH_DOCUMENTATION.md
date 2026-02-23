# Authentication & User Management Documentation

## Overview

This document provides comprehensive documentation for the User & Authentication Module implemented in the E-Commerce application.

## Table of Contents

1. [Architecture](#architecture)
2. [Services](#services)
3. [UI Components](#ui-components)
4. [Integration](#integration)
5. [Usage Examples](#usage-examples)
6. [API Reference](#api-reference)
7. [Security](#security)

---

## Architecture

The authentication system follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         UI Layer (HTML Pages)           │
│  login.html, register.html, profile.html│
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      JavaScript Controllers             │
│  login.js, register.js, profile.js      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Service Layer                   │
│  AuthService, UserService               │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      State Management                   │
│    AuthStateManager                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      Local Storage / API                │
│  Tokens, User Data, Cache               │
└─────────────────────────────────────────┘
```

---

## Services

### 1. AuthService (`js/auth-service.js`)

Handles all authentication operations including registration, login, OTP verification, and password management.

#### Key Methods:

**Registration**
```javascript
await authService.registerUser({
    email: 'user@example.com',
    password: 'SecurePass123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890'
});
```

**Login**
```javascript
await authService.loginUser('user@example.com', 'SecurePass123');
```

**OTP Verification**
```javascript
await authService.verifyOtp(userId, '123456');
```

**Logout**
```javascript
await authService.logoutUser();
```

**Password Management**
```javascript
// Forgot Password
await authService.forgotPassword('user@example.com');

// Reset Password
await authService.resetPassword(token, 'NewPassword123');

// Change Password (authenticated)
await authService.changePassword('OldPass123', 'NewPass123');
```

**Token Management**
```javascript
// Refresh Token
await authService.refreshToken();

// Check Authentication
const isAuth = authService.isAuthenticated();

// Get Current User
const user = authService.getCurrentUser();
```

### 2. UserService (`js/user-service.js`)

Manages user profile and address operations.

#### Key Methods:

**Profile Management**
```javascript
// Get Profile
const profile = await userService.getUserProfile();

// Update Profile
await userService.updateUserProfile({
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    dateOfBirth: '1990-01-01',
    gender: 'male'
});

// Update Profile Picture
await userService.updateProfilePicture(imageFile);

// Delete Account
await userService.deleteAccount(password);
```

**Address Management**
```javascript
// List Addresses
const addresses = await userService.listAddresses();

// Get Single Address
const address = await userService.getAddress(addressId);

// Add Address
await userService.addAddress({
    fullName: 'John Doe',
    addressLine1: '123 Main St',
    addressLine2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    phone: '+1234567890',
    addressType: 'home',
    isDefault: true
});

// Update Address
await userService.updateAddress(addressId, addressData);

// Delete Address
await userService.deleteAddress(addressId);

// Set Default Address
await userService.setDefaultAddress(addressId);

// Get Default Address
const defaultAddr = await userService.getDefaultAddress();
```

### 3. AuthStateManager (`js/auth-state-manager.js`)

Manages global authentication state and UI updates across the application.

#### Key Features:

- **Automatic UI Updates**: Updates navigation and user-specific elements
- **Token Refresh**: Automatically refreshes tokens before expiry
- **Event Handling**: Listens for auth events and updates state
- **Cart Synchronization**: Syncs cart data after login
- **Session Management**: Handles page visibility and session persistence

#### Usage:

```javascript
// Check Authentication
const isAuth = authStateManager.isAuthenticated();

// Get Current User
const user = authStateManager.getCurrentUser();

// Require Authentication (redirect if not logged in)
authStateManager.requireAuth();

// Protect Route
if (!authStateManager.protectRoute()) {
    return; // User will be redirected to login
}

// Add State Change Listener
authStateManager.addListener((state) => {
    console.log('Auth state changed:', state);
});

// Update Cart Count
authStateManager.updateCartCount();

// Show Login Prompt
authStateManager.showLoginPrompt('Please login to continue');
```

---

## UI Components

### 1. Login Page (`login.html`)

**Features:**
- Email/password authentication
- Remember me functionality
- Password visibility toggle
- Social login buttons (Google, Facebook)
- Forgot password link
- Real-time validation
- Loading states

**Usage:**
```html
<!-- Redirect to login with return URL -->
<a href="login.html?redirect=checkout.html">Login</a>
```

### 2. Registration Page (`register.html`)

**Features:**
- Multi-field registration form
- OTP email verification
- Password strength validation
- Terms & conditions checkbox
- Social registration options
- Two-step process (Register → Verify OTP)

**Flow:**
1. User fills registration form
2. System sends OTP to email
3. User enters 6-digit OTP
4. Account is verified and activated

### 3. Forgot Password Page (`forgot-password.html`)

**Features:**
- Email-based password reset
- Reset link sent to email
- Resend functionality
- Success confirmation

### 4. Profile Page (`profile.html`)

**Features:**
- Profile information editing
- Avatar/profile picture upload
- Address management (CRUD)
- Order history view
- Password change
- Account deletion

**Sections:**
- Profile Information
- My Addresses
- My Orders
- Security Settings

---

## Integration

### Adding Authentication to Existing Pages

#### 1. Include Required Scripts

Add these scripts to your HTML pages (in order):

```html
<!-- Authentication Scripts -->
<script src="js/auth-service.js"></script>
<script src="js/user-service.js"></script>
<script src="js/auth-state-manager.js"></script>
<script src="js/main.js"></script>
```

#### 2. Protect Routes

For pages that require authentication:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Redirect to login if not authenticated
    if (!authStateManager.protectRoute()) {
        return;
    }
    
    // Continue with page initialization
    initializePage();
});
```

#### 3. Update Navigation

The AuthStateManager automatically updates navigation, but you can manually trigger updates:

```javascript
// After login/logout
authStateManager.updateAuthState();
```

#### 4. Cart Integration

Update cart operations to sync with authentication:

```javascript
// After adding to cart
window.dispatchEvent(new Event('cartUpdated'));

// Listen for cart updates
window.addEventListener('cartUpdated', function() {
    authStateManager.updateCartCount();
});
```

---

## Usage Examples

### Example 1: Login Flow

```javascript
// login.js
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await authService.loginUser(email, password);
        
        if (response.success) {
            // Redirect to intended page
            const redirectUrl = new URLSearchParams(window.location.search)
                .get('redirect') || 'index.html';
            window.location.href = redirectUrl;
        }
    } catch (error) {
        showAlert('error', error.message);
    }
});
```

### Example 2: Registration with OTP

```javascript
// register.js
const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const userData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        phone: document.getElementById('phone').value
    };
    
    try {
        const response = await authService.registerUser(userData);
        
        if (response.requiresOtp) {
            // Show OTP form
            showOtpForm(userData.email, response.userId);
        }
    } catch (error) {
        showAlert('error', error.message);
    }
});

// OTP Verification
async function verifyOtp(userId, otp) {
    try {
        const response = await authService.verifyOtp(userId, otp);
        
        if (response.success) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        showAlert('error', error.message);
    }
}
```

### Example 3: Profile Update

```javascript
// profile.js
const profileForm = document.getElementById('profileForm');

profileForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const profileData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        phone: document.getElementById('phone').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value
    };
    
    try {
        const response = await userService.updateUserProfile(profileData);
        
        if (response.success) {
            showAlert('success', 'Profile updated successfully!');
        }
    } catch (error) {
        showAlert('error', error.message);
    }
});
```

### Example 4: Address Management

```javascript
// Add new address
async function addAddress() {
    const addressData = {
        fullName: document.getElementById('fullName').value,
        addressLine1: document.getElementById('addressLine1').value,
        addressLine2: document.getElementById('addressLine2').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').value,
        phone: document.getElementById('phone').value,
        addressType: document.getElementById('addressType').value,
        isDefault: document.getElementById('isDefault').checked
    };
    
    try {
        const response = await userService.addAddress(addressData);
        
        if (response.success) {
            showAlert('success', 'Address added successfully!');
            loadAddresses(); // Refresh address list
        }
    } catch (error) {
        showAlert('error', error.message);
    }
}
```

---

## API Reference

### Authentication Events

The system dispatches custom events that you can listen to:

```javascript
// User logged in
window.addEventListener('userLoggedIn', function(event) {
    console.log('User:', event.detail.user);
});

// User logged out
window.addEventListener('userLoggedOut', function() {
    console.log('User logged out');
});

// Profile updated
window.addEventListener('profileUpdated', function(event) {
    console.log('Updated user:', event.detail.user);
});

// Address added
window.addEventListener('addressAdded', function(event) {
    console.log('New address:', event.detail.address);
});

// Address updated
window.addEventListener('addressUpdated', function(event) {
    console.log('Updated address:', event.detail.address);
});

// Address deleted
window.addEventListener('addressDeleted', function(event) {
    console.log('Deleted address ID:', event.detail.addressId);
});

// Cart updated
window.addEventListener('cartUpdated', function() {
    console.log('Cart was updated');
});
```

### Local Storage Keys

The system uses the following localStorage keys:

- `auth_token`: JWT authentication token
- `refresh_token`: Refresh token for token renewal
- `user_data`: Current user information
- `user_addresses`: Cached user addresses
- `cart`: Shopping cart data
- `remembered_email`: Email for "Remember Me" feature

### Session Storage Keys

- `pending_registration`: Temporary registration data for OTP verification
- `reset_email`: Email for password reset flow

---

## Security

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Token Management

- JWT tokens with expiration
- Automatic token refresh before expiry
- Secure token storage in localStorage
- Token validation on each request

### Best Practices

1. **Always use HTTPS** in production
2. **Implement CSRF protection** on the backend
3. **Rate limit** authentication endpoints
4. **Use secure password hashing** (bcrypt, Argon2)
5. **Implement account lockout** after failed attempts
6. **Enable two-factor authentication** (future enhancement)
7. **Log security events** for monitoring
8. **Sanitize user inputs** to prevent XSS
9. **Implement proper session management**
10. **Regular security audits**

### Data Protection

- Passwords are never stored in plain text
- Sensitive data is encrypted in transit
- User data is cached locally for performance
- Cache is cleared on logout
- Tokens expire after inactivity

---

## Testing

### Manual Testing Checklist

- [ ] User can register with valid data
- [ ] OTP verification works correctly
- [ ] User can login with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] Remember me functionality works
- [ ] Forgot password sends reset email
- [ ] Password reset works with valid token
- [ ] User can update profile information
- [ ] Profile picture upload works
- [ ] User can add/edit/delete addresses
- [ ] Default address can be set
- [ ] Password change works correctly
- [ ] User can logout successfully
- [ ] Protected routes redirect to login
- [ ] Token refresh works automatically
- [ ] Cart persists after login
- [ ] Navigation updates based on auth state

---

## Future Enhancements

1. **Two-Factor Authentication (2FA)**
2. **Social Login Integration** (Google, Facebook, Apple)
3. **Biometric Authentication** (fingerprint, face ID)
4. **Email Verification** for profile changes
5. **Session Management** across devices
6. **Activity Log** for security monitoring
7. **OAuth 2.0** implementation
8. **Role-Based Access Control** (RBAC)
9. **Account Recovery** options
10. **Privacy Settings** management

---

## Support

For issues or questions:
- Check the console for error messages
- Review the browser's Network tab for API calls
- Ensure all scripts are loaded in the correct order
- Verify localStorage is enabled in the browser
- Check that cookies are not blocked

---

## License

This authentication module is part of the E-Commerce application.

---

**Last Updated:** February 23, 2026
**Version:** 1.0.0