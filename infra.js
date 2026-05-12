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

    // === PHOTO GALLERY ===
    // (function initPhotoGallery() {
    //     const gallery = document.getElementById('photo-wall');
    //     if (!gallery) return;

    //     // Photo manifest — loads from assets/photos folder
    //     // Each entry: { src, aspect: 'landscape'|'portrait'|'square' }
    //     // In production, scan folder server-side; here we use Unsplash placeholders
    //     // and determine their aspect ratios to assign correct CSS frames.
    //     const photos = [
    //         { src: 'images/photo1.png', aspect: 'landscape' },
    //         { src: 'images/photo2.png', aspect: 'square' },
    //         { src: 'images/photo3.png', aspect: 'portrait' },
    //         { src: 'images/photo4.png', aspect: 'landscape' },
    //         { src: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600&h=900&fit=crop', aspect: 'portrait' },
    //         { src: 'https://images.unsplash.com/photo-1431890713044-d71e360a8a0a?w=500&h=500&fit=crop', aspect: 'square' },
    //         { src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=500&fit=crop', aspect: 'landscape' },
    //         { src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=900&fit=crop', aspect: 'portrait' },
    //         { src: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=500&fit=crop', aspect: 'square' },
    //         { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop', aspect: 'landscape' },
    //         { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=900&fit=crop', aspect: 'portrait' },
    //         { src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&h=500&fit=crop', aspect: 'square' },
    //     ];

    //     // Fisher-Yates shuffle
    //     function shuffle(arr) {
    //         const a = [...arr];
    //         for (let i = a.length - 1; i > 0; i--) {
    //             const j = Math.floor(Math.random() * (i + 1));
    //             [a[i], a[j]] = [a[j], a[i]];
    //         }
    //         return a;
    //     }

    //     // To load from local folder: replace photos[] with dynamic list
    //     // e.g., via fetch('/api/photos') or a pre-generated manifest.js
    //     // Images will auto-detect aspect and fit correct frame via object-fit

    //     let currentBatch = [];
    //     const BATCH_SIZE = 12;

    //     function renderGallery(photoList) {
    //         gallery.innerHTML = '';
    //         photoList.forEach((photo, index) => {
    //             const item = document.createElement('div');
    //             item.className = 'photo-item';
    //             item.setAttribute('data-aspect', photo.aspect);

    //             const img = document.createElement('img');
    //             img.src = photo.src;
    //             img.alt = `Photography ${index + 1}`;
    //             img.loading = 'lazy';
    //             // Ensure landscape images fill landscape frames, portrait fills portrait frames
    //             img.style.objectPosition = 'center center';

    //             item.appendChild(img);
    //             gallery.appendChild(item);
    //         });
    //     }

    //     function loadNextBatch() {
    //         // Pick a fresh unique set of photos, cycling through all
    //         const shuffled = shuffle(photos);
    //         currentBatch = shuffled.slice(0, BATCH_SIZE);
    //         renderGallery(currentBatch);
    //     }

    //     // Initial load
    //     loadNextBatch();

    //     // Rotate every 8 seconds — picks a fresh shuffle so each visible set has unique pics
    //     // and ensures no photo repeats within the same 12-slot display
    //     setInterval(() => {
    //         loadNextBatch();
    //     }, 8000);

    //     // To load from local folder (assets/photos/):
    //     // Replace the photos[] array above with dynamically loaded paths.
    //     // Example:
    //     //   fetch('/assets/photos/manifest.json')
    //     //     .then(r => r.json())
    //     //     .then(list => { photos = list; loadNextBatch(); });
    // })();
    // === PHOTO GALLERY — BULLETPROOF SHUFFLE + PERFECT MOBILE ===
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

        var MAX_IDX = 50;
        var EXTS = ['jpg', 'jpeg', 'png', 'webp'];
        var SWAP_MS = 10000;  // 10 সেকেন্ডে ছবি চেঞ্জ
        var SHUFFLE_MS = 60000; // 1 মিনিটে ফ্রেম লেআউট চেঞ্জ
        var FADE_MS = 550;
        var COUNT = 12;
        var CIRC = 2 * Math.PI * 26;

        var allPhotos = [];
        var landscapePool = [];
        var portraitPool = [];
        var neutralPool = [];

        var shown = [];
        var frames = [];
        var currentLayout = [];
        var lbIdx = -1;
        var busy = false;

        // ============================================================
        //  RESPONSIVE LAYOUT SYSTEM
        // ============================================================
        function getCurrentColumns() {
            if (window.innerWidth >= 1024) return 6;
            if (window.innerWidth >= 768) return 4;
            if (window.innerWidth >= 640) return 3;
            return 2; // Small mobile
        }

        function generateRandomLayout() {
            var cols = getCurrentColumns();
            var chosen = [];

            if (cols >= 3) {
                // 24 cells logic: 3L + W + T = 12
                var templates = [
                    ['large', 'large', 'wide', 'wide', 'wide', 'tall', 'tall', 'tall', 'square', 'square', 'square', 'square'],
                    ['large', 'large', 'large', 'wide', 'tall', 'tall', 'square', 'square', 'square', 'square', 'square', 'square'],
                    ['large', 'wide', 'wide', 'wide', 'wide', 'tall', 'tall', 'tall', 'tall', 'tall', 'square', 'square'],
                    ['large', 'large', 'large', 'large', 'square', 'square', 'square', 'square', 'square', 'square', 'square', 'square']
                ];
                chosen = templates[Math.floor(Math.random() * templates.length)].slice();
                var sizeOrder = { 'large': 1, 'tall': 2, 'wide': 3, 'square': 4 };
                chosen.sort(function (a, b) { return sizeOrder[a] - sizeOrder[b]; });
            } else {
                // 2 Columns Mobile logic: 2 cols × 7 rows = 14 cells
                // Wide(2 cells) + Square(1 cell). W + S = 12 AND 2W + S = 14 => W = 2, S = 10
                var mobileTemplates = [
                    ['wide', 'wide', 'square', 'square', 'square', 'square', 'square', 'square', 'square', 'square', 'square', 'square'],
                    ['wide', 'wide', 'square', 'square', 'square', 'square', 'square', 'square', 'square', 'square', 'square', 'square']
                ];
                chosen = mobileTemplates[Math.floor(Math.random() * mobileTemplates.length)].slice();
                chosen.sort(function (a, b) { return a === 'wide' ? 1 : 2; }); // Wide first for mobile
            }
            return chosen;
        }

        // ============================================================
        //  RATIO POOL SYSTEM
        // ============================================================
        function categorizePhotos() {
            landscapePool = []; portraitPool = []; neutralPool = [];
            for (var i = 0; i < allPhotos.length; i++) {
                var p = allPhotos[i];
                if (p.ratio >= 1.2) landscapePool.push(p);
                else if (p.ratio <= 0.85) portraitPool.push(p);
                else neutralPool.push(p);
            }
            if (landscapePool.length === 0) landscapePool = allPhotos.slice();
            if (portraitPool.length === 0) portraitPool = allPhotos.slice();
            if (neutralPool.length === 0) neutralPool = allPhotos.slice();
        }

        function smartAssign(layoutTypes) {
            var needL = 0, needP = 0, needN = 0;
            for (var i = 0; i < layoutTypes.length; i++) {
                if (layoutTypes[i] === 'large' || layoutTypes[i] === 'wide') needL++;
                else if (layoutTypes[i] === 'tall') needP++;
                else needN++;
            }

            var lSrc = shuffle(landscapePool.slice()).slice(0, needL);
            var pSrc = shuffle(portraitPool.slice()).slice(0, needP);
            var nSrc = shuffle(neutralPool.slice()).slice(0, needN);

            while (lSrc.length < needL) lSrc.push(allPhotos[Math.floor(Math.random() * allPhotos.length)]);
            while (pSrc.length < needP) pSrc.push(allPhotos[Math.floor(Math.random() * allPhotos.length)]);
            while (nSrc.length < needN) nSrc.push(allPhotos[Math.floor(Math.random() * allPhotos.length)]);

            var assigned = [];
            for (var i = 0; i < layoutTypes.length; i++) {
                var type = layoutTypes[i];
                var photo;
                if (type === 'large' || type === 'wide') photo = lSrc.shift();
                else if (type === 'tall') photo = pSrc.shift();
                else photo = nSrc.shift();

                assigned.push({ photo: photo, type: type });
            }
            return assigned;
        }

        // ============================================================
        //  CAPTIONS
        // ============================================================
        var captions = {
            'Nature': { landscape: ['A horizon stretched beyond what the eye could hold', 'Where the land meets the sky in golden silence'], portrait: ['Standing at the base of something ancient and tall', 'Looking up — the canopy filters light into ribbons'], square: ['A single frame where nature arranged itself perfectly', 'Details the camera chose — light, texture, stillness'] },
            'Street': { landscape: ['The city unfolds — every block tells a different story', 'Urban panorama — life flowing through concrete veins'], portrait: ['Looking up between buildings — a slice of sky remains', 'Vertical city — walls of glass reaching for clouds'], square: ['A moment the street offered without asking', 'Someone walked through this frame and left a story'] },
            'Architecture': { landscape: ['Structure repeated — rhythm built in concrete and glass'], portrait: ['Looking straight up — the building converges to a point'], square: ['One detail of a building most people walk past'] },
            'Portrait': { landscape: ['A person in their environment — context tells the story'], portrait: ['Full presence — head to toe, completely themselves'], square: ['The face fills the frame — nothing else matters here'] },
            'Travel': { landscape: ['A new landscape — the kind that makes you reset'], portrait: ['Looking up in a place you have never been before'], square: ['One square of a place you might never see again'] },
            'Persona': { landscape: ['Not just the person — the space they inhabit'], portrait: ['Full height — this is how I actually stand in the world'], square: ['Just me — no context needed, no explanation required'] }
        };

        function generateCaption(photo) {
            var catCaps = captions[photo.cat];
            if (catCaps) {
                var orient = photo.ratio > 1.2 ? 'landscape' : (photo.ratio < 0.85 ? 'portrait' : 'square');
                var typeCaps = catCaps[orient];
                if (typeCaps && typeCaps.length > 0) return typeCaps[Math.floor(Math.random() * typeCaps.length)];
            }
            return 'The lens found something worth stopping for';
        }

        // ============================================================
        //  LIGHTBOX
        // ============================================================
        var lbOverlay = document.createElement('div');
        lbOverlay.setAttribute('id', 'lb-overlay');
        lbOverlay.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(5,7,12,.96);backdrop-filter:blur(30px);opacity:0;visibility:hidden;transition:opacity .45s ease,visibility .45s ease;';
        lbOverlay.innerHTML = '<div id="lb-box" style="position:relative;max-width:92vw;max-height:88vh;"><button id="lb-x" style="position:absolute;top:-54px;right:0;width:44px;height:44px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.3rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;z-index:5;backdrop-filter:blur(8px);">&#10005;</button><div style="position:relative;padding:10px;background:linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.02));border-radius:18px;border:1px solid rgba(255,255,255,.1);box-shadow:0 40px 100px rgba(0,0,0,.7),0 0 60px rgba(0,212,255,.06);"><div style="padding:14px;background:rgba(10,15,28,.9);border-radius:10px;border:1px solid rgba(255,255,255,.04);overflow:hidden;"><img id="lb-img" src="" alt="" style="display:block;max-width:85vw;max-height:78vh;object-fit:contain;border-radius:6px;transition:opacity .3s ease,transform .3s ease;"></div></div><button id="lb-p" style="position:absolute;top:50%;left:-68px;transform:translateY(-50%);width:50px;height:50px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.6rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;backdrop-filter:blur(8px);">&#8249;</button><button id="lb-n" style="position:absolute;top:50%;right:-68px;transform:translateY(-50%);width:50px;height:50px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:50%;color:#a0aec0;cursor:pointer;font-size:1.6rem;display:flex;align-items:center;justify-content:center;transition:all .3s ease;backdrop-filter:blur(8px);">&#8250;</button><div style="position:absolute;bottom:-44px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;"><span id="lb-cnt" style="font-family:var(--font-mono);font-size:.8rem;color:#718096;background:rgba(255,255,255,.04);padding:6px 16px;border-radius:20px;border:1px solid rgba(255,255,255,.06);"></span><span id="lb-cat" style="font-family:var(--font-mono);font-size:.75rem;color:#00d4ff;opacity:.7;"></span></div></div>';
        document.body.appendChild(lbOverlay);

        var lbImg = document.getElementById('lb-img'), lbCnt = document.getElementById('lb-cnt'), lbCat = document.getElementById('lb-cat'), lbX = document.getElementById('lb-x'), lbP = document.getElementById('lb-p'), lbN = document.getElementById('lb-n');
        var shutter = document.createElement('div');
        shutter.style.cssText = 'position:fixed;inset:0;background:#fff;z-index:10001;pointer-events:none;opacity:0;';
        document.body.appendChild(shutter);

        function fireShutter() { shutter.style.transition = 'none'; shutter.style.opacity = '0'; void shutter.offsetWidth; shutter.style.transition = 'opacity .35s ease'; shutter.style.opacity = '.12'; setTimeout(function () { shutter.style.opacity = '0'; }, 120); }
        lbX.onmouseenter = function () { this.style.background = 'rgba(239,68,68,.15)'; this.style.borderColor = 'rgba(239,68,68,.4)'; this.style.color = '#ef4444'; this.style.transform = 'rotate(90deg) scale(1.1)'; };
        lbX.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.06)'; this.style.borderColor = 'rgba(255,255,255,.12)'; this.style.color = '#a0aec0'; this.style.transform = ''; };
        lbP.onmouseenter = function () { this.style.background = 'rgba(0,212,255,.12)'; this.style.borderColor = 'rgba(0,212,255,.35)'; this.style.color = '#00d4ff'; };
        lbP.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.05)'; this.style.borderColor = 'rgba(255,255,255,.1)'; this.style.color = '#a0aec0'; };
        lbN.onmouseenter = function () { this.style.background = 'rgba(0,212,255,.12)'; this.style.borderColor = 'rgba(0,212,255,.35)'; this.style.color = '#00d4ff'; };
        lbN.onmouseleave = function () { this.style.background = 'rgba(255,255,255,.05)'; this.style.borderColor = 'rgba(255,255,255,.1)'; this.style.color = '#a0aec0'; };

        function openLb(idx) { if (!shown[idx]) return; lbIdx = idx; fireShutter(); lbImg.src = shown[idx].src; lbImg.alt = shown[idx].cat; lbImg.style.opacity = '1'; lbImg.style.transform = ''; lbCnt.textContent = (idx + 1) + ' / ' + COUNT; lbCat.textContent = shown[idx].cat; lbOverlay.style.opacity = '1'; lbOverlay.style.visibility = 'visible'; document.body.style.overflow = 'hidden'; if (navigator.vibrate) navigator.vibrate(25); }
        function closeLb() { lbOverlay.style.opacity = '0'; lbOverlay.style.visibility = 'hidden'; document.body.style.overflow = ''; lbIdx = -1; }
        function navLb(dir) { if (lbIdx < 0) return; var ni = lbIdx; for (var i = 0; i < COUNT; i++) { ni = (ni + dir + COUNT) % COUNT; if (shown[ni]) break; } if (ni === lbIdx) return; lbImg.style.opacity = '0'; lbImg.style.transform = dir > 0 ? 'translateX(12px)' : 'translateX(-12px)'; setTimeout(function () { lbIdx = ni; lbImg.src = shown[ni].src; lbImg.alt = shown[ni].cat; lbCnt.textContent = (ni + 1) + ' / ' + COUNT; lbCat.textContent = shown[ni].cat; lbImg.style.transform = ''; lbImg.style.opacity = '1'; }, 260); }

        lbX.onclick = closeLb; lbP.onclick = function () { navLb(-1); }; lbN.onclick = function () { navLb(1); };
        lbOverlay.addEventListener('click', function (e) { if (e.target === lbOverlay) closeLb(); });
        document.addEventListener('keydown', function (e) { if (lbOverlay.style.visibility !== 'visible') return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') navLb(-1); if (e.key === 'ArrowRight') navLb(1); });
        var txS = 0;
        lbOverlay.addEventListener('touchstart', function (e) { txS = e.changedTouches[0].screenX; }, { passive: true });
        lbOverlay.addEventListener('touchend', function (e) { var d = txS - e.changedTouches[0].screenX; if (Math.abs(d) > 60) navLb(d > 0 ? 1 : -1); }, { passive: true });

        // ============================================================
        //  SCANNER
        // ============================================================
        function probe(url) { return new Promise(function (res) { var im = new Image(); im.onload = function () { var r = im.naturalWidth / im.naturalHeight; res({ ok: true, ratio: r }); }; im.onerror = function () { res({ ok: false }); }; im.src = url; }); }
        function scanFolder(fo) { return new Promise(function (resolve) { var found = [], misses = 0, n = 1; function next() { if (n > MAX_IDX || (found.length > 0 && misses >= 5)) { resolve(found); return; } var num = n; n++; var ei = 0; function tryExt() { if (ei >= EXTS.length) { misses++; next(); return; } var url = fo.path + '/' + num + '.' + EXTS[ei]; ei++; probe(url).then(function (info) { if (info.ok) { found.push({ src: url, name: fo.name + ' — ' + num, cat: fo.name, ratio: info.ratio }); misses = 0; next(); } else { tryExt(); } }); } tryExt(); } next(); }); }
        async function scanAllFolders() { var results = {}, total = 0; for (var i = 0; i < FOLDERS.length; i++) { var photos = await scanFolder(FOLDERS[i]); results[FOLDERS[i].name] = photos; total += photos.length; } return { results: results, total: total }; }

        var fallbacks = [
            { src: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600&h=900&fit=crop', name: 'Mountain', cat: 'Nature', ratio: 0.667 },
            { src: 'https://images.unsplash.com/photo-1431890713044-d71e360a8a0a?w=500&h=500&fit=crop', name: 'Reflection', cat: 'Nature', ratio: 1.0 },
            { src: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=500&fit=crop', name: 'Fields', cat: 'Nature', ratio: 1.6 },
            { src: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=900&fit=crop', name: 'City', cat: 'Street', ratio: 0.667 },
            { src: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=500&h=500&fit=crop', name: 'Pattern', cat: 'Architecture', ratio: 1.0 },
            { src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop', name: 'Clouds', cat: 'Nature', ratio: 1.6 },
            { src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&h=900&fit=crop', name: 'Forest', cat: 'Nature', ratio: 0.667 },
            { src: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=500&h=500&fit=crop', name: 'Silhouette', cat: 'Portrait', ratio: 1.0 },
            { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=500&fit=crop', name: 'Stars', cat: 'Nature', ratio: 1.6 },
            { src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=500&fit=crop', name: 'Fog', cat: 'Nature', ratio: 1.6 },
            { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop', name: 'Sunlight', cat: 'Nature', ratio: 1.6 },
            { src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop', name: 'Beach', cat: 'Travel', ratio: 1.6 }
        ];

        function shuffle(arr) { var a = arr.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

        // ============================================================
        //  BUILD GRID
        // ============================================================
        function buildGrid() {
            gallery.innerHTML = ''; frames = [];
            for (var i = 0; i < COUNT; i++) {
                var f = document.createElement('div'); f.className = 'photo-frame';
                var sk = document.createElement('div'); sk.className = 'photo-skeleton'; f.appendChild(sk);
                var wr = document.createElement('div'); wr.className = 'photo-img-wrap'; f.appendChild(wr);
                var fl = document.createElement('div'); fl.className = 'swap-flash'; f.appendChild(fl);
                var inf = document.createElement('div'); inf.className = 'photo-info-hover';
                inf.innerHTML = '<p class="info-title"></p><p class="info-caption"></p><span class="info-meta">Photography</span>';
                f.appendChild(inf);
                var rn = document.createElement('div'); rn.className = 'long-press-ring'; rn.innerHTML = '<svg viewBox="0 0 60 60"><circle class="r-bg" cx="30" cy="30" r="26"/><circle class="r-fg" cx="30" cy="30" r="26" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"/></svg>'; f.appendChild(rn);
                wireFrame(f, i, rn); gallery.appendChild(f); frames.push(f);
            }
        }

        // ============================================================
        //  FRAME EVENTS
        // ============================================================
        function wireFrame(f, idx, ring) {
            var rfg = ring.querySelector('.r-fg'), lpRAF = 0, lpStart = 0, wasLP = false;
            f.addEventListener('click', function () { if (wasLP) { wasLP = false; return; } if (shown[idx]) openLb(idx); });
            f.addEventListener('mousemove', function (e) { if (window.innerWidth < 769) return; var r = f.getBoundingClientRect(); var rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 4; var ry = ((r.width / 2 - e.clientX + r.left) / (r.width / 2)) * 4; f.style.transform = 'perspective(800px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(6px)'; f.style.transition = 'border-color .4s ease, box-shadow .5s ease'; });
            f.addEventListener('mouseleave', function () { f.style.transform = ''; f.style.transition = ''; });
            f.addEventListener('mouseenter', function () { if (shown[idx]) { var capEl = f.querySelector('.info-caption'); if (capEl && !capEl.textContent) { var cap = generateCaption(shown[idx]); capEl.textContent = cap; } } });
            f.addEventListener('touchstart', function () { if (window.innerWidth >= 769) return; wasLP = false; lpStart = Date.now(); ring.classList.add('ring-show'); rfg.style.strokeDashoffset = CIRC; function tick() { var p = Math.min((Date.now() - lpStart) / 5000, 1); rfg.style.strokeDashoffset = CIRC * (1 - p); if (p < 1) { lpRAF = requestAnimationFrame(tick); } else { wasLP = true; ring.classList.remove('ring-show'); rfg.style.strokeDashoffset = CIRC; if (shown[idx]) openLb(idx); } } lpRAF = requestAnimationFrame(tick); }, { passive: true });
            function stopLP() { cancelAnimationFrame(lpRAF); ring.classList.remove('ring-show'); rfg.style.strokeDashoffset = CIRC; }
            f.addEventListener('touchend', function () { stopLP(); setTimeout(function () { wasLP = false; }, 60); }, { passive: true });
            f.addEventListener('touchcancel', stopLP, { passive: true }); f.addEventListener('touchmove', stopLP, { passive: true });
        }

        // ============================================================
        //  LOAD IMAGE INTO FRAME
        // ============================================================
        function loadInto(idx, photo, frameType) {
            var f = frames[idx]; if (!f || !photo) return;
            shown[idx] = photo;
            var wr = f.querySelector('.photo-img-wrap'), sk = f.querySelector('.photo-skeleton'), fl = f.querySelector('.swap-flash');

            f.classList.remove('frame-large', 'frame-wide', 'frame-tall', 'frame-square');
            f.classList.add('frame-visible', 'frame-' + frameType);

            f.querySelector('.info-title').textContent = photo.cat || '';
            f.querySelector('.info-caption').textContent = '';

            var ni = document.createElement('img'); ni.src = photo.src; ni.alt = photo.cat || '';
            ni.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;opacity:0;z-index:1;transition:opacity ' + FADE_MS + 'ms ease;filter:brightness(.82) saturate(.8) contrast(1.05);';

            var old = wr.querySelector('img:not([data-lv])'); var leaving = wr.querySelector('img[data-lv]'); if (leaving) leaving.remove();
            wr.appendChild(ni);

            ni.onload = function () {
                if (sk) sk.style.display = 'none';
                requestAnimationFrame(function () { ni.style.opacity = '1'; });
                if (old) { old.setAttribute('data-lv', '1'); old.style.transition = 'opacity ' + FADE_MS + 'ms ease'; old.style.opacity = '0'; setTimeout(function () { if (old.parentNode) old.remove(); ni.removeAttribute('style'); }, FADE_MS + 50); }
                else { setTimeout(function () { ni.removeAttribute('style'); }, FADE_MS + 50); }
                fl.classList.remove('flash-on'); void fl.offsetWidth; fl.classList.add('flash-on');
            };
            ni.onerror = function () { if (ni.parentNode) ni.remove(); };
        }

        // ============================================================
        //  SWAP IMAGES (10 sec)
        // ============================================================
        function swapImages() {
            if (busy) return;
            busy = true;
            var assigned = smartAssign(currentLayout);
            for (var i = 0; i < COUNT; i++) { if (assigned[i]) { (function (fi, d) { setTimeout(function () { loadInto(fi, assigned[fi].photo, assigned[fi].type); }, d); })(i, i * 80); } }
            setTimeout(function () { busy = false; }, COUNT * 80 + FADE_MS + 100);
        }

        // ============================================================
        //  SHUFFLE LAYOUT (60 sec) — SMART RETRY BUG FIX
        // ============================================================
        function shuffleLayout() {
            // SMART RETRY: If busy with 10s swap, wait 1 sec and try again. Never miss 1 min shuffle!
            if (busy) {
                setTimeout(shuffleLayout, 1000);
                return;
            }
            busy = true;

            // 1. Fade out all frames instantly
            for (var i = 0; i < COUNT; i++) { frames[i].classList.add('shuffling'); }

            // 2. Wait for fade out, then change layout
            setTimeout(function () {
                currentLayout = generateRandomLayout();
                var assigned = smartAssign(currentLayout);

                for (var i = 0; i < COUNT; i++) {
                    if (assigned[i]) {
                        loadInto(i, assigned[i].photo, assigned[i].type);
                    }
                }

                // Force DOM Reflow
                void gallery.offsetHeight;

                // 3. Fade in with stagger
                for (var i = 0; i < COUNT; i++) {
                    (function (fi) {
                        setTimeout(function () { frames[fi].classList.remove('shuffling'); }, fi * 50);
                    })(i);
                }

                setTimeout(function () { busy = false; }, COUNT * 50 + 600);

            }, 450); // Wait for CSS fade out
        }

        // ============================================================
        //  INIT
        // ============================================================
        var fObs = new IntersectionObserver(function (entries) { entries.forEach(function (e) { if (e.isIntersecting) { var i = Array.prototype.indexOf.call(frames, e.target); if (i < 0) i = 0; setTimeout(function () { e.target.classList.add('frame-visible'); }, i * 50); fObs.unobserve(e.target); } }); }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

        (async function () {
            buildGrid(); frames.forEach(function (f) { fObs.observe(f); });
            var sb = document.createElement('div'); sb.className = 'gallery-status-bar'; sb.innerHTML = '<div class="gallery-status-left"><span class="gallery-status-dot"></span><span class="gallery-status-text" id="gs-t">Scanning folders...</span></div><span class="gallery-status-right" id="gs-c">—</span>'; gallery.parentElement.insertBefore(sb, gallery);
            var gsT = document.getElementById('gs-t'), gsC = document.getElementById('gs-c');
            var scan = await scanAllFolders(); var parts = [];
            for (var fname in scan.results) { if (scan.results[fname].length > 0) parts.push(fname + ': ' + scan.results[fname].length); }
            if (scan.total === 0) { allPhotos = fallbacks.slice(); gsT.textContent = 'Sample gallery'; gsC.textContent = allPhotos.length + ' photos'; }
            else { for (var key in scan.results) { allPhotos = allPhotos.concat(scan.results[key]); } gsT.textContent = parts.join(' · '); gsC.textContent = scan.total + ' photos'; }
            while (allPhotos.length < COUNT) { allPhotos.push(allPhotos[Math.floor(Math.random() * allPhotos.length)]); }

            categorizePhotos();

            currentLayout = generateRandomLayout();
            var initAssigned = smartAssign(currentLayout);
            for (var i = 0; i < COUNT; i++) { (function (fi) { setTimeout(function () { loadInto(fi, initAssigned[fi].photo, initAssigned[fi].type); }, fi * 70); })(i); }

            setInterval(swapImages, SWAP_MS);
            setInterval(shuffleLayout, SHUFFLE_MS);

            // Handle Screen Resize dynamically
            var resizeTimer;
            window.addEventListener('resize', function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    shuffleLayout();
                }, 300);
            });
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
