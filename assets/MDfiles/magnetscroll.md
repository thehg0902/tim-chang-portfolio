# Magnet Scroll

A scroll-hijacking pattern where one scroll gesture auto-plays one full animation sequence (canvas frame sequence, video, etc.) and stops. Extra scrolls during playback are swallowed. Supports forward and backward traversal through multiple "niches" (scenes), with clean entry from hero and exit to CTA.

---

## Core Concept

- Normal page scroll in and out of the section (no hijacking at entry/exit)
- Once inside the scrub zone: one scroll = one full sequence plays at a fixed FPS, then stops
- Extra scrolls during animation = ignored (screen does not move)
- Scroll direction determines forward (next scene) or backward (previous scene)
- Page position is physically locked via `jumpInstant` while active — kills trackpad momentum

---

## HTML Structure

```html
<!-- Hero section sits above -->
<section class="wd-hero">...</section>
<div class="wd-hero-spacer"></div>  <!-- 100vh spacer -->

<!-- Scrub wrapper: 300vh tall so sticky has room to stay pinned -->
<div class="wd-scrub-wrapper">
  <div class="wd-scrub-sticky">
    <!-- Frost overlay (entry transition) -->
    <div class="wd-scrub-frost" id="wdScrubFrost"></div>

    <!-- UI chrome -->
    <div class="wd-progress-bar"><div class="wd-progress-fill" id="wdProgressFill"></div></div>
    <div class="wd-nav-dots" id="wdNavDots">
      <div class="wd-dot active"></div>
      <!-- one per niche -->
    </div>
    <div class="wd-niche-counter" id="wdCounter">01 / 04</div>

    <!-- One .wd-frame per niche, canvas-driven -->
    <div class="wd-frame" id="wdFrame0" data-niche="0"
         data-frames="76"
         data-frame-path="../assets/.../frame-"
         data-frame-ext=".webp">
      <canvas class="wd-frame-canvas"></canvas>
      <div class="wd-frame-bg" style="background:#3D2B1F;"></div>
      <div class="wd-frame-content">
        <!-- text with data-reveal="0.0–1.0" triggers on nicheProgress -->
        <h2 data-reveal="0.15">...</h2>
        <p  data-reveal="0.72">...</p>
      </div>
    </div>
    <!-- repeat for each niche -->
  </div>
</div>

<!-- CTA section follows -->
<section id="wd-cta">...</section>
```

---

## CSS

```css
/* Wrapper: tall enough for sticky to remain pinned during wheel-hijack */
.wd-scrub-wrapper {
  position: relative;
  height: 300vh;        /* 100vh natural entry + 200vh sticky buffer */
  z-index: 1;
  margin-top: -100vh;   /* overlap with hero so frost builds as spacer exits */
}

/* Frost overlay: sticky so it stays on screen while building */
.wd-scrub-frost {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;
  z-index: 20;
  backdrop-filter: blur(0px);
  background: rgba(8,8,8,0);
  margin-bottom: -100vh;
  display: none;
}

/* Sticky canvas area: hidden until .visible is added by JS */
.wd-scrub-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.5s ease;
}
.wd-scrub-sticky.visible { opacity: 1; }

/* Frames stack on top of each other; only .active is visible */
.wd-frame {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}
.wd-frame.active { opacity: 1; z-index: 2; }

/* Canvas fills the frame */
.wd-frame-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

## JavaScript

```js
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

