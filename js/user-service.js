/**
 * UserService - Handles user profile and address management
 * Includes profile operations and address CRUD operations
 */

class UserService {
    constructor() {
        this.API_BASE_URL = 'https://api.example.com'; // Replace with actual API
        this.authService = authService; // Reference to AuthService
        this.ADDRESSES_KEY = 'user_addresses';
    }

    // ========== Profile Management ==========

    /**
     * Get user profile
     * @returns {Promise<Object>} User profile data
     */
    async getUserProfile() {
        try {
            const token = this.authService.getToken();
            
            if (!token) {
                throw new Error('User not authenticated');
            }

            // Check if user data exists in local storage
            const cachedUser = this.authService.getCurrentUser();
            
            // Fetch fresh data from server
            const response = await this.authenticatedRequest('/user/profile', {
                method: 'GET'
            });

            if (response.success) {
                // Update cached user data
                this.authService.setUserData(response.user);
                
                return {
                    success: true,
                    user: response.user
                };
            }

            // If API fails, return cached data
            if (cachedUser) {
                return {
                    success: true,
                    user: cachedUser,
                    cached: true
                };
            }

            throw new Error(response.message || 'Failed to fetch profile');
        } catch (error) {
            console.error('Get profile error:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {Object} profileData - Updated profile data
     * @returns {Promise<Object>} Updated profile
     */
    async updateUserProfile(profileData) {
        try {
            const token = this.authService.getToken();
            
            if (!token) {
                throw new Error('User not authenticated');
            }

            // Validate profile data
            const validatedData = this.validateProfileData(profileData);

            const response = await this.authenticatedRequest('/user/profile', {
                method: 'PUT',
                body: JSON.stringify(validatedData)
            });

            if (response.success) {
                // Update local user data
                this.authService.setUserData(response.user);

                // Dispatch profile update event
                window.dispatchEvent(new CustomEvent('profileUpdated', {
                    detail: { user: response.user }
                }));

                return {
                    success: true,
                    message: 'Profile updated successfully',
                    user: response.user
                };
            }

            throw new Error(response.message || 'Failed to update profile');
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    /**
     * Update user avatar/profile picture
     * @param {File} imageFile - Image file
     * @returns {Promise<Object>} Response with image URL
     */
    async updateProfilePicture(imageFile) {
        try {
            const token = this.authService.getToken();
            
            if (!token) {
                throw new Error('User not authenticated');
            }

            // Validate image file
            if (!imageFile || !imageFile.type.startsWith('image/')) {
                throw new Error('Please select a valid image file');
            }

            // Check file size (max 5MB)
            if (imageFile.size > 5 * 1024 * 1024) {
                throw new Error('Image size must be less than 5MB');
            }

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('avatar', imageFile);

            const response = await this.authenticatedRequest('/user/profile/avatar', {
                method: 'POST',
                body: formData,
                headers: {} // Let browser set Content-Type for FormData
            });

            if (response.success) {
                // Update user data with new avatar URL
                const currentUser = this.authService.getCurrentUser();
                currentUser.avatar = response.avatarUrl;
                this.authService.setUserData(currentUser);

                return {
                    success: true,
                    message: 'Profile picture updated successfully',
                    avatarUrl: response.avatarUrl
                };
            }

            throw new Error(response.message || 'Failed to upload profile picture');
        } catch (error) {
            console.error('Update profile picture error:', error);
            throw error;
        }
    }

    /**
     * Delete user account
     * @param {string} password - User password for confirmation
     * @returns {Promise<Object>} Response
     */
    async deleteAccount(password) {
        try {
            const token = this.authService.getToken();
            
            if (!token) {
                throw new Error('User not authenticated');
            }

            if (!password) {
                throw new Error('Password is required to delete account');
            }

            const response = await this.authenticatedRequest('/user/account', {
                method: 'DELETE',
                body: JSON.stringify({ password })
            });

            if (response.success) {
                // Clear all user data and logout
                await this.authService.logoutUser();

                return {
                    success: true,
                    message: 'Account deleted successfully'
                };
            }

            throw new Error(response.message || 'Failed to delete account');
        } catch (error) {
            console.error('Delete account error:', error);
            throw error;
        }
    }

    // ========== Address Management ==========

    /**
     * List all user addresses
     * @returns {Promise<Array>} List of addresses
     */
    async listAddresses() {
        try {
            const token = this.authService.getToken();
            
            if (!token) {
                throw new Error('User not authenticated');
            }

            // Try to get from local storage first
            const cachedAddresses = this.getCachedAddresses();

            // Fetch from server
            const response = await this.authenticatedRequest('/user/addresses', {
                method: 'GET'
            });

            if (response.success) {
                // Cache addresses locally
                this.cacheAddresses(response.addresses);

                return {
                    success: true,
                    addresses: response.addresses
                };
            }

            // Return cached addresses if API fails
            if (cachedAddresses) {
                return {
                    success: true,
                    addresses: cachedAddresses,
                    cached: true
                };
            }

            throw new Error(response.message || 'Failed to fetch addresses');
        } catch (error) {
            console.error('List addresses error:', error);
            throw error;
        }
    }

    /**
     * Get a specific address by ID
     * @param {string} addressId - Address ID
     * @returns {Promise<Object>} Address data
     */
    async getAddress(addressId) {
        try {
            const token = this.authService.getToken();
            
            if (!token) {
                throw new Error('User not authenticated');
            }

            const response = await this.authenticatedRequest(`/user/addresses/${addressId}`, {
                method: 'GET'
            });

            if (response.success) {
                return {
                    success: true,
                    address: response.address
                };
            }

            throw new Error(response.message || 'Failed to fetch address');
        } catch (error) {
            console.error('Get address error:', error);
            throw error;
        }
    }

    /**
     * Add a new address
     * @param {Object} addressData - Address details
     * @returns {Promise<Object>} Created address
     */
    async addAddress(addressData) {
        try {
            const token = this.authService.getToken();
            
            if (!token) {
                throw new Error('User not authenticated');
            }

            // Validate address data
            const validatedAddress = this.validateAddressData(addressData);

            const response = await this.authenticatedRequest('/user/addresses', {
                method: 'POST',
                body: JSON.stringify(validatedAddress)
            });

            if (response.success) {
                // Update cached addresses
                const addresses = this.getCachedAddresses() || [];
                addresses.push(response.address);
                this.cacheAddresses(addresses);

                // Dispatch address added event
                window.dispatchEvent(new CustomEvent('addressAdded', {
                    detail: { address: response.address }
                }));

                return {
                    success: true,
                    message: 'Address added successfully',
                    address: response.address
                };
            }

            throw new Error(response.message || 'Failed to add address');
        } catch (error) {
            console.error('Add address error:', error);
            throw error;
        }
    }

    /**
     * Update an existing address
     * @param {string} addressId - Address ID
     * @param {Object} addressData - Updated address data
     * @returns {Promise<Object>} Updated address
     */
    async updateAddress(addressId, addressData) {
        try {
            const token = this.authService.getToken();
            
            if (!token) {
                throw new Error('User not authenticated');
            }

            if (!addressId) {
                throw new Error('Address ID is required');
            }

            // Validate address data
            const validatedAddress = this.validateAddressData(addressData);

            const response = await this.authenticatedRequest(`/user/addresses/${addressId}`, {
                method: 'PUT',
                body: JSON.stringify(validatedAddress)
            });

            if (response.success) {
                // Update cached addresses
                const addresses = this.getCachedAddresses() || [];
                const index = addresses.findIndex(addr => addr.id === addressId);
                if (index !== -1) {
                    addresses[index] = response.address;
                    this.cacheAddresses(addresses);
                }

                // Dispatch address updated event
                window.dispatchEvent(new CustomEvent('addressUpdated', {
                    detail: { address: response.address }
                }));

                return {
                    success: true,
                    message: 'Address updated successfully',
                    address: response.address
                };
            }

            throw new Error(response.message || 'Failed to update address');
        } catch (error) {
            console.error('Update address error:', error);
            throw error;
        }
    }

    /**
     * Delete an address
     * @param {string} addressId - Address ID
     * @returns {Promise<Object>} Response
     */
    async deleteAddress(addressId) {
        try {
            const token = this.authService.getToken();
            
            if (!token) {
                throw new Error('User not authenticated');
            }

            if (!addressId) {
                throw new Error('Address ID is required');
            }

            const response = await this.authenticatedRequest(`/user/addresses/${addressId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                // Update cached addresses
                const addresses = this.getCachedAddresses() || [];
                const filteredAddresses = addresses.filter(addr => addr.id !== addressId);
                this.cacheAddresses(filteredAddresses);

                // Dispatch address deleted event
                window.dispatchEvent(new CustomEvent('addressDeleted', {
                    detail: { addressId }
                }));

                return {
                    success: true,
                    message: 'Address deleted successfully'
                };
            }

            throw new Error(response.message || 'Failed to delete address');
        } catch (error) {
            console.error('Delete address error:', error);
            throw error;
        }
    }

    /**
     * Set default address
     * @param {string} addressId - Address ID
     * @returns {Promise<Object>} Response
     */
    async setDefaultAddress(addressId) {
        try {
            const token = this.authService.getToken();
            
            if (!token) {
                throw new Error('User not authenticated');
            }

            if (!addressId) {
                throw new Error('Address ID is required');
            }

            const response = await this.authenticatedRequest(`/user/addresses/${addressId}/default`, {
                method: 'PUT'
            });

            if (response.success) {
                // Update cached addresses
                const addresses = this.getCachedAddresses() || [];
                addresses.forEach(addr => {
                    addr.isDefault = addr.id === addressId;
                });
                this.cacheAddresses(addresses);

                return {
                    success: true,
                    message: 'Default address updated successfully'
                };
            }

            throw new Error(response.message || 'Failed to set default address');
        } catch (error) {
            console.error('Set default address error:', error);
            throw error;
        }
    }

    /**
     * Get default address
     * @returns {Promise<Object>} Default address
     */
    async getDefaultAddress() {
        try {
            const result = await this.listAddresses();
            const defaultAddress = result.addresses.find(addr => addr.isDefault);

            if (defaultAddress) {
                return {
                    success: true,
                    address: defaultAddress
                };
            }

            return {
                success: false,
                message: 'No default address found'
            };
        } catch (error) {
            console.error('Get default address error:', error);
            throw error;
        }
    }

    // ========== Validation Methods ==========

    /**
     * Validate profile data
     */
    validateProfileData(data) {
        const validated = {};

        if (data.firstName) {
            if (data.firstName.length < 2) {
                throw new Error('First name must be at least 2 characters');
            }
            validated.firstName = data.firstName.trim();
        }

        if (data.lastName) {
            if (data.lastName.length < 2) {
                throw new Error('Last name must be at least 2 characters');
            }
            validated.lastName = data.lastName.trim();
        }

        if (data.email) {
            if (!this.validateEmail(data.email)) {
                throw new Error('Invalid email format');
            }
            validated.email = data.email.trim().toLowerCase();
        }

        if (data.phone) {
            if (!this.validatePhone(data.phone)) {
                throw new Error('Invalid phone number format');
            }
            validated.phone = data.phone.trim();
        }

        if (data.dateOfBirth) {
            validated.dateOfBirth = data.dateOfBirth;
        }

        if (data.gender) {
            validated.gender = data.gender;
        }

        return validated;
    }

    /**
     * Validate address data
     */
    validateAddressData(data) {
        const required = ['fullName', 'addressLine1', 'city', 'state', 'zipCode', 'country', 'phone'];
        
        for (const field of required) {
            if (!data[field] || data[field].trim() === '') {
                throw new Error(`${field} is required`);
            }
        }

        // Validate zip code format (basic validation)
        if (!/^\d{5,6}(-\d{4})?$/.test(data.zipCode)) {
            throw new Error('Invalid zip code format');
        }

        // Validate phone
        if (!this.validatePhone(data.phone)) {
            throw new Error('Invalid phone number format');
        }

        return {
            fullName: data.fullName.trim(),
            addressLine1: data.addressLine1.trim(),
            addressLine2: data.addressLine2 ? data.addressLine2.trim() : '',
            city: data.city.trim(),
            state: data.state.trim(),
            zipCode: data.zipCode.trim(),
            country: data.country.trim(),
            phone: data.phone.trim(),
            addressType: data.addressType || 'home', // home, work, other
            isDefault: data.isDefault || false
        };
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number
     */
    validatePhone(phone) {
        // Basic phone validation (supports various formats)
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        return phoneRegex.test(phone);
    }

    // ========== Cache Management ==========

    /**
     * Cache addresses in local storage
     */
    cacheAddresses(addresses) {
        try {
            localStorage.setItem(this.ADDRESSES_KEY, JSON.stringify(addresses));
        } catch (error) {
            console.error('Failed to cache addresses:', error);
        }
    }

    /**
     * Get cached addresses from local storage
     */
    getCachedAddresses() {
        try {
            const cached = localStorage.getItem(this.ADDRESSES_KEY);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Failed to get cached addresses:', error);
            return null;
        }
    }

    /**
     * Clear cached addresses
     */
    clearCachedAddresses() {
        localStorage.removeItem(this.ADDRESSES_KEY);
    }

    // ========== API Request Helper ==========

    /**
     * Make authenticated API request
     */
    async authenticatedRequest(endpoint, options = {}) {
        const token = this.authService.getToken();

        if (!token) {
            throw new Error('User not authenticated');
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Mock responses for development
        const mockResponses = {
            '/user/profile': {
                success: true,
                user: {
                    id: 'user_123',
                    email: 'user@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+1234567890',
                    dateOfBirth: '1990-01-01',
                    gender: 'male',
                    avatar: 'https://via.placeholder.com/150',
                    verified: true,
                    createdAt: '2024-01-01T00:00:00Z'
                }
            },
            '/user/addresses': {
                success: true,
                addresses: [
                    {
                        id: 'addr_1',
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
                    },
                    {
                        id: 'addr_2',
                        fullName: 'John Doe',
                        addressLine1: '456 Office Blvd',
                        addressLine2: 'Suite 200',
                        city: 'New York',
                        state: 'NY',
                        zipCode: '10002',
                        country: 'USA',
                        phone: '+1234567890',
                        addressType: 'work',
                        isDefault: false
                    }
                ]
            }
        };

        // Handle different HTTP methods
        if (options.method === 'GET') {
            return mockResponses[endpoint] || { success: false, message: 'Endpoint not found' };
        } else if (options.method === 'POST') {
            // Mock POST responses
            if (endpoint === '/user/addresses') {
                const body = JSON.parse(options.body);
                return {
                    success: true,
                    address: {
                        id: 'addr_' + Date.now(),
                        ...body
                    }
                };
            }
            return { success: true, message: 'Created successfully' };
        } else if (options.method === 'PUT') {
            // Mock PUT responses
            if (endpoint === '/user/profile') {
                const body = JSON.parse(options.body);
                return {
                    success: true,
                    user: {
                        ...mockResponses['/user/profile'].user,
                        ...body
                    }
                };
            }
            return { success: true, message: 'Updated successfully' };
        } else if (options.method === 'DELETE') {
            return { success: true, message: 'Deleted successfully' };
        }

        return { success: false, message: 'Method not supported' };

        // Uncomment below for actual API calls
        /*
        try {
            const response = await fetch(this.API_BASE_URL + endpoint, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    ...options.headers
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired, try to refresh
                    await this.authService.refreshToken();
                    // Retry request
                    return await this.authenticatedRequest(endpoint, options);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
        */
    }
}

// Export singleton instance
const userService = new UserService();

// Made with Bob
