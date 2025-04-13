document.addEventListener('DOMContentLoaded', () => {
    // DOM element selections
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeBtn = loginModal.querySelector('.close');
    const loginForm = document.getElementById('login-form');
    const contactForm = document.getElementById('contact-form');
    const heroQuote = document.getElementById('hero-quote');
    const carousel = document.querySelector('.carousel');
    const carouselContainer = carousel.querySelector('.carousel-container');
    const carouselItems = carousel.querySelectorAll('.carousel-item');
    const prevBtn = carousel.querySelector('.prev');
    const nextBtn = carousel.querySelector('.next');
    const indicators = carousel.querySelectorAll('.indicator');
    const backToTopBtn = document.querySelector('.back-to-top');

    // Sticky Navbar with smooth transition
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Navbar hide/show on scroll
        if (scrollTop > 100) {
            navbar.style.top = scrollTop > lastScrollTop ? '-80px' : '0';
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.top = '0';
        }

        lastScrollTop = scrollTop;

        // Parallax effect for hero section
        const heroSection = document.querySelector('.hero');
        if (heroSection && window.innerWidth > 768) {
            document.querySelector('.hero-bg').style.transform = `skewY(-6deg) translateY(${window.pageYOffset * 0.1}px)`;
        }

        // Show/hide back to top button
        if (scrollTop > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }

        // Animate elements when they come into view
        animateOnScroll();
    });

    // Back to top button
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Mobile Menu Toggle with animation
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        menuToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('show');
                menuToggle.classList.remove('active');
            }
        });
    });

    // Smooth Scrolling for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;

            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        });
    });

    // Login Modal
    loginBtn.addEventListener('click', () => {
        openModal(loginModal);
    });

    closeBtn.addEventListener('click', () => {
        closeModal(loginModal);
    });

    window.addEventListener('click', (e) => {
        if (e.target == loginModal) {
            closeModal(loginModal);
        }
    });

    function openModal(modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.querySelector('.modal-content').style.transform = 'translateY(0)';
        }, 10);
    }

    function closeModal(modal) {
        modal.style.opacity = '0';
        modal.querySelector('.modal-content').style.transform = 'translateY(-50px)';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    // Form Validation with improved visual feedback
    function validateForm(form) {
        let isValid = true;
        form.querySelectorAll('input[required], textarea[required]').forEach(field => {
            if (!field.value.trim()) {
                showError(field, 'This field is required');
                isValid = false;
            } else if (field.type === 'email' && !validateEmail(field.value)) {
                showError(field, 'Please enter a valid email address');
                isValid = false;
            } else {
                clearError(field);
            }
        });
        return isValid;
    }

    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    function showError(field, message) {
        const errorElement = field.closest('.form-group').querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
        }
        field.classList.add('error');
        field.style.animation = 'shake 0.5s';
        field.style.borderColor = 'var(--accent-color)';

        setTimeout(() => {
            field.style.animation = '';
        }, 500);
    }

    function clearError(field) {
        const errorElement = field.closest('.form-group').querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
        }
        field.classList.remove('error');
        field.style.borderColor = '';
    }

    // Login Form Submission
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (validateForm(loginForm)) {
            const username = document.getElementById("username").value;
            const password = document.getElementById("password").value;

            // Show loading state
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;

            // Login function to authenticate and get JWT token
            try {
                const response = await fetch('/jwt/authenticate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Full API Response:", data);

                    // Check if JWTToken and role exist in the response
                    if (data.JWTToken && data.role) {
                        sessionStorage.setItem('jwtToken', data.JWTToken);
                        sessionStorage.setItem('role', data.role);
                        console.log('Stored JWT:', sessionStorage.getItem('jwtToken'));
                        console.log('Stored Role:', sessionStorage.getItem('role'));

                        // Show success message
                        showNotification('Login successful! Redirecting...', 'success');

                        // Role-based redirection
                        setTimeout(() => {
                            if (data.role === "[USER]") {
                                window.location.href = "../Student.html";
                            } else if (data.role === "[ADMIN]") {
                                window.location.href = "../Admin.html";
                            } else if (data.role === "[MANAGER]") {
                                window.location.href = "../Manager.html";
                            } else {
                                console.error('Unexpected role:', data.role);
                                showNotification('Error: Unexpected role', 'error');
                            }
                        }, 1500);
                    } else {
                        console.error("JWTToken or role is missing in response:", data);
                        showNotification('Authentication error: Missing token or role', 'error');
                    }
                } else {
                    // Display error message to user
                    showNotification('Invalid username or password. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Login error:', error);
                showNotification('Error connecting to server. Please try again later.', 'error');
            } finally {
                // Restore button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        } else {
            console.log('Form not validated.');
        }
    });

    // Contact Form Submission with enhanced feedback
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm(contactForm)) {
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                showNotification('Thank you for your message. We will get back to you soon!', 'success');
                contactForm.reset();
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }, 1500);
        }
    });

    // Notification system
    function showNotification(message, type = 'info') {
        // Remove any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Add icon based on type
        let icon = '';
        if (type === 'success') {
            icon = '<i class="fas fa-check-circle"></i>';
        } else if (type === 'error') {
            icon = '<i class="fas fa-exclamation-circle"></i>';
        } else if (type === 'warning') {
            icon = '<i class="fas fa-exclamation-triangle"></i>';
        } else {
            icon = '<i class="fas fa-info-circle"></i>';
        }

        notification.innerHTML = `
            <div class="notification-content">
                ${icon}
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;

        // Add styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '9999',
            padding: '15px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            maxWidth: '350px',
            animation: 'slideInRight 0.3s forwards',
            color: '#fff',
            fontSize: '0.95rem'
        });

        // Set background color based on type
        if (type === 'success') {
            notification.style.background = 'linear-gradient(to right, #10b981, #059669)';
        } else if (type === 'error') {
            notification.style.background = 'linear-gradient(to right, #ef4444, #dc2626)';
        } else if (type === 'warning') {
            notification.style.background = 'linear-gradient(to right, #f59e0b, #d97706)';
        } else {
            notification.style.background = 'linear-gradient(to right, #3b82f6, #2563eb)';
        }

        // Add to DOM
        document.body.appendChild(notification);

        // Add close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOutRight 0.3s forwards';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);

        // Add keyframes for animations if they don't exist
        if (!document.querySelector('#notification-keyframes')) {
            const style = document.createElement('style');
            style.id = 'notification-keyframes';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Dynamic News Feed with enhanced styling
    const newsFeed = document.getElementById('news-feed');
    const newsItems = [
        {
            title: 'Annual Science Fair',
            date: 'May 15, 2024',
            content: 'Join us for an exciting showcase of student projects and innovations.',
            icon: 'flask'
        },
        {
            title: 'Parent-Teacher Conference',
            date: 'June 1-2, 2024',
            content: 'Schedule your appointments to discuss your child\'s progress.',
            icon: 'users'
        },
        {
            title: 'Summer Sports Camp',
            date: 'July 10-24, 2024',
            content: 'Enroll now for our annual summer sports camp featuring various activities.',
            icon: 'futbol'
        }
    ];

    function createNewsItem(item, index) {
        const newsItem = document.createElement('div');
        newsItem.classList.add('news-item');
        newsItem.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 15px;">
                <div style="width: 50px; height: 50px; background: var(--gradient-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
                    <i class="fas fa-${item.icon}" style="color: white; font-size: 1.2rem;"></i>
                </div>
                <div>
                    <h3>${item.title}</h3>
                    <p class="date"><i class="fas fa-calendar-alt" style="margin-right: 5px;"></i>${item.date}</p>
                </div>
            </div>
            <p>${item.content}</p>
            <a href="#" class="btn" style="margin-top: 15px; padding: 8px 16px; font-size: 0.9rem;">Learn More</a>
        `;
        newsItem.style.opacity = '0';
        newsItem.style.transform = 'translateY(20px)';
        return newsItem;
    }

    newsItems.forEach((item, index) => {
        newsFeed.appendChild(createNewsItem(item, index));
    });

    // Random Quotes for Hero Section with typewriter effect
    const quotes = [
        "Empowering minds, shaping futures.",
        "Where learning knows no bounds.",
        "Nurturing tomorrow's leaders today.",
        "Excellence in education, every day.",
        "Inspiring curiosity, fostering growth.",
        "Building character, cultivating knowledge.",
        "Unlocking potential, one student at a time.",
        "Creating a brighter future through education."
    ];

    function typeWriter(text, i = 0) {
        if (i < text.length) {
            heroQuote.innerHTML += text.charAt(i);
            i++;
            setTimeout(() => typeWriter(text, i), 50);
        }
    }

    function changeQuote() {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        heroQuote.innerHTML = '';
        typeWriter(randomQuote);
    }

    changeQuote();
    setInterval(changeQuote, 10000);

    // Intersection Observer for animations
    function animateOnScroll() {
        const elements = document.querySelectorAll('.card, .news-item, .value-item, .contact-form, .contact-info');

        elements.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            const elementBottom = el.getBoundingClientRect().bottom;

            // Check if element is in viewport
            if (elementTop < window.innerHeight - 100 && elementBottom > 0) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            }
        });
    }

    // Initialize animations
    setTimeout(animateOnScroll, 500);

    // Carousel functionality with improved controls
    let currentIndex = 0;

    function showSlide(index) {
        // Update current index
        currentIndex = (index + carouselItems.length) % carouselItems.length;

        // Update carousel position
        const offset = -currentIndex * 100;
        carouselContainer.style.transform = `translateX(${offset}%)`;

        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === currentIndex);
        });
    }

    // Add event listeners to carousel buttons
    prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

    // Add event listeners to indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => showSlide(index));
    });

    // Auto-advance carousel
    let carouselInterval = setInterval(() => showSlide(currentIndex + 1), 5000);

    // Pause carousel on hover
    carousel.addEventListener('mouseenter', () => {
        clearInterval(carouselInterval);
    });

    carousel.addEventListener('mouseleave', () => {
        carouselInterval = setInterval(() => showSlide(currentIndex + 1), 5000);
    });

    // Touch support for carousel
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe left
            showSlide(currentIndex + 1);
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe right
            showSlide(currentIndex - 1);
        }
    }

    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input[type="email"]');

            if (emailInput.value.trim() && validateEmail(emailInput.value)) {
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                emailInput.value = '';
            } else {
                showNotification('Please enter a valid email address', 'error');
            }
        });
    }

    // Preload images for better performance
    function preloadImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const src = img.getAttribute('src');
            if (src) {
                const newImg = new Image();
                newImg.src = src;
            }
        });
    }

    // Call preload after a short delay
    setTimeout(preloadImages, 1000);

    // Add CSS animations for page load
    document.body.classList.add('loaded');

    // Disable animations for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition-normal', '0s');
        document.documentElement.style.setProperty('--transition-fast', '0s');
        document.documentElement.style.setProperty('--transition-slow', '0s');
    }
});