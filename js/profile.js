/**
 * Profile Page JavaScript
 * Handles profile management, address CRUD, and security settings
 */

let currentAddressId = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
        window.location.href = 'login.html?redirect=profile.html';
        return;
    }

    // Initialize profile page
    initProfilePage();
    initSectionNavigation();
    initProfileForm();
    initAddressManagement();
    initSecuritySettings();
    initAvatarUpload();
    updateCartCount();
});

/**
 * Initialize profile page
 */
async function initProfilePage() {
    try {
        // Load user profile
        const response = await userService.getUserProfile();
        
        if (response.success) {
            displayUserProfile(response.user);
        }
    } catch (error) {
        console.error('Failed to load profile:', error);
        showAlert('error', 'Failed to load profile. Please refresh the page.');
    }
}

/**
 * Display user profile
 */
function displayUserProfile(user) {
    // Update sidebar
    document.getElementById('profileName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profileEmail').textContent = user.email;
    
    if (user.avatar) {
        document.getElementById('avatarImage').src = user.avatar;
    }

    // Update form fields
    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.lastName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';
    document.getElementById('dateOfBirth').value = user.dateOfBirth || '';
    document.getElementById('gender').value = user.gender || '';
}

/**
 * Initialize section navigation
 */
function initSectionNavigation() {
    const menuLinks = document.querySelectorAll('.profile-menu a[data-section]');
    const sections = document.querySelectorAll('.profile-section-content');

    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('data-section');
            
            // Update active menu item
            menuLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show selected section
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Load section-specific data
                if (sectionId === 'addresses') {
                    loadAddresses();
                }
            }
        });
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', async function(e) {
        e.preventDefault();
        
        if (confirm('Are you sure you want to logout?')) {
            try {
                await authService.logoutUser();
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Logout error:', error);
                showAlert('error', 'Failed to logout. Please try again.');
            }
        }
    });
}

/**
 * Initialize profile form
 */
function initProfileForm() {
    const form = document.getElementById('profileForm');
    const updateBtn = document.getElementById('updateProfileBtn');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            dateOfBirth: document.getElementById('dateOfBirth').value,
            gender: document.getElementById('gender').value
        };

        // Show loading state
        setLoadingState(updateBtn, true);

        try {
            const response = await userService.updateUserProfile(formData);

            if (response.success) {
                showAlert('success', 'Profile updated successfully!');
                displayUserProfile(response.user);
            }
        } catch (error) {
            console.error('Update profile error:', error);
            showAlert('error', error.message || 'Failed to update profile.');
        } finally {
            setLoadingState(updateBtn, false);
        }
    });
}

/**
 * Initialize address management
 */
function initAddressManagement() {
    const addAddressBtn = document.getElementById('addAddressBtn');
    const addressModal = document.getElementById('addressModal');
    const closeModalBtn = document.getElementById('closeAddressModal');
    const cancelBtn = document.getElementById('cancelAddressBtn');
    const addressForm = document.getElementById('addressForm');

    // Add new address
    addAddressBtn.addEventListener('click', function() {
        openAddressModal();
    });

    // Close modal
    closeModalBtn.addEventListener('click', closeAddressModal);
    cancelBtn.addEventListener('click', closeAddressModal);

    // Close modal on outside click
    addressModal.addEventListener('click', function(e) {
        if (e.target === addressModal) {
            closeAddressModal();
        }
    });

    // Submit address form
    addressForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveAddress();
    });
}

/**
 * Load addresses
 */
async function loadAddresses() {
    const addressList = document.getElementById('addressList');
    addressList.innerHTML = '<p style="text-align: center; color: #666;">Loading addresses...</p>';

    try {
        const response = await userService.listAddresses();

        if (response.success && response.addresses.length > 0) {
            displayAddresses(response.addresses);
        } else {
            addressList.innerHTML = `
                <p style="text-align: center; color: #666; padding: 40px;">
                    No addresses found. Add your first address to get started!
                </p>
            `;
        }
    } catch (error) {
        console.error('Load addresses error:', error);
        addressList.innerHTML = `
            <p style="text-align: center; color: #ef4444; padding: 40px;">
                Failed to load addresses. Please try again.
            </p>
        `;
    }
}

