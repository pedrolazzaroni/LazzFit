// LazzFit Authentication JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePasswordStrength(this);
        });
    }

    // Password confirmation validation
    const confirmPasswordInput = document.getElementById('confirm-password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            validatePasswordMatch();
        });
    }

    // Login form handling
    const loginForm = document.querySelector('form.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous error messages
            clearFormMessages();
            
            // Get form data
            const formData = new FormData(loginForm);
            
            // Add loading state to button
            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.classList.add('btn-loading');
            submitButton.disabled = true;
            
            // Send login request
            fetch('../auth/login.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Remove loading state
                submitButton.classList.remove('btn-loading');
                submitButton.disabled = false;
                
                if (data.success) {
                    // Show success message and redirect
                    showMessage('success', data.message || 'Login realizado com sucesso!');
                    
                    // Store user data if needed
                    if (data.user) {
                        localStorage.setItem('user_first_name', data.user.first_name);
                    }
                    
                    // Redirect after a brief delay to show the success message
                    setTimeout(() => {
                        window.location.href = data.redirect || '../dashboard.php';
                    }, 1000);
                } else {
                    // Show error message
                    showMessage('error', data.message || 'Falha no login. Verifique suas credenciais.');
                }
            })
            .catch(error => {
                // Remove loading state
                submitButton.classList.remove('btn-loading');
                submitButton.disabled = false;
                
                console.error('Error:', error);
                showMessage('error', 'Ocorreu um erro na comunicação com o servidor. Por favor, tente novamente.');
            });
        });
    }

    // Registration form handling
    const registerForm = document.querySelector('form.register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous error messages
            clearFormMessages();
            
            // Get form data
            const formData = new FormData(registerForm);
            
            // Validate form data
            if (!validateRegistrationForm(formData)) {
                return;
            }
            
            // Add loading state to button
            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.classList.add('btn-loading');
            submitButton.disabled = true;
            
            // Send registration request
            fetch('../auth/register.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Remove loading state
                submitButton.classList.remove('btn-loading');
                submitButton.disabled = false;
                
                if (data.success) {
                    // Show success message and redirect
                    showMessage('success', data.message || 'Conta criada com sucesso!');
                    
                    // Clear form
                    registerForm.reset();
                    
                    // Redirect after a brief delay to show the success message
                    setTimeout(() => {
                        window.location.href = data.redirect || '../dashboard.php';
                    }, 1500);
                } else {
                    // Show error message
                    showMessage('error', data.message || 'Ocorreu um erro ao criar sua conta.');
                }
            })
            .catch(error => {
                // Remove loading state
                submitButton.classList.remove('btn-loading');
                submitButton.disabled = false;
                
                console.error('Error:', error);
                showMessage('error', 'Ocorreu um erro na comunicação com o servidor. Por favor, tente novamente.');
            });
        });
    }

    // Password reset form handling
    const resetPasswordForm = document.querySelector('form.reset-password-form');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Clear previous error messages
            clearFormMessages();
            
            // Get form data
            const formData = new FormData(resetPasswordForm);
            
            // Validate email
            const email = formData.get('email');
            if (!validateEmail(email)) {
                showFieldError('email', 'Por favor, informe um e-mail válido');
                return;
            }
            
            // Add loading state to button
            const submitButton = resetPasswordForm.querySelector('button[type="submit"]');
            submitButton.classList.add('btn-loading');
            submitButton.disabled = true;
            
            // Send password reset request
            fetch('../auth/request_reset.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                // Remove loading state
                submitButton.classList.remove('btn-loading');
                submitButton.disabled = false;
                
                if (data.success) {
                    // Show success message
                    showMessage('success', data.message || 'Instruções de recuperação enviadas para seu e-mail!');
                    
                    // Clear form
                    resetPasswordForm.reset();
                } else {
                    // Show error message
                    showMessage('error', data.message || 'Não foi possível processar sua solicitação.');
                }
            })
            .catch(error => {
                // Remove loading state
                submitButton.classList.remove('btn-loading');
                submitButton.disabled = false;
                
                console.error('Error:', error);
                showMessage('error', 'Ocorreu um erro na comunicação com o servidor. Por favor, tente novamente.');
            });
        });
    }

    // Validation Functions
    function validatePasswordStrength(passwordInput) {
        const password = passwordInput.value;
        let strength = 0;
        const feedback = document.createElement('div');
        feedback.className = 'password-strength-meter';
        
        // Remove any existing feedback
        const existingFeedback = document.querySelector('.password-strength-meter');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        if (password.length === 0) {
            return;
        }
        
        // Password length check
        if (password.length >= 8) {
            strength += 1;
        }
        
        // Contains lowercase
        if (password.match(/[a-z]/)) {
            strength += 1;
        }
        
        // Contains uppercase
        if (password.match(/[A-Z]/)) {
            strength += 1;
        }
        
        // Contains number
        if (password.match(/[0-9]/)) {
            strength += 1;
        }
        
        // Contains special character
        if (password.match(/[^a-zA-Z0-9]/)) {
            strength += 1;
        }
        
        // Create strength meter
        const meter = document.createElement('div');
        meter.className = 'strength-meter';
        
        const meterBar = document.createElement('div');
        meterBar.className = 'meter-bar';
        
        // Set strength level
        let strengthText = '';
        let strengthClass = '';
        
        switch (strength) {
            case 0:
            case 1:
                strengthText = 'Fraco';
                strengthClass = 'weak';
                break;
            case 2:
            case 3:
                strengthText = 'Médio';
                strengthClass = 'medium';
                break;
            case 4:
            case 5:
                strengthText = 'Forte';
                strengthClass = 'strong';
                break;
        }
        
        meterBar.style.width = `${(strength / 5) * 100}%`;
        meterBar.classList.add(strengthClass);
        meter.appendChild(meterBar);
        
        const strengthLabel = document.createElement('span');
        strengthLabel.className = `strength-text ${strengthClass}`;
        strengthLabel.textContent = strengthText;
        
        feedback.appendChild(meter);
        feedback.appendChild(strengthLabel);
        
        // Add feedback after the password input
        const parent = passwordInput.parentElement;
        parent.appendChild(feedback);
        
        // Add CSS if it doesn't exist
        addPasswordStrengthStyles();
    }
    
    function validatePasswordMatch() {
        const passwordInput = document.getElementById('password');
        const confirmInput = document.getElementById('confirm-password');
        
        if (!passwordInput || !confirmInput) return;
        
        const password = passwordInput.value;
        const confirmPassword = confirmInput.value;
        
        // Remove any existing feedback
        const existingFeedback = confirmInput.parentElement.querySelector('.password-match-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        // Only validate if both fields have content
        if (password.length > 0 && confirmPassword.length > 0) {
            const feedback = document.createElement('div');
            feedback.className = 'password-match-feedback';
            
            if (password === confirmPassword) {
                feedback.classList.add('match');
                feedback.innerHTML = '<i class="fas fa-check"></i> Senhas correspondem';
                confirmInput.classList.remove('is-invalid');
                confirmInput.classList.add('is-valid');
            } else {
                feedback.classList.add('no-match');
                feedback.innerHTML = '<i class="fas fa-times"></i> Senhas não correspondem';
                confirmInput.classList.remove('is-valid');
                confirmInput.classList.add('is-invalid');
            }
            
            // Add feedback after the confirm password input
            const parent = confirmInput.parentElement;
            parent.appendChild(feedback);
        }
    }
    
    function validateRegistrationForm(formData) {
        let isValid = true;
        
        // Validate name
        const name = formData.get('name');
        if (!name || name.trim() === '') {
            showFieldError('name', 'O nome é obrigatório');
            isValid = false;
        }
        
        // Validate email
        const email = formData.get('email');
        if (!validateEmail(email)) {
            showFieldError('email', 'Por favor, informe um e-mail válido');
            isValid = false;
        }
        
        // Validate password
        const password = formData.get('password');
        if (password.length < 8) {
            showFieldError('password', 'A senha deve ter pelo menos 8 caracteres');
            isValid = false;
        } else if (!password.match(/[a-z]/) || !password.match(/[0-9]/)) {
            showFieldError('password', 'A senha deve conter letras e números');
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
    
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return email && re.test(String(email).toLowerCase());
    }
    
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (field) {
            field.classList.add('is-invalid');
            
            // Remove any existing feedback
            const existingFeedback = field.parentElement.querySelector('.invalid-feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }
            
            // Add error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = message;
            
            const parent = field.parentElement;
            parent.appendChild(errorDiv);
        }
    }
    
    function showMessage(type, message) {
        // Find messages container
        let messageContainer = document.querySelector(`.form-message.${type}`);
        
        if (messageContainer) {
            messageContainer.textContent = message;
            messageContainer.style.display = 'block';
        } else {
            // Create new message container if needed
            const form = document.querySelector('form');
            if (form) {
                messageContainer = document.createElement('div');
                messageContainer.className = `form-message ${type}`;
                messageContainer.textContent = message;
                messageContainer.style.display = 'block';
                
                form.insertBefore(messageContainer, form.firstChild);
            }
        }
    }
    
    function clearFormMessages() {
        // Hide all form messages
        const messages = document.querySelectorAll('.form-message');
        messages.forEach(message => {
            message.style.display = 'none';
        });
        
        // Remove invalid state from fields
        const invalidFields = document.querySelectorAll('.is-invalid');
        invalidFields.forEach(field => {
            field.classList.remove('is-invalid');
        });
        
        // Remove feedback messages
        const feedbacks = document.querySelectorAll('.invalid-feedback, .password-match-feedback, .password-strength-meter');
        feedbacks.forEach(feedback => {
            feedback.remove();
        });
    }
    
    function addPasswordStrengthStyles() {
        // Check if style exists
        if (document.getElementById('password-strength-styles')) {
            return;
        }
        
        // Create style element
        const style = document.createElement('style');
        style.id = 'password-strength-styles';
        style.textContent = `
            .password-strength-meter {
                margin-top: 10px;
                font-size: 0.85rem;
            }
            
            .strength-meter {
                height: 5px;
                background-color: #e0e0e0;
                border-radius: 3px;
                position: relative;
                margin-bottom: 5px;
            }
            
            .meter-bar {
                height: 100%;
                border-radius: 3px;
                transition: width 0.5s ease;
            }
            
            .meter-bar.weak {
                background-color: #FF3B30;
                width: 30%;
            }
            
            .meter-bar.medium {
                background-color: #FF9500;
                width: 60%;
            }
            
            .meter-bar.strong {
                background-color: #34C759;
                width: 100%;
            }
            
            .strength-text {
                font-size: 0.75rem;
                font-weight: 500;
            }
            
            .strength-text.weak {
                color: #FF3B30;
            }
            
            .strength-text.medium {
                color: #FF9500;
            }
            
            .strength-text.strong {
                color: #34C759;
            }
            
            .password-match-feedback {
                margin-top: 5px;
                font-size: 0.85rem;
            }
            
            .password-match-feedback.match {
                color: #34C759;
            }
            
            .password-match-feedback.no-match {
                color: #FF3B30;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Helper functions for social login (placeholders)
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const provider = this.classList.contains('google') ? 'google' : 
                            this.classList.contains('facebook') ? 'facebook' : 'apple';
                            
            // Show a message for demonstration purposes
            showMessage('info', `Login com ${provider} será implementado em breve!`);
        });
    });
});
