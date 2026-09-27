/* =========================================================================
   app.js
   No personal content lives here — everything comes from CONFIG (config.js).
   ========================================================================= */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -----------------------------------------------------------------------
     1. TIMEZONE-AWARE UNLOCK CALCULATION
     Works out the real UTC instant that corresponds to the configured
     wall-clock date/time in the configured IANA timezone, without ever
     depending on the visitor's own timezone.
  ----------------------------------------------------------------------- */
  function getTZOffsetMs(timeZone, date) {
    try {
      const dtf = new Intl.DateTimeFormat("en-US", {
        timeZone, hourCycle: "h23",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      });
      const parts = {};
      dtf.formatToParts(date).forEach(p => { if (p.type !== "literal") parts[p.type] = p.value; });
      const asUTC = Date.UTC(
        Number(parts.year), Number(parts.month) - 1, Number(parts.day),
        Number(parts.hour), Number(parts.minute), Number(parts.second)
      );
      return asUTC - date.getTime();
    } catch (e) {
      console.error("[birthday-site] Invalid timezone in CONFIG.unlock.timezone:", timeZone, e);
      return 0;
    }
  }

  function computeUnlockTimestamp(cfg) {
    try {
      const [y, mo, d] = cfg.date.split("-").map(Number);
      const [h, mi, s] = cfg.time.split(":").map(Number);
      if (!y || !mo || !d || Number.isNaN(h) || Number.isNaN(mi)) throw new Error("bad date/time format");

      // Baseline: treat the wall-clock digits as if they were UTC.
      let guessUTC = Date.UTC(y, mo - 1, d, h, mi, s || 0);

      // Iterate twice to converge even across DST boundaries.
      for (let i = 0; i < 2; i++) {
        const offset = getTZOffsetMs(cfg.timezone, new Date(guessUTC));
        guessUTC = Date.UTC(y, mo - 1, d, h, mi, s || 0) - offset;
      }
      return guessUTC;
    } catch (e) {
      console.error("[birthday-site] CONFIG.unlock is invalid — check date/time/timezone.", e);
      return Date.now() - 1; // fail open: never trap a visitor behind a broken config
    }
  }

  const UNLOCK_TS = computeUnlockTimestamp(CONFIG.unlock);

  function isUnlocked() { return Date.now() >= UNLOCK_TS; }

  /* -----------------------------------------------------------------------
     2. RENDER — every piece of copy/media comes from CONFIG
  ----------------------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);
  const t = CONFIG.texts, person = CONFIG.person, bday = CONFIG.birthday;

  function renderStaticContent() {
    $("gate-eyebrow").textContent = t.waitingEyebrow || "";
    $("gate-title").textContent = t.waitingTitle || "";
    $("gate-subtitle").textContent = t.waitingSubtitle || "";
    $("tap-hint").textContent = t.tapToEnter || "Tap to enter";

    $("hero-eyebrow").textContent = t.heroEyebrow || "";
    $("hero-happy").textContent = t.heroLine || "HAPPY BIRTHDAY";
    $("hero-nickname").textContent = person.nickname || "";
    $("hero-date").textContent = bday.displayDate || "";
    $("hero-custom").textContent = bday.customLine || "";

    $("herday-eyebrow").textContent = t.herDayEyebrow || "";
    $("herday-line").textContent = t.herDayLine || "";
    $("herday-date").textContent = bday.displayDate || "";
    $("herday-custom").textContent = bday.customLine || "";

    $("cards-eyebrow").textContent = t.littleThingsEyebrow || "";
    $("cards-title").textContent = t.littleThingsTitle || "";

    $("gallery-eyebrow").textContent = t.galleryEyebrow || "";
    $("gallery-title").textContent = t.galleryTitle || "";

    $("choice-eyebrow").textContent = t.choiceEyebrow || "";
    $("choice-title").textContent = t.choiceTitle || "";

    $("wish-eyebrow").textContent = t.wishEyebrow || "";
    $("wish-title").textContent = t.wishTitle || "";
    $("wish-instruction").textContent = t.wishInstruction || "";
    $("wish-after").textContent = t.wishAfter || "";

    $("surprise-eyebrow").textContent = t.surpriseEyebrow || "";
    $("surprise-btn").textContent = t.surpriseButton || "";
    $("surprise-title").textContent = CONFIG.surprise?.title || "";
    $("surprise-text").textContent = CONFIG.surprise?.text || "";

    $("final-eyebrow").textContent = t.finalEyebrow || "";
    $("final-message").textContent = t.finalMessage || "";
    $("final-name").textContent = person.fullName || "";
    $("final-signoff").textContent = t.finalSignoff || "";

    $("ending-line").textContent = t.endingLine || "";

    document.title = `Happy Birthday, ${person.nickname || ""}`;
  }

  function renderCards() {
    const stack = $("card-stack");
    stack.innerHTML = "";
    (CONFIG.chapters || []).forEach((c, i) => {
      const card = document.createElement("div");
      card.className = "thing-card";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-expanded", "false");
      card.innerHTML = `
        <div class="thing-card-head">
          <span class="thing-icon">${c.icon || "•"}</span>
          <span class="thing-title">${c.title || ""}</span>
          <span class="thing-chevron">+</span>
        </div>
        <div class="thing-body"><p>${c.text || ""}</p></div>
      `;
      const toggle = () => {
        const nowOpen = card.classList.toggle("open");
        card.setAttribute("aria-expanded", String(nowOpen));
      };
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
      stack.appendChild(card);
    });
  }

  function renderGallery() {
    const track = $("gallery-track");
    track.innerHTML = "";
    (CONFIG.media?.photos || []).forEach((p) => {
      const card = document.createElement("div");
      card.className = "photo-card";
      const img = document.createElement("img");
      img.src = p.image;
      img.alt = p.title || "";
      img.loading = "lazy";
      img.addEventListener("error", () => {
        img.remove();
        const fb = document.createElement("div");
        fb.className = "photo-fallback";
        fb.textContent = "◇";
        card.prepend(fb);
      });
      card.appendChild(img);
      const cap = document.createElement("div");
      cap.className = "photo-caption";
      cap.innerHTML = `<div class="p-title">${p.title || ""}</div><div class="p-caption">${p.caption || ""}</div>`;
      card.appendChild(cap);
      track.appendChild(card);
    });
  }

  function renderChoices() {
    const row = $("choice-row");
    row.innerHTML = "";
    const msg = $("choice-message");
    (CONFIG.choices || []).forEach((c) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.innerHTML = `<span class="icon">${c.icon || ""}</span><span class="label">${c.title || ""}</span>`;
      btn.addEventListener("click", () => {
        [...row.children].forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        const scene = $("scene-choice");
        scene.className = "scene mood-" + (c.key || "");
        scene.classList.add("in-view");
        msg.textContent = c.message || t.choiceFooter || "";
        msg.classList.add("show");
      });
      row.appendChild(btn);
    });
  }

  function wireCandle() {
    const candle = $("candle");
    const after = $("wish-after");
    const layer = $("wish-particles");
    let blown = false;
    const blow = () => {
      if (blown) return;
      blown = true;
      candle.classList.add("blown");
      spawnParticles(layer, 18);
      setTimeout(() => after.classList.add("show"), 500);
    };
    candle.addEventListener("click", blow);
    candle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); blow(); }
    });
  }

  function wireSurprise() {
    const btn = $("surprise-btn");
    const reveal = $("surprise-reveal");
    btn.addEventListener("click", () => {
      const open = reveal.classList.toggle("open");
      btn.style.opacity = open ? "0.5" : "1";
    });
  }

  function spawnParticles(layer, count) {
    if (!layer || reducedMotion) return;
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.animationDelay = (Math.random() * 0.8) + "s";
      p.style.background = i % 3 === 0 ? "var(--accent-2)" : "var(--accent)";
      layer.appendChild(p);
      setTimeout(() => p.remove(), 5000);
    }
  }

  /* -----------------------------------------------------------------------
     3. STARFIELD — lightweight canvas backdrop, respects reduced motion
  ----------------------------------------------------------------------- */
  function initStarfield() {
    const canvas = $("starfield");
    const ctx = canvas.getContext("2d");
    let stars = [];
    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.min(90, Math.floor((canvas.width * canvas.height) / 14000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * 0.02 + 0.005,
        dir: Math.random() > 0.5 ? 1 : -1
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f4f1ea";
      stars.forEach(s => {
        if (!reducedMotion) {
          s.a += s.tw * s.dir;
          if (s.a > 0.85 || s.a < 0.15) s.dir *= -1;
        }
        ctx.globalAlpha = s.a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (!reducedMotion) requestAnimationFrame(draw);
    }
    window.addEventListener("resize", resize, { passive: true });
    resize();
    draw();
  }

  /* -----------------------------------------------------------------------
     4. SCROLL REVEALS + PROGRESS RAIL
  ----------------------------------------------------------------------- */
  function initScrollEffects() {
    const scenes = document.querySelectorAll(".scene");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in-view"); });
    }, { threshold: 0.3 });
    scenes.forEach(s => io.observe(s));

    const fill = document.querySelector("#progress-rail .fill");
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      fill.style.width = Math.min(100, Math.max(0, scrolled * 100)) + "%";
    }, { passive: true });
  }

  /* -----------------------------------------------------------------------
     5. AUDIO
     Autoplay is never assumed. Everything waits for a tap.
  ----------------------------------------------------------------------- */
  const audio = {
    waiting: $("audio-waiting"),
    birthday: $("audio-birthday"),
    voice: $("audio-voice"),
    muted: false
  };

  function safeSetSrc(el, src) {
    if (!src) return;
    el.src = src;
    el.addEventListener("error", () => {
      console.warn("[birthday-site] Audio file not found, continuing silently:", src);
    }, { once: true });
  }

  safeSetSrc(audio.waiting, CONFIG.media?.waitingMusic);
  safeSetSrc(audio.birthday, CONFIG.media?.birthdayMusic);
  safeSetSrc(audio.voice, CONFIG.media?.voiceOver);

  function fade(el, to, ms) {
    if (!el || !el.src) return;
    const from = el.volume;
    const start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / ms);
      el.volume = from + (to - from) * p;
      if (p < 1) requestAnimationFrame(step);
      else if (to === 0) el.pause();
    }
    requestAnimationFrame(step);
  }

  function tryPlay(el, vol) {
    if (!el || !el.src || audio.muted) return;
    el.volume = 0;
    el.play().then(() => fade(el, vol, 900)).catch(() => {
      console.warn("[birthday-site] Playback was blocked by the browser.");
    });
  }

  $("audio-toggle").addEventListener("click", () => {
    audio.muted = !audio.muted;
    $("audio-toggle").textContent = audio.muted ? "🔇" : "🔈";
    [audio.waiting, audio.birthday, audio.voice].forEach(el => {
      if (audio.muted) el.pause(); 
    });
    if (!audio.muted) {
      if (isUnlocked() && experienceStarted) tryPlay(audio.birthday, 0.5);
      else if (!isUnlocked() && gateEntered) tryPlay(audio.waiting, 0.35);
    }
  });

  /* -----------------------------------------------------------------------
     6. COUNTDOWN + STATE MACHINE
  ----------------------------------------------------------------------- */
  let gateEntered = false;
  let experienceStarted = false;

  function updateCountdown() {
    const diff = UNLOCK_TS - Date.now();
    if (diff <= 0) { triggerUnlock(); return; }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    $("cd-days").textContent = String(days).padStart(2, "0");
    $("cd-hours").textContent = String(hours).padStart(2, "0");
    $("cd-mins").textContent = String(mins).padStart(2, "0");
    $("cd-secs").textContent = String(secs).padStart(2, "0");
  }

  let countdownInterval = null;
  let unlockTriggered = false;

  function triggerUnlock() {
    if (unlockTriggered) return;
    unlockTriggered = true;
    clearInterval(countdownInterval);
    runRevealSequence(true);
  }

  function runRevealSequence(fromCountdown) {
    const gate = $("gate");
    const flash = $("reveal-flash");
    const exp = $("experience");

    exp.classList.remove("locked-out");

    fade(audio.waiting, 0, 1200);

    if (fromCountdown) {
      flash.classList.add("burst");
    }

    setTimeout(() => {
      gate.classList.add("hidden");
    }, fromCountdown ? 500 : 0);

    setTimeout(() => {
      tryPlay(audio.voice, 0.9);
      spawnParticles($("hero-particles"), 14);
      audio.voice.addEventListener("ended", () => tryPlay(audio.birthday, 0.45), { once: true });
      // If there's no voice-over file, go straight to music.
      if (!audio.voice.src) tryPlay(audio.birthday, 0.45);
    }, fromCountdown ? 1400 : 300);

    experienceStarted = true;
  }

  function enterGate() {
    if (gateEntered) return;
    gateEntered = true;
    $("tap-hint").style.display = "none";
    if (!isUnlocked()) tryPlay(audio.waiting, 0.35);
  }

  /* -----------------------------------------------------------------------
     7. BOOT
  ----------------------------------------------------------------------- */
  function boot() {
    renderStaticContent();
    renderCards();
    renderGallery();
    renderChoices();
    wireCandle();
    wireSurprise();
    initStarfield();
    initScrollEffects();

    const gate = $("gate");
    const tapHint = $("tap-hint");

    if (isUnlocked()) {
      // CASE 4/5/6: arriving after unlock — full experience is already
      // rendered behind the gate; the gate just becomes a lightweight
      // audio-consent tap, then gets out of the way.
      $("gate-title").textContent = "";
      $("gate-eyebrow").textContent = "";
      $("gate-subtitle").textContent = "";
      $("countdown").style.display = "none";
      tapHint.textContent = t.tapToBegin || "Tap to begin";
      $("experience").classList.remove("locked-out");

      const beginNow = () => {
        gate.classList.add("hidden");
        enterGate();
        runRevealSequence(false);
        window.removeEventListener("scroll", beginOnScroll);
      };
      const beginOnScroll = () => beginNow();
      gate.addEventListener("click", beginNow, { once: true });
      window.addEventListener("scroll", beginOnScroll, { once: true, passive: true });
    } else {
      // CASE 1/2/3: still locked — show the waiting screen + live countdown.
      tapHint.addEventListener("click", enterGate, { once: true });
      updateCountdown();
      countdownInterval = setInterval(updateCountdown, 1000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
