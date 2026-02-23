/**
 * Authentication State Manager
 * Manages global authentication state and UI updates across the application
 */

class AuthStateManager {
    constructor() {
        this.authService = authService;
        this.listeners = [];
        this.initialized = false;
        
        // Initialize on load
        this.init();
    }

    /**
     * Initialize auth state manager
     */
    init() {
        if (this.initialized) return;

        // Listen for authentication events
        this.setupEventListeners();

        // Check initial auth state
        this.updateAuthState();

        // Setup token refresh interval
        this.setupTokenRefresh();

        this.initialized = true;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // User logged in
        window.addEventListener('userLoggedIn', (event) => {
            this.handleLogin(event.detail.user);
        });

        // User logged out
        window.addEventListener('userLoggedOut', () => {
            this.handleLogout();
        });

        // Profile updated
        window.addEventListener('profileUpdated', (event) => {
            this.handleProfileUpdate(event.detail.user);
        });

        // Page visibility change (refresh token when page becomes visible)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.authService.isAuthenticated()) {
                this.refreshTokenIfNeeded();
            }
        });

        // Before page unload (optional: sync cart, etc.)
        window.addEventListener('beforeunload', () => {
            this.handleBeforeUnload();
        });
    }

    /**
     * Update authentication state
     */
    updateAuthState() {
        const isAuthenticated = this.authService.isAuthenticated();
        const user = this.authService.getCurrentUser();

        if (isAuthenticated && user) {
            this.updateUIForAuthenticatedUser(user);
        } else {
            this.updateUIForGuestUser();
        }

        // Notify listeners
        this.notifyListeners({
            isAuthenticated,
            user
        });
    }

    /**
     * Handle user login
     */
    handleLogin(user) {
        console.log('User logged in:', user);
        this.updateUIForAuthenticatedUser(user);
        
        // Sync cart from server if needed
        this.syncCartAfterLogin();
    }

    /**
     * Handle user logout
     */
    handleLogout() {
        console.log('User logged out');
        this.updateUIForGuestUser();
        
        // Clear any user-specific data
        this.clearUserData();
    }

    /**
     * Handle profile update
     */
    handleProfileUpdate(user) {
        console.log('Profile updated:', user);
        this.updateUIForAuthenticatedUser(user);
    }

    /**
     * Update UI for authenticated user
     */
    updateUIForAuthenticatedUser(user) {
        // Update navigation
        this.updateNavigation(true, user);

        // Update user-specific elements
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(el => {
            el.textContent = `${user.firstName} ${user.lastName}`;
        });

        const userEmailElements = document.querySelectorAll('[data-user-email]');
        userEmailElements.forEach(el => {
            el.textContent = user.email;
        });

        // Show authenticated-only elements
        const authElements = document.querySelectorAll('[data-auth-required]');
        authElements.forEach(el => {
            el.style.display = '';
        });

        // Hide guest-only elements
        const guestElements = document.querySelectorAll('[data-guest-only]');
        guestElements.forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * Update UI for guest user
     */
    updateUIForGuestUser() {
        // Update navigation
        this.updateNavigation(false);

        // Hide authenticated-only elements
        const authElements = document.querySelectorAll('[data-auth-required]');
        authElements.forEach(el => {
            el.style.display = 'none';
        });

        // Show guest-only elements
        const guestElements = document.querySelectorAll('[data-guest-only]');
        guestElements.forEach(el => {
            el.style.display = '';
        });
    }

    /**
     * Update navigation based on auth state
     */
    updateNavigation(isAuthenticated, user = null) {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        const navIcons = navbar.querySelector('.nav-icons');
        if (!navIcons) return;

        // Remove existing auth-related icons
        const existingUserIcon = navIcons.querySelector('.user-icon');
        const existingLoginLink = navIcons.querySelector('.login-link');

        if (existingUserIcon) existingUserIcon.remove();
        if (existingLoginLink) existingLoginLink.remove();

        if (isAuthenticated && user) {
            // Add user profile icon
            const userIcon = document.createElement('a');
            userIcon.href = 'profile.html';
            userIcon.className = 'user-icon';
            userIcon.title = `${user.firstName} ${user.lastName}`;
            userIcon.innerHTML = '👤';
            navIcons.appendChild(userIcon);
        } else {
            // Add login link
            const loginLink = document.createElement('a');
            loginLink.href = 'login.html';
            loginLink.className = 'login-link';
            loginLink.textContent = 'Login';
            loginLink.style.marginLeft = '15px';
            navIcons.appendChild(loginLink);
        }
    }

    /**
     * Setup automatic token refresh
     */
    setupTokenRefresh() {
        // Refresh token every 50 minutes (assuming 60-minute token expiry)
        setInterval(() => {
            this.refreshTokenIfNeeded();
        }, 50 * 60 * 1000);
    }

    /**
     * Refresh token if needed
     */
    async refreshTokenIfNeeded() {
        if (!this.authService.isAuthenticated()) {
            return;
        }

        try {
            const token = this.authService.getToken();
            if (!token) return;

            // Parse token to check expiry
            const payload = this.authService.parseJwt(token);
            const currentTime = Date.now() / 1000;
            const timeUntilExpiry = payload.exp - currentTime;

            // Refresh if token expires in less than 10 minutes
            if (timeUntilExpiry < 600) {
                console.log('Refreshing token...');
                await this.authService.refreshToken();
                console.log('Token refreshed successfully');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            // If refresh fails, logout user
            await this.authService.logoutUser();
        }
    }

    /**
     * Sync cart after login
     */
    async syncCartAfterLogin() {
        try {
            // Get local cart
            const localCart = JSON.parse(localStorage.getItem('cart')) || [];
            
            if (localCart.length > 0) {
                console.log('Syncing local cart with server...');
                // TODO: Implement server-side cart sync
                // For now, just keep local cart
            }
        } catch (error) {
            console.error('Cart sync error:', error);
        }
    }

    /**
     * Clear user-specific data
     */
    clearUserData() {
        // Clear cached addresses
        if (typeof userService !== 'undefined') {
            userService.clearCachedAddresses();
        }

        // Clear any other user-specific cached data
        // Note: We keep the cart for guest users
    }

    /**
     * Handle before page unload
     */
    handleBeforeUnload() {
        // Sync any pending data
        // This is a good place to save draft data, etc.
    }

    /**
     * Add state change listener
     */
    addListener(callback) {
        if (typeof callback === 'function') {
            this.listeners.push(callback);
        }
    }

    /**
     * Remove state change listener
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    }

    /**
     * Notify all listeners of state change
     */
    notifyListeners(state) {
        this.listeners.forEach(callback => {
            try {
                callback(state);
            } catch (error) {
                console.error('Listener error:', error);
            }
        });
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.authService.isAuthenticated();
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        return this.authService.getCurrentUser();
    }

    /**
     * Require authentication (redirect to login if not authenticated)
     */
    requireAuth(redirectUrl = null) {
        if (!this.isAuthenticated()) {
            const currentUrl = redirectUrl || window.location.pathname + window.location.search;
            window.location.href = `login.html?redirect=${encodeURIComponent(currentUrl)}`;
            return false;
        }
        return true;
    }

    /**
     * Protect route (for use in page initialization)
     */
    protectRoute() {
        return this.requireAuth();
    }

    /**
     * Get user display name
     */
    getUserDisplayName() {
        const user = this.getCurrentUser();
        if (!user) return 'Guest';
        return `${user.firstName} ${user.lastName}`;
    }

    /**
     * Check if user has specific role/permission
     */
    hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        // TODO: Implement role-based permissions
        return user.permissions && user.permissions.includes(permission);
    }

    /**
     * Update cart count in navigation
     */
    updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(el => {
            el.textContent = totalItems;
            
            // Add badge animation
            if (totalItems > 0) {
                el.style.display = 'inline-block';
                el.classList.add('cart-count-updated');
                setTimeout(() => {
                    el.classList.remove('cart-count-updated');
                }, 300);
            } else {
                el.style.display = 'none';
            }
        });
    }

    /**
     * Show login prompt
     */
    showLoginPrompt(message = 'Please login to continue') {
        if (confirm(`${message}\n\nWould you like to login now?`)) {
            const currentUrl = window.location.pathname + window.location.search;
            window.location.href = `login.html?redirect=${encodeURIComponent(currentUrl)}`;
        }
    }

    /**
     * Handle API authentication errors
     */
    handleAuthError(error) {
        console.error('Authentication error:', error);
        
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
            // Token expired or invalid
            this.authService.clearAuthData();
            this.showLoginPrompt('Your session has expired. Please login again.');
        }
    }
}

// Create singleton instance
const authStateManager = new AuthStateManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = authStateManager;
}

// Add CSS for cart count animation
const style = document.createElement('style');
style.textContent = `
    .cart-count {
        transition: transform 0.3s ease;
    }
    
    .cart-count-updated {
        animation: cartBounce 0.3s ease;
    }
    
    @keyframes cartBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
    }
    
    .user-icon {
        font-size: 24px;
        text-decoration: none;
        margin-left: 15px;
        transition: transform 0.3s ease;
    }
    
    .user-icon:hover {
        transform: scale(1.1);
    }
    
    .login-link {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 6px;
        transition: all 0.3s ease;
    }
    
    .login-link:hover {
        background: #f8f9ff;
        color: #764ba2;
    }
`;
document.head.appendChild(style);

// Made with Bob
