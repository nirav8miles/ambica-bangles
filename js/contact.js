// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm('contactForm')) {
                showErrorMessage('Please fill in all required fields correctly.');
                return;
            }
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Show loading
            showLoading();
            
            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                hideLoading();
                showSuccessMessage('Thank you for contacting us! We will get back to you soon.');
                contactForm.reset();
                
                // Optional: Send to backend or email service
                console.log('Form submitted:', formData);
            }, 1500);
        });
    }
});

// Made with Bob
