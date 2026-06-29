# Seamless Section Transition — Glass Mesh Fade

A scroll-driven pattern where Section B fades in on top of Section A through a frosted glass effect, with full reverse-scroll support.

---

## Overview

Section A is fixed/visible. Section B overlaps it using negative margin. A frost overlay builds as the user scrolls, obscuring Section A. Section B's content appears behind the frost, then the frost clears — revealing Section B seamlessly. Scrolling back reverses the entire sequence.

---

## HTML Structure

```html
<!-- SECTION A (fixed in place) -->
<section class="section-a">
  <!-- your content -->
</section>
<div class="section-a-spacer"></div>

<!-- SECTION B (overlaps A) -->
<div class="section-b-wrapper">
  <div class="section-b-sticky">
    <div class="section-b-frost" id="sectionBFrost"></div>
    <!-- your Section B content here -->
    <div class="section-b-content" id="sectionBContent">
      ...
    </div>
  </div>
</div>
```

**Key points:**
- `section-a-spacer` reserves scroll height for Section A since it's fixed
- `section-b-frost` is the glass overlay — sits inside the sticky container
- `section-b-content` holds the actual content that appears after frost clears

---

## CSS

```css
/* Section A: fixed behind everything */
.section-a {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 100vh;
  z-index: 0;
}

/* Spacer: reserves scroll space for Section A */
.section-a-spacer {
  height: 100vh;
  pointer-events: none;
}

/* Section B wrapper: overlaps Section A */
.section-b-wrapper {
  position: relative;
  z-index: 1;
  margin-top: -100vh; /* pulls up to overlap Section A */
}

/* Sticky container: locks to viewport during scroll */
.section-b-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.5s ease;
}
.section-b-sticky.visible {
  opacity: 1;
}

/* Frost overlay: glass mesh effect */
.section-b-frost {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;
  z-index: 20;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  background: rgba(0, 0, 0, 0);
  margin-bottom: -100vh; /* collapses so it doesn't push content */
  display: none;
}
```

### Critical CSS details:
- `margin-top: -100vh` on the wrapper makes Section B overlap Section A
- `margin-bottom: -100vh` on the frost collapses it so it doesn't add height
- `pointer-events: none` on spacer lets clicks pass through to Section A
- `opacity: 0` on sticky container hides Section B until frost covers Section A

---

## JavaScript

```js
var wrapper = document.querySelector('.section-b-wrapper');
var frost = document.getElementById('sectionBFrost');
var sticky = wrapper.querySelector('.section-b-sticky');
var spacer = document.querySelector('.section-a-spacer');

function updateTransition() {
  var rect = wrapper.getBoundingClientRect();
  var scrolled = -rect.top;
  var max = wrapper.offsetHeight - window.innerHeight;
  var p = Math.max(0, Math.min(1, scrolled / max));

  // IMPORTANT: Base fade progress on Section A's spacer, NOT Section B's rect.
  // This is what makes reverse scroll work — Section B's rect never truly
  // "leaves" due to margin-top: -100vh, but the spacer does.
  var spacerBottom = spacer.getBoundingClientRect().bottom;
  var fadeInP = Math.max(0, Math.min(1, 1 - (spacerBottom / window.innerHeight)));

  if (fadeInP > 0 && fadeInP < 1) {
    // PHASE 1: Frost builds over Section A
    var frostAmount = Math.min(1, fadeInP / 0.5);
    frost.style.backdropFilter = 'blur(' + (frostAmount * 20) + 'px)';
    frost.style.webkitBackdropFilter = 'blur(' + (frostAmount * 20) + 'px)';
    frost.style.background = 'rgba(0,0,0,' + (frostAmount * 0.6) + ')';
    frost.style.display = 'block';
    sticky.classList.remove('visible');

  } else if (fadeInP >= 1 && p < 0.015) {
    // PHASE 2: Frost fully opaque, Section B content fades in behind it
    frost.style.backdropFilter = 'blur(20px)';
    frost.style.webkitBackdropFilter = 'blur(20px)';
    frost.style.background = 'rgba(0,0,0,0.8)';
    frost.style.display = 'block';
    sticky.classList.add('visible');

  } else if (p >= 0.015 && p < 0.04) {
    // PHASE 3: Frost clears, revealing Section B
    var clearP = (p - 0.015) / 0.025;
    frost.style.backdropFilter = 'blur(' + (20 * (1 - clearP)) + 'px)';
    frost.style.webkitBackdropFilter = 'blur(' + (20 * (1 - clearP)) + 'px)';
    frost.style.background = 'rgba(0,0,0,' + (0.8 * (1 - clearP)) + ')';
    frost.style.display = 'block';
    sticky.classList.add('visible');

  } else if (p >= 0.04) {
    // PHASE 4: Transition complete, frost hidden
    frost.style.display = 'none';
    sticky.classList.add('visible');

  } else if (fadeInP <= 0) {
    // REVERSE: Back at Section A, reset everything
    frost.style.display = 'none';
    frost.style.backdropFilter = 'blur(0px)';
    frost.style.webkitBackdropFilter = 'blur(0px)';
    frost.style.background = 'rgba(0,0,0,0)';
    sticky.classList.remove('visible');
  }
}

window.addEventListener('scroll', function () {
  requestAnimationFrame(updateTransition);
}, { passive: true });
```

---

## Phase Breakdown

| Phase | Scroll Progress | What Happens |
|-------|----------------|--------------|
| 1 | `fadeInP` 0→1 | Frost blur + darken builds over Section A |
| 2 | `fadeInP` = 1, `p` < 0.015 | Frost fully opaque, Section B fades in behind it |
| 3 | `p` 0.015→0.04 | Frost clears (blur + opacity decrease) |
| 4 | `p` >= 0.04 | Frost hidden, Section B fully visible |
| Reverse | `fadeInP` = 0 | Everything resets, Section A visible again |

---

## Tuning

| Parameter | What it controls | Default |
|-----------|-----------------|---------|
| `frost * 20` | Max blur in pixels | 20px |
| `frost * 0.6` | Max darken opacity during frost | 0.6 |
| `0.8` | Opacity when frost is fully built | 0.8 |
| `0.015` / `0.04` | Scroll range where frost clears | 1.5%–4% of total scroll |
| `0.5s ease` | Section B content fade-in speed | 0.5s |

Increase blur for heavier frost. Increase the `0.04` threshold to make the frost clear more slowly.

---

## Common Mistakes

1. **Basing fade on Section B's rect** — Section B has `margin-top: -100vh` so its rect never truly leaves the viewport. Always use Section A's spacer as the scroll anchor.
2. **Forgetting `pointer-events: none`** on the spacer — Section A is fixed underneath, clicks won't reach it.
3. **Forgetting `margin-bottom: -100vh`** on the frost — without it, the frost div pushes Section B content down by 100vh.
4. **Forgetting `-webkit-backdrop-filter`** — Safari requires the prefix.
5. **Not hiding frost when done** — `display: none` after the transition prevents the frost from intercepting scroll or causing performance issues.
