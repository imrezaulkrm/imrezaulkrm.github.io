document.addEventListener('DOMContentLoaded', () => {
    // --- DYNAMIC PROFILE IMAGE LOADER ---
    (function initProfileImageLoader() {
        const profileImage = document.getElementById('profile-image');
        if (!profileImage) return;

        // Predefined profile images - will be automatically discovered from assets/profile folder
        // For production, implement server-side folder scanning via API endpoint
        // For now, using placeholder fallback structure
        const profileImages = [
            'https://github.com/imrezaulkrm/imrezaulkrm.github.io/raw/main/img/convocation.jpg',
            // Add more images here from assets/profile folder
            // 'assets/profile/photo-1.jpg',
            // 'assets/profile/photo-2.jpg',
            // etc.
        ];

        // Fisher-Yates Shuffle Algorithm
        function shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        // Get random image from shuffle
        function getRandomImage() {
            if (profileImages.length === 0) return null;
            const shuffled = shuffleArray(profileImages);
            return shuffled[0];
        }

        // Load image with fade transition
        function loadImageWithTransition(imageUrl) {
            if (!imageUrl) return;

            const img = new Image();
            img.onload = () => {
                // Fade out current image
                profileImage.style.animation = 'none';
                setTimeout(() => {
                    profileImage.src = imageUrl;
                    // Trigger fade in animation
                    profileImage.style.animation = '';
                    profileImage.offsetHeight; // Trigger reflow
                    profileImage.style.animation = 'imageLoadFade 0.8s ease-out forwards';
                }, 100);
            };
            img.src = imageUrl;
        }

        // Initialize with random image
        const initialImage = getRandomImage();
        if (initialImage) {
            loadImageWithTransition(initialImage);
        }

        // Optional: Change image periodically (disabled by default - uncomment to enable)
        /*
        const imageChangeInterval = 15000; // Change every 15 seconds
        setInterval(() => {
            const nextImage = getRandomImage();
            if (nextImage) {
                loadImageWithTransition(nextImage);
            }
        }, imageChangeInterval);
        */
    })();

    // --- SECTION NAVIGATION OVERLAY ---
    (function initSectionNav() {
        const sectionNav = document.getElementById('section-nav');
        const navItems = document.querySelectorAll('.section-nav-item');
        const sections = ['hero', 'about', 'experience', 'projects', 'skills', 'systems', 'credentials', 'passion', 'contact'];

        // Track scroll position for active section detection
        function updateActiveSection() {
            let currentSection = 'hero';
            let maxScroll = 0;

            // Find which section is currently in view
            sections.forEach(sectionId => {
                const section = document.getElementById(sectionId);
                if (section) {
                    const rect = section.getBoundingClientRect();
                    // Section is in view if its top is above viewport center
                    if (rect.top < window.innerHeight * 0.5 && rect.top > -rect.height) {
                        currentSection = sectionId;
                    }
                }
            });

            // Update active nav item
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.dataset.section === currentSection) {
                    item.classList.add('active');
                }
            });

            // Update visibility: show nav when scrolled past hero (with smooth fade)
            const heroSection = document.getElementById('hero');
            if (heroSection) {
                const heroRect = heroSection.getBoundingClientRect();
                // Start fading in at 80% of hero height
                const fadeStart = heroSection.offsetHeight * 0.8;
                const scrollProgress = Math.max(0, window.scrollY - fadeStart) / 200; // Fade over 200px
                const targetOpacity = Math.min(1, scrollProgress);

                if (targetOpacity > 0.05) {
                    sectionNav.classList.add('visible');
                    sectionNav.classList.remove('hero-hidden');
                } else {
                    sectionNav.classList.remove('visible');
                    sectionNav.classList.add('hero-hidden');
                }
            }
        }

        // Scroll event listener with throttling
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                updateActiveSection();
            }, 10);
        });

        // Click navigation with smooth scroll
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.dataset.section;
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    const targetPosition = targetSection.offsetTop;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update active immediately for better UX
                    navItems.forEach(navItem => navItem.classList.remove('active'));
                    item.classList.add('active');
                }
            });
        });

        // Initialize on page load
        updateActiveSection();
    })();

    const svg = document.getElementById('infra-svg');
    const logsContainer = document.getElementById('terminal-logs');
    const commandText = document.getElementById('current-command');

    const layers = {
        ENTRY: 60,
        ROUTING: 160,
        SERVICES: 270,
        PODS: 370
    };

    const nodes = [
        { id: 'user', label: 'SOURCE TRAFFIC', x: 200, y: 40, type: 'pc' },
        { id: 'alb', label: 'AWS LOAD BALANCER', x: 200, y: 95, type: 'edge' },
        { id: 'ingress', label: 'INGRESS-HUB', x: 200, y: layers.ROUTING, type: 'ingress' },

        // Horizontal Service Split
        { id: 'svc_fe', label: 'FRONTEND-SVC', x: 100, y: layers.SERVICES, type: 'mesh' },
        { id: 'svc_be', label: 'BACKEND-SVC', x: 220, y: layers.SERVICES, type: 'mesh' },

        // Pod Execution
        { id: 'pod_fe', x: 100, y: layers.PODS, type: 'pod', parent: 'svc_fe' },
        { id: 'pod_be', x: 220, y: layers.PODS, type: 'pod', parent: 'svc_be' },

        // Side-car Database Branch (Horizontal shift)
        { id: 'svc_db', label: 'DATABASE-SVC', x: 340, y: layers.PODS, type: 'mesh' },
        { id: 'db', label: 'POSTGRES-HA', x: 340, y: layers.PODS + 60, type: 'pod' }
    ];

    const connections = [
        { from: 'user', to: 'alb' },
        { from: 'alb', to: 'ingress' },
        { from: 'ingress', to: 'svc_fe' },
        { from: 'ingress', to: 'svc_be' },
        { from: 'svc_fe', to: 'pod_fe' },
        { from: 'svc_be', to: 'pod_be' },
        { from: 'pod_be', to: 'svc_db' }, // Side connection
        { from: 'svc_db', to: 'db' }
    ];

    function createNS(tag, attrs) {
        const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        return el;
    }

    // Straight Connection Paths
    connections.forEach(conn => {
        const from = nodes.find(n => n.id === conn.from);
        const to = nodes.find(n => n.id === conn.to);
        const pathData = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

        conn.reqPath = createNS('path', {
            d: pathData, stroke: 'var(--request-color)', 'stroke-width': '0.8',
            fill: 'none', opacity: 0.1, 'marker-end': 'url(#arrow-cyan)'
        });

        conn.respPath = createNS('path', {
            d: pathData, stroke: 'var(--response-color)', 'stroke-width': '0.8',
            fill: 'none', opacity: 0.1, 'marker-end': 'url(#arrow-green)'
        });

        svg.insertBefore(conn.reqPath, svg.firstChild);
        svg.insertBefore(conn.respPath, svg.firstChild);
    });

    // Node Rendering
    nodes.forEach(node => {
        const group = createNS('g', { class: `node node-${node.type}` });

        if (node.type === 'pc') {
            const screen = createNS('rect', { x: node.x - 8, y: node.y - 8, width: 16, height: 12, rx: 1, fill: 'var(--accent-color)', filter: 'url(#glow)' });
            const stand = createNS('rect', { x: node.x - 1, y: node.y + 4, width: 2, height: 2, fill: 'var(--accent-color)' });
            const base = createNS('rect', { x: node.x - 4, y: node.y + 6, width: 8, height: 1.5, rx: 0.5, fill: 'var(--accent-color)' });
            group.appendChild(screen); group.appendChild(stand); group.appendChild(base);
        } else if (node.type === 'pod') {
            const square = createNS('rect', { x: node.x - 4, y: node.y - 4, width: 8, height: 8, fill: 'rgba(255,255,255,0.8)', filter: 'url(#glow)' });
            group.appendChild(square);
        } else {
            const circle = createNS('circle', { cx: node.x, cy: node.y, r: 5, fill: 'var(--accent-color)', filter: 'url(#glow)' });
            group.appendChild(circle);
        }

        if (node.label) {
            const label = createNS('text', {
                x: node.x, y: node.y + (node.y < 130 ? -18 : 22),
                'text-anchor': 'middle', fill: 'var(--text-secondary)', 'font-size': '8px', 'font-family': 'var(--font-mono)'
            });
            label.textContent = node.label.toUpperCase();
            group.appendChild(label);
        }
        svg.appendChild(group);
    });

    // High-Density Traffic Logic
    function spawnRiver(pathEl, color, type) {
        const isResp = type === 'response';
        const density = 20; // HIGH LOAD VOLUME
        for (let i = 0; i < density; i++) {
            setTimeout(() => {
                const particle = createNS('circle', { r: 1, fill: color, opacity: 0 });
                svg.appendChild(particle);

                const dur = isResp ? 1800 : 1200;
                const anim = createNS('animateMotion', {
                    path: pathEl.getAttribute('d'), dur: `${dur}ms`, repeatCount: 'indefinite',
                    keyPoints: isResp ? '1;0' : '0;1', keyTimes: '0;1', calcMode: 'linear'
                });
                const opacity = createNS('animate', { attributeName: 'opacity', values: '0;1;1;0', dur: `${dur}ms`, repeatCount: 'indefinite' });

                particle.appendChild(anim);
                particle.appendChild(opacity);

                // Garbage Collection: Remove from DOM after a few cycles
                setTimeout(() => {
                    if (particle.parentNode) particle.remove();
                }, dur * 3);
            }, i * 200);
        }
    }

    connections.forEach(conn => {
        // High-frequency intervals for massive traffic feel
        setInterval(() => spawnRiver(conn.reqPath, 'var(--request-color)', 'request'), 800 + Math.random() * 600);
        setInterval(() => spawnRiver(conn.respPath, 'var(--response-color)', 'response'), 1500 + Math.random() * 800);
    });

    // Streaming Logs
    const logData = [
        { cat: 'REQUEST', text: 'ALB routing traffic to Ingress', class: 'tag-request' },
        { cat: 'PROCESS', text: 'Backend node processing API request', class: 'tag-process' },
        { cat: 'DB_OP', text: 'Writing session data to Postgres HA', class: 'tag-db' },
        { cat: 'SUCCESS', text: 'Transaction complete: HTTP 200', class: 'tag-success' }
    ];

    function streamLog() {
        const item = logData[Math.floor(Math.random() * logData.length)];
        const line = document.createElement('div');
        line.className = 'log-line';
        line.innerHTML = `<span style="opacity:0.3">[${new Date().toLocaleTimeString('en-GB')}]</span> <span class="log-tag ${item.class}">${item.cat}</span> <span>${item.text}</span>`;
        logsContainer.appendChild(line);
        if (logsContainer.childNodes.length > 8) logsContainer.removeChild(logsContainer.firstChild);
        logsContainer.scrollTop = logsContainer.scrollHeight;
        setTimeout(streamLog, 600 + Math.random() * 600);
    }
    streamLog();

    // 6. Scroll Reveal Observer
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Apply reveal classes and observe
    const aboutHeader = document.querySelector('.about-header');
    const aboutContent = document.querySelector('.about-content');
    const capabilities = document.querySelector('.capabilities-grid');
    const techStack = document.querySelector('.tech-stack-inline');
    const profile = document.querySelector('.profile-frame');
    const expHeader = document.querySelector('.experience-header');
    const projHeader = document.querySelector('#projects .experience-header');
    const projectCards = document.querySelectorAll('.project-card-immersive');
    const skillsHeader = document.querySelector('#skills .experience-header');
    const capabilityCards = document.querySelectorAll('.capability-card');

    [aboutHeader, aboutContent, capabilities, techStack, profile, expHeader, projHeader, ...projectCards, skillsHeader, ...capabilityCards].forEach(el => {
        if (el) {
            el.classList.add('reveal-in');
            revealObserver.observe(el);
        }
    });

    // 7. Timeline Scroll Animation
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineSpine = document.querySelector('.timeline-spine'); // The dim background line
    const timelineProgress = document.getElementById('timeline-progress');
    const timelineItems = document.querySelectorAll('.timeline-item');

    function updateTimeline() {
        if (!timelineContainer || !timelineProgress) return;

        const containerRect = timelineContainer.getBoundingClientRect();
        const viewportCenter = window.innerHeight / 2;

        // Find the last item to determine completion state
        const lastItem = timelineItems.length > 0 ? timelineItems[timelineItems.length - 1] : null;

        // Reset spine to full container height for a "complete journey" feel
        if (timelineSpine) {
            timelineSpine.style.height = `100%`;
        }

        // Calculate the "tip" position relative to the container top
        let containerTip = viewportCenter - containerRect.top;

        // Progress continues to the bottom of the container
        containerTip = Math.max(0, Math.min(containerRect.height, containerTip));

        // Update line growth
        const progress = containerTip / containerRect.height;
        timelineProgress.style.transform = `scaleY(${progress})`;

        // Activate items as the line tip hits their nodes
        timelineItems.forEach(item => {
            const nodeCenter = item.offsetTop + 30;
            // Exact touch logic: item.offsetTop + 30 is the node center relative to container
            if (nodeCenter <= containerTip) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(updateTimeline);
    });
    // Initial check
    updateTimeline();

    // --- Skills Card Interactions ---
    (function initSkillCards() {
        const skillCards = document.querySelectorAll('.skill-card');

        // Simple hover and keyboard interaction
        skillCards.forEach(card => {
            card.addEventListener('mouseenter', function () {
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });
        });

        // Make cards keyboard accessible
        skillCards.forEach(card => {
            card.setAttribute('role', 'article');
            card.setAttribute('tabindex', '0');
        });
    })();

    // --- LEARNING TIMELINE MILESTONE TOGGLES ---
    (function initMilestoneToggles() {
        const milestones = document.querySelectorAll('.milestone');

        milestones.forEach(milestone => {
            const toggle = milestone.querySelector('.milestone-toggle');
            const details = milestone.querySelector('.milestone-details');

            if (toggle && details) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';

                    toggle.setAttribute('aria-expanded', !isExpanded);

                    if (isExpanded) {
                        details.setAttribute('hidden', '');
                    } else {
                        details.removeAttribute('hidden');
                    }
                });

                // Make it keyboard accessible
                toggle.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle.click();
                    }
                });
            }
        });
    })();

    // --- CREDENTIAL VAULT SYSTEM ---
    (function initCredentialVault() {
        const credentialEntries = document.querySelectorAll('.credential-entry');
        const credentialExpandButtons = document.querySelectorAll('.credential-expand');

        // Add hover state for vault entries
        credentialEntries.forEach(entry => {
            entry.addEventListener('mouseenter', function () {
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            });

            // Make accessible with keyboard
            entry.setAttribute('role', 'article');
            entry.setAttribute('tabindex', '0');
        });

        // Expand button functionality (future enhancement for detail panels)
        credentialExpandButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const entry = button.closest('.credential-entry');
                const credentialId = entry?.getAttribute('data-credential');

                // Visual feedback
                button.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 100);

                // Could trigger detail panel here
                console.log('Viewing details for:', credentialId);
            });

            // Keyboard accessible
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    button.click();
                }
            });
        });

        // Vault timeline-style scroll reveal for entries
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'timeline-fade-in 0.6s ease-out forwards';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        credentialEntries.forEach((entry, index) => {
            entry.style.animationDelay = `${index * 0.1}s`;
            observer.observe(entry);
        });
    })();

    // --- PHOTO WALL SYSTEM ---
    (function initPhotoWall() {
        const photoWallContainer = document.getElementById('photo-wall');
        if (!photoWallContainer) return;

        // Sample photos array - in production, these would be loaded from a folder
        // For now, we're using placeholder images from a service
        const photoUrls = [
            'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1433086720384-a1e5c6f62eae?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1501616666990-6ec4ee3f28d0?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1431890713044-d71e360a8a0a?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=400&fit=crop',
            'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=400&h=400&fit=crop',
        ];

        // Fisher-Yates Shuffle Algorithm
        function shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }

        // Load and shuffle photos
        function initializePhotoWall() {
            photoWallContainer.innerHTML = '';

            // Shuffle photos for random display
            const shuffledPhotos = shuffleArray(photoUrls);

            // Create image elements
            shuffledPhotos.forEach((photoUrl, index) => {
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-wall-item';

                const img = document.createElement('img');
                img.src = photoUrl;
                img.alt = `Photography ${index + 1}`;
                img.loading = 'lazy';

                photoItem.appendChild(img);
                photoWallContainer.appendChild(photoItem);
            });
        }

        // Initialize on page load
        initializePhotoWall();

        // Re-shuffle on each scroll to top (optional: create new arrangement)
        window.addEventListener('beforeunload', () => {
            // This could trigger a re-shuffle if user navigates away
        });
    })();

    // --- CONTACT FORM HANDLING ---
    (function initContactForm() {
        const contactForm = document.getElementById('contact-form');
        const formStatus = document.getElementById('form-status');

        if (!contactForm) return;

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                name: document.getElementById('form-name').value,
                email: document.getElementById('form-email').value,
                message: document.getElementById('form-message').value,
            };

            // Validate form
            if (!formData.name || !formData.email || !formData.message) {
                formStatus.textContent = 'Please fill in all fields';
                formStatus.className = 'form-status error';
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                formStatus.textContent = 'Please enter a valid email';
                formStatus.className = 'form-status error';
                return;
            }

            // Show loading state
            const submitBtn = contactForm.querySelector('.form-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            try {
                // In production, send to backend/email service
                // For now, we'll simulate success
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Success message
                formStatus.textContent = 'Message sent! I\'ll get back to you soon.';
                formStatus.className = 'form-status success';

                // Reset form
                contactForm.reset();

                // Hide status after 5 seconds
                setTimeout(() => {
                    formStatus.textContent = '';
                    formStatus.className = 'form-status';
                }, 5000);

            } catch (error) {
                formStatus.textContent = 'Error sending message. Please try again.';
                formStatus.className = 'form-status error';
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        // Optional: Add client-side validation feedback
        const inputs = contactForm.querySelectorAll('.form-input, .form-textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value.trim()) {
                    input.style.borderColor = 'rgba(0, 212, 255, 0.5)';
                }
            });

            input.addEventListener('focus', () => {
                input.style.borderColor = '';
            });
        });
    })();

    // --- BACK TO TOP BUTTON FUNCTIONALITY ---
    (function initBackToTop() {
        const backToTopBtn = document.getElementById('back-to-top');

        if (!backToTopBtn) return;

        // Show/hide button on scroll
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        // Smooth scroll to top on click
        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Optional: keyboard support
        backToTopBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                backToTopBtn.click();
            }
        });
    })();
});
