/**
 * AuthService - Handles all authentication operations
 * Includes registration, login, OTP verification, password management
 */

class AuthService {
    constructor() {
        this.API_BASE_URL = 'https://api.example.com'; // Replace with actual API
        this.TOKEN_KEY = 'auth_token';
        this.REFRESH_TOKEN_KEY = 'refresh_token';
        this.USER_KEY = 'user_data';
    }

    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Registration response
     */
    async registerUser(userData) {
        try {
            const { email, password, firstName, lastName, phone } = userData;

            // Validate input
            if (!email || !password || !firstName || !lastName) {
                throw new Error('All required fields must be filled');
            }

            if (!this.validateEmail(email)) {
                throw new Error('Invalid email format');
            }

            if (!this.validatePassword(password)) {
                throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
            }

            // Simulate API call (replace with actual API endpoint)
            const response = await this.mockApiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                    firstName,
                    lastName,
                    phone
                })
            });

            if (response.success) {
                // Store temporary registration data for OTP verification
                sessionStorage.setItem('pending_registration', JSON.stringify({
                    email,
                    userId: response.userId
                }));

                return {
                    success: true,
                    message: 'Registration successful. Please verify your email.',
                    userId: response.userId,
                    requiresOtp: true
                };
            }

            throw new Error(response.message || 'Registration failed');
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Verify OTP for email/phone verification
     * @param {string} userId - User ID
     * @param {string} otp - One-time password
     * @returns {Promise<Object>} Verification response
     */
    async verifyOtp(userId, otp) {
        try {
            if (!userId || !otp) {
                throw new Error('User ID and OTP are required');
            }

            if (otp.length !== 6) {
                throw new Error('OTP must be 6 digits');
            }

            // Simulate API call
            const response = await this.mockApiCall('/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ userId, otp })
            });

            if (response.success) {
                // Clear pending registration
                sessionStorage.removeItem('pending_registration');

                // Store tokens
                this.setTokens(response.token, response.refreshToken);
                this.setUserData(response.user);

                return {
                    success: true,
                    message: 'Email verified successfully',
                    user: response.user
                };
            }

            throw new Error(response.message || 'OTP verification failed');
        } catch (error) {
            console.error('OTP verification error:', error);
            throw error;
        }
    }

    /**
     * Resend OTP
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Response
     */
    async resendOtp(userId) {
        try {
            const response = await this.mockApiCall('/auth/resend-otp', {
                method: 'POST',
                body: JSON.stringify({ userId })
            });

            return {
                success: response.success,
                message: response.message || 'OTP sent successfully'
            };
        } catch (error) {
            console.error('Resend OTP error:', error);
            throw error;
        }
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Login response
     */
    async loginUser(email, password) {
        try {
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            if (!this.validateEmail(email)) {
                throw new Error('Invalid email format');
            }

            // Simulate API call
            const response = await this.mockApiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (response.success) {
                // Store tokens and user data
                this.setTokens(response.token, response.refreshToken);
                this.setUserData(response.user);

                // Dispatch login event
                window.dispatchEvent(new CustomEvent('userLoggedIn', {
                    detail: { user: response.user }
                }));

                return {
                    success: true,
                    message: 'Login successful',
                    user: response.user
                };
            }

            throw new Error(response.message || 'Login failed');
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Logout user
     * @returns {Promise<Object>} Logout response
     */
    async logoutUser() {
        try {
            const token = this.getToken();

            if (token) {
                // Notify server about logout
                await this.mockApiCall('/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }

            // Clear local storage
            this.clearAuthData();

            // Dispatch logout event
            window.dispatchEvent(new Event('userLoggedOut'));

            return {
                success: true,
                message: 'Logged out successfully'
            };
        } catch (error) {
            console.error('Logout error:', error);
            // Clear data even if API call fails
            this.clearAuthData();
            throw error;
        }
    }

    /**
     * Refresh authentication token
     * @returns {Promise<Object>} New token
     */
    async refreshToken() {
        try {
            const refreshToken = this.getRefreshToken();

            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await this.mockApiCall('/auth/refresh-token', {
                method: 'POST',
                body: JSON.stringify({ refreshToken })
            });

            if (response.success) {
                this.setTokens(response.token, response.refreshToken);
                return {
                    success: true,
                    token: response.token
                };
            }

            throw new Error('Token refresh failed');
        } catch (error) {
            console.error('Token refresh error:', error);
            // If refresh fails, logout user
            this.clearAuthData();
            window.location.href = '/login.html';
            throw error;
        }
    }

    /**
     * Forgot password - Send reset link
     * @param {string} email - User email
     * @returns {Promise<Object>} Response
     */
    async forgotPassword(email) {
        try {
            if (!email) {
                throw new Error('Email is required');
            }

            if (!this.validateEmail(email)) {
                throw new Error('Invalid email format');
            }

            const response = await this.mockApiCall('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email })
            });

            return {
                success: response.success,
                message: response.message || 'Password reset link sent to your email'
            };
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    /**
     * Reset password with token
     * @param {string} token - Reset token from email
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Response
     */
    async resetPassword(token, newPassword) {
        try {
            if (!token || !newPassword) {
                throw new Error('Token and new password are required');
            }

            if (!this.validatePassword(newPassword)) {
                throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
            }

            const response = await this.mockApiCall('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, newPassword })
            });

            return {
                success: response.success,
                message: response.message || 'Password reset successful'
            };
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    /**
     * Change password (for logged-in users)
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Response
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('User not authenticated');
            }

            if (!currentPassword || !newPassword) {
                throw new Error('Current and new password are required');
            }

            if (!this.validatePassword(newPassword)) {
                throw new Error('Password must be at least 8 characters with uppercase, lowercase, and number');
            }

            const response = await this.mockApiCall('/auth/change-password', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            return {
                success: response.success,
                message: response.message || 'Password changed successfully'
            };
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }

    // ========== Helper Methods ==========

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate password strength
     */
    validatePassword(password) {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        // Check if token is expired
        try {
            const payload = this.parseJwt(token);
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get current user data
     */
    getCurrentUser() {
        const userData = localStorage.getItem(this.USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }

    /**
     * Get authentication token
     */
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Get refresh token
     */
    getRefreshToken() {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    /**
     * Set tokens in local storage
     */
    setTokens(token, refreshToken) {
        localStorage.setItem(this.TOKEN_KEY, token);
        if (refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        }
    }

    /**
     * Set user data in local storage
     */
    setUserData(user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    /**
     * Clear all authentication data
     */
    clearAuthData() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem('pending_registration');
    }

    /**
     * Parse JWT token
     */
    parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    /**
     * Mock API call (replace with actual fetch calls)
     */
    async mockApiCall(endpoint, options = {}) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock responses for development
        const mockResponses = {
            '/auth/register': {
                success: true,
                userId: 'user_' + Date.now(),
                message: 'Registration successful'
            },
            '/auth/verify-otp': {
                success: true,
                token: 'mock_jwt_token_' + Date.now(),
                refreshToken: 'mock_refresh_token_' + Date.now(),
                user: {
                    id: 'user_' + Date.now(),
                    email: 'user@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+1234567890',
                    verified: true
                }
            },
            '/auth/login': {
                success: true,
                token: 'mock_jwt_token_' + Date.now(),
                refreshToken: 'mock_refresh_token_' + Date.now(),
                user: {
                    id: 'user_123',
                    email: 'user@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+1234567890',
                    verified: true
                }
            },
            '/auth/logout': {
                success: true,
                message: 'Logged out successfully'
            },
            '/auth/refresh-token': {
                success: true,
                token: 'new_mock_jwt_token_' + Date.now(),
                refreshToken: 'new_mock_refresh_token_' + Date.now()
            },
            '/auth/forgot-password': {
                success: true,
                message: 'Password reset link sent'
            },
            '/auth/reset-password': {
                success: true,
                message: 'Password reset successful'
            },
            '/auth/change-password': {
                success: true,
                message: 'Password changed successfully'
            },
            '/auth/resend-otp': {
                success: true,
                message: 'OTP sent successfully'
            }
        };

        // Return mock response
        return mockResponses[endpoint] || { success: false, message: 'Endpoint not found' };

        // Uncomment below for actual API calls
        /*
        const response = await fetch(this.API_BASE_URL + endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
        */
    }

    /**
     * Make authenticated API request
     */
    async authenticatedRequest(endpoint, options = {}) {
        const token = this.getToken();

        if (!token) {
            throw new Error('User not authenticated');
        }

        try {
            const response = await this.mockApiCall(endpoint, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    ...options.headers
                }
            });

            return response;
        } catch (error) {
            // If token expired, try to refresh
            if (error.message.includes('401') || error.message.includes('expired')) {
                await this.refreshToken();
                // Retry request with new token
                const newToken = this.getToken();
                return await this.mockApiCall(endpoint, {
                    ...options,
                    headers: {
                        'Authorization': `Bearer ${newToken}`,
                        ...options.headers
                    }
                });
            }
            throw error;
        }
    }
}

// Export singleton instance
const authService = new AuthService();

// Made with Bob
