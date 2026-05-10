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

    // === MOBILE NAVIGATION LOGIC ===
    (function initMobileNav() {
        const toggle = document.getElementById('mobile-nav-toggle');
        const menu = document.getElementById('mobile-menu');
        const links = document.querySelectorAll('.mobile-nav-link');

        if (!toggle || !menu) return;

        function toggleMenu() {
            toggle.classList.toggle('open');
            menu.classList.toggle('open');
            document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
        }

        toggle.addEventListener('click', toggleMenu);
        toggle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            toggleMenu();
        });

        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);

                toggleMenu();

                if (target) {
                    setTimeout(() => {
                        const offset = 60; // scroll-margin-top
                        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }, 400); // Wait for menu close animation
                }
            });
        });
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

    // === ENHANCED PHOTO GALLERY — Frame-persistent, Folder-discovery, Lightbox ===
    (function initPhotoGallery() {
        const gallery = document.getElementById('photo-wall');
        if (!gallery) return;

        // ---- CONFIG ----
        const PHOTO_FOLDER = 'photos';          // folder name inside your repo root
        const PHOTO_PREFIX = 'photo-';          // file naming: photo-1.jpg, photo-2.png ...
        const MAX_PHOTO_INDEX = 50;             // scan up to this number
        const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
        const SWAP_INTERVAL = 8000;             // ms between photo swaps
        const LONG_PRESS_DURATION = 5000;       // ms for mobile long-press
        const CROSSFADE_DURATION = 700;         // ms for image crossfade
        const FRAME_COUNT = 12;

        // ---- STATE ----
        let discoveredPhotos = [];              // { src, name } — populated by scanner
        let currentPhotos = [];                 // currently displayed in frames
        let frames = [];                        // DOM frame elements
        let lightboxCurrentIndex = -1;
        let isSwapping = false;
        let scanComplete = false;

        // ---- BUILD LIGHTBOX DOM ----
        const lightboxShutter = document.createElement('div');
        lightboxShutter.className = 'lightbox-shutter';
        document.body.appendChild(lightboxShutter);

        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox-overlay';
        lightbox.setAttribute('role', 'dialog');
        lightbox.setAttribute('aria-label', 'Photo viewer');
        lightbox.innerHTML = `
        <div class="lightbox-outer-frame">
            <div class="lightbox-corner tl"></div>
            <div class="lightbox-corner tr"></div>
            <div class="lightbox-corner bl"></div>
            <div class="lightbox-corner br"></div>
            <button class="lightbox-close-btn" aria-label="Close photo viewer">&#10005;</button>
            <button class="lightbox-nav-btn lightbox-nav-prev" aria-label="Previous photo">&#8249;</button>
            <div class="lightbox-inner-mat">
                <img src="" alt="Photo" class="lightbox-image">
            </div>
            <button class="lightbox-nav-btn lightbox-nav-next" aria-label="Next photo">&#8250;</button>
            <div class="lightbox-bottom-bar">
                <span class="lightbox-counter"></span>
                <span class="lightbox-hint">ESC to close &bull; Arrow keys to navigate</span>
            </div>
        </div>
    `;
        document.body.appendChild(lightbox);

        const lbImage = lightbox.querySelector('.lightbox-image');
        const lbCounter = lightbox.querySelector('.lightbox-counter');
        const lbClose = lightbox.querySelector('.lightbox-close-btn');
        const lbPrev = lightbox.querySelector('.lightbox-nav-prev');
        const lbNext = lightbox.querySelector('.lightbox-nav-next');

        // ---- BUILD STATUS BAR ----
        const statusBar = document.createElement('div');
        statusBar.className = 'gallery-status-bar';
        statusBar.innerHTML = `
        <div class="gallery-status-left">
            <span class="gallery-status-dot"></span>
            <span class="gallery-status-text" id="gallery-status-text">Scanning photo library...</span>
        </div>
        <span class="gallery-status-right" id="gallery-photo-count">0 photos found</span>
    `;
        gallery.parentElement.insertBefore(statusBar, gallery);

        const statusText = document.getElementById('gallery-status-text');
        const photoCount = document.getElementById('gallery-photo-count');

        // ---- PHOTO DISCOVERY — scans folder for existing images ----
        function checkImageExists(url) {
            return new Promise(resolve => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = url;
            });
        }

        async function discoverPhotos() {
            const found = [];
            // Scan in parallel batches of 5
            for (let i = 1; i <= MAX_PHOTO_INDEX; i++) {
                const batch = PHOTO_EXTENSIONS.map(ext => `${PHOTO_FOLDER}/${PHOTO_PREFIX}${i}.${ext}`);
                let foundForIndex = false;

                for (const url of batch) {
                    const exists = await checkImageExists(url);
                    if (exists) {
                        found.push({ src: url, name: `Photo ${i}` });
                        foundForIndex = true;
                        photoCount.textContent = `${found.length} photo${found.length > 1 ? 's' : ''} found`;
                        break;
                    }
                }

                // Update status every 5 scans
                if (i % 5 === 0) {
                    statusText.textContent = `Scanning... (${i}/${MAX_PHOTO_INDEX})`;
                }

                // Early stop if 5 consecutive misses after finding at least one
                if (found.length > 0 && i > found.length + 5 && !foundForIndex) {
                    break;
                }
            }

            return found;
        }

        // ---- FALLBACK PHOTOS (Unsplash) — used if folder is empty ----
        const fallbackPhotos = [
            { src: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600&h=900&fit=crop', name: 'Mountain Peak' },
            { src: 'https://images.unsplash.com/photo-1431890713044-d71e360a8a0a?w=500&h=500&fit=crop', name: 'Reflections' },
            { src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=500&fit=crop', name: 'Golden Fields' },
            { src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=900&fit=crop', name: 'City Lights' },
            { src: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=500&fit=crop', name: 'Patterns' },
            { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop', name: 'Cloud Formation' },
            { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=900&fit=crop', name: 'Forest Path' },
            { src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&h=500&fit=crop', name: 'Silhouette' },
            { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=500&fit=crop', name: 'Starry Night' },
            { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop', name: 'Foggy Forest' },
            { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop', name: 'Sunlight Trees' },
            { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop', name: 'Beach Sunset' },
        ];

        // ---- SHUFFLE ----
        function shuffle(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        // ---- PICK RANDOM UNIQUE (no repeats with current set) ----
        function pickRandomSet(pool, count, exclude = []) {
            const available = pool.filter(p => !exclude.some(e => e.src === p.src));
            if (available.length < count) {
                // Not enough unique, allow repeats
                return shuffle(pool).slice(0, count);
            }
            return shuffle(available).slice(0, count);
        }

        // ---- BUILD FRAMES (once, never rebuilt) ----
        function buildFrames() {
            gallery.innerHTML = '';

            for (let i = 0; i < FRAME_COUNT; i++) {
                const frame = document.createElement('div');
                frame.className = 'photo-frame';
                frame.setAttribute('data-frame-index', i);

                // Skeleton loader
                const skeleton = document.createElement('div');
                skeleton.className = 'photo-skeleton';
                frame.appendChild(skeleton);

                // Image wrapper
                const imgWrap = document.createElement('div');
                imgWrap.className = 'photo-img-wrap';
                frame.appendChild(imgWrap);

                // Swap flash overlay
                const flash = document.createElement('div');
                flash.className = 'swap-flash';
                frame.appendChild(flash);

                // Info overlay
                const info = document.createElement('div');
                info.className = 'photo-info-hover';
                info.innerHTML = `<p class="info-title"></p><span class="info-meta"></span>`;
                frame.appendChild(info);

                // Long press ring (mobile)
                const ring = document.createElement('div');
                ring.className = 'long-press-ring';
                ring.innerHTML = `
                <svg viewBox="0 0 60 60">
                    <circle class="ring-bg" cx="30" cy="30" r="26"/>
                    <circle class="ring-progress" cx="30" cy="30" r="26"/>
                </svg>
                <span class="ring-icon">☐</span>
            `;
                frame.appendChild(ring);

                // Events
                setupFrameEvents(frame, i);

                gallery.appendChild(frame);
                frames.push(frame);
            }
        }

        // ---- SETUP FRAME EVENTS (click, hover, long-press) ----
        function setupFrameEvents(frame, index) {
            let longPressTimer = null;
            let longPressStart = 0;
            let longPressRAF = null;
            const ring = frame.querySelector('.long-press-ring');
            const ringProgress = ring.querySelector('.ring-progress');
            const circumference = 2 * Math.PI * 26; // r=26
            let isLongPressing = false;

            // Click -> lightbox
            frame.addEventListener('click', (e) => {
                if (isLongPressing) return;
                if (currentPhotos[index]) {
                    openLightbox(index);
                }
            });

            // 3D Tilt on desktop hover
            frame.addEventListener('mousemove', (e) => {
                if (window.innerWidth < 768) return;
                const rect = frame.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const cx = rect.width / 2;
                const cy = rect.height / 2;
                const rx = ((y - cy) / cy) * 4;
                const ry = ((cx - x) / cx) * 4;

                frame.classList.add('tilt-active');
                frame.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
            });

            frame.addEventListener('mouseleave', () => {
                frame.classList.remove('tilt-active');
                frame.style.transform = '';
            });

            // Long press — mobile only
            frame.addEventListener('touchstart', (e) => {
                if (window.innerWidth >= 768) return;
                isLongPressing = false;
                longPressStart = Date.now();
                ring.classList.add('ring-visible');
                ringProgress.style.strokeDashoffset = circumference;

                const animateRing = () => {
                    const elapsed = Date.now() - longPressStart;
                    const progress = Math.min(elapsed / LONG_PRESS_DURATION, 1);
                    ringProgress.style.strokeDashoffset = circumference * (1 - progress);

                    // Update icon
                    const ringIcon = ring.querySelector('.ring-icon');
                    if (progress > 0.3) {
                        ringIcon.textContent = progress > 0.7 ? '📈' : '⛓';
                    }

                    if (progress < 1) {
                        longPressRAF = requestAnimationFrame(animateRing);
                    } else {
                        // Long press complete!
                        isLongPressing = true;
                        ring.classList.remove('ring-visible');
                        if (currentPhotos[index]) {
                            openLightbox(index);
                        }
                    }
                };

                longPressRAF = requestAnimationFrame(animateRing);
            }, { passive: true });

            const cancelLongPress = () => {
                cancelAnimationFrame(longPressRAF);
                ring.classList.remove('ring-visible');
                ringProgress.style.strokeDashoffset = circumference;
                const ringIcon = ring.querySelector('.ring-icon');
                ringIcon.textContent = '☐';
                // Small delay to prevent click firing after long press cancel
                if (!isLongPressing) {
                    setTimeout(() => { isLongPressing = false; }, 100);
                }
            };

            frame.addEventListener('touchend', cancelLongPress, { passive: true });
            frame.addEventListener('touchcancel', cancelLongPress, { passive: true });
            frame.addEventListener('touchmove', cancelLongPress, { passive: true });
        }

        // ---- LOAD IMAGE INTO EXISTING FRAME (crossfade, no rebuild) ----
        function loadImageIntoFrame(frameIndex, photo) {
            const frame = frames[frameIndex];
            if (!frame || !photo) return;

            const imgWrap = frame.querySelector('.photo-img-wrap');
            const skeleton = frame.querySelector('.photo-skeleton');
            const flash = frame.querySelector('.swap-flash');
            const infoTitle = frame.querySelector('.info-title');
            const infoMeta = frame.querySelector('.info-meta');

            // Update info
            infoTitle.textContent = photo.name || '';
            infoMeta.textContent = `Photography`;

            // Create new image
            const newImg = document.createElement('img');
            newImg.src = photo.src;
            newImg.alt = photo.name || 'Photo';
            newImg.className = 'img-entering';

            const oldImg = imgWrap.querySelector('img:not(.img-entering)');
            const oldLeaving = imgWrap.querySelector('img.img-leaving');

            // Clean up any previously leaving image
            if (oldLeaving) oldLeaving.remove();

            imgWrap.appendChild(newImg);

            newImg.onload = () => {
                // Hide skeleton
                if (skeleton) skeleton.style.display = 'none';

                // Fade in new image
                requestAnimationFrame(() => {
                    newImg.classList.add('img-loaded');
                });

                // Fade out old image
                if (oldImg) {
                    oldImg.classList.add('img-leaving');
                    setTimeout(() => {
                        oldImg.remove();
                        // Clean up classes on new image
                        newImg.classList.remove('img-entering', 'img-loaded');
                        newImg.style.position = '';
                    }, CROSSFADE_DURATION);
                } else {
                    setTimeout(() => {
                        newImg.classList.remove('img-entering', 'img-loaded');
                        newImg.style.position = '';
                    }, CROSSFADE_DURATION);
                }

                // Flash effect
                flash.classList.remove('flash-active');
                void flash.offsetWidth; // reflow
                flash.classList.add('flash-active');
            };

            newImg.onerror = () => {
                newImg.remove();
                if (!oldImg && skeleton) {
                    skeleton.style.display = '';
                }
            };
        }

        // ---- POPULATE ALL FRAMES ----
        function populateFrames(photos, animate = true) {
            currentPhotos = [...photos];

            photos.forEach((photo, i) => {
                if (animate) {
                    setTimeout(() => {
                        loadImageIntoFrame(i, photo);
                    }, i * 80);
                } else {
                    loadImageIntoFrame(i, photo);
                }
            });
        }

        // ---- SWAP PHOTOS IN FRAMES (no grid rebuild) ----
        async function swapPhotosInFrames() {
            if (isSwapping || discoveredPhotos.length < FRAME_COUNT) return;
            isSwapping = true;

            const newSet = pickRandomSet(discoveredPhotos, FRAME_COUNT, currentPhotos);
            currentPhotos = [...newSet];

            // Stagger swaps with small delays
            for (let i = 0; i < FRAME_COUNT; i++) {
                await new Promise(resolve => {
                    setTimeout(() => {
                        loadImageIntoFrame(i, newSet[i]);
                        resolve();
                    }, 120);
                });
            }

            isSwapping = false;
        }

        // ---- LIGHTBOX FUNCTIONS ----
        function openLightbox(frameIndex) {
            lightboxCurrentIndex = frameIndex;
            const photo = currentPhotos[frameIndex];
            if (!photo) return;

            // Shutter effect
            lightboxShutter.classList.remove('shutter-fire');
            void lightboxShutter.offsetWidth;
            lightboxShutter.classList.add('shutter-fire');

            lbImage.src = photo.src;
            lbImage.alt = photo.name || 'Photo';
            lbCounter.textContent = `${frameIndex + 1} / ${FRAME_COUNT}`;

            lightbox.classList.add('lightbox-open');
            document.body.style.overflow = 'hidden';

            // Vibrate on mobile if supported
            if (navigator.vibrate) navigator.vibrate(30);
        }

        function closeLightbox() {
            lightbox.classList.remove('lightbox-open');
            document.body.style.overflow = '';
            lightboxCurrentIndex = -1;
        }

        function navigateLightbox(direction) {
            if (lightboxCurrentIndex < 0) return;

            // Find next frame with a valid photo
            let newIndex = lightboxCurrentIndex;
            for (let attempt = 0; attempt < FRAME_COUNT; attempt++) {
                newIndex = (newIndex + direction + FRAME_COUNT) % FRAME_COUNT;
                if (currentPhotos[newIndex]) break;
            }

            if (newIndex === lightboxCurrentIndex) return;

            // Transition
            lbImage.classList.add('lb-transitioning');

            setTimeout(() => {
                lightboxCurrentIndex = newIndex;
                const photo = currentPhotos[newIndex];
                lbImage.src = photo.src;
                lbImage.alt = photo.name || 'Photo';
                lbCounter.textContent = `${newIndex + 1} / ${FRAME_COUNT}`;

                requestAnimationFrame(() => {
                    lbImage.classList.remove('lb-transitioning');
                });
            }, 300);
        }

        // ---- LIGHTBOX EVENT LISTENERS ----
        lbClose.addEventListener('click', closeLightbox);
        lbPrev.addEventListener('click', () => navigateLightbox(-1));
        lbNext.addEventListener('click', () => navigateLightbox(1));

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-outer-frame')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!lightbox.classList.contains('lightbox-open')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') navigateLightbox(-1);
            if (e.key === 'ArrowRight') navigateLightbox(1);
        });

        // Swipe support in lightbox
        let lbTouchStartX = 0;
        lightbox.addEventListener('touchstart', (e) => {
            lbTouchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            const diff = lbTouchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 60) {
                navigateLightbox(diff > 0 ? 1 : -1);
            }
        }, { passive: true });

        // ---- SCROLL REVEAL FOR FRAMES ----
        const frameObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const idx = parseInt(entry.target.getAttribute('data-frame-index'));
                    setTimeout(() => {
                        entry.target.classList.add('frame-revealed');
                    }, idx * 70);
                    frameObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

        // ---- INIT ----
        async function init() {
            // Build the grid structure once
            buildFrames();

            // Observe frames for scroll reveal
            frames.forEach(f => frameObserver.observe(f));

            // Scan for photos in local folder
            discoveredPhotos = await discoverPhotos();

            // If no local photos found, use fallback
            if (discoveredPhotos.length === 0) {
                statusText.textContent = 'Using sample gallery';
                discoveredPhotos = [...fallbackPhotos];
                photoCount.textContent = `${discoveredPhotos.length} photos loaded`;
            } else {
                statusText.textContent = `Library ready — ${discoveredPhotos.length} photos`;
            }

            scanComplete = true;

            // Need at least FRAME_COUNT photos; if fewer, duplicate to fill
            if (discoveredPhotos.length < FRAME_COUNT) {
                while (discoveredPhotos.length < FRAME_COUNT) {
                    discoveredPhotos.push(discoveredPhotos[Math.floor(Math.random() * discoveredPhotos.length)]);
                }
            }

            // Populate frames with random selection
            const initialSet = shuffle(discoveredPhotos).slice(0, FRAME_COUNT);
            populateFrames(initialSet, true);

            // Start periodic swap (frames persist, only images change)
            if (discoveredPhotos.length >= FRAME_COUNT) {
                setInterval(swapPhotosInFrames, SWAP_INTERVAL);
            }
        }

        init();
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
