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
    // (function initPhotoGallery() {
    //     const gallery = document.getElementById('photo-wall');
    //     if (!gallery) return;

    //     // ---- CONFIG ----
    //     const PHOTO_FOLDER = 'photos';          // folder name inside your repo root
    //     const PHOTO_PREFIX = 'photo-';          // file naming: photo-1.jpg, photo-2.png ...
    //     const MAX_PHOTO_INDEX = 50;             // scan up to this number
    //     const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
    //     const SWAP_INTERVAL = 8000;             // ms between photo swaps
    //     const LONG_PRESS_DURATION = 5000;       // ms for mobile long-press
    //     const CROSSFADE_DURATION = 700;         // ms for image crossfade
    //     const FRAME_COUNT = 12;

    //     // ---- STATE ----
    //     let discoveredPhotos = [];              // { src, name } — populated by scanner
    //     let currentPhotos = [];                 // currently displayed in frames
    //     let frames = [];                        // DOM frame elements
    //     let lightboxCurrentIndex = -1;
    //     let isSwapping = false;
    //     let scanComplete = false;

    //     // ---- BUILD LIGHTBOX DOM ----
    //     const lightboxShutter = document.createElement('div');
    //     lightboxShutter.className = 'lightbox-shutter';
    //     document.body.appendChild(lightboxShutter);

    //     const lightbox = document.createElement('div');
    //     lightbox.className = 'lightbox-overlay';
    //     lightbox.setAttribute('role', 'dialog');
    //     lightbox.setAttribute('aria-label', 'Photo viewer');
    //     lightbox.innerHTML = `
    //     <div class="lightbox-outer-frame">
    //         <div class="lightbox-corner tl"></div>
    //         <div class="lightbox-corner tr"></div>
    //         <div class="lightbox-corner bl"></div>
    //         <div class="lightbox-corner br"></div>
    //         <button class="lightbox-close-btn" aria-label="Close photo viewer">&#10005;</button>
    //         <button class="lightbox-nav-btn lightbox-nav-prev" aria-label="Previous photo">&#8249;</button>
    //         <div class="lightbox-inner-mat">
    //             <img src="" alt="Photo" class="lightbox-image">
    //         </div>
    //         <button class="lightbox-nav-btn lightbox-nav-next" aria-label="Next photo">&#8250;</button>
    //         <div class="lightbox-bottom-bar">
    //             <span class="lightbox-counter"></span>
    //             <span class="lightbox-hint">ESC to close &bull; Arrow keys to navigate</span>
    //         </div>
    //     </div>
    // `;
    //     document.body.appendChild(lightbox);

    //     const lbImage = lightbox.querySelector('.lightbox-image');
    //     const lbCounter = lightbox.querySelector('.lightbox-counter');
    //     const lbClose = lightbox.querySelector('.lightbox-close-btn');
    //     const lbPrev = lightbox.querySelector('.lightbox-nav-prev');
    //     const lbNext = lightbox.querySelector('.lightbox-nav-next');

    //     // ---- BUILD STATUS BAR ----
    //     const statusBar = document.createElement('div');
    //     statusBar.className = 'gallery-status-bar';
    //     statusBar.innerHTML = `
    //     <div class="gallery-status-left">
    //         <span class="gallery-status-dot"></span>
    //         <span class="gallery-status-text" id="gallery-status-text">Scanning photo library...</span>
    //     </div>
    //     <span class="gallery-status-right" id="gallery-photo-count">0 photos found</span>
    // `;
    //     gallery.parentElement.insertBefore(statusBar, gallery);

    //     const statusText = document.getElementById('gallery-status-text');
    //     const photoCount = document.getElementById('gallery-photo-count');

    //     // ---- PHOTO DISCOVERY — scans folder for existing images ----
    //     function checkImageExists(url) {
    //         return new Promise(resolve => {
    //             const img = new Image();
    //             img.onload = () => resolve(true);
    //             img.onerror = () => resolve(false);
    //             img.src = url;
    //         });
    //     }

    //     async function discoverPhotos() {
    //         const found = [];
    //         // Scan in parallel batches of 5
    //         for (let i = 1; i <= MAX_PHOTO_INDEX; i++) {
    //             const batch = PHOTO_EXTENSIONS.map(ext => `${PHOTO_FOLDER}/${PHOTO_PREFIX}${i}.${ext}`);
    //             let foundForIndex = false;

    //             for (const url of batch) {
    //                 const exists = await checkImageExists(url);
    //                 if (exists) {
    //                     found.push({ src: url, name: `Photo ${i}` });
    //                     foundForIndex = true;
    //                     photoCount.textContent = `${found.length} photo${found.length > 1 ? 's' : ''} found`;
    //                     break;
    //                 }
    //             }

    //             // Update status every 5 scans
    //             if (i % 5 === 0) {
    //                 statusText.textContent = `Scanning... (${i}/${MAX_PHOTO_INDEX})`;
    //             }

    //             // Early stop if 5 consecutive misses after finding at least one
    //             if (found.length > 0 && i > found.length + 5 && !foundForIndex) {
    //                 break;
    //             }
    //         }

    //         return found;
    //     }

    //     // ---- FALLBACK PHOTOS (Unsplash) — used if folder is empty ----
    //     const fallbackPhotos = [
    //         { src: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600&h=900&fit=crop', name: 'Mountain Peak' },
    //         { src: 'https://images.unsplash.com/photo-1431890713044-d71e360a8a0a?w=500&h=500&fit=crop', name: 'Reflections' },
    //         { src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=500&fit=crop', name: 'Golden Fields' },
    //         { src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=900&fit=crop', name: 'City Lights' },
    //         { src: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=500&fit=crop', name: 'Patterns' },
    //         { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop', name: 'Cloud Formation' },
    //         { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=900&fit=crop', name: 'Forest Path' },
    //         { src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&h=500&fit=crop', name: 'Silhouette' },
    //         { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=500&fit=crop', name: 'Starry Night' },
    //         { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop', name: 'Foggy Forest' },
    //         { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop', name: 'Sunlight Trees' },
    //         { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop', name: 'Beach Sunset' },
    //     ];

    //     // ---- SHUFFLE ----
    //     function shuffle(arr) {
    //         const a = [...arr];
    //         for (let i = a.length - 1; i > 0; i--) {
    //             const j = Math.floor(Math.random() * (i + 1));
    //             [a[i], a[j]] = [a[j], a[i]];
    //         }
    //         return a;
    //     }

    //     // ---- PICK RANDOM UNIQUE (no repeats with current set) ----
    //     function pickRandomSet(pool, count, exclude = []) {
    //         const available = pool.filter(p => !exclude.some(e => e.src === p.src));
    //         if (available.length < count) {
    //             // Not enough unique, allow repeats
    //             return shuffle(pool).slice(0, count);
    //         }
    //         return shuffle(available).slice(0, count);
    //     }

    //     // ---- BUILD FRAMES (once, never rebuilt) ----
    //     function buildFrames() {
    //         gallery.innerHTML = '';

    //         for (let i = 0; i < FRAME_COUNT; i++) {
    //             const frame = document.createElement('div');
    //             frame.className = 'photo-frame';
    //             frame.setAttribute('data-frame-index', i);

    //             // Skeleton loader
    //             const skeleton = document.createElement('div');
    //             skeleton.className = 'photo-skeleton';
    //             frame.appendChild(skeleton);

    //             // Image wrapper
    //             const imgWrap = document.createElement('div');
    //             imgWrap.className = 'photo-img-wrap';
    //             frame.appendChild(imgWrap);

    //             // Swap flash overlay
    //             const flash = document.createElement('div');
    //             flash.className = 'swap-flash';
    //             frame.appendChild(flash);

    //             // Info overlay
    //             const info = document.createElement('div');
    //             info.className = 'photo-info-hover';
    //             info.innerHTML = `<p class="info-title"></p><span class="info-meta"></span>`;
    //             frame.appendChild(info);

    //             // Long press ring (mobile)
    //             const ring = document.createElement('div');
    //             ring.className = 'long-press-ring';
    //             ring.innerHTML = `
    //             <svg viewBox="0 0 60 60">
    //                 <circle class="ring-bg" cx="30" cy="30" r="26"/>
    //                 <circle class="ring-progress" cx="30" cy="30" r="26"/>
    //             </svg>
    //             <span class="ring-icon">☐</span>
    //         `;
    //             frame.appendChild(ring);

    //             // Events
    //             setupFrameEvents(frame, i);

    //             gallery.appendChild(frame);
    //             frames.push(frame);
    //         }
    //     }

    //     // ---- SETUP FRAME EVENTS (click, hover, long-press) ----
    //     function setupFrameEvents(frame, index) {
    //         let longPressTimer = null;
    //         let longPressStart = 0;
    //         let longPressRAF = null;
    //         const ring = frame.querySelector('.long-press-ring');
    //         const ringProgress = ring.querySelector('.ring-progress');
    //         const circumference = 2 * Math.PI * 26; // r=26
    //         let isLongPressing = false;

    //         // Click -> lightbox
    //         frame.addEventListener('click', (e) => {
    //             if (isLongPressing) return;
    //             if (currentPhotos[index]) {
    //                 openLightbox(index);
    //             }
    //         });

    //         // 3D Tilt on desktop hover
    //         frame.addEventListener('mousemove', (e) => {
    //             if (window.innerWidth < 768) return;
    //             const rect = frame.getBoundingClientRect();
    //             const x = e.clientX - rect.left;
    //             const y = e.clientY - rect.top;
    //             const cx = rect.width / 2;
    //             const cy = rect.height / 2;
    //             const rx = ((y - cy) / cy) * 4;
    //             const ry = ((cx - x) / cx) * 4;

    //             frame.classList.add('tilt-active');
    //             frame.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
    //         });

    //         frame.addEventListener('mouseleave', () => {
    //             frame.classList.remove('tilt-active');
    //             frame.style.transform = '';
    //         });

    //         // Long press — mobile only
    //         frame.addEventListener('touchstart', (e) => {
    //             if (window.innerWidth >= 768) return;
    //             isLongPressing = false;
    //             longPressStart = Date.now();
    //             ring.classList.add('ring-visible');
    //             ringProgress.style.strokeDashoffset = circumference;

    //             const animateRing = () => {
    //                 const elapsed = Date.now() - longPressStart;
    //                 const progress = Math.min(elapsed / LONG_PRESS_DURATION, 1);
    //                 ringProgress.style.strokeDashoffset = circumference * (1 - progress);

    //                 // Update icon
    //                 const ringIcon = ring.querySelector('.ring-icon');
    //                 if (progress > 0.3) {
    //                     ringIcon.textContent = progress > 0.7 ? '📈' : '⛓';
    //                 }

    //                 if (progress < 1) {
    //                     longPressRAF = requestAnimationFrame(animateRing);
    //                 } else {
    //                     // Long press complete!
    //                     isLongPressing = true;
    //                     ring.classList.remove('ring-visible');
    //                     if (currentPhotos[index]) {
    //                         openLightbox(index);
    //                     }
    //                 }
    //             };

    //             longPressRAF = requestAnimationFrame(animateRing);
    //         }, { passive: true });

    //         const cancelLongPress = () => {
    //             cancelAnimationFrame(longPressRAF);
    //             ring.classList.remove('ring-visible');
    //             ringProgress.style.strokeDashoffset = circumference;
    //             const ringIcon = ring.querySelector('.ring-icon');
    //             ringIcon.textContent = '☐';
    //             // Small delay to prevent click firing after long press cancel
    //             if (!isLongPressing) {
    //                 setTimeout(() => { isLongPressing = false; }, 100);
    //             }
    //         };

    //         frame.addEventListener('touchend', cancelLongPress, { passive: true });
    //         frame.addEventListener('touchcancel', cancelLongPress, { passive: true });
    //         frame.addEventListener('touchmove', cancelLongPress, { passive: true });
    //     }

    //     // ---- LOAD IMAGE INTO EXISTING FRAME (crossfade, no rebuild) ----
    //     function loadImageIntoFrame(frameIndex, photo) {
    //         const frame = frames[frameIndex];
    //         if (!frame || !photo) return;

    //         const imgWrap = frame.querySelector('.photo-img-wrap');
    //         const skeleton = frame.querySelector('.photo-skeleton');
    //         const flash = frame.querySelector('.swap-flash');
    //         const infoTitle = frame.querySelector('.info-title');
    //         const infoMeta = frame.querySelector('.info-meta');

    //         // Update info
    //         infoTitle.textContent = photo.name || '';
    //         infoMeta.textContent = `Photography`;

    //         // Create new image
    //         const newImg = document.createElement('img');
    //         newImg.src = photo.src;
    //         newImg.alt = photo.name || 'Photo';
    //         newImg.className = 'img-entering';

    //         const oldImg = imgWrap.querySelector('img:not(.img-entering)');
    //         const oldLeaving = imgWrap.querySelector('img.img-leaving');

    //         // Clean up any previously leaving image
    //         if (oldLeaving) oldLeaving.remove();

    //         imgWrap.appendChild(newImg);

    //         newImg.onload = () => {
    //             // Hide skeleton
    //             if (skeleton) skeleton.style.display = 'none';

    //             // Fade in new image
    //             requestAnimationFrame(() => {
    //                 newImg.classList.add('img-loaded');
    //             });

    //             // Fade out old image
    //             if (oldImg) {
    //                 oldImg.classList.add('img-leaving');
    //                 setTimeout(() => {
    //                     oldImg.remove();
    //                     // Clean up classes on new image
    //                     newImg.classList.remove('img-entering', 'img-loaded');
    //                     newImg.style.position = '';
    //                 }, CROSSFADE_DURATION);
    //             } else {
    //                 setTimeout(() => {
    //                     newImg.classList.remove('img-entering', 'img-loaded');
    //                     newImg.style.position = '';
    //                 }, CROSSFADE_DURATION);
    //             }

    //             // Flash effect
    //             flash.classList.remove('flash-active');
    //             void flash.offsetWidth; // reflow
    //             flash.classList.add('flash-active');
    //         };

    //         newImg.onerror = () => {
    //             newImg.remove();
    //             if (!oldImg && skeleton) {
    //                 skeleton.style.display = '';
    //             }
    //         };
    //     }

    //     // ---- POPULATE ALL FRAMES ----
    //     function populateFrames(photos, animate = true) {
    //         currentPhotos = [...photos];

    //         photos.forEach((photo, i) => {
    //             if (animate) {
    //                 setTimeout(() => {
    //                     loadImageIntoFrame(i, photo);
    //                 }, i * 80);
    //             } else {
    //                 loadImageIntoFrame(i, photo);
    //             }
    //         });
    //     }

    //     // ---- SWAP PHOTOS IN FRAMES (no grid rebuild) ----
    //     async function swapPhotosInFrames() {
    //         if (isSwapping || discoveredPhotos.length < FRAME_COUNT) return;
    //         isSwapping = true;

    //         const newSet = pickRandomSet(discoveredPhotos, FRAME_COUNT, currentPhotos);
    //         currentPhotos = [...newSet];

    //         // Stagger swaps with small delays
    //         for (let i = 0; i < FRAME_COUNT; i++) {
    //             await new Promise(resolve => {
    //                 setTimeout(() => {
    //                     loadImageIntoFrame(i, newSet[i]);
    //                     resolve();
    //                 }, 120);
    //             });
    //         }

    //         isSwapping = false;
    //     }

    //     // ---- LIGHTBOX FUNCTIONS ----
    //     function openLightbox(frameIndex) {
    //         lightboxCurrentIndex = frameIndex;
    //         const photo = currentPhotos[frameIndex];
    //         if (!photo) return;

    //         // Shutter effect
    //         lightboxShutter.classList.remove('shutter-fire');
    //         void lightboxShutter.offsetWidth;
    //         lightboxShutter.classList.add('shutter-fire');

    //         lbImage.src = photo.src;
    //         lbImage.alt = photo.name || 'Photo';
    //         lbCounter.textContent = `${frameIndex + 1} / ${FRAME_COUNT}`;

    //         lightbox.classList.add('lightbox-open');
    //         document.body.style.overflow = 'hidden';

    //         // Vibrate on mobile if supported
    //         if (navigator.vibrate) navigator.vibrate(30);
    //     }

    //     function closeLightbox() {
    //         lightbox.classList.remove('lightbox-open');
    //         document.body.style.overflow = '';
    //         lightboxCurrentIndex = -1;
    //     }

    //     function navigateLightbox(direction) {
    //         if (lightboxCurrentIndex < 0) return;

    //         // Find next frame with a valid photo
    //         let newIndex = lightboxCurrentIndex;
    //         for (let attempt = 0; attempt < FRAME_COUNT; attempt++) {
    //             newIndex = (newIndex + direction + FRAME_COUNT) % FRAME_COUNT;
    //             if (currentPhotos[newIndex]) break;
    //         }

    //         if (newIndex === lightboxCurrentIndex) return;

    //         // Transition
    //         lbImage.classList.add('lb-transitioning');

    //         setTimeout(() => {
    //             lightboxCurrentIndex = newIndex;
    //             const photo = currentPhotos[newIndex];
    //             lbImage.src = photo.src;
    //             lbImage.alt = photo.name || 'Photo';
    //             lbCounter.textContent = `${newIndex + 1} / ${FRAME_COUNT}`;

    //             requestAnimationFrame(() => {
    //                 lbImage.classList.remove('lb-transitioning');
    //             });
    //         }, 300);
    //     }

    //     // ---- LIGHTBOX EVENT LISTENERS ----
    //     lbClose.addEventListener('click', closeLightbox);
    //     lbPrev.addEventListener('click', () => navigateLightbox(-1));
    //     lbNext.addEventListener('click', () => navigateLightbox(1));

    //     lightbox.addEventListener('click', (e) => {
    //         if (e.target === lightbox || e.target.classList.contains('lightbox-outer-frame')) {
    //             closeLightbox();
    //         }
    //     });

    //     document.addEventListener('keydown', (e) => {
    //         if (!lightbox.classList.contains('lightbox-open')) return;
    //         if (e.key === 'Escape') closeLightbox();
    //         if (e.key === 'ArrowLeft') navigateLightbox(-1);
    //         if (e.key === 'ArrowRight') navigateLightbox(1);
    //     });

    //     // Swipe support in lightbox
    //     let lbTouchStartX = 0;
    //     lightbox.addEventListener('touchstart', (e) => {
    //         lbTouchStartX = e.changedTouches[0].screenX;
    //     }, { passive: true });

    //     lightbox.addEventListener('touchend', (e) => {
    //         const diff = lbTouchStartX - e.changedTouches[0].screenX;
    //         if (Math.abs(diff) > 60) {
    //             navigateLightbox(diff > 0 ? 1 : -1);
    //         }
    //     }, { passive: true });

    //     // ---- SCROLL REVEAL FOR FRAMES ----
    //     const frameObserver = new IntersectionObserver((entries) => {
    //         entries.forEach(entry => {
    //             if (entry.isIntersecting) {
    //                 const idx = parseInt(entry.target.getAttribute('data-frame-index'));
    //                 setTimeout(() => {
    //                     entry.target.classList.add('frame-revealed');
    //                 }, idx * 70);
    //                 frameObserver.unobserve(entry.target);
    //             }
    //         });
    //     }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

    //     // ---- INIT ----
    //     async function init() {
    //         // Build the grid structure once
    //         buildFrames();

    //         // Observe frames for scroll reveal
    //         frames.forEach(f => frameObserver.observe(f));

    //         // Scan for photos in local folder
    //         discoveredPhotos = await discoverPhotos();

    //         // If no local photos found, use fallback
    //         if (discoveredPhotos.length === 0) {
    //             statusText.textContent = 'Using sample gallery';
    //             discoveredPhotos = [...fallbackPhotos];
    //             photoCount.textContent = `${discoveredPhotos.length} photos loaded`;
    //         } else {
    //             statusText.textContent = `Library ready — ${discoveredPhotos.length} photos`;
    //         }

    //         scanComplete = true;

    //         // Need at least FRAME_COUNT photos; if fewer, duplicate to fill
    //         if (discoveredPhotos.length < FRAME_COUNT) {
    //             while (discoveredPhotos.length < FRAME_COUNT) {
    //                 discoveredPhotos.push(discoveredPhotos[Math.floor(Math.random() * discoveredPhotos.length)]);
    //             }
    //         }

    //         // Populate frames with random selection
    //         const initialSet = shuffle(discoveredPhotos).slice(0, FRAME_COUNT);
    //         populateFrames(initialSet, true);

    //         // Start periodic swap (frames persist, only images change)
    //         if (discoveredPhotos.length >= FRAME_COUNT) {
    //             setInterval(swapPhotosInFrames, SWAP_INTERVAL);
    //         }
    //     }

    //     init();
    // })();

    // === PHOTO GALLERY — SMART RATIO + SHUFFLE + AI CAPTION ===
    // (function initPhotoGallery() {
    //     var gallery = document.getElementById('photo-wall');
    //     if (!gallery) return;

    //     var FOLDERS = [
    //         { name: 'Nature', path: 'photos/nature' },
    //         { name: 'Street', path: 'photos/street' },
    //         { name: 'Architecture', path: 'photos/architecture' },
    //         { name: 'Portrait', path: 'photos/portrait' },
    //         { name: 'Travel', path: 'photos/travel' },
    //         { name: 'Persona', path: 'photos/persona' }
    //     ];

    //     // ============================================================
    //     //  AI CAPTION — ফ্রি টোকেন নিচের লিংক থেকে নাও:
    //     //  https://huggingface.co/settings/tokens → New token (Read) → কপি → পেস্ট
    //     //  খালি রাখলে স্মার্ট ফোল্ডার-নেম ক্যাপশন ব্যবহার হবে
    //     // ============================================================
    //     var HF_TOKEN = '';

    //     var MAX_IDX = 50;
    //     var EXTS = ['jpg', 'jpeg', 'png', 'webp'];
    //     var SWAP_MS = 8000;
    //     var LP_MS = 5000;
    //     var FADE_MS = 600;
    //     var COUNT = 12;
    //     var CIRC = 2 * Math.PI * 26;

    //     var allPhotos = [];
    //     var photoRatios = {};
    //     var shown = [];
    //     var frames = [];
    //     var captionCache = {};
    //     var lbIdx = -1;
    //     var busy = false;

    //     // ============================================================
    //     //  SLOT TYPE — CSS nth-child অনুযায়ী frame এর type
    //     //  6n+1→large  6n+2→wide  6n+3→square  6n+4→tall  6n+5→wide  6n+6→square
    //     // ============================================================
    //     function getSlotType(domIndex) {
    //         var p = domIndex % 6;
    //         if (p === 0) return 'large';
    //         if (p === 1) return 'wide';
    //         if (p === 2) return 'square';
    //         if (p === 3) return 'tall';
    //         if (p === 4) return 'wide';
    //         return 'square';
    //     }

    //     // ============================================================
    //     //  LIGHTBOX (same as before)
    //     // ============================================================
    //     var lbOverlay = document.createElement('div');
    //     lbOverlay.setAttribute('id', 'lb-overlay');
    //     lbOverlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(5,7,12,0.96);backdrop-filter:blur(30px);opacity:0;visibility:hidden;transition:opacity .45s ease,visibility .45s ease;';
    //     lbOverlay.innerHTML =
    //         '<div id="lb-box" style="position:relative;max-width:92vw;max-height:88vh;">' +
    //         '<button id="lb-x" style="position:absolute;top:-54px;right:0;width:44px;height:44px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.3rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;z-index:5;backdrop-filter:blur(8px);">&#10005;</button>' +
    //         '<div style="position:relative;padding:10px;background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border-radius:18px;border:1px solid rgba(255,255,255,.1);box-shadow:0 40px 100px rgba(0,0,0,.7),0 0 60px rgba(0,212,255,.06);">' +
    //         '<div style="padding:14px;background:rgba(10,15,28,.9);border-radius:10px;border:1px solid rgba(255,255,255,.04);overflow:hidden;">' +
    //         '<img id="lb-img" src="" alt="" style="display:block;max-width:85vw;max-height:78vh;object-fit:contain;border-radius:6px;transition:opacity .3s ease,transform .3s ease;">' +
    //         '</div></div>' +
    //         '<button id="lb-p" style="position:absolute;top:50%;left:-68px;transform:translateY(-50%);width:50px;height:50px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.6rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;backdrop-filter:blur(8px);">&#8249;</button>' +
    //         '<button id="lb-n" style="position:absolute;top:50%;right:-68px;transform:translateY(-50%);width:50px;height:50px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.6rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;backdrop-filter:blur(8px);">&#8250;</button>' +
    //         '<div style="position:absolute;bottom:-44px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;">' +
    //         '<span id="lb-cnt" style="font-family:var(--font-mono);font-size:.8rem;color:#718096;background:rgba(255,255,255,.04);padding:6px 16px;border-radius:20px;border:1px solid rgba(255,255,255,.06);"></span>' +
    //         '<span id="lb-cat" style="font-family:var(--font-mono);font-size:.75rem;color:#00d4ff;opacity:.7;"></span>' +
    //         '</div></div>';
    //     document.body.appendChild(lbOverlay);

    //     var lbImg = document.getElementById('lb-img');
    //     var lbCnt = document.getElementById('lb-cnt');
    //     var lbCat = document.getElementById('lb-cat');
    //     var lbX = document.getElementById('lb-x');
    //     var lbP = document.getElementById('lb-p');
    //     var lbN = document.getElementById('lb-n');

    //     var shutter = document.createElement('div');
    //     shutter.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:10001;pointer-events:none;opacity:0;';
    //     document.body.appendChild(shutter);

    //     function fireShutter() {
    //         shutter.style.transition = 'none'; shutter.style.opacity = '0';
    //         void shutter.offsetWidth;
    //         shutter.style.transition = 'opacity .35s ease'; shutter.style.opacity = '0.12';
    //         setTimeout(function () { shutter.style.opacity = '0'; }, 120);
    //     }

    //     lbX.onmouseenter = function () { this.style.background = 'rgba(239,68,68,.15)'; this.style.borderColor = 'rgba(239,68,68,.4)'; this.style.color = '#ef4444'; this.style.transform = 'rotate(90deg) scale(1.1)'; };
    //     lbX.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.06)'; this.style.borderColor = 'rgba(255,255,255,.12)'; this.style.color = '#a0aec0'; this.style.transform = ''; };
    //     lbP.onmouseenter = function () { this.style.background = 'rgba(0,212,255,.12)'; this.style.borderColor = 'rgba(0,212,255,.35)'; this.style.color = '#00d4ff'; };
    //     lbP.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.05)'; this.style.borderColor = 'rgba(255,255,255,.1)'; this.style.color = '#a0aec0'; };
    //     lbN.onmouseenter = function () { this.style.background = 'rgba(0,212,255,.12)'; this.style.borderColor = 'rgba(0,212,255,.35)'; this.style.color = '#00d4ff'; };
    //     lbN.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.05)'; this.style.borderColor = 'rgba(255,255,255,.1)'; this.style.color = '#a0aec0'; };

    //     function openLb(idx) {
    //         if (!shown[idx]) return;
    //         lbIdx = idx; fireShutter();
    //         lbImg.src = shown[idx].src; lbImg.alt = shown[idx].cat;
    //         lbImg.style.opacity = '1'; lbImg.style.transform = '';
    //         lbCnt.textContent = (idx + 1) + ' / ' + COUNT;
    //         lbCat.textContent = shown[idx].cat;
    //         lbOverlay.style.opacity = '1'; lbOverlay.style.visibility = 'visible';
    //         document.body.style.overflow = 'hidden';
    //         if (navigator.vibrate) navigator.vibrate(25);
    //     }

    //     function closeLb() {
    //         lbOverlay.style.opacity = '0'; lbOverlay.style.visibility = 'hidden';
    //         document.body.style.overflow = ''; lbIdx = -1;
    //     }

    //     function navLb(dir) {
    //         if (lbIdx < 0) return;
    //         var ni = lbIdx;
    //         for (var i = 0; i < COUNT; i++) {
    //             ni = (ni + dir + COUNT) % COUNT;
    //             if (shown[ni]) break;
    //         }
    //         if (ni === lbIdx) return;
    //         lbImg.style.opacity = '0';
    //         lbImg.style.transform = dir > 0 ? 'translateX(12px)' : 'translateX(-12px)';
    //         setTimeout(function () {
    //             lbIdx = ni; lbImg.src = shown[ni].src; lbImg.alt = shown[ni].cat;
    //             lbCnt.textContent = (ni + 1) + ' / ' + COUNT;
    //             lbCat.textContent = shown[ni].cat;
    //             lbImg.style.transform = ''; lbImg.style.opacity = '1';
    //         }, 260);
    //     }

    //     lbX.onclick = closeLb;
    //     lbP.onclick = function () { navLb(-1); };
    //     lbN.onclick = function () { navLb(1); };
    //     lbOverlay.addEventListener('click', function (e) { if (e.target === lbOverlay) closeLb(); });
    //     document.addEventListener('keydown', function (e) {
    //         if (lbOverlay.style.visibility !== 'visible') return;
    //         if (e.key === 'Escape') closeLb();
    //         if (e.key === 'ArrowLeft') navLb(-1);
    //         if (e.key === 'ArrowRight') navLb(1);
    //     });

    //     var txS = 0;
    //     lbOverlay.addEventListener('touchstart', function (e) { txS = e.changedTouches[0].screenX; }, { passive: true });
    //     lbOverlay.addEventListener('touchend', function (e) {
    //         var d = txS - e.changedTouches[0].screenX;
    //         if (Math.abs(d) > 60) navLb(d > 0 ? 1 : -1);
    //     }, { passive: true });

    //     // ============================================================
    //     //  FOLDER SCANNER
    //     // ============================================================
    //     function exists(url) {
    //         return new Promise(function (res) {
    //             var im = new Image();
    //             im.onload = function () { res(true); };
    //             im.onerror = function () { res(false); };
    //             im.src = url;
    //         });
    //     }

    //     function scanFolder(folderObj) {
    //         return new Promise(function (resolve) {
    //             var found = [], misses = 0, n = 1;
    //             function next() {
    //                 if (n > MAX_IDX || (found.length > 0 && misses >= 5)) { resolve(found); return; }
    //                 var num = n; n++; var ei = 0;
    //                 function tryExt() {
    //                     if (ei >= EXTS.length) { misses++; next(); return; }
    //                     var url = folderObj.path + '/' + num + '.' + EXTS[ei]; ei++;
    //                     exists(url).then(function (ok) {
    //                         if (ok) {
    //                             found.push({ src: url, name: folderObj.name + ' — ' + num, cat: folderObj.name });
    //                             misses = 0; next();
    //                         } else { tryExt(); }
    //                     });
    //                 }
    //                 tryExt();
    //             }
    //             next();
    //         });
    //     }

    //     async function scanAllFolders() {
    //         var results = {}, total = 0;
    //         for (var i = 0; i < FOLDERS.length; i++) {
    //             var f = FOLDERS[i];
    //             var photos = await scanFolder(f);
    //             results[f.name] = photos;
    //             total += photos.length;
    //         }
    //         return { results: results, total: total };
    //     }

    //     var fallbacks = [
    //         { src: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600&h=900&fit=crop', name: 'Mountain', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1431890713044-d71e360a8a0a?w=500&h=500&fit=crop', name: 'Reflection', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=500&fit=crop', name: 'Fields', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=900&fit=crop', name: 'City', cat: 'Street' },
    //         { src: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=500&fit=crop', name: 'Pattern', cat: 'Architecture' },
    //         { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop', name: 'Clouds', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=900&fit=crop', name: 'Forest', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&h=500&fit=crop', name: 'Silhouette', cat: 'Portrait' },
    //         { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=500&fit=crop', name: 'Stars', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop', name: 'Fog', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop', name: 'Sunlight', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop', name: 'Beach', cat: 'Travel' }
    //     ];

    //     function shuffle(a) {
    //         var b = a.slice();
    //         for (var i = b.length - 1; i > 0; i--) {
    //             var j = Math.floor(Math.random() * (i + 1));
    //             var t = b[i]; b[i] = b[j]; b[j] = t;
    //         }
    //         return b;
    //     }

    //     function pickRandom(pool, n, excl) {
    //         var avail = pool.filter(function (p) {
    //             return !excl.some(function (e) { return e.src === p.src; });
    //         });
    //         var src = avail.length >= n ? avail : pool;
    //         return shuffle(src).slice(0, n);
    //     }

    //     // ============================================================
    //     //  RATIO DETECTION — ছবি লোড হলে তার natural ratio বের করে
    //     // ============================================================
    //     function detectRatio(src) {
    //         return new Promise(function (resolve) {
    //             if (photoRatios[src]) { resolve(photoRatios[src]); return; }
    //             var im = new Image();
    //             im.onload = function () {
    //                 var w = im.naturalWidth, h = im.naturalHeight;
    //                 var r = w / h;
    //                 var type = r > 1.4 ? 'wide' : (r < 0.75 ? 'tall' : 'square');
    //                 photoRatios[src] = { w: w, h: h, ratio: r, type: type };
    //                 resolve(photoRatios[src]);
    //             };
    //             im.onerror = function () { resolve({ w: 1, h: 1, ratio: 1, type: 'square' }); };
    //             im.src = src;
    //         });
    //     }

    //     // ============================================================
    //     //  SMART ASSIGNMENT — ratio অনুযায়ী সঠিক frame এ ছবি বসায়
    //     // ============================================================
    //     async function smartAssign(photos) {
    //         // সব ছবির ratio detect করো
    //         var detected = [];
    //         for (var i = 0; i < photos.length; i++) {
    //             var ratio = await detectRatio(photos[i].src);
    //             detected.push({ photo: photos[i], ratio: ratio });
    //         }

    //         // বর্তমান DOM order অনুযায়ী slot types বের করো
    //         var slots = [];
    //         for (var i = 0; i < COUNT; i++) {
    //             slots.push({ index: i, type: getSlotType(i) });
    //         }

    //         // Type অনুযায়ী আলাদা করো
    //         var byType = { wide: [], tall: [], square: [], large: [] };
    //         detected.forEach(function (d) { if (byType[d.ratio.type]) byType[d.ratio.type].push(d); });

    //         var slotByType = { wide: [], tall: [], square: [], large: [] };
    //         slots.forEach(function (s) { if (slotByType[s.type]) slotByType[s.type].push(s); });

    //         var assigned = new Array(COUNT).fill(null);
    //         var used = {};

    //         function assignOne(photoList, slotList) {
    //             for (var i = 0; i < photoList.length && i < slotList.length; i++) {
    //                 if (used[photoList[i].photo.src]) continue;
    //                 assigned[slotList[i].index] = photoList[i].photo;
    //                 used[photoList[i].photo.src] = true;
    //             }
    //         }

    //         // Priority: tall → wide → square → large (large is most flexible)
    //         assignOne(byType.tall, slotByType.tall);
    //         assignOne(byType.wide, slotByType.wide);
    //         assignOne(byType.square, slotByType.square);

    //         // Remaining → large slots first, then any empty
    //         var remaining = detected.filter(function (d) { return !used[d.photo.src]; });
    //         var emptySlots = [];
    //         for (var i = 0; i < COUNT; i++) {
    //             if (!assigned[i]) emptySlots.push(i);
    //         }
    //         var largeEmpty = emptySlots.filter(function (i) { return getSlotType(i) === 'large'; });
    //         var otherEmpty = emptySlots.filter(function (i) { return getSlotType(i) !== 'large'; });

    //         for (var i = 0; i < remaining.length; i++) {
    //             var slotIdx = i < largeEmpty.length ? largeEmpty[i] : (i - largeEmpty.length < otherEmpty.length ? otherEmpty[i - largeEmpty.length] : emptySlots[i]);
    //             if (slotIdx !== undefined) assigned[slotIdx] = remaining[i].photo;
    //         }

    //         return assigned;
    //     }

    //     // ============================================================
    //     //  AI CAPTION — HuggingFace free API অথবা smart fallback
    //     // ============================================================
    //     var poeticLines = {
    //         'Nature': ['Where light meets the earth', 'Silence between the leaves', 'The sky remembers everything', 'Nature speaks in colors', 'Quiet strength of growing things'],
    //         'Street': ['Stories written on pavements', 'The city breathes at dusk', 'Movement frozen in time', 'Life between the buildings', 'Every corner holds a secret'],
    //         'Architecture': ['Geometry of human ambition', 'Lines that define our spaces', 'Structure meets beauty', 'Where math becomes art', 'Shadows drawn by concrete'],
    //         'Portrait': ['Eyes that hold universes', 'A moment of being seen', 'The face of a feeling', 'Presence captured in light', 'Humanity in a single frame'],
    //         'Travel': ['Footprints in unfamiliar light', 'Somewhere I became someone else', 'Distance made visible', 'The world outside the window', 'Maps drawn by memory'],
    //         'Persona': ['The person behind the code', 'Between the frames of self', 'Unfiltered presence', 'Seeing myself seeing', 'The engineer outside the machine']
    //     };

    //     function smartCaption(photo) {
    //         var lines = poeticLines[photo.cat] || ['A moment captured in light', 'The world paused here', 'Seeing through the lens'];
    //         return lines[Math.floor(Math.random() * lines.length)];
    //     }

    //     function imgToBase64(url) {
    //         return new Promise(function (resolve, reject) {
    //             var im = new Image();
    //             im.crossOrigin = 'anonymous';
    //             im.onload = function () {
    //                 var c = document.createElement('canvas');
    //                 var maxDim = 400;
    //                 var scale = Math.min(maxDim / im.naturalWidth, maxDim / im.naturalHeight, 1);
    //                 c.width = Math.round(im.naturalWidth * scale);
    //                 c.height = Math.round(im.naturalHeight * scale);
    //                 c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    //                 resolve(c.toDataURL('image/jpeg', 0.6));
    //             };
    //             im.onerror = reject;
    //             im.src = url;
    //         });
    //     }

    //     async function getCaption(photo) {
    //         if (captionCache[photo.src]) return captionCache[photo.src];

    //         // AI caption — only if token provided
    //         if (HF_TOKEN) {
    //             try {
    //                 var base64 = await imgToBase64(photo.src);
    //                 var res = await fetch('https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning', {
    //                     method: 'POST',
    //                     headers: { 'Authorization': 'Bearer ' + HF_TOKEN, 'Content-Type': 'application/json' },
    //                     body: JSON.stringify({ inputs: base64 })
    //                 });
    //                 var data = await res.json();
    //                 if (data && data[0] && data[0].generated_text) {
    //                     var cap = data[0].generated_text.charAt(0).toUpperCase() + data[0].generated_text.slice(1);
    //                     if (cap.length > 5) { captionCache[photo.src] = cap; return cap; }
    //                 }
    //             } catch (e) { /* fall through */ }
    //         }

    //         // Smart fallback
    //         var cap = smartCaption(photo);
    //         captionCache[photo.src] = cap;
    //         return cap;
    //     }

    //     // ============================================================
    //     //  BUILD GRID — একবার তৈরি, আর বদলাবে না
    //     // ============================================================
    //     function buildGrid() {
    //         gallery.innerHTML = '';
    //         frames = [];

    //         for (var i = 0; i < COUNT; i++) {
    //             var f = document.createElement('div');
    //             f.className = 'photo-frame';

    //             var sk = document.createElement('div');
    //             sk.className = 'photo-skeleton';
    //             f.appendChild(sk);

    //             var wr = document.createElement('div');
    //             wr.className = 'photo-img-wrap';
    //             f.appendChild(wr);

    //             var fl = document.createElement('div');
    //             fl.className = 'swap-flash';
    //             f.appendChild(fl);

    //             var inf = document.createElement('div');
    //             inf.className = 'photo-info-hover';
    //             inf.innerHTML = '<p class="info-title"></p><p class="info-caption"></p><span class="info-meta">Photography</span>';
    //             f.appendChild(inf);

    //             var rn = document.createElement('div');
    //             rn.className = 'long-press-ring';
    //             rn.innerHTML = '<svg viewBox="0 0 60 60"><circle class="r-bg" cx="30" cy="30" r="26"/><circle class="r-fg" cx="30" cy="30" r="26" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"/></svg>';
    //             f.appendChild(rn);

    //             wireFrame(f, i, rn);
    //             gallery.appendChild(f);
    //             frames.push(f);
    //         }
    //     }

    //     // ============================================================
    //     //  FRAME EVENTS
    //     // ============================================================
    //     function wireFrame(f, idx, ring) {
    //         var rfg = ring.querySelector('.r-fg');
    //         var lpRAF = 0, lpStart = 0, wasLP = false;

    //         f.addEventListener('click', function () {
    //             if (wasLP) { wasLP = false; return; }
    //             if (shown[idx]) openLb(idx);
    //         });

    //         // 3D tilt
    //         f.addEventListener('mousemove', function (e) {
    //             if (window.innerWidth < 769) return;
    //             var r = f.getBoundingClientRect();
    //             var rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 4;
    //             var ry = ((r.width / 2 - e.clientX + r.left) / (r.width / 2)) * 4;
    //             f.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(6px)';
    //             f.style.transition = 'border-color .4s ease, box-shadow .5s ease';
    //         });

    //         f.addEventListener('mouseleave', function () {
    //             f.style.transform = '';
    //             f.style.transition = '';
    //         });

    //         // Hover → load AI caption
    //         f.addEventListener('mouseenter', function () {
    //             if (shown[idx]) {
    //                 var capEl = f.querySelector('.info-caption');
    //                 if (capEl && !capEl.textContent) {
    //                     getCaption(shown[idx]).then(function (cap) {
    //                         if (capEl) capEl.textContent = cap;
    //                     });
    //                 }
    //             }
    //         });

    //         // Long press
    //         f.addEventListener('touchstart', function () {
    //             if (window.innerWidth >= 769) return;
    //             wasLP = false; lpStart = Date.now();
    //             ring.classList.add('ring-show');
    //             rfg.style.strokeDashoffset = CIRC;
    //             function tick() {
    //                 var p = Math.min((Date.now() - lpStart) / LP_MS, 1);
    //                 rfg.style.strokeDashoffset = CIRC * (1 - p);
    //                 if (p < 1) { lpRAF = requestAnimationFrame(tick); }
    //                 else {
    //                     wasLP = true;
    //                     ring.classList.remove('ring-show');
    //                     rfg.style.strokeDashoffset = CIRC;
    //                     if (shown[idx]) openLb(idx);
    //                 }
    //             }
    //             lpRAF = requestAnimationFrame(tick);
    //         }, { passive: true });

    //         function stopLP() {
    //             cancelAnimationFrame(lpRAF);
    //             ring.classList.remove('ring-show');
    //             rfg.style.strokeDashoffset = CIRC;
    //         }

    //         f.addEventListener('touchend', function () { stopLP(); setTimeout(function () { wasLP = false; }, 60); }, { passive: true });
    //         f.addEventListener('touchcancel', stopLP, { passive: true });
    //         f.addEventListener('touchmove', stopLP, { passive: true });
    //     }

    //     // ============================================================
    //     //  LOAD IMAGE INTO FRAME — crossfade
    //     // ============================================================
    //     function loadInto(idx, photo) {
    //         var f = frames[idx];
    //         if (!f || !photo) return;

    //         shown[idx] = photo;
    //         var wr = f.querySelector('.photo-img-wrap');
    //         var sk = f.querySelector('.photo-skeleton');
    //         var fl = f.querySelector('.swap-flash');

    //         f.querySelector('.info-title').textContent = photo.cat || '';
    //         f.querySelector('.info-caption').textContent = '';

    //         var ni = document.createElement('img');
    //         ni.src = photo.src;
    //         ni.alt = photo.cat || '';
    //         ni.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;opacity:0;z-index:1;transition:opacity ' + FADE_MS + 'ms ease;filter:brightness(0.82) saturate(0.8) contrast(1.05);';

    //         var old = wr.querySelector('img');
    //         var leaving = wr.querySelector('img[data-lv]');
    //         if (leaving) leaving.remove();

    //         wr.appendChild(ni);

    //         ni.onload = function () {
    //             if (sk) sk.style.display = 'none';
    //             requestAnimationFrame(function () { ni.style.opacity = '1'; });

    //             if (old && old !== ni) {
    //                 old.setAttribute('data-lv', '1');
    //                 old.style.transition = 'opacity ' + FADE_MS + 'ms ease';
    //                 old.style.opacity = '0';
    //                 setTimeout(function () {
    //                     if (old.parentNode) old.remove();
    //                     ni.removeAttribute('style');
    //                 }, FADE_MS + 50);
    //             } else {
    //                 setTimeout(function () { ni.removeAttribute('style'); }, FADE_MS + 50);
    //             }

    //             fl.classList.remove('flash-on');
    //             void fl.offsetWidth;
    //             fl.classList.add('flash-on');
    //         };

    //         ni.onerror = function () { if (ni.parentNode) ni.remove(); };
    //     }

    //     // ============================================================
    //     //  SHUFFLE + SWAP — frame position ও image দুটোই বদলায়
    //     // ============================================================
    //     async function shuffleAndSwap() {
    //         if (busy || allPhotos.length < COUNT) return;
    //         busy = true;

    //         // Step 1: Fade out all frames
    //         frames.forEach(function (f) { f.classList.add('shuffling'); });

    //         // Step 2: Wait for fade out
    //         await new Promise(function (r) { setTimeout(r, 380); });

    //         // Step 3: Shuffle DOM order → CSS nth-child অনুযায়ী নতুন position
    //         var shuffled = shuffle(frames.slice());
    //         shuffled.forEach(function (f) { gallery.appendChild(f); });

    //         // Step 4: Smart assign images based on new slot positions
    //         var candidates = pickRandom(allPhotos, COUNT, shown);
    //         var assigned = await smartAssign(candidates);

    //         // Step 5: Load new images + reset caption
    //         for (var i = 0; i < COUNT; i++) {
    //             if (assigned[i]) {
    //                 shown[i] = null; // reset
    //                 loadInto(i, assigned[i]);
    //             }
    //         }

    //         // Step 6: Fade in with stagger
    //         for (var i = 0; i < COUNT; i++) {
    //             (function (fi) {
    //                 setTimeout(function () {
    //                     frames[fi].classList.remove('shuffling');
    //                 }, fi * 50);
    //             })(i);
    //         }

    //         setTimeout(function () { busy = false; }, COUNT * 50 + FADE_MS + 100);
    //     }

    //     // ============================================================
    //     //  SCROLL REVEAL
    //     // ============================================================
    //     var fObs = new IntersectionObserver(function (entries) {
    //         entries.forEach(function (e) {
    //             if (e.isIntersecting) {
    //                 var i = Array.prototype.indexOf.call(frames, e.target);
    //                 setTimeout(function () { e.target.classList.add('frame-visible'); }, i * 60);
    //                 fObs.unobserve(e.target);
    //             }
    //         });
    //     }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

    //     // ============================================================
    //     //  INIT
    //     // ============================================================
    //     (async function () {
    //         buildGrid();
    //         frames.forEach(function (f) { fObs.observe(f); });

    //         var sb = document.createElement('div');
    //         sb.className = 'gallery-status-bar';
    //         sb.innerHTML = '<div class="gallery-status-left"><span class="gallery-status-dot"></span><span class="gallery-status-text" id="gs-t">Scanning folders...</span></div><span class="gallery-status-right" id="gs-c">—</span>';
    //         gallery.parentElement.insertBefore(sb, gallery);

    //         var gsT = document.getElementById('gs-t');
    //         var gsC = document.getElementById('gs-c');

    //         var scan = await scanAllFolders();

    //         var parts = [];
    //         for (var fname in scan.results) {
    //             if (scan.results[fname].length > 0) parts.push(fname + ': ' + scan.results[fname].length);
    //         }

    //         if (scan.total === 0) {
    //             allPhotos = fallbacks.slice();
    //             gsT.textContent = 'Sample gallery';
    //             gsC.textContent = allPhotos.length + ' photos';
    //         } else {
    //             for (var key in scan.results) allPhotos = allPhotos.concat(scan.results[key]);
    //             gsT.textContent = parts.join(' · ');
    //             gsC.textContent = scan.total + ' photos';
    //         }

    //         while (allPhotos.length < COUNT) {
    //             allPhotos.push(allPhotos[Math.floor(Math.random() * allPhotos.length)]);
    //         }

    //         // Initial smart assignment
    //         var initPhotos = shuffle(allPhotos).slice(0, COUNT);
    //         var initAssigned = await smartAssign(initPhotos);

    //         for (var i = 0; i < COUNT; i++) {
    //             (function (fi) {
    //                 setTimeout(function () { loadInto(fi, initAssigned[fi]); }, fi * 80);
    //             })(i);
    //         }

    //         // Periodic shuffle + swap
    //         if (allPhotos.length >= COUNT) {
    //             setInterval(shuffleAndSwap, SWAP_MS);
    //         }
    //     })();
    // })();


    // === PHOTO GALLERY — PERFECT FILL + DUAL TIMER ===
    // (function initPhotoGallery() {
    //     var gallery = document.getElementById('photo-wall');
    //     if (!gallery) return;

    //     var FOLDERS = [
    //         { name: 'Nature', path: 'photos/nature' },
    //         { name: 'Street', path: 'photos/street' },
    //         { name: 'Architecture', path: 'photos/architecture' },
    //         { name: 'Portrait', path: 'photos/portrait' },
    //         { name: 'Travel', path: 'photos/travel' },
    //         { name: 'Persona', path: 'photos/persona' }
    //     ];

    //     var HF_TOKEN = '';
    //     var MAX_IDX = 50;
    //     var EXTS = ['jpg', 'jpeg', 'png', 'webp'];
    //     var SHUFFLE_MS = 60000;   // frame position — 1 minute
    //     var SWAP_MS = 10000;      // picture inside frame — 10 seconds
    //     var FADE_MS = 550;
    //     var COUNT = 12;
    //     var CIRC = 2 * Math.PI * 26;

    //     var allPhotos = [];
    //     var shown = [];
    //     var frames = [];
    //     var captionCache = {};
    //     var lbIdx = -1;
    //     var busy = false;

    //     // ---- SLOT TYPE per DOM position ----
    //     function getSlotType(domIdx) {
    //         var p = domIdx % 6;
    //         if (p === 0) return 'large';
    //         if (p === 1) return 'wide';
    //         if (p === 2) return 'square';
    //         if (p === 3) return 'tall';
    //         if (p === 4) return 'wide';
    //         return 'square';
    //     }

    //     // ============================================================
    //     //  LIGHTBOX
    //     // ============================================================
    //     var lbOverlay = document.createElement('div');
    //     lbOverlay.setAttribute('id', 'lb-overlay');
    //     lbOverlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(5,7,12,.96);backdrop-filter:blur(30px);opacity:0;visibility:hidden;transition:opacity .45s ease,visibility .45s ease;';
    //     lbOverlay.innerHTML =
    //         '<div id="lb-box" style="position:relative;max-width:92vw;max-height:88vh;">' +
    //         '<button id="lb-x" style="position:absolute;top:-54px;right:0;width:44px;height:44px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.3rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;z-index:5;backdrop-filter:blur(8px);">&#10005;</button>' +
    //         '<div style="position:relative;padding:10px;background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border-radius:18px;border:1px solid rgba(255,255,255,.1);box-shadow:0 40px 100px rgba(0,0,0,.7),0 0 60px rgba(0,212,255,.06);">' +
    //         '<div style="padding:14px;background:rgba(10,15,28,.9);border-radius:10px;border:1px solid rgba(255,255,255,.04);overflow:hidden;">' +
    //         '<img id="lb-img" src="" alt="" style="display:block;max-width:85vw;max-height:78vh;object-fit:contain;border-radius:6px;transition:opacity .3s ease,transform .3s ease;">' +
    //         '</div></div>' +
    //         '<button id="lb-p" style="position:absolute;top:50%;left:-68px;transform:translateY(-50%);width:50px;height:50px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.6rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;backdrop-filter:blur(8px);">&#8249;</button>' +
    //         '<button id="lb-n" style="position:absolute;top:50%;right:-68px;transform:translateY(-50%);width:50px;height:50px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.6rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;backdrop-filter:blur(8px);">&#8250;</button>' +
    //         '<div style="position:absolute;bottom:-44px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;">' +
    //         '<span id="lb-cnt" style="font-family:var(--font-mono);font-size:.8rem;color:#718096;background:rgba(255,255,255,.04);padding:6px 16px;border-radius:20px;border:1px solid rgba(255,255,255,.06);"></span>' +
    //         '<span id="lb-cat" style="font-family:var(--font-mono);font-size:.75rem;color:#00d4ff;opacity:.7;"></span>' +
    //         '</div></div>';
    //     document.body.appendChild(lbOverlay);

    //     var lbImg = document.getElementById('lb-img');
    //     var lbCnt = document.getElementById('lb-cnt');
    //     var lbCat = document.getElementById('lb-cat');
    //     var lbX = document.getElementById('lb-x');
    //     var lbP = document.getElementById('lb-p');
    //     var lbN = document.getElementById('lb-n');

    //     var shutter = document.createElement('div');
    //     shutter.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:10001;pointer-events:none;opacity:0;';
    //     document.body.appendChild(shutter);

    //     function fireShutter() {
    //         shutter.style.transition = 'none'; shutter.style.opacity = '0';
    //         void shutter.offsetWidth;
    //         shutter.style.transition = 'opacity .35s ease'; shutter.style.opacity = '.12';
    //         setTimeout(function () { shutter.style.opacity = '0'; }, 120);
    //     }

    //     lbX.onmouseenter = function () { this.style.background = 'rgba(239,68,68,.15)'; this.style.borderColor = 'rgba(239,68,68,.4)'; this.style.color = '#ef4444'; this.style.transform = 'rotate(90deg) scale(1.1)'; };
    //     lbX.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.06)'; this.style.borderColor = 'rgba(255,255,255,.12)'; this.style.color = '#a0aec0'; this.style.transform = ''; };
    //     lbP.onmouseenter = function () { this.style.background = 'rgba(0,212,255,.12)'; this.style.borderColor = 'rgba(0,212,255,.35)'; this.style.color = '#00d4ff'; };
    //     lbP.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.05)'; this.style.borderColor = 'rgba(255,255,255,.1)'; this.style.color = '#a0aec0'; };
    //     lbN.onmouseenter = function () { this.style.background = 'rgba(0,212,255,.12)'; this.style.borderColor = 'rgba(0,212,255,.35)'; this.style.color = '#00d4ff'; };
    //     lbN.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.05)'; this.style.borderColor = 'rgba(255,255,255,.1)'; this.style.color = '#a0aec0'; };

    //     function openLb(idx) {
    //         if (!shown[idx]) return;
    //         lbIdx = idx; fireShutter();
    //         lbImg.src = shown[idx].src; lbImg.alt = shown[idx].cat;
    //         lbImg.style.opacity = '1'; lbImg.style.transform = '';
    //         lbCnt.textContent = (idx + 1) + ' / ' + COUNT;
    //         lbCat.textContent = shown[idx].cat;
    //         lbOverlay.style.opacity = '1'; lbOverlay.style.visibility = 'visible';
    //         document.body.style.overflow = 'hidden';
    //         if (navigator.vibrate) navigator.vibrate(25);
    //     }

    //     function closeLb() {
    //         lbOverlay.style.opacity = '0'; lbOverlay.style.visibility = 'hidden';
    //         document.body.style.overflow = ''; lbIdx = -1;
    //     }

    //     function navLb(dir) {
    //         if (lbIdx < 0) return;
    //         var ni = lbIdx;
    //         for (var i = 0; i < COUNT; i++) { ni = (ni + dir + COUNT) % COUNT; if (shown[ni]) break; }
    //         if (ni === lbIdx) return;
    //         lbImg.style.opacity = '0';
    //         lbImg.style.transform = dir > 0 ? 'translateX(12px)' : 'translateX(-12px)';
    //         setTimeout(function () {
    //             lbIdx = ni; lbImg.src = shown[ni].src; lbImg.alt = shown[ni].cat;
    //             lbCnt.textContent = (ni + 1) + ' / ' + COUNT;
    //             lbCat.textContent = shown[ni].cat;
    //             lbImg.style.transform = ''; lbImg.style.opacity = '1';
    //         }, 260);
    //     }

    //     lbX.onclick = closeLb;
    //     lbP.onclick = function () { navLb(-1); };
    //     lbN.onclick = function () { navLb(1); };
    //     lbOverlay.addEventListener('click', function (e) { if (e.target === lbOverlay) closeLb(); });
    //     document.addEventListener('keydown', function (e) {
    //         if (lbOverlay.style.visibility !== 'visible') return;
    //         if (e.key === 'Escape') closeLb();
    //         if (e.key === 'ArrowLeft') navLb(-1);
    //         if (e.key === 'ArrowRight') navLb(1);
    //     });
    //     var txS = 0;
    //     lbOverlay.addEventListener('touchstart', function (e) { txS = e.changedTouches[0].screenX; }, { passive: true });
    //     lbOverlay.addEventListener('touchend', function (e) {
    //         var d = txS - e.changedTouches[0].screenX;
    //         if (Math.abs(d) > 60) navLb(d > 0 ? 1 : -1);
    //     }, { passive: true });

    //     // ============================================================
    //     //  SCANNER
    //     // ============================================================
    //     function exists(url) {
    //         return new Promise(function (res) {
    //             var im = new Image();
    //             im.onload = function () { res(true); };
    //             im.onerror = function () { res(false); };
    //             im.src = url;
    //         });
    //     }

    //     function scanFolder(fo) {
    //         return new Promise(function (resolve) {
    //             var found = [], misses = 0, n = 1;
    //             function next() {
    //                 if (n > MAX_IDX || (found.length > 0 && misses >= 5)) { resolve(found); return; }
    //                 var num = n; n++; var ei = 0;
    //                 function tryExt() {
    //                     if (ei >= EXTS.length) { misses++; next(); return; }
    //                     var url = fo.path + '/' + num + '.' + EXTS[ei]; ei++;
    //                     exists(url).then(function (ok) {
    //                         if (ok) { found.push({ src: url, name: fo.name + ' — ' + num, cat: fo.name }); misses = 0; next(); }
    //                         else { tryExt(); }
    //                     });
    //                 }
    //                 tryExt();
    //             }
    //             next();
    //         });
    //     }

    //     async function scanAllFolders() {
    //         var results = {}, total = 0;
    //         for (var i = 0; i < FOLDERS.length; i++) {
    //             var photos = await scanFolder(FOLDERS[i]);
    //             results[FOLDERS[i].name] = photos;
    //             total += photos.length;
    //         }
    //         return { results: results, total: total };
    //     }

    //     var fallbacks = [
    //         { src: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600&h=900&fit=crop', name: 'Mountain', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1431890713044-d71e360a8a0a?w=500&h=500&fit=crop', name: 'Reflection', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=500&fit=crop', name: 'Fields', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=900&fit=crop', name: 'City', cat: 'Street' },
    //         { src: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=500&fit=crop', name: 'Pattern', cat: 'Architecture' },
    //         { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop', name: 'Clouds', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=900&fit=crop', name: 'Forest', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&h=500&fit=crop', name: 'Silhouette', cat: 'Portrait' },
    //         { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=500&fit=crop', name: 'Stars', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop', name: 'Fog', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop', name: 'Sunlight', cat: 'Nature' },
    //         { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop', name: 'Beach', cat: 'Travel' }
    //     ];

    //     function shuffle(a) {
    //         var b = a.slice();
    //         for (var i = b.length - 1; i > 0; i--) {
    //             var j = Math.floor(Math.random() * (i + 1));
    //             var t = b[i]; b[i] = b[j]; b[j] = t;
    //         }
    //         return b;
    //     }

    //     function pickRandom(pool, n, excl) {
    //         var avail = pool.filter(function (p) { return !excl.some(function (e) { return e.src === p.src; }); });
    //         var src = avail.length >= n ? avail : pool;
    //         return shuffle(src).slice(0, n);
    //     }

    //     // ============================================================
    //     //  CAPTIONS
    //     // ============================================================
    //     var poeticLines = {
    //         'Nature': ['Where light meets the earth', 'Silence between the leaves', 'The sky remembers everything'],
    //         'Street': ['Stories written on pavements', 'The city breathes at dusk', 'Life between the buildings'],
    //         'Architecture': ['Geometry of human ambition', 'Lines that define our spaces', 'Where math becomes art'],
    //         'Portrait': ['Eyes that hold universes', 'A moment of being seen', 'Presence captured in light'],
    //         'Travel': ['Footprints in unfamiliar light', 'Somewhere I became someone else', 'Distance made visible'],
    //         'Persona': ['The person behind the code', 'Between the frames of self', 'Unfiltered presence']
    //     };

    //     function smartCaption(photo) {
    //         var lines = poeticLines[photo.cat] || ['A moment captured in light'];
    //         return lines[Math.floor(Math.random() * lines.length)];
    //     }

    //     function imgToBase64(url) {
    //         return new Promise(function (resolve, reject) {
    //             var im = new Image(); im.crossOrigin = 'anonymous';
    //             im.onload = function () {
    //                 var c = document.createElement('canvas');
    //                 var s = Math.min(400 / im.naturalWidth, 400 / im.naturalHeight, 1);
    //                 c.width = Math.round(im.naturalWidth * s); c.height = Math.round(im.naturalHeight * s);
    //                 c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    //                 resolve(c.toDataURL('image/jpeg', .6));
    //             };
    //             im.onerror = reject; im.src = url;
    //         });
    //     }

    //     async function getCaption(photo) {
    //         if (captionCache[photo.src]) return captionCache[photo.src];
    //         if (HF_TOKEN) {
    //             try {
    //                 var b64 = await imgToBase64(photo.src);
    //                 var res = await fetch('https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning', {
    //                     method: 'POST',
    //                     headers: { 'Authorization': 'Bearer ' + HF_TOKEN, 'Content-Type': 'application/json' },
    //                     body: JSON.stringify({ inputs: b64 })
    //                 });
    //                 var data = await res.json();
    //                 if (data && data[0] && data[0].generated_text) {
    //                     var cap = data[0].generated_text.charAt(0).toUpperCase() + data[0].generated_text.slice(1);
    //                     if (cap.length > 5) { captionCache[photo.src] = cap; return cap; }
    //                 }
    //             } catch (e) { }
    //         }
    //         var cap = smartCaption(photo);
    //         captionCache[photo.src] = cap;
    //         return cap;
    //     }

    //     // ============================================================
    //     //  BUILD GRID
    //     // ============================================================
    //     function buildGrid() {
    //         gallery.innerHTML = '';
    //         frames = [];
    //         for (var i = 0; i < COUNT; i++) {
    //             var f = document.createElement('div');
    //             f.className = 'photo-frame';

    //             var sk = document.createElement('div'); sk.className = 'photo-skeleton'; f.appendChild(sk);

    //             var wr = document.createElement('div'); wr.className = 'photo-img-wrap'; f.appendChild(wr);

    //             var fl = document.createElement('div'); fl.className = 'swap-flash'; f.appendChild(fl);

    //             var inf = document.createElement('div'); inf.className = 'photo-info-hover';
    //             inf.innerHTML = '<p class="info-title"></p><p class="info-caption"></p><span class="info-meta">Photography</span>';
    //             f.appendChild(inf);

    //             var rn = document.createElement('div'); rn.className = 'long-press-ring';
    //             rn.innerHTML = '<svg viewBox="0 0 60 60"><circle class="r-bg" cx="30" cy="30" r="26"/><circle class="r-fg" cx="30" cy="30" r="26" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"/></svg>';
    //             f.appendChild(rn);

    //             wireFrame(f, i, rn);
    //             gallery.appendChild(f);
    //             frames.push(f);
    //         }
    //     }

    //     // ============================================================
    //     //  FRAME EVENTS
    //     // ============================================================
    //     function wireFrame(f, idx, ring) {
    //         var rfg = ring.querySelector('.r-fg');
    //         var lpRAF = 0, lpStart = 0, wasLP = false;

    //         f.addEventListener('click', function () {
    //             if (wasLP) { wasLP = false; return; }
    //             if (shown[idx]) openLb(idx);
    //         });

    //         f.addEventListener('mousemove', function (e) {
    //             if (window.innerWidth < 769) return;
    //             var r = f.getBoundingClientRect();
    //             var rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 4;
    //             var ry = ((r.width / 2 - e.clientX + r.left) / (r.width / 2)) * 4;
    //             f.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(6px)';
    //             f.style.transition = 'border-color .4s ease, box-shadow .5s ease';
    //         });

    //         f.addEventListener('mouseleave', function () { f.style.transform = ''; f.style.transition = ''; });

    //         f.addEventListener('mouseenter', function () {
    //             if (shown[idx]) {
    //                 var capEl = f.querySelector('.info-caption');
    //                 if (capEl && !capEl.textContent) {
    //                     getCaption(shown[idx]).then(function (cap) { if (capEl) capEl.textContent = cap; });
    //                 }
    //             }
    //         });

    //         f.addEventListener('touchstart', function () {
    //             if (window.innerWidth >= 769) return;
    //             wasLP = false; lpStart = Date.now();
    //             ring.classList.add('ring-show'); rfg.style.strokeDashoffset = CIRC;
    //             function tick() {
    //                 var p = Math.min((Date.now() - lpStart) / LP_MS, 1);
    //                 rfg.style.strokeDashoffset = CIRC * (1 - p);
    //                 if (p < 1) lpRAF = requestAnimationFrame(tick);
    //                 else { wasLP = true; ring.classList.remove('ring-show'); rfg.style.strokeDashoffset = CIRC; if (shown[idx]) openLb(idx); }
    //             }
    //             lpRAF = requestAnimationFrame(tick);
    //         }, { passive: true });

    //         function stopLP() { cancelAnimationFrame(lpRAF); ring.classList.remove('ring-show'); rfg.style.strokeDashoffset = CIRC; }
    //         f.addEventListener('touchend', function () { stopLP(); setTimeout(function () { wasLP = false; }, 60); }, { passive: true });
    //         f.addEventListener('touchcancel', stopLP, { passive: true });
    //         f.addEventListener('touchmove', stopLP, { passive: true });
    //     }

    //     // ============================================================
    //     //  LOAD IMAGE INTO FRAME — পারফেক্ট fill
    //     // ============================================================
    //     function loadInto(idx, photo) {
    //         var f = frames[idx];
    //         if (!f || !photo) return;

    //         shown[idx] = photo;
    //         var wr = f.querySelector('.photo-img-wrap');
    //         var sk = f.querySelector('.photo-skeleton');
    //         var fl = f.querySelector('.swap-flash');

    //         f.querySelector('.info-title').textContent = photo.cat || '';
    //         f.querySelector('.info-caption').textContent = '';

    //         // নতুন ছবি — absolute, frame এর পুরো width/height কভার করবে
    //         var ni = document.createElement('img');
    //         ni.src = photo.src;
    //         ni.alt = photo.cat || '';
    //         ni.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;opacity:0;z-index:1;transition:opacity ' + FADE_MS + 'ms ease;filter:brightness(.82) saturate(.8) contrast(1.05);';

    //         var old = wr.querySelector('img:not([data-lv])');
    //         var leaving = wr.querySelector('img[data-lv]');
    //         if (leaving) leaving.remove();

    //         wr.appendChild(ni);

    //         ni.onload = function () {
    //             if (sk) sk.style.display = 'none';

    //             // Fade in new
    //             requestAnimationFrame(function () { ni.style.opacity = '1'; });

    //             // Fade out old
    //             if (old) {
    //                 old.setAttribute('data-lv', '1');
    //                 old.style.transition = 'opacity ' + FADE_MS + 'ms ease';
    //                 old.style.opacity = '0';
    //                 setTimeout(function () {
    //                     if (old.parentNode) old.remove();
    //                     ni.removeAttribute('style');
    //                 }, FADE_MS + 50);
    //             } else {
    //                 setTimeout(function () { ni.removeAttribute('style'); }, FADE_MS + 50);
    //             }

    //             // Flash
    //             fl.classList.remove('flash-on');
    //             void fl.offsetWidth;
    //             fl.classList.add('flash-on');
    //         };

    //         ni.onerror = function () { if (ni.parentNode) ni.remove(); };
    //     }

    //     // ============================================================
    //     //  SWAP IMAGES — frame জায়গায় থাকে, শুধু pic বদলায় (10 sec)
    //     // ============================================================
    //     function swapImages() {
    //         if (busy || allPhotos.length < COUNT) return;
    //         busy = true;

    //         var next = pickRandom(allPhotos, COUNT, shown);
    //         for (var i = 0; i < COUNT; i++) {
    //             (function (fi, d) {
    //                 setTimeout(function () { loadInto(fi, next[fi]); }, d);
    //             })(i, i * 80);
    //         }

    //         setTimeout(function () { busy = false; }, COUNT * 80 + FADE_MS + 100);
    //     }

    //     // ============================================================
    //     //  SHUFFLE FRAMES — DOM reorder, frame জায়গা বদলায় (1 min)
    //     // ============================================================
    //     async function shuffleFrames() {
    //         if (busy) return;
    //         busy = true;

    //         // Fade out
    //         frames.forEach(function (f) { f.classList.add('shuffling'); });
    //         await new Promise(function (r) { setTimeout(r, 320); });

    //         // DOM reorder → CSS nth-child অনুযায়ী নতুন position
    //         var shuffled = shuffle(frames.slice());
    //         shuffled.forEach(function (f) { gallery.appendChild(f); });

    //         // Re-sync shown array with new DOM order
    //         var newShown = new Array(COUNT);
    //         for (var i = 0; i < COUNT; i++) {
    //             var oldIdx = frames.indexOf(shuffled[i]);
    //             if (oldIdx >= 0 && shown[oldIdx]) {
    //                 newShown[i] = shown[oldIdx];
    //                 // Update caption element
    //                 shuffled[i].querySelector('.info-title').textContent = shown[oldIdx].cat || '';
    //                 shuffled[i].querySelector('.info-caption').textContent = '';
    //             }
    //         }
    //         shown = newShown;

    //         // Fade in stagger
    //         for (var i = 0; i < COUNT; i++) {
    //             (function (fi) {
    //                 setTimeout(function () { frames[fi].classList.remove('shuffling'); }, fi * 40);
    //             })(i);
    //         }

    //         setTimeout(function () { busy = false; }, COUNT * 40 + 100);
    //     }

    //     // ============================================================
    //     //  SCROLL REVEAL
    //     // ============================================================
    //     var fObs = new IntersectionObserver(function (entries) {
    //         entries.forEach(function (e) {
    //             if (e.isIntersecting) {
    //                 var i = Array.prototype.indexOf.call(frames, e.target);
    //                 if (i < 0) i = 0;
    //                 setTimeout(function () { e.target.classList.add('frame-visible'); }, i * 50);
    //                 fObs.unobserve(e.target);
    //             }
    //         });
    //     }, { threshold: .05, rootMargin: '0px 0px -30px 0px' });

    //     // ============================================================
    //     //  INIT
    //     // ============================================================
    //     (async function () {
    //         buildGrid();
    //         frames.forEach(function (f) { fObs.observe(f); });

    //         var sb = document.createElement('div');
    //         sb.className = 'gallery-status-bar';
    //         sb.innerHTML = '<div class="gallery-status-left"><span class="gallery-status-dot"></span><span class="gallery-status-text" id="gs-t">Scanning folders...</span></div><span class="gallery-status-right" id="gs-c">—</span>';
    //         gallery.parentElement.insertBefore(sb, gallery);

    //         var gsT = document.getElementById('gs-t');
    //         var gsC = document.getElementById('gs-c');

    //         var scan = await scanAllFolders();
    //         var parts = [];
    //         for (var fname in scan.results) {
    //             if (scan.results[fname].length > 0) parts.push(fname + ': ' + scan.results[fname].length);
    //         }

    //         if (scan.total === 0) {
    //             allPhotos = fallbacks.slice();
    //             gsT.textContent = 'Sample gallery';
    //             gsC.textContent = allPhotos.length + ' photos';
    //         } else {
    //             for (var key in scan.results) allPhotos = allPhotos.concat(scan.results[key]);
    //             gsT.textContent = parts.join(' · ');
    //             gsC.textContent = scan.total + ' photos';
    //         }

    //         while (allPhotos.length < COUNT) {
    //             allPhotos.push(allPhotos[Math.floor(Math.random() * allPhotos.length)]);
    //         }

    //         // Initial load
    //         var init = shuffle(allPhotos).slice(0, COUNT);
    //         for (var i = 0; i < COUNT; i++) {
    //             (function (fi) {
    //                 setTimeout(function () { loadInto(fi, init[fi]); }, fi * 70);
    //             })(i);
    //         }

    //         // আলাদা আলাদা timer
    //         setInterval(swapImages, SWAP_MS);    // 10 sec — pic change
    //         setInterval(shuffleFrames, SHUFFLE_MS); // 60 sec — frame move
    //     })();
    // })();
    // === PHOTO GALLERY — STRICT RATIO MATCHING ===
    // (function initPhotoGallery() {
    //     var gallery = document.getElementById('photo-wall');
    //     if (!gallery) return;

    //     var FOLDERS = [
    //         { name: 'Nature', path: 'photos/nature' },
    //         { name: 'Street', path: 'photos/street' },
    //         { name: 'Architecture', path: 'photos/architecture' },
    //         { name: 'Portrait', path: 'photos/portrait' },
    //         { name: 'Travel', path: 'photos/travel' },
    //         { name: 'Persona', path: 'photos/persona' }
    //     ];

    //     var HF_TOKEN = '';
    //     var MAX_IDX = 50;
    //     var EXTS = ['jpg', 'jpeg', 'png', 'webp'];
    //     var SHUFFLE_MS = 60000;
    //     var SWAP_MS = 10000;
    //     var FADE_MS = 550;
    //     var COUNT = 12;
    //     var CIRC = 2 * Math.PI * 26;

    //     var allPhotos = [];
    //     var shown = [];
    //     var frames = [];
    //     var captionCache = {};
    //     var lbIdx = -1;
    //     var busy = false;

    //     // ============================================================
    //     //  SLOT TYPE — CSS grid spans অনুযায়ী frame এর actual ratio
    //     //  6n+1: 2col×2row → 1:1 (large/square)
    //     //  6n+2: 2col×1row → 2:1 (wide/16:9)
    //     //  6n+3: 1col×1row → 1:1 (square)
    //     //  6n+4: 1col×2row → 1:2 (tall/9:16)
    //     //  6n+5: 2col×1row → 2:1 (wide/16:9)
    //     //  6n+6: 1col×1row → 1:1 (square)
    //     // ============================================================
    //     function getSlotType(domIdx) {
    //         var p = domIdx % 6;
    //         if (p === 0) return 'large';   // 1:1 — যেকোনো ratio
    //         if (p === 1) return 'wide';    // 2:1 — শুধু wide ছবি
    //         if (p === 2) return 'square';  // 1:1 — যেকোনো ratio
    //         if (p === 3) return 'tall';    // 1:2 — শুধু tall ছবি
    //         if (p === 4) return 'wide';    // 2:1 — শুধু wide ছবি
    //         return 'square';              // 1:1 — যেকোনো ratio
    //     }

    //     // ============================================================
    //     //  LIGHTBOX
    //     // ============================================================
    //     var lbOverlay = document.createElement('div');
    //     lbOverlay.setAttribute('id', 'lb-overlay');
    //     lbOverlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(5,7,12,.96);backdrop-filter:blur(30px);opacity:0;visibility:hidden;transition:opacity .45s ease,visibility .45s ease;';
    //     lbOverlay.innerHTML =
    //         '<div id="lb-box" style="position:relative;max-width:92vw;max-height:88vh;">' +
    //         '<button id="lb-x" style="position:absolute;top:-54px;right:0;width:44px;height:44px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.3rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;z-index:5;backdrop-filter:blur(8px);">&#10005;</button>' +
    //         '<div style="position:relative;padding:10px;background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border-radius:18px;border:1px solid rgba(255,255,255,.1);box-shadow:0 40px 100px rgba(0,0,0,.7),0 0 60px rgba(0,212,255,.06);">' +
    //         '<div style="padding:14px;background:rgba(10,15,28,.9);border-radius:10px;border:1px solid rgba(255,255,255,.04);overflow:hidden;">' +
    //         '<img id="lb-img" src="" alt="" style="display:block;max-width:85vw;max-height:78vh;object-fit:contain;border-radius:6px;transition:opacity .3s ease,transform .3s ease;">' +
    //         '</div></div>' +
    //         '<button id="lb-p" style="position:absolute;top:50%;left:-68px;transform:translateY(-50%);width:50px;height:50px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.6rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;backdrop-filter:blur(8px);">&#8249;</button>' +
    //         '<button id="lb-n" style="position:absolute;top:50%;right:-68px;transform:translateY(-50%);width:50px;height:50px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.6rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;backdrop-filter:blur(8px);">&#8250;</button>' +
    //         '<div style="position:absolute;bottom:-44px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;">' +
    //         '<span id="lb-cnt" style="font-family:var(--font-mono);font-size:.8rem;color:#718096;background:rgba(255,255,255,.04);padding:6px 16px;border-radius:20px;border:1px solid rgba(255,255,255,.06);"></span>' +
    //         '<span id="lb-cat" style="font-family:var(--font-mono);font-size:.75rem;color:#00d4ff;opacity:.7;"></span>' +
    //         '</div></div>';
    //     document.body.appendChild(lbOverlay);

    //     var lbImg = document.getElementById('lb-img');
    //     var lbCnt = document.getElementById('lb-cnt');
    //     var lbCat = document.getElementById('lb-cat');
    //     var lbX = document.getElementById('lb-x');
    //     var lbP = document.getElementById('lb-p');
    //     var lbN = document.getElementById('lb-n');

    //     var shutter = document.createElement('div');
    //     shutter.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:10001;pointer-events:none;opacity:0;';
    //     document.body.appendChild(shutter);

    //     function fireShutter() {
    //         shutter.style.transition = 'none'; shutter.style.opacity = '0';
    //         void shutter.offsetWidth;
    //         shutter.style.transition = 'opacity .35s ease'; shutter.style.opacity = '.12';
    //         setTimeout(function () { shutter.style.opacity = '0'; }, 120);
    //     }

    //     lbX.onmouseenter = function () { this.style.background = 'rgba(239,68,68,.15)'; this.style.borderColor = 'rgba(239,68,68,.4)'; this.style.color = '#ef4444'; this.style.transform = 'rotate(90deg) scale(1.1)'; };
    //     lbX.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.06)'; this.style.borderColor = 'rgba(255,255,255,.12)'; this.style.color = '#a0aec0'; this.style.transform = ''; };
    //     lbP.onmouseenter = function () { this.style.background = 'rgba(0,212,255,.12)'; this.style.borderColor = 'rgba(0,212,255,.35)'; this.style.color = '#00d4ff'; };
    //     lbP.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.05)'; this.style.borderColor = 'rgba(255,255,255,.1)'; this.style.color = '#a0aec0'; };
    //     lbN.onmouseenter = function () { this.style.background = 'rgba(0,212,255,.12)'; this.style.borderColor = 'rgba(0,212,255,.35)'; this.style.color = '#00d4ff'; };
    //     lbN.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.05)'; this.style.borderColor = 'rgba(255,255,255,.1)'; this.style.color = '#a0aec0'; };

    //     function openLb(idx) {
    //         if (!shown[idx]) return;
    //         lbIdx = idx; fireShutter();
    //         lbImg.src = shown[idx].src; lbImg.alt = shown[idx].cat;
    //         lbImg.style.opacity = '1'; lbImg.style.transform = '';
    //         lbCnt.textContent = (idx + 1) + ' / ' + COUNT;
    //         lbCat.textContent = shown[idx].cat;
    //         lbOverlay.style.opacity = '1'; lbOverlay.style.visibility = 'visible';
    //         document.body.style.overflow = 'hidden';
    //         if (navigator.vibrate) navigator.vibrate(25);
    //     }

    //     function closeLb() {
    //         lbOverlay.style.opacity = '0'; lbOverlay.style.visibility = 'hidden';
    //         document.body.style.overflow = ''; lbIdx = -1;
    //     }

    //     function navLb(dir) {
    //         if (lbIdx < 0) return;
    //         var ni = lbIdx;
    //         for (var i = 0; i < COUNT; i++) { ni = (ni + dir + COUNT) % COUNT; if (shown[ni]) break; }
    //         if (ni === lbIdx) return;
    //         lbImg.style.opacity = '0';
    //         lbImg.style.transform = dir > 0 ? 'translateX(12px)' : 'translateX(-12px)';
    //         setTimeout(function () {
    //             lbIdx = ni; lbImg.src = shown[ni].src; lbImg.alt = shown[ni].cat;
    //             lbCnt.textContent = (ni + 1) + ' / ' + COUNT;
    //             lbCat.textContent = shown[ni].cat;
    //             lbImg.style.transform = ''; lbImg.style.opacity = '1';
    //         }, 260);
    //     }

    //     lbX.onclick = closeLb;
    //     lbP.onclick = function () { navLb(-1); };
    //     lbN.onclick = function () { navLb(1); };
    //     lbOverlay.addEventListener('click', function (e) { if (e.target === lbOverlay) closeLb(); });
    //     document.addEventListener('keydown', function (e) {
    //         if (lbOverlay.style.visibility !== 'visible') return;
    //         if (e.key === 'Escape') closeLb();
    //         if (e.key === 'ArrowLeft') navLb(-1);
    //         if (e.key === 'ArrowRight') navLb(1);
    //     });
    //     var txS = 0;
    //     lbOverlay.addEventListener('touchstart', function (e) { txS = e.changedTouches[0].screenX; }, { passive: true });
    //     lbOverlay.addEventListener('touchend', function (e) {
    //         var d = txS - e.changedTouches[0].screenX;
    //         if (Math.abs(d) > 60) navLb(d > 0 ? 1 : -1);
    //     }, { passive: true });

    //     // ============================================================
    //     //  SCANNER — ratio সহ প্রতিটি ছবির info ক্যাশ করে
    //     // ============================================================
    //     function probe(url) {
    //         return new Promise(function (res) {
    //             var im = new Image();
    //             im.onload = function () {
    //                 var w = im.naturalWidth, h = im.naturalHeight;
    //                 var r = w / h;
    //                 // Thresholds:
    //                 //   wide:  ratio > 1.35  (16:9=1.78, 3:2=1.5 এর উপর)
    //                 //   tall:  ratio < 0.75  (9:16=0.56, 2:3=0.67 এর নিচে)
    //                 //   square: 0.75 থেকে 1.35 এর মধ্যে
    //                 var type = r > 1.35 ? 'wide' : (r < 0.75 ? 'tall' : 'square');
    //                 res({ ok: true, w: w, h: h, ratio: r, type: type });
    //             };
    //             im.onerror = function () { res({ ok: false }); };
    //             im.src = url;
    //         });
    //     }

    //     function scanFolder(fo) {
    //         return new Promise(function (resolve) {
    //             var found = [], misses = 0, n = 1;
    //             function next() {
    //                 if (n > MAX_IDX || (found.length > 0 && misses >= 5)) { resolve(found); return; }
    //                 var num = n; n++; var ei = 0;
    //                 function tryExt() {
    //                     if (ei >= EXTS.length) { misses++; next(); return; }
    //                     var url = fo.path + '/' + num + '.' + EXTS[ei]; ei++;
    //                     probe(url).then(function (info) {
    //                         if (info.ok) {
    //                             found.push({
    //                                 src: url, name: fo.name + ' — ' + num, cat: fo.name,
    //                                 ratio: info.ratio, ratioType: info.type,
    //                                 imgW: info.w, imgH: info.h
    //                             });
    //                             misses = 0; next();
    //                         } else { tryExt(); }
    //                     });
    //                 }
    //                 tryExt();
    //             }
    //             next();
    //         });
    //     }

    //     async function scanAllFolders() {
    //         var results = {}, total = 0;
    //         for (var i = 0; i < FOLDERS.length; i++) {
    //             var photos = await scanFolder(FOLDERS[i]);
    //             results[FOLDERS[i].name] = photos;
    //             total += photos.length;
    //         }
    //         return { results: results, total: total };
    //     }

    //     var fallbacks = [
    //         { src: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600&h=900&fit=crop', name: 'Mountain', cat: 'Nature', ratio: 0.67, ratioType: 'tall' },
    //         { src: 'https://images.unsplash.com/photo-1431890713044-d71e360a8a0a?w=500&h=500&fit=crop', name: 'Reflection', cat: 'Nature', ratio: 1.0, ratioType: 'square' },
    //         { src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=500&fit=crop', name: 'Fields', cat: 'Nature', ratio: 1.6, ratioType: 'wide' },
    //         { src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=900&fit=crop', name: 'City', cat: 'Street', ratio: 0.67, ratioType: 'tall' },
    //         { src: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=500&fit=crop', name: 'Pattern', cat: 'Architecture', ratio: 1.0, ratioType: 'square' },
    //         { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop', name: 'Clouds', cat: 'Nature', ratio: 1.6, ratioType: 'wide' },
    //         { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=900&fit=crop', name: 'Forest', cat: 'Nature', ratio: 0.67, ratioType: 'tall' },
    //         { src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&h=500&fit=crop', name: 'Silhouette', cat: 'Portrait', ratio: 1.0, ratioType: 'square' },
    //         { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=500&fit=crop', name: 'Stars', cat: 'Nature', ratio: 1.6, ratioType: 'wide' },
    //         { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop', name: 'Fog', cat: 'Nature', ratio: 1.6, ratioType: 'wide' },
    //         { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop', name: 'Sunlight', cat: 'Nature', ratio: 1.6, ratioType: 'wide' },
    //         { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop', name: 'Beach', cat: 'Travel', ratio: 1.6, ratioType: 'wide' }
    //     ];

    //     function shuffle(a) {
    //         var b = a.slice();
    //         for (var i = b.length - 1; i > 0; i--) {
    //             var j = Math.floor(Math.random() * (i + 1));
    //             var t = b[i]; b[i] = b[j]; b[j] = t;
    //         }
    //         return b;
    //     }

    //     function pickRandom(pool, n, excl) {
    //         var avail = pool.filter(function (p) {
    //             for (var k = 0; k < excl.length; k++) {
    //                 if (excl[k] && excl[k].src === p.src) return false;
    //             }
    //             return true;
    //         });
    //         var src = avail.length >= n ? avail : pool;
    //         return shuffle(src).slice(0, n);
    //     }

    //     // ============================================================
    //     //  SMART ASSIGN — STRICT RATIO MATCHING
    //     //
    //     //  Rule 1: Wide frame (2:1 ≈ 16:9) → শুধু wide ratio ছবি (>1.35)
    //     //  Rule 2: Tall frame (1:2 ≈ 9:16) → শুধু tall ratio ছবি (<0.75)
    //     //  Rule 3: Square frame (1:1) → যেকোনো ratio (universal fallback)
    //     //  Rule 4: Large frame (1:1) → যেকোনো ratio (second fallback)
    //     //
    //     //  Flow:
    //     //    tall photos → tall frames (strict)
    //     //    wide photos → wide frames (strict)
    //     //    remaining  → square + large frames (any ratio)
    //     // ============================================================
    //     function smartAssign(photos) {
    //         // ছবি আলাদা করো ratio type অনুযায়ী
    //         var tallPhotos = photos.filter(function (p) { return p.ratioType === 'tall'; });
    //         var widePhotos = photos.filter(function (p) { return p.ratioType === 'wide'; });
    //         var otherPhotos = photos.filter(function (p) { return p.ratioType !== 'tall' && p.ratioType !== 'wide'; });

    //         // Frame slots আলাদা করো type অনুযায়ী
    //         var tallSlots = [];
    //         var wideSlots = [];
    //         var anySlots = []; // square + large — যেকোনো ratio

    //         for (var i = 0; i < COUNT; i++) {
    //             var t = getSlotType(i);
    //             if (t === 'tall') tallSlots.push(i);
    //             else if (t === 'wide') wideSlots.push(i);
    //             else anySlots.push(i);
    //         }

    //         var assigned = new Array(COUNT).fill(null);
    //         var usedSrc = {};

    //         function assignList(photoList, slotList) {
    //             for (var i = 0; i < photoList.length && i < slotList.length; i++) {
    //                 if (usedSrc[photoList[i].src]) continue;
    //                 assigned[slotList[i]] = photoList[i];
    //                 usedSrc[photoList[i].src] = true;
    //             }
    //         }

    //         // Step 1: TALL photos → TALL frames only (STRICT)
    //         assignList(tallPhotos, tallSlots);

    //         // Step 2: WIDE photos → WIDE frames only (STRICT)
    //         assignList(widePhotos, wideSlots);

    //         // Step 3: Remaining photos → SQUARE + LARGE frames (ANY ratio)
    //         var remaining = photos.filter(function (p) { return !usedSrc[p.src]; });
    //         assignList(remaining, anySlots);

    //         return assigned;
    //     }

    //     // ============================================================
    //     //  CAPTIONS — ratio + category অনুযায়ী unique
    //     // ============================================================
    //     var captions = {
    //         'Nature': {
    //             wide: ['A horizon stretched beyond what the eye could hold', 'Where the land meets the sky in golden silence', 'Endless green rolling toward the far edge of light', 'The earth unfolds like a map of quiet colors'],
    //             tall: ['Standing at the base of something ancient and tall', 'Looking up — the canopy filters light into ribbons', 'Vertical world — roots reaching down, branches reaching up', 'Height gives perspective — the ground looks different from here'],
    //             square: ['A single frame where nature arranged itself perfectly', 'Details the camera chose — light, texture, stillness', 'The kind of quiet that only exists in untouched places']
    //         },
    //         'Street': {
    //             wide: ['The city unfolds — every block tells a different story', 'Two sides of the street, two different worlds', 'Movement and stillness sharing the same frame'],
    //             tall: ['Looking up between buildings — a slice of sky remains', 'Vertical city — walls of glass reaching for clouds', 'The corridor of daily life — everyone passing through'],
    //             square: ['A moment the street offered without asking', 'Someone walked through this frame and left a story', 'The kind of scene you only see if you stop moving']
    //         },
    //         'Architecture': {
    //             wide: ['Structure repeated — rhythm built in concrete and glass', 'The building stretches — geometry becoming landscape', 'Facade after facade — the city as a design system'],
    //             tall: ['Looking straight up — the building converges to a point', 'Vertical lines pulling the eye toward the sky', 'The height of human ambition, framed'],
    //             square: ['One detail of a building that most people walk past', 'Geometry caught in perfect balance', 'The architect\'s single decision, frozen in a frame']
    //         },
    //         'Portrait': {
    //             wide: ['A person in their environment — context tells the story', 'Not just a face — a whole world around them', 'Wide frame — the subject shares space with their life'],
    //             tall: ['Full presence — head to toe, completely themselves', 'Standing tall — the frame honors their height', 'Vertical portrait — the body tells what the face starts'],
    //             square: ['The face fills the frame — nothing else matters here', 'Eyes meet the lens — a conversation in a square', 'Portrait distilled — just the person, just the moment']
    //         },
    //         'Travel': {
    //             wide: ['A new landscape — the kind that makes you reset', 'Somewhere far — the view that justified the journey', 'Travel wide — the destination spreads out before you'],
    //             tall: ['Looking up in a place you\'ve never been before', 'The vertical dimension of a new world', 'Travel height — climbing, looking, discovering'],
    //             square: ['One square of a place you might never see again', 'Travel snapshot — the moment you decided to take the photo', 'A small frame from a big journey']
    //         },
    //         'Persona': {
    //             wide: ['Not just the person — the space they inhabit', 'My world in a wide frame — this is where I am', 'Self in context — the environment is part of the portrait'],
    //             tall: ['Full height — this is how I actually stand in the world', 'Standing tall — the camera doesn\'t crop who I am', 'Top to bottom — nothing hidden, everything present'],
    //             square: ['Just me — no context needed, no explanation required', 'Self portrait — the simplest frame for the most complex subject', 'Square me — balanced, honest, unfiltered']
    //         }
    //     };

    //     function generateCaption(photo) {
    //         var catCaps = captions[photo.cat];
    //         if (catCaps) {
    //             var typeCaps = catCaps[photo.ratioType];
    //             if (typeCaps && typeCaps.length > 0) {
    //                 return typeCaps[Math.floor(Math.random() * typeCaps.length)];
    //             }
    //         }
    //         return 'The lens found something worth stopping for';
    //     }

    //     function imgToBase64(url) {
    //         return new Promise(function (resolve, reject) {
    //             var im = new Image(); im.crossOrigin = 'anonymous';
    //             im.onload = function () {
    //                 var c = document.createElement('canvas');
    //                 var s = Math.min(400 / im.naturalWidth, 400 / im.naturalHeight, 1);
    //                 c.width = Math.round(im.naturalWidth * s); c.height = Math.round(im.naturalHeight * s);
    //                 c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    //                 resolve(c.toDataURL('image/jpeg', .6));
    //             };
    //             im.onerror = reject; im.src = url;
    //         });
    //     }

    //     async function getCaption(photo) {
    //         if (captionCache[photo.src]) return captionCache[photo.src];
    //         if (HF_TOKEN) {
    //             try {
    //                 var b64 = await imgToBase64(photo.src);
    //                 var res = await fetch('https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning', {
    //                     method: 'POST',
    //                     headers: { 'Authorization': 'Bearer ' + HF_TOKEN, 'Content-Type': 'application/json' },
    //                     body: JSON.stringify({ inputs: b64 })
    //                 });
    //                 var data = await res.json();
    //                 if (data && data[0] && data[0].generated_text) {
    //                     var cap = data[0].generated_text.charAt(0).toUpperCase() + data[0].generated_text.slice(1);
    //                     if (cap.length > 5) { captionCache[photo.src] = cap; return cap; }
    //                 }
    //             } catch (e) { }
    //         }
    //         var cap = generateCaption(photo);
    //         captionCache[photo.src] = cap;
    //         return cap;
    //     }

    //     // ============================================================
    //     //  BUILD GRID
    //     // ============================================================
    //     function buildGrid() {
    //         gallery.innerHTML = '';
    //         frames = [];
    //         for (var i = 0; i < COUNT; i++) {
    //             var f = document.createElement('div');
    //             f.className = 'photo-frame';

    //             var sk = document.createElement('div'); sk.className = 'photo-skeleton'; f.appendChild(sk);
    //             var wr = document.createElement('div'); wr.className = 'photo-img-wrap'; f.appendChild(wr);
    //             var fl = document.createElement('div'); fl.className = 'swap-flash'; f.appendChild(fl);

    //             var inf = document.createElement('div'); inf.className = 'photo-info-hover';
    //             inf.innerHTML = '<p class="info-title"></p><p class="info-caption"></p><span class="info-meta">Photography</span>';
    //             f.appendChild(inf);

    //             var rn = document.createElement('div'); rn.className = 'long-press-ring';
    //             rn.innerHTML = '<svg viewBox="0 0 60 60"><circle class="r-bg" cx="30" cy="30" r="26"/><circle class="r-fg" cx="30" cy="30" r="26" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"/></svg>';
    //             f.appendChild(rn);

    //             wireFrame(f, i, rn);
    //             gallery.appendChild(f);
    //             frames.push(f);
    //         }
    //     }

    //     // ============================================================
    //     //  FRAME EVENTS
    //     // ============================================================
    //     function wireFrame(f, idx, ring) {
    //         var rfg = ring.querySelector('.r-fg');
    //         var lpRAF = 0, lpStart = 0, wasLP = false;

    //         f.addEventListener('click', function () {
    //             if (wasLP) { wasLP = false; return; }
    //             if (shown[idx]) openLb(idx);
    //         });

    //         f.addEventListener('mousemove', function (e) {
    //             if (window.innerWidth < 769) return;
    //             var r = f.getBoundingClientRect();
    //             var rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 4;
    //             var ry = ((r.width / 2 - e.clientX + r.left) / (r.width / 2)) * 4;
    //             f.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(6px)';
    //             f.style.transition = 'border-color .4s ease, box-shadow .5s ease';
    //         });

    //         f.addEventListener('mouseleave', function () { f.style.transform = ''; f.style.transition = ''; });

    //         f.addEventListener('mouseenter', function () {
    //             if (shown[idx]) {
    //                 var capEl = f.querySelector('.info-caption');
    //                 if (capEl && !capEl.textContent) {
    //                     getCaption(shown[idx]).then(function (cap) { if (capEl) capEl.textContent = cap; });
    //                 }
    //             }
    //         });

    //         f.addEventListener('touchstart', function () {
    //             if (window.innerWidth >= 769) return;
    //             wasLP = false; lpStart = Date.now();
    //             ring.classList.add('ring-show'); rfg.style.strokeDashoffset = CIRC;
    //             function tick() {
    //                 var p = Math.min((Date.now() - lpStart) / LP_MS, 1);
    //                 rfg.style.strokeDashoffset = CIRC * (1 - p);
    //                 if (p < 1) lpRAF = requestAnimationFrame(tick);
    //                 else { wasLP = true; ring.classList.remove('ring-show'); rfg.style.strokeDashoffset = CIRC; if (shown[idx]) openLb(idx); }
    //             }
    //             lpRAF = requestAnimationFrame(tick);
    //         }, { passive: true });

    //         function stopLP() { cancelAnimationFrame(lpRAF); ring.classList.remove('ring-show'); rfg.style.strokeDashoffset = CIRC; }
    //         f.addEventListener('touchend', function () { stopLP(); setTimeout(function () { wasLP = false; }, 60); }, { passive: true });
    //         f.addEventListener('touchcancel', stopLP, { passive: true });
    //         f.addEventListener('touchmove', stopLP, { passive: true });
    //     }

    //     // ============================================================
    //     //  LOAD IMAGE INTO FRAME
    //     // ============================================================
    //     function loadInto(idx, photo) {
    //         var f = frames[idx];
    //         if (!f || !photo) return;

    //         shown[idx] = photo;
    //         var wr = f.querySelector('.photo-img-wrap');
    //         var sk = f.querySelector('.photo-skeleton');
    //         var fl = f.querySelector('.swap-flash');

    //         f.querySelector('.info-title').textContent = photo.cat || '';
    //         f.querySelector('.info-caption').textContent = '';

    //         var ni = document.createElement('img');
    //         ni.src = photo.src;
    //         ni.alt = photo.cat || '';
    //         ni.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;opacity:0;z-index:1;transition:opacity ' + FADE_MS + 'ms ease;filter:brightness(.82) saturate(.8) contrast(1.05);';

    //         var old = wr.querySelector('img:not([data-lv])');
    //         var leaving = wr.querySelector('img[data-lv]');
    //         if (leaving) leaving.remove();

    //         wr.appendChild(ni);

    //         ni.onload = function () {
    //             if (sk) sk.style.display = 'none';
    //             requestAnimationFrame(function () { ni.style.opacity = '1'; });
    //             if (old) {
    //                 old.setAttribute('data-lv', '1');
    //                 old.style.transition = 'opacity ' + FADE_MS + 'ms ease';
    //                 old.style.opacity = '0';
    //                 setTimeout(function () { if (old.parentNode) old.remove(); ni.removeAttribute('style'); }, FADE_MS + 50);
    //             } else {
    //                 setTimeout(function () { ni.removeAttribute('style'); }, FADE_MS + 50);
    //             }
    //             fl.classList.remove('flash-on'); void fl.offsetWidth; fl.classList.add('flash-on');
    //         };

    //         ni.onerror = function () { if (ni.parentNode) ni.remove(); };
    //     }

    //     // ============================================================
    //     //  SWAP IMAGES — smart assign by ratio (10 sec)
    //     // ============================================================
    //     function swapImages() {
    //         if (busy || allPhotos.length < COUNT) return;
    //         busy = true;

    //         var candidates = pickRandom(allPhotos, COUNT, shown);
    //         var assigned = smartAssign(candidates);

    //         for (var i = 0; i < COUNT; i++) {
    //             if (assigned[i]) {
    //                 (function (fi, d) {
    //                     setTimeout(function () { loadInto(fi, assigned[fi]); }, d);
    //                 })(i, i * 80);
    //             }
    //         }

    //         setTimeout(function () { busy = false; }, COUNT * 80 + FADE_MS + 100);
    //     }

    //     // ============================================================
    //     //  SHUFFLE FRAMES — DOM reorder (60 sec)
    //     // ============================================================
    //     async function shuffleFrames() {
    //         if (busy) return;
    //         busy = true;

    //         frames.forEach(function (f) { f.classList.add('shuffling'); });
    //         await new Promise(function (r) { setTimeout(r, 320); });

    //         var shuffled = shuffle(frames.slice());
    //         shuffled.forEach(function (f) { gallery.appendChild(f); });

    //         var newShown = new Array(COUNT);
    //         for (var i = 0; i < COUNT; i++) {
    //             var oldIdx = frames.indexOf(shuffled[i]);
    //             if (oldIdx >= 0 && shown[oldIdx]) {
    //                 newShown[i] = shown[oldIdx];
    //                 shuffled[i].querySelector('.info-title').textContent = shown[oldIdx].cat || '';
    //                 shuffled[i].querySelector('.info-caption').textContent = '';
    //             }
    //         }
    //         shown = newShown;

    //         for (var i = 0; i < COUNT; i++) {
    //             (function (fi) {
    //                 setTimeout(function () { frames[fi].classList.remove('shuffling'); }, fi * 40);
    //             })(i);
    //         }

    //         setTimeout(function () { busy = false; }, COUNT * 40 + 100);
    //     }

    //     // ============================================================
    //     //  SCROLL REVEAL
    //     // ============================================================
    //     var fObs = new IntersectionObserver(function (entries) {
    //         entries.forEach(function (e) {
    //             if (e.isIntersecting) {
    //                 var i = Array.prototype.indexOf.call(frames, e.target);
    //                 if (i < 0) i = 0;
    //                 setTimeout(function () { e.target.classList.add('frame-visible'); }, i * 50);
    //                 fObs.unobserve(e.target);
    //             }
    //         });
    //     }, { threshold: .05, rootMargin: '0px 0px -30px 0px' });

    //     // ============================================================
    //     //  INIT
    //     // ============================================================
    //     (async function () {
    //         buildGrid();
    //         frames.forEach(function (f) { fObs.observe(f); });

    //         var sb = document.createElement('div');
    //         sb.className = 'gallery-status-bar';
    //         sb.innerHTML = '<div class="gallery-status-left"><span class="gallery-status-dot"></span><span class="gallery-status-text" id="gs-t">Scanning folders...</span></div><span class="gallery-status-right" id="gs-c">—</span>';
    //         gallery.parentElement.insertBefore(sb, gallery);

    //         var gsT = document.getElementById('gs-t');
    //         var gsC = document.getElementById('gs-c');

    //         var scan = await scanAllFolders();
    //         var parts = [];
    //         for (var fname in scan.results) {
    //             if (scan.results[fname].length > 0) parts.push(fname + ': ' + scan.results[fname].length);
    //         }

    //         if (scan.total === 0) {
    //             allPhotos = fallbacks.slice();
    //             gsT.textContent = 'Sample gallery';
    //             gsC.textContent = allPhotos.length + ' photos';
    //         } else {
    //             for (var key in scan.results) allPhotos = allPhotos.concat(scan.results[key]);
    //             gsT.textContent = parts.join(' · ');
    //             gsC.textContent = scan.total + ' photos';
    //         }

    //         while (allPhotos.length < COUNT) {
    //             allPhotos.push(allPhotos[Math.floor(Math.random() * allPhotos.length)]);
    //         }

    //         // Initial — smart assign by ratio
    //         var initPhotos = shuffle(allPhotos).slice(0, COUNT);
    //         var initAssigned = smartAssign(initPhotos);

    //         for (var i = 0; i < COUNT; i++) {
    //             (function (fi) {
    //                 setTimeout(function () { loadInto(fi, initAssigned[fi]); }, fi * 70);
    //             })(i);
    //         }

    //         setInterval(swapImages, SWAP_MS);
    //         setInterval(shuffleFrames, SHUFFLE_MS);
    //     })();
    // })();

    // === PHOTO GALLERY — STRICT RATIO MATCHING ===
    // === PHOTO GALLERY — STRICT RATIO MATCHING ===
    (function initPhotoGallery() {
        var gallery = document.getElementById('photo-wall');
        if (!gallery) return;

        var FOLDERS = [
            { name: 'Nature', path: 'photos/nature' },
            { name: 'Street', path: 'photos/street' },
            { name: 'Architecture', path: 'photos/architecture' },
            { name: 'Portrait', path: 'photos/portrait' },
            { name: 'Travel', path: 'photos/travel' },
            { name: 'Persona', path: 'photos/persona' }
        ];

        var HF_TOKEN = '';
        var MAX_IDX = 50;
        var EXTS = ['jpg', 'jpeg', 'png', 'webp'];
        var SHUFFLE_MS = 60000;
        var SWAP_MS = 10000;
        var FADE_MS = 550;
        var COUNT = 12;
        var CIRC = 2 * Math.PI * 26;

        var allPhotos = [];
        var shown = [];
        var frames = [];
        var captionCache = {};
        var lbIdx = -1;
        var busy = false;

        function getSlotType(domIdx) {
            var p = domIdx % 6;
            if (p === 0) return 'large';
            if (p === 1) return 'wide';
            if (p === 2) return 'square';
            if (p === 3) return 'tall';
            if (p === 4) return 'wide';
            return 'square';
        }

        // ============================================================
        //  LIGHTBOX
        // ============================================================
        var lbOverlay = document.createElement('div');
        lbOverlay.setAttribute('id', 'lb-overlay');
        lbOverlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(5,7,12,.96);backdrop-filter:blur(30px);opacity:0;visibility:hidden;transition:opacity .45s ease,visibility .45s ease;';
        lbOverlay.innerHTML =
            '<div id="lb-box" style="position:relative;max-width:92vw;max-height:88vh;">' +
            '<button id="lb-x" style="position:absolute;top:-54px;right:0;width:44px;height:44px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.3rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;z-index:5;backdrop-filter:blur(8px);">&#10005;</button>' +
            '<div style="position:relative;padding:10px;background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border-radius:18px;border:1px solid rgba(255,255,255,.1);box-shadow:0 40px 100px rgba(0,0,0,.7),0 0 60px rgba(0,212,255,.06);">' +
            '<div style="padding:14px;background:rgba(10,15,28,.9);border-radius:10px;border:1px solid rgba(255,255,255,.04);overflow:hidden;">' +
            '<img id="lb-img" src="" alt="" style="display:block;max-width:85vw;max-height:78vh;object-fit:contain;border-radius:6px;transition:opacity .3s ease,transform .3s ease;">' +
            '</div></div>' +
            '<button id="lb-p" style="position:absolute;top:50%;left:-68px;transform:translateY(-50%);width:50px;height:50px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.6rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;backdrop-filter:blur(8px);">&#8249;</button>' +
            '<button id="lb-n" style="position:absolute;top:50%;right:-68px;transform:translateY(-50%);width:50px;height:50px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.6rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;backdrop-filter:blur(8px);">&#8250;</button>' +
            '<div style="position:absolute;bottom:-44px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;">' +
            '<span id="lb-cnt" style="font-family:var(--font-mono);font-size:.8rem;color:#718096;background:rgba(255,255,255,.04);padding:6px 16px;border-radius:20px;border:1px solid rgba(255,255,255,.06);"></span>' +
            '<span id="lb-cat" style="font-family:var(--font-mono);font-size:.75rem;color:#00d4ff;opacity:.7;"></span>' +
            '</div></div>';
        document.body.appendChild(lbOverlay);

        var lbImg = document.getElementById('lb-img');
        var lbCnt = document.getElementById('lb-cnt');
        var lbCat = document.getElementById('lb-cat');
        var lbX = document.getElementById('lb-x');
        var lbP = document.getElementById('lb-p');
        var lbN = document.getElementById('lb-n');

        var shutter = document.createElement('div');
        shutter.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:10001;pointer-events:none;opacity:0;';
        document.body.appendChild(shutter);

        function fireShutter() {
            shutter.style.transition = 'none'; shutter.style.opacity = '0';
            void shutter.offsetWidth;
            shutter.style.transition = 'opacity .35s ease'; shutter.style.opacity = '.12';
            setTimeout(function () { shutter.style.opacity = '0'; }, 120);
        }

        lbX.onmouseenter = function () { this.style.background = 'rgba(239,68,68,.15)'; this.style.borderColor = 'rgba(239,68,68,.4)'; this.style.color = '#ef4444'; this.style.transform = 'rotate(90deg) scale(1.1)'; };
        lbX.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.06)'; this.style.borderColor = 'rgba(255,255,255,.12)'; this.style.color = '#a0aec0'; this.style.transform = ''; };
        lbP.onmouseenter = function () { this.style.background = 'rgba(0,212,255,.12)'; this.style.borderColor = 'rgba(0,212,255,.35)'; this.style.color = '#00d4ff'; };
        lbP.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.05)'; this.style.borderColor = 'rgba(255,255,255,.1)'; this.style.color = '#a0aec0'; };
        lbN.onmouseenter = function () { this.style.background = 'rgba(0,212,255,.12)'; this.style.borderColor = 'rgba(0,212,255,.35)'; this.style.color = '#00d4ff'; };
        lbN.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.05)'; this.style.borderColor = 'rgba(255,255,255,.1)'; this.style.color = '#a0aec0'; };

        function openLb(idx) {
            if (!shown[idx]) return;
            lbIdx = idx; fireShutter();
            lbImg.src = shown[idx].src; lbImg.alt = shown[idx].cat;
            lbImg.style.opacity = '1'; lbImg.style.transform = '';
            lbCnt.textContent = (idx + 1) + ' / ' + COUNT;
            lbCat.textContent = shown[idx].cat;
            lbOverlay.style.opacity = '1'; lbOverlay.style.visibility = 'visible';
            document.body.style.overflow = 'hidden';
            if (navigator.vibrate) navigator.vibrate(25);
        }

        function closeLb() {
            lbOverlay.style.opacity = '0'; lbOverlay.style.visibility = 'hidden';
            document.body.style.overflow = ''; lbIdx = -1;
        }

        function navLb(dir) {
            if (lbIdx < 0) return;
            var ni = lbIdx;
            for (var i = 0; i < COUNT; i++) { ni = (ni + dir + COUNT) % COUNT; if (shown[ni]) break; }
            if (ni === lbIdx) return;
            lbImg.style.opacity = '0';
            lbImg.style.transform = dir > 0 ? 'translateX(12px)' : 'translateX(-12px)';
            setTimeout(function () {
                lbIdx = ni; lbImg.src = shown[ni].src; lbImg.alt = shown[ni].cat;
                lbCnt.textContent = (ni + 1) + ' / ' + COUNT;
                lbCat.textContent = shown[ni].cat;
                lbImg.style.transform = ''; lbImg.style.opacity = '1';
            }, 260);
        }

        lbX.onclick = closeLb;
        lbP.onclick = function () { navLb(-1); };
        lbN.onclick = function () { navLb(1); };
        lbOverlay.addEventListener('click', function (e) { if (e.target === lbOverlay) closeLb(); });
        document.addEventListener('keydown', function (e) {
            if (lbOverlay.style.visibility !== 'visible') return;
            if (e.key === 'Escape') closeLb();
            if (e.key === 'ArrowLeft') navLb(-1);
            if (e.key === 'ArrowRight') navLb(1);
        });
        var txS = 0;
        lbOverlay.addEventListener('touchstart', function (e) { txS = e.changedTouches[0].screenX; }, { passive: true });
        lbOverlay.addEventListener('touchend', function (e) {
            var d = txS - e.changedTouches[0].screenX;
            if (Math.abs(d) > 60) navLb(d > 0 ? 1 : -1);
        }, { passive: true });

        // ============================================================
        //  SCANNER — BUG FIXED: im.src ঠিক জাযগায় + TIMEOUT
        // ============================================================
        function probe(url) {
            return new Promise(function (res) {
                var im = new Image();
                var timeout = setTimeout(function () {
                    res({ ok: false });
                    im.src = '';
                }, 8000); // 8 second timeout per image
                im.onload = function () {
                    clearTimeout(timeout);
                    var w = im.naturalWidth;
                    var h = im.naturalHeight;
                    var r = w / h;
                    res({ ok: true, w: w, h: h, ratio: r, type: r > 1.0 ? 'landscape' : 'portrait' });
                };
                im.onerror = function () {
                    clearTimeout(timeout);
                    res({ ok: false });
                };
                im.src = url;
            });
        }

        function scanFolder(fo) {
            return new Promise(function (resolve) {
                var found = [];
                var misses = 0;
                var n = 1;

                function next() {
                    if (n > MAX_IDX || (found.length > 0 && misses >= 5)) {
                        resolve(found);
                        return;
                    }
                    var num = n;
                    n++;
                    var ei = 0;

                    function tryExt() {
                        if (ei >= EXTS.length) {
                            misses++;
                            next();
                            return;
                        }
                        var url = fo.path + '/' + num + '.' + EXTS[ei];
                        ei++;
                        probe(url).then(function (info) {
                            if (info.ok) {
                                found.push({
                                    src: url,
                                    name: fo.name + ' — ' + num,
                                    cat: fo.name,
                                    ratio: info.ratio,
                                    ratioType: info.type,
                                    imgW: info.w,
                                    imgH: info.h
                                });
                                misses = 0;
                                next();
                            } else {
                                tryExt();
                            }
                        });
                    }

                    tryExt();
                }

                next();
            });
        }

        async function scanAllFolders() {
            var results = {};
            var total = 0;
            for (var i = 0; i < FOLDERS.length; i++) {
                var photos = await scanFolder(FOLDERS[i]);
                results[FOLDERS[i].name] = photos;
                total += photos.length;
            }
            return { results: results, total: total };
        }

        var fallbacks = [
            { src: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600&h=900&fit=crop', name: 'Mountain', cat: 'Nature', ratio: 0.667, ratioType: 'portrait' },
            { src: 'https://images.unsplash.com/photo-1431890713044-d71e360a8a0a?w=500&h=500&fit=crop', name: 'Reflection', cat: 'Nature', ratio: 1.0, ratioType: 'landscape' },
            { src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=500&fit=crop', name: 'Fields', cat: 'Nature', ratio: 1.6, ratioType: 'landscape' },
            { src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=900&fit=crop', name: 'City', cat: 'Street', ratio: 0.667, ratioType: 'portrait' },
            { src: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=500&fit=crop', name: 'Pattern', cat: 'Architecture', ratio: 1.0, ratioType: 'landscape' },
            { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop', name: 'Clouds', cat: 'Nature', ratio: 1.6, ratioType: 'landscape' },
            { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=900&fit=crop', name: 'Forest', cat: 'Nature', ratio: 0.667, ratioType: 'portrait' },
            { src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&h=500&fit=crop', name: 'Silhouette', cat: 'Portrait', ratio: 1.0, ratioType: 'landscape' },
            { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=500&fit=crop', name: 'Stars', cat: 'Nature', ratio: 1.6, ratioType: 'landscape' },
            { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop', name: 'Fog', cat: 'Nature', ratio: 1.6, ratioType: 'landscape' },
            { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop', name: 'Sunlight', cat: 'Nature', ratio: 1.6, ratioType: 'landscape' },
            { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop', name: 'Beach', cat: 'Travel', ratio: 1.6, ratioType: 'landscape' }
        ];

        function shuffle(arr) {
            var a = arr.slice();
            for (var i = a.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = a[i];
                a[i] = a[j];
                a[j] = t;
            }
            return a;
        }

        function pickRandom(pool, n, excl) {
            var avail = pool.filter(function (p) {
                for (var k = 0; k < excl.length; k++) {
                    if (excl[k] && excl[k].src === p.src) return false;
                }
                return true;
            });
            var src = avail.length >= n ? avail : pool;
            return shuffle(src).slice(0, n);
        }

        // ============================================================
        //  SMART ASSIGN — STRICT ORIENTATION MATCHING
        // ============================================================
        function smartAssign(photos) {
            var frameList = [];

            for (var i = 0; i < COUNT; i++) {
                var type = getSlotType(i);
                if (type === 'wide') {
                    frameList.push({ idx: i, ratio: 2.0, strict: true, orient: 'landscape' });
                } else if (type === 'tall') {
                    frameList.push({ idx: i, ratio: 0.5, strict: true, orient: 'portrait' });
                } else {
                    frameList.push({ idx: i, ratio: 1.0, strict: false, orient: null });
                }
            }

            frameList.sort(function (a, b) {
                return (b.strict ? 1 : 0) - (a.strict ? 1 : 0);
            });

            var assigned = new Array(COUNT).fill(null);
            var usedSrc = {};
            var pool = photos.slice();

            for (var f = 0; f < frameList.length; f++) {
                var frame = frameList[f];
                if (assigned[frame.idx]) continue;

                var candidates = pool;

                if (frame.orient) {
                    var filtered = [];
                    for (var c = 0; c < pool.length; c++) {
                        if (frame.orient === 'landscape') {
                            if (pool[c].ratio >= 1.0) filtered.push(pool[c]);
                        } else {
                            if (pool[c].ratio <= 1.0) filtered.push(pool[c]);
                        }
                    }
                    if (filtered.length > 0) candidates = filtered;
                }

                var bestPhoto = null;
                var bestDist = Infinity;

                for (var c = 0; c < candidates.length; c++) {
                    if (usedSrc[candidates[c].src]) continue;
                    var dist = Math.abs(candidates[c].ratio - frame.ratio);
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestPhoto = candidates[c];
                    }
                }

                if (bestPhoto) {
                    assigned[frame.idx] = bestPhoto;
                    usedSrc[bestPhoto.src] = true;
                    var newPool = [];
                    for (var p = 0; p < pool.length; p++) {
                        if (pool[p].src !== bestPhoto.src) newPool.push(pool[p]);
                    }
                    pool = newPool;
                }
            }

            for (var i = 0; i < COUNT; i++) {
                if (!assigned[i] && pool.length > 0) {
                    assigned[i] = pool.shift();
                }
            }

            return assigned;
        }

        // ============================================================
        //  CAPTIONS
        // ============================================================
        var captions = {
            'Nature': {
                landscape: ['A horizon stretched beyond what the eye could hold', 'Where the land meets the sky in golden silence', 'Endless green rolling toward the far edge of light', 'The earth unfolds like a map of quiet colors', 'Wide open — the kind of view that makes you stop walking'],
                portrait: ['Standing at the base of something ancient and tall', 'Looking up — the canopy filters light into ribbons', 'Vertical world — roots reaching down, branches reaching up', 'Height gives perspective — the ground looks different from here'],
                square: ['A single frame where nature arranged itself perfectly', 'Details the camera chose — light, texture, stillness', 'The kind of quiet that only exists in untouched places', 'Nature squared — balanced, deliberate, calm']
            },
            'Street': {
                landscape: ['The city unfolds — every block tells a different story', 'Two sides of the street, two different worlds', 'Movement and stillness sharing the same frame', 'Urban panorama — life flowing through concrete veins'],
                portrait: ['Looking up between buildings — a slice of sky remains', 'Vertical city — walls of glass reaching for clouds', 'The corridor of daily life — everyone passing through'],
                square: ['A moment the street offered without asking', 'Someone walked through this frame and left a story', 'The kind of scene you only see if you stop moving', 'Street corner — where directions meet and people pause']
            },
            'Architecture': {
                landscape: ['Structure repeated — rhythm built in concrete and glass', 'The building stretches — geometry becoming landscape', 'Facade after facade — the city as a design system'],
                portrait: ['Looking straight up — the building converges to a point', 'Vertical lines pulling the eye toward the sky', 'Height of human ambition, framed'],
                square: ['One detail of a building most people walk past', 'Geometry caught in perfect balance', "The architect's single decision, frozen in a frame"]
            },
            'Portrait': {
                landscape: ['A person in their environment — context tells the story', 'Not just a face — a whole world around them', 'Wide frame — the subject shares space with their life'],
                portrait: ['Full presence — head to toe, completely themselves', 'Standing tall — the frame honors their height', 'Vertical portrait — the body tells what the face starts'],
                square: ['The face fills the frame — nothing else matters here', 'Eyes meet the lens — a conversation in a square', 'Portrait distilled — just the person, just the moment']
            },
            'Travel': {
                landscape: ['A new landscape — the kind that makes you reset', 'Somewhere far — the view that justified the journey', 'Travel wide — the destination spreads out before you'],
                portrait: ['Looking up in a place you have never been before', 'The vertical dimension of a new world', 'Travel height — climbing, looking, discovering'],
                square: ['One square of a place you might never see again', 'Travel snapshot — the moment you decided to take the photo', 'A small frame from a big journey']
            },
            'Persona': {
                landscape: ['Not just the person — the space they inhabit', 'My world in a wide frame — this is where I am', 'Self in context — the environment is part of the portrait'],
                portrait: ['Full height — this is how I actually stand in the world', 'Standing tall — the camera does not crop who I am', 'Top to bottom — nothing hidden, everything present'],
                square: ['Just me — no context needed, no explanation required', 'Self portrait — the simplest frame for the most complex subject', 'Square me — balanced, honest, unfiltered']
            }
        };

        function generateCaption(photo) {
            var catCaps = captions[photo.cat];
            if (catCaps) {
                var orient = photo.ratio > 1.0 ? 'landscape' : 'portrait';
                var typeCaps = catCaps[orient];
                if (typeCaps && typeCaps.length > 0) {
                    return typeCaps[Math.floor(Math.random() * typeCaps.length)];
                }
            }
            return 'The lens found something worth stopping for';
        }

        function imgToBase64(url) {
            return new Promise(function (resolve, reject) {
                var im = new Image();
                im.crossOrigin = 'anonymous';
                im.onload = function () {
                    var c = document.createElement('canvas');
                    var s = Math.min(400 / im.naturalWidth, 400 / im.naturalHeight, 1);
                    c.width = Math.round(im.naturalWidth * s);
                    c.height = Math.round(im.naturalHeight * s);
                    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
                    resolve(c.toDataURL('image/jpeg', 0.6));
                };
                im.onerror = reject;
                im.src = url;
            });
        }

        async function getCaption(photo) {
            if (captionCache[photo.src]) return captionCache[photo.src];
            if (HF_TOKEN) {
                try {
                    var b64 = await imgToBase64(photo.src);
                    var res = await fetch('https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning', {
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer ' + HF_TOKEN, 'Content-Type': 'application/json' },
                        body: JSON.stringify({ inputs: b64 })
                    });
                    var data = await res.json();
                    if (data && data[0] && data[0].generated_text) {
                        var cap = data[0].generated_text.charAt(0).toUpperCase() + data[0].generated_text.slice(1);
                        if (cap.length > 5) {
                            captionCache[photo.src] = cap;
                            return cap;
                        }
                    }
                } catch (e) { /* fallback */ }
            }
            var cap = generateCaption(photo);
            captionCache[photo.src] = cap;
            return cap;
        }

        // ============================================================
        //  BUILD GRID
        // ============================================================
        function buildGrid() {
            gallery.innerHTML = '';
            frames = [];
            for (var i = 0; i < COUNT; i++) {
                var f = document.createElement('div');
                f.className = 'photo-frame';

                var sk = document.createElement('div');
                sk.className = 'photo-skeleton';
                f.appendChild(sk);

                var wr = document.createElement('div');
                wr.className = 'photo-img-wrap';
                f.appendChild(wr);

                var fl = document.createElement('div');
                fl.className = 'swap-flash';
                f.appendChild(fl);

                var inf = document.createElement('div');
                inf.className = 'photo-info-hover';
                inf.innerHTML = '<p class="info-title"></p><p class="info-caption"></p><span class="info-meta">Photography</span>';
                f.appendChild(inf);

                var rn = document.createElement('div');
                rn.className = 'long-press-ring';
                rn.innerHTML = '<svg viewBox="0 0 60 60"><circle class="r-bg" cx="30" cy="30" r="26"/><circle class="r-fg" cx="30" cy="30" r="26" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"/></svg>';
                f.appendChild(rn);

                wireFrame(f, i, rn);
                gallery.appendChild(f);
                frames.push(f);
            }
        }

        // ============================================================
        //  FRAME EVENTS
        // ============================================================
        function wireFrame(f, idx, ring) {
            var rfg = ring.querySelector('.r-fg');
            var lpRAF = 0;
            var lpStart = 0;
            var wasLP = false;

            f.addEventListener('click', function () {
                if (wasLP) { wasLP = false; return; }
                if (shown[idx]) openLb(idx);
            });

            f.addEventListener('mousemove', function (e) {
                if (window.innerWidth < 769) return;
                var r = f.getBoundingClientRect();
                var rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 4;
                var ry = ((r.width / 2 - e.clientX + r.left) / (r.width / 2)) * 4;
                f.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(6px)';
                f.style.transition = 'border-color .4s ease, box-shadow .5s ease';
            });

            f.addEventListener('mouseleave', function () {
                f.style.transform = '';
                f.style.transition = '';
            });

            f.addEventListener('mouseenter', function () {
                if (shown[idx]) {
                    var capEl = f.querySelector('.info-caption');
                    if (capEl && !capEl.textContent) {
                        getCaption(shown[idx]).then(function (cap) {
                            if (capEl) capEl.textContent = cap;
                        });
                    }
                }
            });

            f.addEventListener('touchstart', function () {
                if (window.innerWidth >= 769) return;
                wasLP = false;
                lpStart = Date.now();
                ring.classList.add('ring-show');
                rfg.style.strokeDashoffset = CIRC;

                function tick() {
                    var p = Math.min((Date.now() - lpStart) / LP_MS, 1);
                    rfg.style.strokeDashoffset = CIRC * (1 - p);
                    if (p < 1) {
                        lpRAF = requestAnimationFrame(tick);
                    } else {
                        wasLP = true;
                        ring.classList.remove('ring-show');
                        rfg.style.strokeDashoffset = CIRC;
                        if (shown[idx]) openLb(idx);
                    }
                }
                lpRAF = requestAnimationFrame(tick);
            }, { passive: true });

            function stopLP() {
                cancelAnimationFrame(lpRAF);
                ring.classList.remove('ring-show');
                rfg.style.strokeDashoffset = CIRC;
            }

            f.addEventListener('touchend', function () {
                stopLP();
                setTimeout(function () { wasLP = false; }, 60);
            }, { passive: true });
            f.addEventListener('touchcancel', stopLP, { passive: true });
            f.addEventListener('touchmove', stopLP, { passive: true });
        }

        // ============================================================
        //  LOAD IMAGE INTO FRAME
        // ============================================================
        function loadInto(idx, photo) {
            var f = frames[idx];
            if (!f || !photo) return;

            shown[idx] = photo;
            var wr = f.querySelector('.photo-img-wrap');
            var sk = f.querySelector('.photo-skeleton');
            var fl = f.querySelector('.swap-flash');

            f.querySelector('.info-title').textContent = photo.cat || '';
            f.querySelector('.info-caption').textContent = '';

            var ni = document.createElement('img');
            ni.src = photo.src;
            ni.alt = photo.cat || '';
            ni.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;opacity:0;z-index:1;transition:opacity ' + FADE_MS + 'ms ease;filter:brightness(.82) saturate(.8) contrast(1.05);';

            var old = wr.querySelector('img:not([data-lv])');
            var leaving = wr.querySelector('img[data-lv]');
            if (leaving) leaving.remove();

            wr.appendChild(ni);

            ni.onload = function () {
                if (sk) sk.style.display = 'none';

                requestAnimationFrame(function () { ni.style.opacity = '1'; });

                if (old) {
                    old.setAttribute('data-lv', '1');
                    old.style.transition = 'opacity ' + FADE_MS + 'ms ease';
                    old.style.opacity = '0';
                    setTimeout(function () {
                        if (old.parentNode) old.remove();
                        ni.removeAttribute('style');
                    }, FADE_MS + 50);
                } else {
                    setTimeout(function () { ni.removeAttribute('style'); }, FADE_MS + 50);
                }

                fl.classList.remove('flash-on');
                void fl.offsetWidth;
                fl.classList.add('flash-on');
            };

            ni.onerror = function () { if (ni.parentNode) ni.remove(); };
        }

        // ============================================================
        //  SWAP IMAGES (10 sec)
        // ============================================================
        function swapImages() {
            if (busy || allPhotos.length < COUNT) return;
            busy = true;

            var candidates = pickRandom(allPhotos, COUNT, shown);
            var assigned = smartAssign(candidates);

            for (var i = 0; i < COUNT; i++) {
                if (assigned[i]) {
                    (function (fi, d) {
                        setTimeout(function () { loadInto(fi, assigned[fi]); }, d);
                    })(i, i * 80);
                }
            }

            setTimeout(function () { busy = false; }, COUNT * 80 + FADE_MS + 100);
        }

        // ============================================================
        //  SHUFFLE FRAMES (60 sec)
        // ============================================================
        async function shuffleFrames() {
            if (busy) return;
            busy = true;

            frames.forEach(function (f) { f.classList.add('shuffling'); });
            await new Promise(function (r) { setTimeout(r, 320); });

            var shuffled = shuffle(frames.slice());
            shuffled.forEach(function (f) { gallery.appendChild(f); });

            var newShown = new Array(COUNT);
            for (var i = 0; i < COUNT; i++) {
                var oldIdx = frames.indexOf(shuffled[i]);
                if (oldIdx >= 0 && shown[oldIdx]) {
                    newShown[i] = shown[oldIdx];
                    shuffled[i].querySelector('.info-title').textContent = shown[oldIdx].cat || '';
                    shuffled[i].querySelector('.info-caption').textContent = '';
                }
            }
            shown = newShown;

            for (var i = 0; i < COUNT; i++) {
                (function (fi) {
                    setTimeout(function () { frames[fi].classList.remove('shuffling'); }, fi * 40);
                })(i);
            }

            setTimeout(function () { busy = false; }, COUNT * 40 + 100);
        }

        // ============================================================
        //  SCROLL REVEAL
        // ============================================================
        var fObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) {
                    var i = Array.prototype.indexOf.call(frames, e.target);
                    if (i < 0) i = 0;
                    setTimeout(function () { e.target.classList.add('frame-visible'); }, i * 50);
                    fObs.unobserve(e.target);
                }
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

        // ============================================================
        //  INIT
        // ============================================================
        (async function () {
            buildGrid();
            frames.forEach(function (f) { fObs.observe(f); });

            var sb = document.createElement('div');
            sb.className = 'gallery-status-bar';
            sb.innerHTML = '<div class="gallery-status-left"><span class="gallery-status-dot"></span><span class="gallery-status-text" id="gs-t">Scanning folders...</span></div><span class="gallery-status-right" id="gs-c">—</span>';
            gallery.parentElement.insertBefore(sb, gallery);

            var gsT = document.getElementById('gs-t');
            var gsC = document.getElementById('gs-c');

            var scan = await scanAllFolders();
            var parts = [];
            for (var fname in scan.results) {
                if (scan.results[fname].length > 0) {
                    parts.push(fname + ': ' + scan.results[fname].length);
                }
            }

            if (scan.total === 0) {
                allPhotos = fallbacks.slice();
                gsT.textContent = 'Sample gallery';
                gsC.textContent = allPhotos.length + ' photos';
            } else {
                for (var key in scan.results) {
                    allPhotos = allPhotos.concat(scan.results[key]);
                }
                gsT.textContent = parts.join(' · ');
                gsC.textContent = scan.total + ' photos';
            }

            while (allPhotos.length < COUNT) {
                allPhotos.push(allPhotos[Math.floor(Math.random() * allPhotos.length)]);
            }

            var initPhotos = shuffle(allPhotos).slice(0, COUNT);
            var initAssigned = smartAssign(initPhotos);

            for (var i = 0; i < COUNT; i++) {
                (function (fi) {
                    setTimeout(function () { loadInto(fi, initAssigned[fi]); }, fi * 70);
                })(i);
            }

            setInterval(swapImages, SWAP_MS);
            setInterval(shuffleFrames, SHUFFLE_MS);
        })();
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