(function () {
  'use strict';

  // ── DOM refs ─────────────────────────────────────────────────────
  var wrapper      = document.querySelector('.wd-scrub-wrapper');
  var scrubSticky  = wrapper.querySelector('.wd-scrub-sticky');
  var frames       = document.querySelectorAll('.wd-frame');
  var dots         = document.querySelectorAll('.wd-dot');
  var counter      = document.getElementById('wdCounter');
  var progressFill = document.getElementById('wdProgressFill');
  var scrubFrost   = document.getElementById('wdScrubFrost');

  // ── Constants ─────────────────────────────────────────────────────
  var TOTAL_NICHES = 4;

  // Start frame index (0-based) for each niche's idle/rest state.
  // Usually 0 for all niches. Set niche 0 to 4 if the first few frames
  // are used as an entry animation that should not be re-played on backward.
  var NICHE_START  = [4, 0, 0, 0];

  var TARGET_FPS   = 24;
  var FRAME_MS     = 1000 / TARGET_FPS;

  // ── Preload frames ────────────────────────────────────────────────
  // Each .wd-frame needs: data-frames (count), data-frame-path, data-frame-ext
  // Files are named: {path}{index padded to 4 digits}{ext}  e.g. frame-0001.webp
  var nicheFrames   = {};
  var nicheCanvases = {};
  frames.forEach(function (f, i) {
    var count = parseInt(f.dataset.frames, 10);
    if (!count) return;
    var canvas = f.querySelector('.wd-frame-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    nicheCanvases[i] = { canvas: canvas, ctx: ctx };
    nicheFrames[i]   = [];
    for (var j = 1; j <= count; j++) {
      var img = new Image();
      img.src = f.dataset.framePath + String(j).padStart(4, '0') + f.dataset.frameExt;
      nicheFrames[i].push(img);
    }
    // On first frame load: size canvas to natural dimensions and hide placeholder bg
    nicheFrames[i][0].onload = (function (cv, c, bg) {
      return function () {
        cv.width  = this.naturalWidth;
        cv.height = this.naturalHeight;
        c.drawImage(this, 0, 0);
        if (bg) bg.style.opacity = '0';
      };
    }(canvas, ctx, f.querySelector('.wd-frame-bg')));
  });

  // ── State ─────────────────────────────────────────────────────────
  var scrubActive   = false;
  var currentNiche  = 0;
  var currentFrame  = NICHE_START[0];
  var animating     = false;
  var animRaf       = null;
  var lastFrameTime = 0;

  // Frost (entry transition) state
  var frostDone     = false;
  var frostClearing = false;
  var frostTimer    = null;

  // Guards
  var jumpInProgress = false;
  var exitingToHero  = false;
  var lastScrollY    = 0;
  var savedScrubY    = 0; // page Y pinned while scrub is active

  // Show first niche immediately (canvas draws on image load above)
  frames[0].classList.add('active');
  updateNicheUI(0);

  // ── Frost transition ───────────────────────────────────────────────
  // Builds backdrop-blur as hero spacer scrolls out of view.
  // Once fully covered, animates blur away and activates scrub.
  function checkFrost() {
    if (frostDone || frostClearing) return;
    var spacer = document.querySelector('.wd-hero-spacer');
    if (!spacer) return;
    var fadeInP = Math.max(0, Math.min(1, 1 - spacer.getBoundingClientRect().bottom / window.innerHeight));
    if (fadeInP <= 0) {
      scrubFrost.style.display = 'none';
      scrubSticky.classList.remove('visible');
      return;
    }
    var frost = Math.min(1, fadeInP / 0.5);
    scrubFrost.style.backdropFilter = 'blur(' + (frost * 20) + 'px)';
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
    (function step(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / 600);
      scrubFrost.style.backdropFilter = 'blur(' + (20 * (1 - t)) + 'px)';
      scrubFrost.style.webkitBackdropFilter = 'blur(' + (20 * (1 - t)) + 'px)';
      scrubFrost.style.background = 'rgba(8,8,8,' + (0.8 * (1 - t)) + ')';
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        scrubFrost.style.display = 'none';
        frostDone    = true;
        frostClearing = false;
        currentNiche = 0;
        currentFrame = NICHE_START[0];
        switchToNiche(0);
        drawFrame(0, NICHE_START[0]);
        updateNicheUI(0);
        updateProgressUI(0, NICHE_START[0], nicheFrames[0].length);
        savedScrubY = window.scrollY;
        scrubActive = true;
      }
    }(performance.now()));
  }

  // ── Scroll listener ────────────────────────────────────────────────
  window.addEventListener('scroll', function () {
    if (jumpInProgress) return;

    var scrollY   = window.scrollY;
    var scrollDir = scrollY < lastScrollY ? -1 : 1;
    lastScrollY   = scrollY;

    // SCROLL LOCK: keep page pinned at savedScrubY while scrub is active.
    // This kills trackpad momentum / inertia that would bypass wheel hijacking.
    if (scrubActive && Math.abs(scrollY - savedScrubY) > 2) {
      jumpInstant(savedScrubY);
      return;
    }

    // Back near top → full reset so frost re-runs on next entry
    if (scrollY < window.innerHeight * 0.4) {
      exitingToHero = false;
      if (frostDone || frostClearing) {
        frostDone = false; frostClearing = false; scrubActive = false;
        clearTimeout(frostTimer);
        if (animRaf) { cancelAnimationFrame(animRaf); animRaf = null; animating = false; }
        scrubSticky.classList.remove('visible');
        scrubFrost.style.display = 'none';
      }
      return;
    }

    // Wrapper geometry: sticky is pinned when top <= 0 and bottom >= vh
    var wRect  = wrapper.getBoundingClientRect();
    var inZone = wRect.top <= 0 && wRect.bottom >= window.innerHeight;

    // Overshoot DOWN from hero (fast scroll bypassed frost)
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

    // Complete bypass DOWN (flew past entire wrapper to CTA)
    if (wRect.bottom < window.innerHeight && !frostDone && !frostClearing && !exitingToHero && scrollY > window.innerHeight) {
      clearTimeout(frostTimer);
      scrubFrost.style.display = 'none';
      frostDone = true; frostClearing = false;
      currentNiche = TOTAL_NICHES; currentFrame = 0;
      scrubSticky.classList.remove('visible');
      scrubActive = false;
      return;
    }

    // Overshoot UP from CTA (fast scroll bypassed re-entry check)
    if (inZone && frostDone && !scrubActive && !exitingToHero) {
      reEnterFromCTA(scrollY);
      return;
    }

    // Normal slow scroll: build frost as hero scrolls away
    if (!frostDone && !frostClearing && !exitingToHero && scrollDir === 1) {
      checkFrost();
    }
  }, { passive: true });

  function reEnterFromCTA(atScrollY) {
    currentNiche = TOTAL_NICHES; // boundary: next backward scroll plays niche 3
    currentFrame = 0;
    scrubSticky.classList.add('visible');
    savedScrubY = atScrollY !== undefined ? atScrollY : window.scrollY;
    scrubActive = true;
  }

  // ── Wheel handler (primary magnet-scroll engine) ───────────────────
  window.addEventListener('wheel', function (e) {
    if (frostClearing) { e.preventDefault(); return; }
    if (!scrubActive) return;

    e.preventDefault(); // block page scroll while scrub is active
    if (animating) return; // swallow extra scrolls during animation

    var dir = e.deltaY > 0 ? 1 : -1;

    if (dir === 1) {
      // ── Forward ──────────────────────────────────────────────────
      if (currentNiche >= TOTAL_NICHES) {
        // All niches done — release to CTA
        scrubActive = false;
        jumpInstant(wrapperEndScrollY());
        return;
      }
      startAnimation(1);

    } else {
      // ── Backward ─────────────────────────────────────────────────
      var idleFrame = currentNiche < TOTAL_NICHES ? NICHE_START[currentNiche] : 0;

      if (currentNiche <= 0 && currentFrame === NICHE_START[0]) {
        // At niche 0 idle frame — release back to hero
        scrubActive   = false;
        frostDone     = false;
        exitingToHero = true;
        return;
      }

      // If at current niche's idle frame, retreat to previous niche
      if (currentFrame === idleFrame) currentNiche--;

      // Jump to last frame of the (now current) niche and play backward
      currentFrame = nicheFrames[currentNiche].length - 1;
      switchToNiche(currentNiche);
      drawFrame(currentNiche, currentFrame);
      updateNicheUI(currentNiche);
      updateProgressUI(currentNiche, currentFrame, nicheFrames[currentNiche].length);
      updateAllRevealEls(currentNiche, currentFrame, nicheFrames[currentNiche].length);
      startAnimation(-1);
    }
  }, { passive: false });

  // ── Touch handler (mirrors wheel logic for mobile) ────────────────
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
      if (currentNiche >= TOTAL_NICHES) { scrubActive = false; jumpInstant(wrapperEndScrollY()); return; }
      startAnimation(1);
    } else {
      var idleFrame = currentNiche < TOTAL_NICHES ? NICHE_START[currentNiche] : 0;
      if (currentNiche <= 0 && currentFrame === NICHE_START[0]) {
        scrubActive = false; frostDone = false; exitingToHero = true; return;
      }
      if (currentFrame === idleFrame) currentNiche--;
      currentFrame = nicheFrames[currentNiche].length - 1;
      switchToNiche(currentNiche); drawFrame(currentNiche, currentFrame);
      updateNicheUI(currentNiche);
      updateProgressUI(currentNiche, currentFrame, nicheFrames[currentNiche].length);
      updateAllRevealEls(currentNiche, currentFrame, nicheFrames[currentNiche].length);
      startAnimation(-1);
    }
  }, { passive: true });

  // ── Animation loop ─────────────────────────────────────────────────
  function startAnimation(dir) {
    if (!nicheFrames[currentNiche]) return;
    animating = true;
    if (animRaf) cancelAnimationFrame(animRaf);
    lastFrameTime = 0;

    var niche      = currentNiche; // capture niche index for closure
    var frameCount = nicheFrames[niche].length;
    // Forward plays to last frame; backward plays to this niche's idle frame
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
      // Advance to next niche at its idle frame
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
      // If currentNiche === TOTAL_NICHES: display stays on last frame, next scroll → CTA
    } else {
      // Rest at this niche's idle frame
      var startF   = NICHE_START[niche];
      currentFrame = startF;
      updateProgressUI(niche, startF, nicheFrames[niche].length);
      updateAllRevealEls(niche, startF, nicheFrames[niche].length);
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────
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
    frames[niche].offsetHeight; // force reflow before re-enabling transition
    frames[niche].style.transition = '';
  }

  function updateNicheUI(niche) {
    dots.forEach(function (d) { d.classList.remove('active'); });
    if (dots[niche]) dots[niche].classList.add('active');
    counter.textContent = String(niche + 1).padStart(2, '0') + ' / 0' + TOTAL_NICHES;
  }

  function updateProgressUI(niche, frame, frameCount) {
    var np    = frameCount > 1 ? frame / (frameCount - 1) : 1;
    var total = (niche + np) / TOTAL_NICHES;
    if (progressFill) progressFill.style.width = (total * 100) + '%';
  }

  function updateAllRevealEls(niche, frame, frameCount) {
    if (!frames[niche]) return;
    var np = frameCount > 1 ? frame / (frameCount - 1) : 1;
    frames[niche].querySelectorAll('[data-reveal]').forEach(function (el) {
      var t = parseFloat(el.dataset.reveal);
      el.classList.toggle('visible', np >= t);
    });
  }

  // Returns the scroll Y at which the wrapper bottom aligns with viewport bottom
  // (the point just before the sticky releases and CTA enters view)
  function wrapperEndScrollY() {
    return wrapper.getBoundingClientRect().top + window.scrollY
           + wrapper.offsetHeight - window.innerHeight;
  }

  // Instantly snaps scroll position without triggering the scroll listener logic
  function jumpInstant(y) {
    jumpInProgress = true;
    window.scrollTo({ top: y, behavior: 'instant' });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { jumpInProgress = false; });
    });
  }

})();
```

---

## State Model

| `currentNiche` | `currentFrame`     | Meaning                                      |
|----------------|--------------------|----------------------------------------------|
| 0              | `NICHE_START[0]`   | After frost: niche 0 idle, ready to play     |
| 1–3            | `NICHE_START[N]`   | Niche N idle, ready to play                  |
| `TOTAL_NICHES` | 0                  | All done, next forward scroll releases to CTA|

### Forward scroll from (N, idle)
1. Play niche N: `NICHE_START[N]` → last frame at 24 fps
2. Cut to niche N+1 at `NICHE_START[N+1]` — new idle state
3. If N+1 = TOTAL_NICHES: hold on last frame, next scroll → CTA

### Backward scroll from (N, idle)
1. If N = 0: release scrub, let user scroll back to hero
2. Else: cut to niche N−1 at last frame (75), play backward to `NICHE_START[N−1]`
3. Land at (N−1, idle)

---

## Key Design Decisions

**300vh wrapper** — Gives the `position: sticky` element room to stay pinned while the wheel handler is hijacking scroll. With only 100vh, the sticky releases as soon as the user scrolls one viewport past entry.

**Scroll lock via `jumpInstant`** — The scroll listener is passive (can't `preventDefault`), so trackpad inertia can move the page even when `scrubActive`. The lock detects drift > 2px from `savedScrubY` and snaps back, effectively cancelling momentum without requiring `overflow: hidden`.

**`animating` flag** — Set synchronously at the top of `startAnimation` before the RAF loop starts. Subsequent wheel events check this flag and return early, swallowing them without any queuing.

**Frost entry transition** — `position: sticky; margin-bottom: -100vh` keeps the frost overlay pinned during the build phase. The 0.3s delay + 0.6s RAF animation gives the user a smooth reveal into the scrub section.

**`NICHE_START` array** — Lets each niche define its own idle/start frame independently. Niche 0 uses index 4 (file frame 5) as its start because frames 0–3 are an entry reveal that should not repeat on backward traversal.

**`jumpInProgress` guard** — Prevents the scroll listener from processing events fired by `window.scrollTo` calls (used when exiting to CTA). Without this, programmatic scrolls would re-trigger detection logic.

**Overshoot detection** — Three cases handled in the scroll listener using `wrapper.getBoundingClientRect()`:
- Partial overshoot down (in zone, frost not done) → activate immediately
- Complete bypass down (past wrapper) → mark done, leave at CTA
- Partial overshoot up (in zone, not active) → `reEnterFromCTA`
