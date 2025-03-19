// LazzFit Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    const header = document.querySelector('.main-header');
    let lastScrollTop = 0;
    
    if (header) {
        window.addEventListener('scroll', function() {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Add sticky class when scrolling down
            if (scrollTop > 50) {
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
            
            // Hide/show header based on scroll direction
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                header.classList.add('hidden');
            } else {
                header.classList.remove('hidden');
            }
            
            lastScrollTop = scrollTop;
        });
    }
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (mainNav && mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    document.body.classList.remove('menu-open');
                }
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animation on scroll
    const animateElements = document.querySelectorAll('.animate');
    
    if (animateElements.length > 0) {
        const animateOnScroll = function() {
            animateElements.forEach(element => {
                const elementTop = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                
                if (elementTop < windowHeight - 50) {
                    element.classList.add('fadeIn');
                }
            });
        };
        
        // Initial check on load
        animateOnScroll();
        
        // Check on scroll
        window.addEventListener('scroll', animateOnScroll);
    }
    
    // Form validation (for non-auth forms)
    const forms = document.querySelectorAll('form:not(.login-form):not(.register-form)');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Check required fields
            const requiredFields = form.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    field.classList.add('error');
                    isValid = false;
                } else {
                    field.classList.remove('error');
                }
            });
            
            // Check email fields
            const emailFields = form.querySelectorAll('input[type="email"]');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            emailFields.forEach(field => {
                if (field.value && !emailRegex.test(field.value)) {
                    field.classList.add('error');
                    isValid = false;
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                
                // Scroll to first error
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstError.focus();
                }
            }
        });
    });
});