/**
 * Display addresses
 */
function displayAddresses(addresses) {
    const addressList = document.getElementById('addressList');
    
    addressList.innerHTML = addresses.map(address => `
        <div class="address-card ${address.isDefault ? 'default' : ''}">
            ${address.isDefault ? '<span class="address-badge">Default</span>' : ''}
            <div class="address-type">${address.addressType}</div>
            <div class="address-name">${address.fullName}</div>
            <div class="address-details">
                ${address.addressLine1}<br>
                ${address.addressLine2 ? address.addressLine2 + '<br>' : ''}
                ${address.city}, ${address.state} ${address.zipCode}<br>
                ${address.country}<br>
                Phone: ${address.phone}
            </div>
            <div class="address-actions">
                <button class="btn btn-sm btn-outline" onclick="editAddress('${address.id}')">
                    Edit
                </button>
                ${!address.isDefault ? `
                    <button class="btn btn-sm btn-outline" onclick="setDefaultAddress('${address.id}')">
                        Set Default
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteAddress('${address.id}')">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Open address modal
 */
function openAddressModal(address = null) {
    const modal = document.getElementById('addressModal');
    const form = document.getElementById('addressForm');
    const title = document.getElementById('addressModalTitle');

    // Reset form
    form.reset();
    currentAddressId = null;

    if (address) {
        // Edit mode
        title.textContent = 'Edit Address';
        currentAddressId = address.id;
        
        // Fill form with address data
        document.getElementById('addressId').value = address.id;
        document.getElementById('fullName').value = address.fullName;
        document.getElementById('addressPhone').value = address.phone;
        document.getElementById('addressLine1').value = address.addressLine1;
        document.getElementById('addressLine2').value = address.addressLine2 || '';
        document.getElementById('city').value = address.city;
        document.getElementById('state').value = address.state;
        document.getElementById('zipCode').value = address.zipCode;
        document.getElementById('country').value = address.country;
        document.getElementById('addressType').value = address.addressType;
        document.getElementById('isDefault').checked = address.isDefault;
    } else {
        // Add mode
        title.textContent = 'Add New Address';
    }

    modal.style.display = 'flex';
}

/**
 * Close address modal
 */
function closeAddressModal() {
    const modal = document.getElementById('addressModal');
    modal.style.display = 'none';
    currentAddressId = null;
}

/**
 * Save address
 */
async function saveAddress() {
    const saveBtn = document.getElementById('saveAddressBtn');
    
    // Get form data
    const addressData = {
        fullName: document.getElementById('fullName').value.trim(),
        phone: document.getElementById('addressPhone').value.trim(),
        addressLine1: document.getElementById('addressLine1').value.trim(),
        addressLine2: document.getElementById('addressLine2').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim(),
        country: document.getElementById('country').value.trim(),
        addressType: document.getElementById('addressType').value,
        isDefault: document.getElementById('isDefault').checked
    };

    // Show loading state
    setLoadingState(saveBtn, true);

    try {
        let response;
        
        if (currentAddressId) {
            // Update existing address
            response = await userService.updateAddress(currentAddressId, addressData);
        } else {
            // Add new address
            response = await userService.addAddress(addressData);
        }

        if (response.success) {
            showAlert('success', response.message || 'Address saved successfully!');
            closeAddressModal();
            loadAddresses();
        }
    } catch (error) {
        console.error('Save address error:', error);
        showAlert('error', error.message || 'Failed to save address.');
    } finally {
        setLoadingState(saveBtn, false);
    }
}

/**
 * Edit address
 */
async function editAddress(addressId) {
    try {
        const response = await userService.getAddress(addressId);
        
        if (response.success) {
            openAddressModal(response.address);
        }
    } catch (error) {
        console.error('Get address error:', error);
        showAlert('error', 'Failed to load address details.');
    }
}

/**
 * Delete address
 */
async function deleteAddress(addressId) {
    if (!confirm('Are you sure you want to delete this address?')) {
        return;
    }

    try {
        const response = await userService.deleteAddress(addressId);
        
        if (response.success) {
            showAlert('success', 'Address deleted successfully!');
            loadAddresses();
        }
    } catch (error) {
        console.error('Delete address error:', error);
        showAlert('error', error.message || 'Failed to delete address.');
    }
}

/**
 * Set default address
 */
async function setDefaultAddress(addressId) {
    try {
        const response = await userService.setDefaultAddress(addressId);
        
        if (response.success) {
            showAlert('success', 'Default address updated!');
            loadAddresses();
        }
    } catch (error) {
        console.error('Set default address error:', error);
        showAlert('error', error.message || 'Failed to set default address.');
    }
}

/**
 * Initialize security settings
 */
function initSecuritySettings() {
    const changePasswordForm = document.getElementById('changePasswordForm');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');

    // Password toggles
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input) {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                this.textContent = type === 'password' ? '👁️' : '🙈';
            }
        });
    });

    // Change password form
    changePasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        // Validate passwords
        if (newPassword !== confirmNewPassword) {
            showAlert('error', 'New passwords do not match!');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            showAlert('error', 'Password must be at least 8 characters with uppercase, lowercase, and number');
            return;
        }

        // Show loading state
        setLoadingState(changePasswordBtn, true);

        try {
            const response = await authService.changePassword(currentPassword, newPassword);

            if (response.success) {
                showAlert('success', 'Password changed successfully!');
                changePasswordForm.reset();
            }
        } catch (error) {
            console.error('Change password error:', error);
            showAlert('error', error.message || 'Failed to change password.');
        } finally {
            setLoadingState(changePasswordBtn, false);
        }
    });

    // Delete account
    deleteAccountBtn.addEventListener('click', async function() {
        const confirmed = confirm(
            'Are you sure you want to delete your account? This action cannot be undone.\n\n' +
            'All your data including orders, addresses, and profile information will be permanently deleted.'
        );

        if (!confirmed) return;

        const password = prompt('Please enter your password to confirm account deletion:');
        
        if (!password) return;

        try {
            const response = await userService.deleteAccount(password);

            if (response.success) {
                alert('Your account has been deleted successfully.');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Delete account error:', error);
            showAlert('error', error.message || 'Failed to delete account.');
        }
    });
}

