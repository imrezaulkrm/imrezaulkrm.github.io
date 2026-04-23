document.addEventListener('DOMContentLoaded', () => {

    // === DYNAMIC PROFILE IMAGE LOADER ===
    (function initProfileImageLoader() {
        const profileImage = document.getElementById('profile-image');
        if (!profileImage) return;
        const profileImages = [
            'https://github.com/imrezaulkrm/imrezaulkrm.github.io/raw/main/img/convocation.jpg',
        ];
        function shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }
        function loadImageWithTransition(imageUrl) {
            if (!imageUrl) return;
            const img = new Image();
            img.onload = () => {
                profileImage.style.animation = 'none';
                setTimeout(() => {
                    profileImage.src = imageUrl;
                    profileImage.style.animation = '';
                    profileImage.offsetHeight;
                    profileImage.style.animation = 'imageLoadFade 0.8s ease-out forwards';
                }, 100);
            };
            img.src = imageUrl;
        }
        const shuffled = shuffleArray(profileImages);
        if (shuffled[0]) loadImageWithTransition(shuffled[0]);
    })();

    // === LEFT SECTION NAV — appears after hero, highlights active section ===
    (function initSectionNav() {
        const sectionNav = document.getElementById('section-nav');
        const navItems = document.querySelectorAll('.section-nav-item');
        const sectionIds = ['about', 'experience', 'projects', 'skills', 'credentials', 'systems', 'passion', 'contact'];

        function updateActiveSection() {
            let currentSection = '';
            let minDist = Infinity;

            sectionIds.forEach(id => {
                const el = document.getElementById(id);
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const dist = Math.abs(rect.top - window.innerHeight * 0.3);
                if (rect.top < window.innerHeight * 0.6 && dist < minDist) {
                    minDist = dist;
                    currentSection = id;
                }
            });

            navItems.forEach(item => {
                item.classList.toggle('active', item.dataset.section === currentSection);
            });

            // Show nav only after hero
            const heroEl = document.getElementById('hero');
            if (heroEl) {
                const heroBottom = heroEl.getBoundingClientRect().bottom;
                if (heroBottom < window.innerHeight * 0.5) {
                    sectionNav.classList.add('visible');
                } else {
                    sectionNav.classList.remove('visible');
                }
            }
        }

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => { updateActiveSection(); ticking = false; });
                ticking = true;
            }
        });

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.getElementById(item.dataset.section);
                if (target) target.scrollIntoView({ behavior: 'smooth' });
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
            });
        });

        updateActiveSection();
    })();

    // === INFRA SVG VISUALIZATION ===
    const svg = document.getElementById('infra-svg');
    const logsContainer = document.getElementById('terminal-logs');
    const commandText = document.getElementById('current-command');

    if (svg) {
        const layers = { ENTRY: 60, ROUTING: 160, SERVICES: 270, PODS: 370 };
        const nodes = [
            { id: 'user', label: 'SOURCE TRAFFIC', x: 200, y: 40, type: 'pc' },
            { id: 'alb', label: 'AWS LOAD BALANCER', x: 200, y: 95, type: 'edge' },
            { id: 'ingress', label: 'INGRESS-HUB', x: 200, y: layers.ROUTING, type: 'ingress' },
            { id: 'svc_fe', label: 'FRONTEND-SVC', x: 100, y: layers.SERVICES, type: 'mesh' },
            { id: 'svc_be', label: 'BACKEND-SVC', x: 220, y: layers.SERVICES, type: 'mesh' },
            { id: 'pod_fe', x: 100, y: layers.PODS, type: 'pod', parent: 'svc_fe' },
            { id: 'pod_be', x: 220, y: layers.PODS, type: 'pod', parent: 'svc_be' },
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
            { from: 'pod_be', to: 'svc_db' },
            { from: 'svc_db', to: 'db' }
        ];

        function createNS(tag, attrs) {
            const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
            Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
            return el;
        }

        connections.forEach(conn => {
            const from = nodes.find(n => n.id === conn.from);
            const to = nodes.find(n => n.id === conn.to);
            const pathData = `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
            conn.reqPath = createNS('path', { d: pathData, stroke: 'var(--request-color)', 'stroke-width': '0.8', fill: 'none', opacity: 0.1, 'marker-end': 'url(#arrow-cyan)' });
            conn.respPath = createNS('path', { d: pathData, stroke: 'var(--response-color)', 'stroke-width': '0.8', fill: 'none', opacity: 0.1, 'marker-end': 'url(#arrow-green)' });
            svg.insertBefore(conn.reqPath, svg.firstChild);
            svg.insertBefore(conn.respPath, svg.firstChild);
        });

        nodes.forEach(node => {
            const group = createNS('g', { class: `node node-${node.type}` });
            if (node.type === 'pc') {
                group.appendChild(createNS('rect', { x: node.x - 8, y: node.y - 8, width: 16, height: 12, rx: 1, fill: 'var(--accent-color)', filter: 'url(#glow)' }));
                group.appendChild(createNS('rect', { x: node.x - 1, y: node.y + 4, width: 2, height: 2, fill: 'var(--accent-color)' }));
                group.appendChild(createNS('rect', { x: node.x - 4, y: node.y + 6, width: 8, height: 1.5, rx: 0.5, fill: 'var(--accent-color)' }));
            } else if (node.type === 'pod') {
                group.appendChild(createNS('rect', { x: node.x - 4, y: node.y - 4, width: 8, height: 8, fill: 'rgba(255,255,255,0.8)', filter: 'url(#glow)' }));
            } else {
                group.appendChild(createNS('circle', { cx: node.x, cy: node.y, r: 5, fill: 'var(--accent-color)', filter: 'url(#glow)' }));
            }
            if (node.label) {
                const label = createNS('text', { x: node.x, y: node.y + (node.y < 130 ? -18 : 22), 'text-anchor': 'middle', fill: 'var(--text-secondary)', 'font-size': '8px', 'font-family': 'var(--font-mono)' });
                label.textContent = node.label.toUpperCase();
                group.appendChild(label);
            }
            svg.appendChild(group);
        });

        function spawnRiver(pathEl, color, type) {
            const isResp = type === 'response';
            const density = 20;
            for (let i = 0; i < density; i++) {
                setTimeout(() => {
                    const particle = createNS('circle', { r: 1, fill: color, opacity: 0 });
                    svg.appendChild(particle);
                    const dur = isResp ? 1800 : 1200;
                    const anim = createNS('animateMotion', { path: pathEl.getAttribute('d'), dur: `${dur}ms`, repeatCount: 'indefinite', keyPoints: isResp ? '1;0' : '0;1', keyTimes: '0;1', calcMode: 'linear' });
                    const opAnim = createNS('animate', { attributeName: 'opacity', values: '0;1;1;0', dur: `${dur}ms`, repeatCount: 'indefinite' });
                    particle.appendChild(anim);
                    particle.appendChild(opAnim);
                    setTimeout(() => { if (particle.parentNode) particle.remove(); }, dur * 3);
                }, i * 200);
            }
        }

        connections.forEach(conn => {
            setInterval(() => spawnRiver(conn.reqPath, 'var(--request-color)', 'request'), 800 + Math.random() * 600);
            setInterval(() => spawnRiver(conn.respPath, 'var(--response-color)', 'response'), 1500 + Math.random() * 800);
        });
    }

    // === STREAMING LOGS ===
    if (logsContainer) {
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
    }

    // === SCROLL REVEAL OBSERVER ===
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));

    // === TIMELINE SCROLL ANIMATION ===
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineSpine = document.querySelector('.timeline-spine');
    const timelineProgress = document.getElementById('timeline-progress');
    const timelineItems = document.querySelectorAll('.timeline-item');

    function updateTimeline() {
        if (!timelineContainer || !timelineProgress) return;
        const containerRect = timelineContainer.getBoundingClientRect();
        if (timelineSpine) timelineSpine.style.height = '100%';
        let containerTip = Math.max(0, Math.min(containerRect.height, window.innerHeight / 2 - containerRect.top));
        const progress = containerTip / containerRect.height;
        timelineProgress.style.transform = `scaleY(${progress})`;
        timelineItems.forEach(item => {
            const nodeCenter = item.offsetTop + 30;
            item.classList.toggle('active', nodeCenter <= containerTip);
        });
    }
    window.addEventListener('scroll', () => requestAnimationFrame(updateTimeline));
    updateTimeline();

    // === MILESTONE TOGGLES ===
    (function initMilestoneToggles() {
        document.querySelectorAll('.milestone').forEach(milestone => {
            const toggle = milestone.querySelector('.milestone-toggle');
            const details = milestone.querySelector('.milestone-details');
            if (toggle && details) {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    const expanded = toggle.getAttribute('aria-expanded') === 'true';
                    toggle.setAttribute('aria-expanded', !expanded);
                    expanded ? details.setAttribute('hidden', '') : details.removeAttribute('hidden');
                });
                toggle.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle.click(); } });
            }
        });
    })();

    // === CREDENTIAL VAULT ===
    (function initCredentialVault() {
        document.querySelectorAll('.credential-entry').forEach(entry => {
            entry.setAttribute('role', 'article');
            entry.setAttribute('tabindex', '0');
        });
        document.querySelectorAll('.credential-expand').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                button.style.transform = 'scale(1.1)';
                setTimeout(() => { button.style.transform = 'scale(1)'; }, 100);
            });
            button.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); button.click(); } });
        });
        const credObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'milestone-fade-in 0.5s ease-out forwards';
                    credObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.credential-entry').forEach((entry, i) => {
            entry.style.opacity = '0';
            entry.style.animationDelay = `${i * 0.08}s`;
            credObserver.observe(entry);
        });
    })();

    // === PHOTO GALLERY ===
    (function initPhotoGallery() {
        const gallery = document.getElementById('photo-wall');
        if (!gallery) return;

        // Photo manifest — loads from assets/photos folder
        // Each entry: { src, aspect: 'landscape'|'portrait'|'square' }
        // In production, scan folder server-side; here we use Unsplash placeholders
        // and determine their aspect ratios to assign correct CSS frames.
        const photos = [
            { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop', aspect: 'landscape' },
            { src: 'https://images.unsplash.com/photo-1433086720384-a1e5c6f62eae?w=600&h=900&fit=crop', aspect: 'portrait' },
            { src: 'https://images.unsplash.com/photo-1501616666990-6ec4ee3f28d0?w=500&h=500&fit=crop', aspect: 'square' },
            { src: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=500&fit=crop', aspect: 'landscape' },
            { src: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600&h=900&fit=crop', aspect: 'portrait' },
            { src: 'https://images.unsplash.com/photo-1431890713044-d71e360a8a0a?w=500&h=500&fit=crop', aspect: 'square' },
            { src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=500&fit=crop', aspect: 'landscape' },
            { src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=900&fit=crop', aspect: 'portrait' },
            { src: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=500&fit=crop', aspect: 'square' },
            { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop', aspect: 'landscape' },
            { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=900&fit=crop', aspect: 'portrait' },
            { src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&h=500&fit=crop', aspect: 'square' },
        ];

        // Fisher-Yates shuffle
        function shuffle(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        // To load from local folder: replace photos[] with dynamic list
        // e.g., via fetch('/api/photos') or a pre-generated manifest.js
        // Images will auto-detect aspect and fit correct frame via object-fit

        let currentBatch = [];
        const BATCH_SIZE = 12;

        function renderGallery(photoList) {
            gallery.innerHTML = '';
            photoList.forEach((photo, index) => {
                const item = document.createElement('div');
                item.className = 'photo-item';
                item.setAttribute('data-aspect', photo.aspect);

                const img = document.createElement('img');
                img.src = photo.src;
                img.alt = `Photography ${index + 1}`;
                img.loading = 'lazy';
                // Ensure landscape images fill landscape frames, portrait fills portrait frames
                img.style.objectPosition = 'center center';

                item.appendChild(img);
                gallery.appendChild(item);
            });
        }

        function loadNextBatch() {
            // Pick a fresh unique set of photos, cycling through all
            const shuffled = shuffle(photos);
            currentBatch = shuffled.slice(0, BATCH_SIZE);
            renderGallery(currentBatch);
        }

        // Initial load
        loadNextBatch();

        // Rotate every 8 seconds — picks a fresh shuffle so each visible set has unique pics
        // and ensures no photo repeats within the same 12-slot display
        setInterval(() => {
            loadNextBatch();
        }, 8000);

        // To load from local folder (assets/photos/):
        // Replace the photos[] array above with dynamically loaded paths.
        // Example:
        //   fetch('/assets/photos/manifest.json')
        //     .then(r => r.json())
        //     .then(list => { photos = list; loadNextBatch(); });
    })();

    // === CONTACT FORM ===
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
            if (!formData.name || !formData.email || !formData.message) {
                formStatus.textContent = 'Please fill in all fields';
                formStatus.className = 'form-status error';
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                formStatus.textContent = 'Please enter a valid email';
                formStatus.className = 'form-status error';
                return;
            }
            const submitBtn = contactForm.querySelector('.form-submit');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                formStatus.textContent = "Message sent! I'll get back to you soon.";
                formStatus.className = 'form-status success';
                contactForm.reset();
                setTimeout(() => { formStatus.textContent = ''; formStatus.className = 'form-status'; }, 5000);
            } catch {
                formStatus.textContent = 'Error sending message. Please try again.';
                formStatus.className = 'form-status error';
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });

        contactForm.querySelectorAll('.form-input, .form-textarea').forEach(input => {
            input.addEventListener('blur', () => { if (input.value.trim()) input.style.borderColor = 'rgba(0,212,255,0.5)'; });
            input.addEventListener('focus', () => { input.style.borderColor = ''; });
        });
    })();

    // === SCROLL-TO-TOP FAB (inside contact section) ===
    (function initScrollFab() {
        const fab = document.getElementById('scroll-to-top-fab');
        if (!fab) return;

        const contactSection = document.getElementById('contact');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                fab.classList.toggle('visible', entry.isIntersecting);
            });
        }, { threshold: 0.1 });

        if (contactSection) observer.observe(contactSection);

        fab.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    })();

    // === SCROLL DOWN indicator hide on scroll ===
    (function initScrollDown() {
        const indicator = document.getElementById('scroll-down');
        if (!indicator) return;
        let hidden = false;
        window.addEventListener('scroll', () => {
            if (window.scrollY > 80 && !hidden) {
                indicator.style.opacity = '0';
                indicator.style.pointerEvents = 'none';
                hidden = true;
            } else if (window.scrollY <= 80 && hidden) {
                indicator.style.opacity = '';
                indicator.style.pointerEvents = '';
                hidden = false;
            }
        }, { passive: true });
    })();

});
