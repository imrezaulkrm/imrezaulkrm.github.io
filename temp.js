        /* ═══════════ STATE ═══════════ */
        let myPeer = null, isHost = false, roomPass = "", roomId = "";
        let ytPlayer = null, ytReady = false, playerReady = false, isSyncing = false;
        let connections = [], viewerCount = 1, users = [];
        let myName = "User_" + Math.floor(Math.random() * 9000 + 1000);
        let playlist = [], currentPlIndex = -1, currentVideoUrl = "";
        let screenStream = null, localStream = null, currentCalls = [];
        let currentMode = "none", lpHideTimer = null;

        const ICE_SERVERS = {
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" },
                { urls: "stun:stun2.l.google.com:19302" }, { urls: "stun:stun3.l.google.com:19302" },
                { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
                { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
                { urls: "turn:openrelay.metered.ca:443?transport=tcp", username: "openrelayproject", credential: "openrelayproject" }
            ]
        };

        /* ═══════════ YT API ═══════════ */
        window.onYouTubeIframeAPIReady = () => { ytReady = true };
        (function () { const s = document.createElement('script'); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s) })();

        /* ═══════════ UTILS ═══════════ */
        function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") }
        function toast(m, t = "") { const e = document.getElementById('toast'); e.textContent = m; e.className = 'show ' + t; clearTimeout(e._to); e._to = setTimeout(() => e.className = '', 3200) }
        function connOverlay(s, m = "") { const e = document.getElementById('conn-overlay'); e.style.display = s ? 'flex' : 'none'; if (m) document.getElementById('conn-msg').textContent = m }
        function setConnStatus(c) { document.getElementById('conn-dot').className = 'conn-dot ' + (c ? 'on' : 'off'); document.getElementById('conn-text').textContent = c ? 'Connected' : 'Offline'; document.getElementById('conn-text').style.color = c ? 'var(--g)' : 'var(--mu)' }
        function waitYT(cb) { if (ytReady) { cb(); return } const t = setInterval(() => { if (ytReady) { clearInterval(t); cb() } }, 150) }
        function extractYTId(u) { const m = u.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/); return m ? m[1] : null }
        function isYTUrl(u) { return /youtube\.com|youtu\.be/.test(u) }
        function isDirectVideoUrl(u) { return /\.(mp4|webm|ogg|mkv|m3u8)(\?.*)?$/i.test(u) }
        function normalizeUrl(u) { u = u.trim(); if (!u) return ""; if (!/^https?:\/\//i.test(u)) u = "https://" + u; return u }
        function fmtTime(s) { if (isNaN(s)) return "0:00"; const m = Math.floor(s / 60), sc = Math.floor(s % 60), h = Math.floor(s / 3600); return h > 0 ? h + ":" + String(m % 60).padStart(2, '0') + ":" + String(sc).padStart(2, '0') : m + ":" + String(sc).padStart(2, '0') }

        /* ═══════════ VIDEO MANAGEMENT ═══════════ */
        function hideAllPlayers() {
            document.getElementById('yt-container').classList.add('vid-hidden');
            document.getElementById('iframe-container').classList.add('vid-hidden');
            document.getElementById('screen-video').classList.add('vid-hidden');
            document.getElementById('local-video').classList.add('vid-hidden');
            document.getElementById('lp-overlay').classList.add('lp-hide');
            document.getElementById('vid-placeholder').style.display = 'none';
            document.getElementById('live-badge').style.display = 'none';
            document.getElementById('share-indicator').style.display = 'none';
            document.getElementById('unmute-overlay').style.display = 'none';
            document.getElementById('fs-btn').style.display = 'none';
            playerReady = false;
        }
        function showPlaceholder() { hideAllPlayers(); document.getElementById('vid-placeholder').style.display = 'flex'; currentMode = "none" }

        function goToUrl() { const r = document.getElementById('url-input').value.trim(); if (!r) return toast("URL লেখো!", "err"); const u = normalizeUrl(r); stopScreenShare(); currentVideoUrl = u; loadAnyUrl(u); broadcast({ type: "load_url", url: u }) }

        function loadYouTube(v) {
            const id = extractYTId(v); if (!id) { toast("YouTube ID পাওয়া যায়নি", "err"); return }
            hideAllPlayers(); currentMode = "youtube";
            const c = document.getElementById('yt-container'); c.classList.remove('vid-hidden'); c.innerHTML = '<div id="yt-player"></div>';
            document.getElementById('fs-btn').style.display = 'flex';
            if (isHost) document.getElementById('lp-overlay').classList.remove('lp-hide');
            waitYT(() => {
                ytPlayer = new YT.Player('yt-player', {
                    videoId: id, playerVars: { autoplay: 1, controls: 0, disablekb: 1, rel: 0, modestbranding: 1, origin: "https://www.youtube.com" },
                    events: {
                        onReady: () => { playerReady = true; ytPlayer.playVideo(); toast("YouTube ভিডিও লোড হয়েছে", "ok") },
                        onStateChange: e => { if (!isHost || isSyncing) return; if (e.data === YT.PlayerState.PLAYING) broadcast({ type: "play", time: ytPlayer.getCurrentTime() }); else if (e.data === YT.PlayerState.PAUSED) broadcast({ type: "pause", time: ytPlayer.getCurrentTime() }); else if (e.data === YT.PlayerState.ENDED) playNextInPlaylist() }
                    }
                });
            });
        }

        function loadIframe(u) { hideAllPlayers(); currentMode = "iframe"; document.getElementById('iframe-container').classList.remove('vid-hidden'); document.getElementById('site-frame').src = u; document.getElementById('fs-btn').style.display = 'flex'; toast("Site লোড হচ্ছে। যদি কাজ না করে, Screen Share ব্যবহার করো!", "err"); }

        function loadDirectVideo(u) {
            hideAllPlayers(); currentMode = "local";
            const v = document.getElementById('local-video'); v.classList.remove('vid-hidden'); v.src = u;
            document.getElementById('fs-btn').style.display = 'flex';
            if (isHost) document.getElementById('lp-overlay').classList.remove('lp-hide');
            v.loop = false; v.playbackRate = 1; v.volume = 1;
            document.getElementById('lp-loop').classList.remove('lp-on');
            document.getElementById('lp-spd').value = '1';
            document.getElementById('lp-vol').value = 1;
            document.getElementById('lp-mute').textContent = '🔊';
            toast("Video URL লোড হচ্ছে", "ok");

            if (isHost) {
                v.onplay = () => { broadcast({ type: "play", time: v.currentTime }) };
                v.onpause = () => { broadcast({ type: "pause", time: v.currentTime }) };
                v.onended = () => { playNextInPlaylist() };
            }
            v.play().catch(() => {});
        }

        function loadAnyUrl(u) {
            if (isYTUrl(u)) waitYT(() => loadYouTube(u));
            else if (isDirectVideoUrl(u)) loadDirectVideo(u);
            else loadIframe(u);
        }

        function applyState(d) {
            if (currentMode === "youtube" && playerReady && ytPlayer) { isSyncing = true; try { if (ytPlayer.getCurrentTime) { if (Math.abs(ytPlayer.getCurrentTime() - d.time) > 1.5) ytPlayer.seekTo(d.time, true); if (d.type === "play") ytPlayer.playVideo(); else ytPlayer.pauseVideo() } } catch (e) { } setTimeout(() => { isSyncing = false }, 600) }
            if (currentMode === "local") { const v = document.getElementById('local-video'); if (Math.abs(v.currentTime - d.time) > 1.5) v.currentTime = d.time; if (d.type === "play") v.play(); else v.pause() }
        }

        /* ═══════════ SCREEN SHARE ═══════════ */
        async function startScreenShare() {
            if (!isHost) return toast("শুধুমাত্র Host স্ক্রিন শেয়ার করতে পারে", "err");
            try {
                try {
                    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                } catch (e) {
                    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                }
                
                if (screenStream.getAudioTracks().length === 0) {
                    toast("⚠️ Audio Share হয়নি! 'Chrome Tab' সিলেক্ট করে 'Share audio' টিক দিন।", "err");
                }

                hideAllPlayers(); currentMode = "screen";
                document.getElementById('share-indicator').style.display = 'flex'; document.getElementById('live-badge').style.display = 'block';
                document.getElementById('btn-start-share').style.display = 'none'; document.getElementById('btn-stop-share').style.display = 'flex';
                connections.forEach(c => { try { const call = myPeer.call(c.peer, screenStream); currentCalls.push(call) } catch (e) { } });
                toast("স্ক্রিন শেয়ার শুরু!", "ok"); sysMsg("Host স্ক্রিন শেয়ার শুরু করেছেন 🖥️"); broadcast({ type: "screen_start" });
                screenStream.getVideoTracks()[0].onended = () => stopScreenShare();
            } catch (e) { toast("স্ক্রিন শেয়ার বাতিল", "err") }
        }

        function stopScreenShare() {
            if (screenStream) { screenStream.getTracks().forEach(t => t.stop()); screenStream = null }
            currentCalls.forEach(c => { try { c.close() } catch (e) { } }); currentCalls = [];
            document.getElementById('btn-start-share').style.display = 'flex'; document.getElementById('btn-stop-share').style.display = 'none';
            broadcast({ type: "screen_stop" }); sysMsg("Host স্ক্রিন শেয়ার বন্ধ করেছেন");
            if (currentVideoUrl) { loadAnyUrl(currentVideoUrl) } else showPlaceholder();
        }

        function setupCallListener() {
            myPeer.on('call', call => {
                call.answer();
                call.on('stream', rs => {
                    hideAllPlayers(); currentMode = "screen";
                    const v = document.getElementById('screen-video'); v.classList.remove('vid-hidden'); v.srcObject = rs;
                    document.getElementById('live-badge').style.display = 'block'; document.getElementById('fs-btn').style.display = 'flex';
                    v.play().catch(() => { document.getElementById('unmute-overlay').style.display = 'flex' });
                    toast("Host এর স্ক্রিন দেখা যাচ্ছে", "ok");
                });
                call.on('close', () => {
                    const v = document.getElementById('screen-video'); v.classList.add('vid-hidden'); v.srcObject = null;
                    document.getElementById('live-badge').style.display = 'none'; document.getElementById('fs-btn').style.display = 'none';
                    if (currentVideoUrl) { loadAnyUrl(currentVideoUrl) } else showPlaceholder();
                });
            });
        }
        function unmuteAudio() { const v = document.getElementById('screen-video'); v.muted = false; v.play(); document.getElementById('unmute-overlay').style.display = 'none' }

        /* ═══════════ LOCAL FILE + ADVANCED PLAYER ═══════════ */
        function playLocalFile(ev) {
            const f = ev.target.files[0]; if (!f) return;
            stopScreenShare();
            const u = URL.createObjectURL(f);
            hideAllPlayers(); currentMode = "local";
            const v = document.getElementById('local-video'); v.classList.remove('vid-hidden'); v.src = u;
            document.getElementById('fs-btn').style.display = 'flex';
            document.getElementById('lp-overlay').classList.remove('lp-hide');
            v.loop = false; v.playbackRate = 1; v.volume = 1;
            document.getElementById('lp-loop').classList.remove('lp-on');
            document.getElementById('lp-spd').value = '1';
            document.getElementById('lp-vol').value = 1;
            document.getElementById('lp-mute').textContent = '🔊';
            toast("লোকাল ফাইল প্লে হচ্ছে", "ok");

            // Host: stream to viewers + sync
            if (isHost) {
                v.onplay = () => {
                    broadcast({ type: "play", time: v.currentTime });
                    try { if (v.captureStream && !localStream) { localStream = v.captureStream(30); connections.forEach(c => { try { const call = myPeer.call(c.peer, localStream); currentCalls.push(call) } catch (e) { } }) } } catch (e) { }
                };
                v.onpause = () => { broadcast({ type: "pause", time: v.currentTime }) };
                v.onended = () => { playNextInPlaylist() };
            }
            v.play().catch(() => { });
        }

        // Player controls
        const LV = document.getElementById('local-video');
        function lpToggle() {
            if (currentMode === "youtube" && playerReady && ytPlayer) {
                if (ytPlayer.getPlayerState() === YT.PlayerState.PLAYING) ytPlayer.pauseVideo();
                else ytPlayer.playVideo();
            } else if (currentMode === "local") {
                if (LV.paused) { LV.play(); document.getElementById('lp-play').textContent = '⏸'; if (isHost) broadcast({ type: "play", time: LV.currentTime }) } 
                else { LV.pause(); document.getElementById('lp-play').textContent = '▶'; if (isHost) broadcast({ type: "pause", time: LV.currentTime }) }
            }
        }
        function lpSkip(s) {
            if (currentMode === "youtube" && playerReady && ytPlayer) {
                ytPlayer.seekTo(ytPlayer.getCurrentTime() + s, true); lpToast((s > 0 ? "+" : "") + s + "s");
            } else if (currentMode === "local") {
                LV.currentTime = Math.max(0, Math.min(LV.duration || 0, LV.currentTime + s)); lpToast((s > 0 ? "+" : "") + s + "s");
            }
        }
        function lpSeek(ev) {
            const r = document.getElementById('lp-bar').getBoundingClientRect();
            if (currentMode === "youtube" && playerReady && ytPlayer) {
                ytPlayer.seekTo(((ev.clientX - r.left) / r.width) * (ytPlayer.getDuration() || 0), true);
            } else if (currentMode === "local") {
                LV.currentTime = ((ev.clientX - r.left) / r.width) * (LV.duration || 0);
            }
        }
        function lpVol(v) {
            if (currentMode === "youtube" && playerReady && ytPlayer) { ytPlayer.setVolume(v * 100); if(v>0) ytPlayer.unMute(); } 
            else if (currentMode === "local") { LV.volume = v; LV.muted = false; }
            document.getElementById('lp-mute').textContent = v == 0 ? '🔇' : v < 0.5 ? '🔉' : '🔊';
        }
        function lpMute() {
            if (currentMode === "youtube" && playerReady && ytPlayer) {
                if (ytPlayer.isMuted()) ytPlayer.unMute(); else ytPlayer.mute();
                const m = ytPlayer.isMuted();
                document.getElementById('lp-mute').textContent = m ? '🔇' : '🔊';
                document.getElementById('lp-vol').value = m ? 0 : (ytPlayer.getVolume() / 100);
            } else if (currentMode === "local") {
                LV.muted = !LV.muted; document.getElementById('lp-mute').textContent = LV.muted ? '🔇' : '🔊'; document.getElementById('lp-vol').value = LV.muted ? 0 : LV.volume;
            }
        }
        function lpSpeed(s) {
            if (currentMode === "youtube" && playerReady && ytPlayer) ytPlayer.setPlaybackRate(parseFloat(s));
            else if (currentMode === "local") LV.playbackRate = parseFloat(s);
            lpToast(s + "x");
        }
        function lpLoop() {
            if (currentMode === "youtube") { lpToast("YouTube Loop not supported"); }
            else if (currentMode === "local") { LV.loop = !LV.loop; document.getElementById('lp-loop').classList.toggle('lp-on', LV.loop); lpToast(LV.loop ? "Loop ON" : "Loop OFF"); }
        }
        function lpPip() { if (currentMode === "local") { try { if (document.pictureInPictureElement) document.exitPictureInPicture(); else LV.requestPictureInPicture() } catch (e) { toast("PiP সাপোর্ট নেই", "err") } } else toast("শুধুমাত্র লোকাল ভিডিওতে PiP সম্ভব", "err") }
        function lpFs() { const el = document.querySelector('.video-col'); if (document.fullscreenElement) { document.exitFullscreen(); if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } else { el.requestFullscreen().then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); }).catch(() => { }) } }
        function lpShot() { if (currentMode === "local") { const c = document.createElement('canvas'); c.width = LV.videoWidth; c.height = LV.videoHeight; c.getContext('2d').drawImage(LV, 0, 0); c.toBlob(b => { const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'screenshot_' + Date.now() + '.png'; a.click(); URL.revokeObjectURL(u); toast("Screenshot সেভ হয়েছে!", "ok") }) } else toast("শুধুমাত্র লোকাল ভিডিওতে স্ক্রিনশট সম্ভব", "err") }
        function lpToast(t) { const el = document.createElement('div'); el.className = 'lp-toast'; el.textContent = t; document.getElementById('video-content').appendChild(el); setTimeout(() => el.remove(), 700) }

        // Progress update
        setInterval(() => {
            if (currentMode === "local" && LV.duration) {
                const p = LV.currentTime / LV.duration * 100;
                document.getElementById('lp-fill').style.width = p + '%';
                document.getElementById('lp-tm').textContent = fmtTime(LV.currentTime) + ' / ' + fmtTime(LV.duration);
                if (LV.buffered.length > 0) document.getElementById('lp-buf').style.width = (LV.buffered.end(LV.buffered.length - 1) / LV.duration * 100) + '%';
                document.getElementById('lp-play').textContent = LV.paused ? '▶' : '⏸';
            } else if (currentMode === "youtube" && playerReady && ytPlayer && ytPlayer.getDuration) {
                const d = ytPlayer.getDuration();
                if (d > 0) {
                    const c = ytPlayer.getCurrentTime();
                    document.getElementById('lp-fill').style.width = (c / d * 100) + '%';
                    document.getElementById('lp-tm').textContent = fmtTime(c) + ' / ' + fmtTime(d);
                    const l = ytPlayer.getVideoLoadedFraction();
                    if (l > 0) document.getElementById('lp-buf').style.width = (l * 100) + '%';
                    document.getElementById('lp-play').textContent = ytPlayer.getPlayerState() === YT.PlayerState.PLAYING ? '⏸' : '▶';
                }
            }
        }, 250);

        // Auto-hide controls
        const lpWrap = document.getElementById('video-content');
        lpWrap.addEventListener('mousemove', () => { 
            if (currentMode !== "local" && currentMode !== "youtube") return; 
            document.getElementById('lp-overlay').classList.remove('lp-hide'); 
            clearTimeout(lpHideTimer); 
            lpHideTimer = setTimeout(() => { 
                const isPaused = currentMode === "local" ? LV.paused : (playerReady ? ytPlayer.getPlayerState() !== YT.PlayerState.PLAYING : false);
                if (!isPaused) document.getElementById('lp-overlay').classList.add('lp-hide');
            }, 3000) 
        });

        // Click on video to play/pause
        lpWrap.addEventListener('click', (e) => { 
            if (e.target.closest('.lp-overlay') || e.target.closest('.reaction-bar') || e.target.closest('.fs-btn')) return;
            if (isHost && (currentMode === "local" || currentMode === "youtube")) lpToggle();
        });
        lpWrap.addEventListener('dblclick', (e) => { 
            if (e.target.closest('.lp-overlay') || e.target.closest('.reaction-bar') || e.target.closest('.fs-btn')) return;
            if (isHost && (currentMode === "local" || currentMode === "youtube")) lpFs();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', e => {
            if ((currentMode !== "local" && currentMode !== "youtube") || !isHost) return;
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            switch (e.key) {
                case ' ': e.preventDefault(); lpToggle(); break;
                case 'ArrowLeft': lpSkip(-10); break;
                case 'ArrowRight': lpSkip(10); break;
                case 'ArrowUp': e.preventDefault(); { const v = Math.min(1, parseFloat(document.getElementById('lp-vol').value) + 0.1); document.getElementById('lp-vol').value = v; lpVol(v); } break;
                case 'ArrowDown': e.preventDefault(); { const v = Math.max(0, parseFloat(document.getElementById('lp-vol').value) - 0.1); document.getElementById('lp-vol').value = v; lpVol(v); } break;
                case 'm': lpMute(); break; case 'f': lpFs(); break; case 'p': lpPip(); break; case 'l': lpLoop(); break;
            }
        });

        /* ═══════════ GENERAL ═══════════ */
        function toggleFullscreen() { const el = document.querySelector('.video-col'); if (document.fullscreenElement) { document.exitFullscreen(); if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } else { el.requestFullscreen().then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); }).catch(() => { }) } }
        function sendReaction(e) { spawnFloatEmoji(e); broadcast({ type: "reaction", emoji: e }) }
        function spawnFloatEmoji(e) { const c = document.getElementById('video-content'); const el = document.createElement('div'); el.className = 'float-emoji'; el.textContent = e; el.style.left = (20 + Math.random() * 60) + '%'; el.style.bottom = '60px'; c.appendChild(el); setTimeout(() => el.remove(), 2000) }

        /* ═══════════ PLAYLIST ═══════════ */
        function addToPlaylist() { const i = document.getElementById('pl-input'); const u = normalizeUrl(i.value); if (!u) return; playlist.push(u); i.value = ""; renderPlaylist(); broadcast({ type: "playlist", data: playlist, idx: currentPlIndex }); if (playlist.length === 1 && !currentVideoUrl) playPlaylistItem(0) }
        function renderPlaylist() { const l = document.getElementById('pl-list'); if (!playlist.length) { l.innerHTML = '<div style="text-align:center;color:var(--mu);padding:2rem;font-size:.82rem">Playlist খালি</div>'; return } l.innerHTML = playlist.map((u, i) => `<div class="pl-item ${i === currentPlIndex ? 'active' : ''}" onclick="playPlaylistItem(${i})"><span class="pl-num">${i + 1}</span><span class="pl-title">${esc(u.length > 45 ? u.substring(0, 45) + '...' : u)}</span>${isHost ? `<span class="pl-remove" onclick="event.stopPropagation();removeFromPlaylist(${i})">✕</span>` : ''}</div>`).join('') }
        function removeFromPlaylist(i) { playlist.splice(i, 1); if (currentPlIndex > i) currentPlIndex--; else if (currentPlIndex === i) currentPlIndex = -1; renderPlaylist(); broadcast({ type: "playlist", data: playlist, idx: currentPlIndex }) }
        function playPlaylistItem(i) { if (i < 0 || i >= playlist.length) return; currentPlIndex = i; currentVideoUrl = playlist[i]; document.getElementById('url-input').value = playlist[i]; loadAnyUrl(playlist[i]); broadcast({ type: "play_item", index: i }); renderPlaylist() }
        function playNextInPlaylist() { if (currentPlIndex < playlist.length - 1) playPlaylistItem(currentPlIndex + 1) }

        /* ═══════════ BROADCAST / RECEIVE ═══════════ */
        function broadcast(d) { connections.forEach(c => { try { c.send(d) } catch (e) { } }) }

        function handleData(d, fc) {
            if (d.type === "auth") {
                if (d.pass !== roomPass) { try { fc.send({ type: "auth_fail" }); fc.close() } catch (e) { } return }
                connections.push(fc);
                const newUser = { id: fc.peer, name: d.name || "Viewer", isHost: false };
                users.push(newUser); viewerCount++; updateVC();
                fc.send({ type: "auth_ok", videoUrl: currentVideoUrl, time: ytPlayer && ytPlayer.getCurrentTime ? ytPlayer.getCurrentTime() : 0, status: ytPlayer && ytPlayer.getPlayerState ? (ytPlayer.getPlayerState() === 1 ? "playing" : "paused") : "paused", pl: playlist, plIdx: currentPlIndex, mode: currentMode, users: users });
                sysMsg(newUser.name + " এলো 👋"); broadcast({ type: "user_list", users: users }); renderUsers();
                if (screenStream) { try { const call = myPeer.call(fc.peer, screenStream); currentCalls.push(call) } catch (e) { } }
                if (localStream) { try { const call = myPeer.call(fc.peer, localStream); currentCalls.push(call) } catch (e) { } }
                return;
            }
            if (d.type === "auth_ok") {
                connOverlay(false); setConnStatus(true); toast("Room এ join হয়েছে!", "ok"); enterRoomUI();
                if (d.videoUrl) { currentVideoUrl = d.videoUrl; document.getElementById('url-input').value = d.videoUrl; loadAnyUrl(d.videoUrl); if (isYTUrl(d.videoUrl) || isDirectVideoUrl(d.videoUrl)) { setTimeout(() => { applyState({ type: d.status === "playing" ? "play" : "pause", time: d.time }) }, 3000) } }
                if (d.pl) { playlist = d.pl; currentPlIndex = d.plIdx ?? -1; renderPlaylist() }
                if (d.users) { users = d.users; renderUsers() }
                return;
            }
            if (d.type === "auth_fail") { connOverlay(false); toast("পাসওয়ার্ড ভুল!", "err"); return }
            if (d.type === "kicked") { toast("Host তোমাকে রুম থেকে বের করে দিয়েছে!", "err"); setTimeout(leaveRoom, 2000); return }
            if (d.type === "user_list") { users = d.users; renderUsers(); return }
            if (d.type === "play" || d.type === "pause") { applyState(d); return }
            if (d.type === "chat") { addMsg(d.name, d.text, false); return }
            if (d.type === "vc") { viewerCount = d.count; updateVC(); return }
            if (d.type === "load_url") { currentVideoUrl = d.url; document.getElementById('url-input').value = d.url; loadAnyUrl(d.url); return }
            if (d.type === "playlist") { playlist = d.data; currentPlIndex = d.idx ?? -1; renderPlaylist(); return }
            if (d.type === "play_item") { playPlaylistItem(d.index); return }
            if (d.type === "screen_start") { sysMsg("Host স্ক্রিন শেয়ার শুরু করেছেন 🖥️"); return }
            if (d.type === "screen_stop") { const v = document.getElementById('screen-video'); v.classList.add('vid-hidden'); v.srcObject = null; document.getElementById('live-badge').style.display = 'none'; document.getElementById('fs-btn').style.display = 'none'; if (currentVideoUrl) { loadAnyUrl(currentVideoUrl) } else showPlaceholder(); toast("Host স্ক্রিন শেয়ার বন্ধ করেছেন", "err"); return }
            if (d.type === "reaction") { spawnFloatEmoji(d.emoji); return }
            if (d.type === "local_file_warning") { sysMsg("⚠️ Host লোকাল ফাইল প্লে করছে।"); return }
        }

        /* ═══════════ USERS ═══════════ */
        function renderUsers() {
            const l = document.getElementById('users-list');
            l.innerHTML = users.map(u => `<div class="user-item ${u.id === myPeer?.id ? 'me-item' : ''}"><div class="ui-av ${u.isHost ? 'host-av' : 'viewer-av'}">${u.isHost ? '🎬' : '👤'}</div><div class="ui-info"><div class="ui-name">${esc(u.name)}${u.id === myPeer?.id ? ' (তুমি)' : ''}</div><div class="ui-role">${u.isHost ? 'Host' : 'Viewer'}</div></div>${isHost && !u.isHost ? `<button class="ui-kick" onclick="kickUser('${u.id}')" title="Kick">✕</button>` : ''}</div>`).join('');
            document.getElementById('vc').textContent = users.length + " জন";
        }
        function kickUser(uid) {
            if (!isHost) return;
            const conn = connections.find(c => c.peer === uid);
            const user = users.find(u => u.id === uid);
            if (conn) { try { conn.send({ type: "kicked" }) } catch (e) { } conn.close(); connections = connections.filter(c => c !== conn) }
            users = users.filter(u => u.id !== uid);
            viewerCount = Math.max(1, viewerCount - 1); updateVC();
            broadcast({ type: "user_list", users: users }); renderUsers();
            if (user) sysMsg(user.name + " কে কিক করা হয়েছে");
            toast("ইউজার কিক করা হয়েছে", "ok");
        }

        /* ═══════════ PEER ═══════════ */
        function createPeer() {
            const p = new Peer({ debug: 0, config: ICE_SERVERS });
            p.on('disconnected', () => { setConnStatus(false); setTimeout(() => { if (p && !p.destroyed) p.reconnect() }, 3000) });
            p.on('close', () => setConnStatus(false));
            return p;
        }

        function doCreate() {
            const n = document.getElementById('c-name').value.trim(), p = document.getElementById('c-pass').value.trim();
            if (!p) return toast("Password দাও!", "err"); if (n) myName = n;
            isHost = true; roomPass = p; connOverlay(true, "Room তৈরি হচ্ছে...");
            myPeer = createPeer();
            myPeer.on('open', id => { roomId = id; connOverlay(false); setConnStatus(true); users = [{ id: myPeer.id, name: myName, isHost: true }]; enterRoomUI(); toast("Room তৈরি হয়েছে! ID কপি করে পাঠাও", "ok") });
            myPeer.on('connection', conn => {
                conn.on('open', () => { }); conn.on('data', d => handleData(d, conn));
                conn.on('close', () => { connections = connections.filter(c => c !== conn); const u = users.find(x => x.id === conn.peer); users = users.filter(x => x.id !== conn.peer); viewerCount = Math.max(1, viewerCount - 1); updateVC(); if (u) sysMsg(u.name + " চলে গেল 👋"); broadcast({ type: "user_list", users: users }); renderUsers() });
                conn.on('error', () => { });
            });
            myPeer.on('error', e => { connOverlay(false); if (e.type === 'peer-unavailable') toast("Room ID পাওয়া যায়নি!", "err"); else toast("Error: " + e.type, "err") });
            setupCallListener();
        }

        function doJoin() {
            const n = document.getElementById('j-name').value.trim(), id = document.getElementById('j-id').value.trim(), p = document.getElementById('j-pass').value.trim();
            if (!id) return toast("Room ID দাও!", "err"); if (!p) return toast("Password দাও!", "err"); if (n) myName = n;
            isHost = false; roomPass = p; connOverlay(true, "Host এর সাথে যুক্ত হচ্ছে...");
            myPeer = createPeer();
            myPeer.on('open', () => {
                const conn = myPeer.connect(id, { reliable: true, serialization: "json" }); connections = [conn];
                conn.on('open', () => { conn.send({ type: "auth", pass: roomPass, name: myName }) });
                conn.on('data', d => handleData(d, conn));
                conn.on('close', () => { setConnStatus(false); toast("Host সংযোগ বিচ্ছিন্ন", "err"); setTimeout(leaveRoom, 3000) });
                conn.on('error', () => { connOverlay(false); toast("সংযোগ ত্রুটি", "err") });
                setTimeout(() => { if (document.getElementById('conn-overlay').style.display === 'flex') { connOverlay(false); toast("Timeout — Room ID ঠিক আছে তো?", "err") } }, 20000);
            });
            myPeer.on('error', e => { connOverlay(false); if (e.type === 'peer-unavailable') toast("Room ID পাওয়া যায়নি!", "err"); else toast("Error: " + e.type, "err") });
            setupCallListener();
        }

        function enterRoomUI() {
            document.getElementById('lobby').style.display = 'none'; document.getElementById('room').style.display = 'flex';
            const d = isHost ? myPeer.id : document.getElementById('j-id').value.trim();
            document.getElementById('disp-id').textContent = d.substring(0, 8) + "...";
            document.getElementById('role-badge').textContent = isHost ? "🎬 Host" : "👁 Viewer";
            document.getElementById('role-badge').className = "badge " + (isHost ? "badge-host" : "badge-viewer");
            window._fullRoomId = d; updateVC(); renderUsers(); renderPlaylist();
            
            if (!isHost) {
                document.getElementById('tab-users').style.display = 'none';
                document.getElementById('tab-sources').style.display = 'none';
                document.getElementById('add-pl-wrap').style.display = 'none';
                document.getElementById('url-bar').style.display = 'none';
                stab('chat', document.getElementById('tab-chat'));
            }
        }
        function updateVC() { document.getElementById('vc').textContent = (users.length || viewerCount) + " জন" }
        function leaveRoom() { if (myPeer && !myPeer.destroyed) myPeer.destroy(); location.reload() }

        /* ═══════════ CHAT ═══════════ */
        function sendMsg() { const i = document.getElementById('ci'), t = i.value.trim(); if (!t) return; i.value = ""; addMsg(myName, t, true); broadcast({ type: "chat", name: myName, text: t }) }
        function addMsg(w, t, m) { const b = document.getElementById('chat-box'), d = document.createElement('div'); d.className = 'msg' + (m ? ' me' : ''); d.innerHTML = `<span class="msg-who">${esc(w)}</span><span class="msg-bubble">${esc(t)}</span>`; b.appendChild(d); b.scrollTop = b.scrollHeight }
        function sysMsg(t) { const b = document.getElementById('chat-box'), d = document.createElement('div'); d.className = 'sys-msg'; d.textContent = t; b.appendChild(d); b.scrollTop = b.scrollHeight }

        /* ═══════════ TABS ═══════════ */
        function stab(n, el) { document.querySelectorAll('.stab').forEach(t => t.classList.remove('on')); document.querySelectorAll('.spanel').forEach(p => p.classList.remove('on')); el.classList.add('on'); document.getElementById('spanel-' + n).classList.add('on') }
        function copyId() { const id = window._fullRoomId || myPeer?.id || ""; navigator.clipboard.writeText(id).then(() => toast("Room ID কপি হয়েছে!", "ok")).catch(() => { const t = document.createElement('textarea'); t.value = id; t.style.position = 'fixed'; t.style.left = '-9999px'; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); toast("Room ID কপি হয়েছে!", "ok") }) }
