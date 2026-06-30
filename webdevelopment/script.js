if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

(function () {
  'use strict';

  // ── Hero video ───────────────────────────────────────────────────
  var heroIntro = document.getElementById('heroIntro');
  var heroLoop  = document.getElementById('heroLoop');
  if (heroIntro) heroIntro.playbackRate = 2.0;
  if (heroIntro && heroLoop) {
    heroLoop.play().then(function () {
      heroLoop.pause();
      heroLoop.currentTime = 0;
    });
    heroIntro.addEventListener('timeupdate', function () {
      if (heroIntro.duration - heroIntro.currentTime < 0.5 && heroLoop.paused) {
        heroLoop.play();
        heroLoop.style.opacity = '1';
        heroIntro.style.opacity = '0';
      }
    });
  }

  setTimeout(function () {
    document.querySelector('.wd-hero-overlay').classList.add('dimmed');
    document.querySelectorAll('.wd-reveal').forEach(function (el, i) {
      setTimeout(function () { el.classList.add('visible'); }, i * 250);
    });
  }, 1000);

  var heroCovered = false;
  function checkHeroCover() {
    var spacer = document.querySelector('.wd-hero-spacer');
    if (!spacer) return;
    var spacerBottom = spacer.getBoundingClientRect().bottom;
    if (spacerBottom < window.innerHeight * 0.2 && !heroCovered) {
      heroCovered = true;
      if (heroLoop)  heroLoop.pause();
      if (heroIntro) heroIntro.pause();
    } else if (spacerBottom >= window.innerHeight * 0.2 && heroCovered) {
      heroCovered = false;
      if (heroLoop && heroLoop.readyState >= 2) heroLoop.play();
    }
  }

  // ── Scrub DOM refs ───────────────────────────────────────────────
  var wrapper      = document.querySelector('.wd-scrub-wrapper');
  var scrubSticky  = wrapper.querySelector('.wd-scrub-sticky');
  var frames       = document.querySelectorAll('.wd-frame');
  var dots         = document.querySelectorAll('.wd-dot');
  var counter      = document.getElementById('wdCounter');
  var progressFill = document.getElementById('wdProgressFill');
  var scrubFrost   = document.getElementById('wdScrubFrost');

  // ── Constants ────────────────────────────────────────────────────
  var TOTAL_NICHES = 4;
  // Frame index (0-based) where each niche idles / starts playing from.
  // Niche 0 idles at index 4 (file frame 5); niches 1-3 idle at index 0.
  var NICHE_START  = [4, 0, 0, 0];
  var TARGET_FPS   = 24;
  var FRAME_MS     = 1000 / TARGET_FPS;

  // ── Preload frames ───────────────────────────────────────────────
  var nicheFrames   = {};
  var nicheCanvases = {};
  frames.forEach(function (f, i) {
    var count = parseInt(f.dataset.frames, 10);
    if (!count) return;
    var path   = f.dataset.framePath;
    var ext    = f.dataset.frameExt;
    var canvas = f.querySelector('.wd-frame-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    nicheCanvases[i] = { canvas: canvas, ctx: ctx };
    nicheFrames[i]   = [];
    for (var j = 1; j <= count; j++) {
      var img = new Image();
      img.src = path + String(j).padStart(4, '0') + ext;
      nicheFrames[i].push(img);
    }
    nicheFrames[i][0].onload = (function (cv, c, fg) {
      return function () {
        cv.width  = this.naturalWidth;
        cv.height = this.naturalHeight;
        c.drawImage(this, 0, 0);
        fg.style.opacity = '0';
      };
    }(canvas, ctx, f.querySelector('.wd-frame-bg')));
  });

  // ── State ────────────────────────────────────────────────────────
  var scrubActive   = false;
  var currentNiche  = 0;
  var currentFrame  = NICHE_START[0]; // 4 — niche 0 starts at frame 5
  var animating     = false;
  var animRaf       = null;
  var lastFrameTime = 0;

  // Frost state
  var frostDone     = false;
  var frostClearing = false;
  var frostTimer    = null;

  // Jump / re-entry guards
  var jumpInProgress = false;
  var exitingToHero  = false;
  var lastScrollY    = 0;
  var savedScrubY    = 0; // page Y held while scrub is active

  // Init: show niche 0
  frames[0].classList.add('active');
  updateNicheUI(0);

  // ── ShowMe button ────────────────────────────────────────────────
  var showMeBtn = document.getElementById('showMeBtn');
  if (showMeBtn) {
    showMeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var top = wrapper.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }

  // ── Frost helpers ────────────────────────────────────────────────
  function checkFrost() {
    if (frostDone || frostClearing) return;
    var spacer = document.querySelector('.wd-hero-spacer');
    if (!spacer) return;
    var spacerBottom = spacer.getBoundingClientRect().bottom;
    var fadeInP = Math.max(0, Math.min(1, 1 - spacerBottom / window.innerHeight));

    if (fadeInP <= 0) {
      scrubFrost.style.display = 'none';
      scrubFrost.style.backdropFilter = 'blur(0px)';
      scrubFrost.style.webkitBackdropFilter = 'blur(0px)';
      scrubFrost.style.background = 'rgba(8,8,8,0)';
      scrubSticky.classList.remove('visible');
      return;
    }

    var frost = Math.min(1, fadeInP / 0.5);
    scrubFrost.style.backdropFilter    = 'blur(' + (frost * 20) + 'px)';
    scrubFrost.style.webkitBackdropFilter = 'blur(' + (frost * 20) + 'px)';
    scrubFrost.style.background = 'rgba(8,8,8,' + (frost * 0.6) + ')';
    scrubFrost.style.display = 'block';
    scrubSticky.classList.add('visible');

    if (fadeInP >= 1) {
      frostClearing = true;
      clearTimeout(frostTimer);
      frostTimer = setTimeout(animateFrostClear, 300);
    }
  }

  function animateFrostClear() {
    var start = null;
    var duration = 600;
    (function step(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / duration);
      scrubFrost.style.backdropFilter    = 'blur(' + (20 * (1 - t)) + 'px)';
      scrubFrost.style.webkitBackdropFilter = 'blur(' + (20 * (1 - t)) + 'px)';
      scrubFrost.style.background = 'rgba(8,8,8,' + (0.8 * (1 - t)) + ')';
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        scrubFrost.style.display = 'none';
        frostDone     = true;
        frostClearing = false;
        // Init scrub at niche 0, idle frame (index 4 = file frame 5)
        currentNiche  = 0;
        currentFrame  = NICHE_START[0];
        switchToNiche(0);
        drawFrame(0, NICHE_START[0]);
        updateNicheUI(0);
        updateProgressUI(0, NICHE_START[0], nicheFrames[0].length);
        savedScrubY = window.scrollY;
        scrubActive = true;
      }
    }(performance.now()));
  }

  // ── Scroll listener ───────────────────────────────────────────────
  window.addEventListener('scroll', function () {
    if (jumpInProgress) return;

    var scrollY   = window.scrollY;
    var scrollDir = scrollY < lastScrollY ? -1 : 1;
    lastScrollY   = scrollY;

    checkHeroCover();

    // Scroll lock: while scrub is active keep the page pinned at savedScrubY.
    // This stops trackpad momentum / inertia from carrying the page out of the
    // sticky zone and bypassing the wheel-based niche transitions.
    if (scrubActive && Math.abs(scrollY - savedScrubY) > 2) {
      jumpInstant(savedScrubY);
      return;
    }

    // Back near top → reset so frost re-runs on next entry
    if (scrollY < window.innerHeight * 0.4) {
      exitingToHero = false;
      scrubSticky.classList.remove('visible'); // always hide near top regardless of state
      frames.forEach(function (f) { f.classList.remove('text-overlay'); });
      if (frostDone || frostClearing || scrubActive) {
        frostDone     = false;
        frostClearing = false;
        scrubActive   = false;
        clearTimeout(frostTimer);
        if (animRaf) { cancelAnimationFrame(animRaf); animRaf = null; animating = false; }
        scrubFrost.style.display = 'none';
      }
      return;
    }

    // Wrapper geometry — tells us if the sticky is currently pinned
    var wRect  = wrapper.getBoundingClientRect();
    var inZone = wRect.top <= 0 && wRect.bottom >= window.innerHeight;

    // Fast scroll DOWN from hero bypassed the frost → activate immediately
    if (inZone && !frostDone && !frostClearing && !exitingToHero && scrollY > window.innerHeight * 0.5) {
      clearTimeout(frostTimer);
      scrubFrost.style.display = 'none';
      frostDone = true; frostClearing = false;
      currentNiche = 0; currentFrame = NICHE_START[0];
      switchToNiche(0); drawFrame(0, NICHE_START[0]);
      updateNicheUI(0); updateProgressUI(0, NICHE_START[0], nicheFrames[0].length);
      scrubSticky.classList.add('visible');
      savedScrubY = scrollY;
      scrubActive = true;
      return;
    }

    // Fast scroll DOWN flew completely past the wrapper → mark done, user is at CTA
    if (wRect.bottom < window.innerHeight && !frostDone && !frostClearing && !exitingToHero && scrollY > window.innerHeight) {
      clearTimeout(frostTimer);
      scrubFrost.style.display = 'none';
      frostDone = true; frostClearing = false;
      currentNiche = TOTAL_NICHES; currentFrame = 0;
      scrubSticky.classList.remove('visible');
      scrubActive = false;
      return;
    }

    // Fast scroll UP from CTA bypassed re-entry → activate immediately
    if (inZone && frostDone && !scrubActive && !exitingToHero) {
      reEnterFromCTA(scrollY);
      return;
    }

    // Normal slow-scroll cases
    if (!frostDone && !frostClearing && !exitingToHero) {
      if (scrollDir === 1) checkFrost();
    }
  }, { passive: true });

  function reEnterFromCTA(atScrollY) {
    currentNiche = TOTAL_NICHES;
    currentFrame = 0;
    scrubSticky.classList.add('visible');
    savedScrubY = atScrollY !== undefined ? atScrollY : window.scrollY;
    scrubActive = true;
  }

  // ── Wheel handler ────────────────────────────────────────────────
  window.addEventListener('wheel', function (e) {
    if (frostClearing) { e.preventDefault(); return; }
    if (!scrubActive) return;

    e.preventDefault(); // always block page scroll while scrub is active
    if (animating) return; // swallow extra scrolls during animation

    var dir = e.deltaY > 0 ? 1 : -1;

    if (dir === 1) {
      // ── Forward ──
      if (currentNiche >= TOTAL_NICHES) {
        // All niches done — jump to CTA
        scrubActive = false;
        jumpInstant(wrapperEndScrollY());
        return;
      }
      startAnimation(1);

    } else {
      // ── Backward ──
      var idleFrame = currentNiche < TOTAL_NICHES ? NICHE_START[currentNiche] : 0;

      if (currentNiche <= 0 && currentFrame === NICHE_START[0]) {
        // At niche 0 idle frame — release to hero
        frames.forEach(function (f) { f.classList.remove('text-overlay'); });
        scrubSticky.classList.remove('visible');
        scrubActive   = false;
        frostDone     = false;
        exitingToHero = true;
        return;
      }

      // Retreat to previous niche if already at this niche's idle frame
      if (currentFrame === idleFrame) currentNiche--;

      // Set to last frame of (now current) niche and play backward
      currentFrame = nicheFrames[currentNiche].length - 1;
      switchToNiche(currentNiche);
      drawFrame(currentNiche, currentFrame);
      updateNicheUI(currentNiche);
      updateProgressUI(currentNiche, currentFrame, nicheFrames[currentNiche].length);
      updateAllRevealEls(currentNiche, currentFrame, nicheFrames[currentNiche].length);
      startAnimation(-1);
    }
  }, { passive: false });

  // ── Touch handler ────────────────────────────────────────────────
  var touchStartY = 0;
  window.addEventListener('touchstart', function (e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  window.addEventListener('touchmove', function (e) {
    if (frostClearing || scrubActive) e.preventDefault();
  }, { passive: false });
  window.addEventListener('touchend', function (e) {
    if (!scrubActive || animating) return;
    var delta = touchStartY - e.changedTouches[0].clientY;
    if (Math.abs(delta) < 30) return;
    var dir = delta > 0 ? 1 : -1;

    if (dir === 1) {
      if (currentNiche >= TOTAL_NICHES) {
        scrubActive = false;
        jumpInstant(wrapperEndScrollY());
        return;
      }
      startAnimation(1);
    } else {
      var idleFrame = currentNiche < TOTAL_NICHES ? NICHE_START[currentNiche] : 0;
      if (currentNiche <= 0 && currentFrame === NICHE_START[0]) {
        frames.forEach(function (f) { f.classList.remove('text-overlay'); });
        scrubSticky.classList.remove('visible');
        scrubActive = false; frostDone = false; exitingToHero = true;
        return;
      }
      if (currentFrame === idleFrame) currentNiche--;
      currentFrame = nicheFrames[currentNiche].length - 1;
      switchToNiche(currentNiche);
      drawFrame(currentNiche, currentFrame);
      updateNicheUI(currentNiche);
      updateProgressUI(currentNiche, currentFrame, nicheFrames[currentNiche].length);
      updateAllRevealEls(currentNiche, currentFrame, nicheFrames[currentNiche].length);
      startAnimation(-1);
    }
  }, { passive: true });

  // ── Animation loop ────────────────────────────────────────────────
  function startAnimation(dir) {
    if (!nicheFrames[currentNiche]) return;
    animating = true;
    frames.forEach(function (f) { f.classList.remove('text-overlay'); });
    if (animRaf) cancelAnimationFrame(animRaf);
    lastFrameTime = 0;

    var niche      = currentNiche; // capture for closure
    var frameCount = nicheFrames[niche].length;
    var target     = dir === 1 ? frameCount - 1 : NICHE_START[niche];

    (function step(ts) {
      if (!lastFrameTime) lastFrameTime = ts;
      if (ts - lastFrameTime >= FRAME_MS) {
        lastFrameTime = ts;
        currentFrame  = Math.max(0, Math.min(frameCount - 1, currentFrame + dir));
        drawFrame(niche, currentFrame);
        updateProgressUI(niche, currentFrame, frameCount);
        updateAllRevealEls(niche, currentFrame, frameCount);
      }
      if (currentFrame !== target) {
        animRaf = requestAnimationFrame(step);
      } else {
        animating = false;
        animRaf   = null;
        onAnimationComplete(dir, niche);
      }
    }(performance.now()));
  }

  function onAnimationComplete(dir, niche) {
    if (dir === 1) {
      // Forward complete: advance to next niche at its idle frame
      currentNiche = niche + 1;
      var startF   = currentNiche < TOTAL_NICHES ? NICHE_START[currentNiche] : 0;
      currentFrame = startF;
      if (currentNiche < TOTAL_NICHES) {
        switchToNiche(currentNiche);
        drawFrame(currentNiche, startF);
        updateNicheUI(currentNiche);
        updateProgressUI(currentNiche, startF, nicheFrames[currentNiche].length);
        updateAllRevealEls(currentNiche, startF, nicheFrames[currentNiche].length);
      }
      // Text overlay: show the niche that just finished over the new canvas.
      // Skip when currentNiche === TOTAL_NICHES (no next niche) — niche 3 stays
      // .active with its last frame visible.
      if (currentNiche < TOTAL_NICHES && frames[niche]) frames[niche].classList.add('text-overlay');
    } else {
      // Backward complete: rest at this niche's idle frame
      var startF   = NICHE_START[niche];
      currentFrame = startF;
      updateProgressUI(niche, startF, nicheFrames[niche].length);
      updateAllRevealEls(niche, startF, nicheFrames[niche].length);
      // Text overlay: show the niche below the current idle
      if (niche > 0 && frames[niche - 1]) frames[niche - 1].classList.add('text-overlay');
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────
  function drawFrame(niche, frame) {
    if (!nicheFrames[niche] || !nicheCanvases[niche]) return;
    var img = nicheFrames[niche][frame];
    var c   = nicheCanvases[niche];
    if (img && img.complete && img.naturalWidth) {
      c.ctx.drawImage(img, 0, 0, c.canvas.width, c.canvas.height);
    }
  }

  function switchToNiche(niche) {
    frames.forEach(function (f) { f.classList.remove('active'); });
    if (!frames[niche]) return;
    frames[niche].style.transition = 'none';
    frames[niche].classList.add('active');
    frames[niche].offsetHeight; // force reflow
    frames[niche].style.transition = '';
  }

  function updateNicheUI(niche) {
    dots.forEach(function (d) { d.classList.remove('active'); });
    if (dots[niche]) dots[niche].classList.add('active');
    counter.textContent = String(niche + 1).padStart(2, '0') + ' / 04';
  }

  function updateProgressUI(niche, frame, frameCount) {
    var np    = frameCount > 1 ? frame / (frameCount - 1) : 1;
    var total = (niche + np) / TOTAL_NICHES;
    progressFill.style.width = (total * 100) + '%';
  }

  function updateAllRevealEls(niche, frame, frameCount) {
    if (!frames[niche]) return;
    var np = frameCount > 1 ? frame / (frameCount - 1) : 1;
    frames[niche].querySelectorAll('[data-reveal]').forEach(function (el) {
      var t = parseFloat(el.dataset.reveal);
      if (np >= t) { el.classList.add('visible'); }
      else         { el.classList.remove('visible'); }
    });
  }

  function wrapperEndScrollY() {
    return wrapper.getBoundingClientRect().top + window.scrollY
           + wrapper.offsetHeight - window.innerHeight;
  }

  function jumpInstant(y) {
    jumpInProgress = true;
    window.scrollTo({ top: y, behavior: 'instant' });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { jumpInProgress = false; });
    });
  }

})();