/**
 * Initialize avatar upload
 */
function initAvatarUpload() {
    const avatarInput = document.getElementById('avatarInput');
    const avatarImage = document.getElementById('avatarImage');

    avatarInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showAlert('error', 'Please select a valid image file.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showAlert('error', 'Image size must be less than 5MB.');
            return;
        }

        try {
            // Show preview
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarImage.src = e.target.result;
            };
            reader.readAsDataURL(file);

            // Upload to server
            const response = await userService.updateProfilePicture(file);

            if (response.success) {
                showAlert('success', 'Profile picture updated successfully!');
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
            showAlert('error', error.message || 'Failed to upload profile picture.');
            
            // Revert to previous image
            const user = authService.getCurrentUser();
            if (user && user.avatar) {
                avatarImage.src = user.avatar;
            }
        }
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
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline-flex';
    } else {
        button.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoader) btnLoader.style.display = 'none';
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

// Listen for profile updates
window.addEventListener('profileUpdated', function(event) {
    console.log('Profile updated:', event.detail.user);
});

window.addEventListener('addressAdded', function(event) {
    console.log('Address added:', event.detail.address);
});

window.addEventListener('addressUpdated', function(event) {
    console.log('Address updated:', event.detail.address);
});

window.addEventListener('addressDeleted', function(event) {
    console.log('Address deleted:', event.detail.addressId);
});

// Made with Bob
