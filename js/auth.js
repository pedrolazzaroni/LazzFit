// LazzFit Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Login form handling
    const loginForm = document.querySelector('form.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous error messages
            clearErrors();
            
            // Get form data
            const formData = new FormData(loginForm);
            
            // Send login request
            fetch('../auth/login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message and redirect
                    showMessage('success', data.message);
                    setTimeout(() => {
                        window.location.href = data.redirect || 'dashboard.php';
                    }, 1000);
                } else {
                    // Show error message
                    showMessage('error', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('error', 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
            });
        });
    }
    
    // Registration form handling
    const registerForm = document.querySelector('form.register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous error messages
            clearErrors();
            
            // Get form data
            const formData = new FormData(registerForm);
            
            // Validate form data
            if (!validateRegisterForm(formData)) {
                return;
            }
            
            // Send register request
            fetch('../auth/register.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message and redirect
                    showMessage('success', data.message);
                    setTimeout(() => {
                        window.location.href = data.redirect || 'dashboard.php';
                    }, 1000);
                } else {
                    // Show error message
                    showMessage('error', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showMessage('error', 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.');
            });
        });
    }
    
    // Form validation functions
    function validateRegisterForm(formData) {
        let isValid = true;
        
        // Validate name
        const name = formData.get('name');
        if (!name || name.trim() === '') {
            showFieldError('name', 'O nome é obrigatório');
            isValid = false;
        }
        
        // Validate email
        const email = formData.get('email');
        if (!email || !isValidEmail(email)) {
            showFieldError('email', 'Por favor, informe um e-mail válido');
            isValid = false;
        }
        
        // Validate password
        const password = formData.get('password');
        if (!password || password.length < 8) {
            showFieldError('password', 'A senha deve ter pelo menos 8 caracteres');
            isValid = false;
        }
        
        // Validate password confirmation
        const confirmPassword = formData.get('confirm-password');
        if (password !== confirmPassword) {
            showFieldError('confirm-password', 'As senhas não correspondem');
            isValid = false;
        }
        
        // Validate terms
        const terms = formData.get('terms');
        if (!terms) {
            showFieldError('terms', 'Você precisa aceitar os termos de uso');
            isValid = false;
        }
        
        return isValid;
    }
    
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('error');
            
            // Add error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            errorDiv.style.color = '#FF3B30';
            errorDiv.style.fontSize = '0.8rem';
            errorDiv.style.marginTop = '5px';
            
            const parent = field.parentElement;
            parent.appendChild(errorDiv);
        }
    }
    
    function showMessage(type, message) {
        const messageContainer = document.querySelector('.form-message') || createMessageContainer();
        messageContainer.textContent = message;
        messageContainer.className = `form-message ${type}`;
        messageContainer.style.display = 'block';
    }
    
    function createMessageContainer() {
        const form = document.querySelector('form');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'form-message';
        messageDiv.style.padding = '10px';
        messageDiv.style.marginBottom = '15px';
        messageDiv.style.borderRadius = 'var(--border-radius)';
        messageDiv.style.display = 'none';
        
        // Insert at the beginning of the form
        form.insertBefore(messageDiv, form.firstChild);
        
        return messageDiv;
    }
    
    function clearErrors() {
        // Clear field errors
        const errorFields = document.querySelectorAll('.error');
        errorFields.forEach(field => {
            field.classList.remove('error');
        });
        
        // Remove error messages
        const errorMessages = document.querySelectorAll('.field-error');
        errorMessages.forEach(message => {
            message.remove();
        });
        
        // Hide form message
        const messageContainer = document.querySelector('.form-message');
        if (messageContainer) {
            messageContainer.style.display = 'none';
        }
    }
});
