# CLAUDE.md — Master Build Guide
> All branches inherit these rules. Branch-specific briefs go in their own folder.

---

## ROLE

You are a professional full-stack web developer and designer. Before writing any code, invoke the **ui-ux-pro-max** skill to inform all design decisions — color, typography, layout, spacing, accessibility, responsiveness. Never skip this step.

---

## BRANCH WORKFLOW

1. When creating a new branch, rename the project folder (not `asset/`) to match the branch name.
2. Read the branch-specific brief (if one exists) before building.
3. Keep everything local unless told to push.

---

## STANDARD WEBSITE STRUCTURE

Every website you build must include(unless requested otherwise):

### 1. Hero Section
- Full-viewport looping video background using an `.mp4` from the `assets/` folder.
- Translucent overlay — never solid colors. Use `rgba()` + `backdrop-filter: blur()` for all masks.
- Company name, tagline, and CTA layered on top with high-contrast text.
- All text must contrast against the video background — use translucent dark panels or text shadows as needed.

### 2. Scroll-Scrub Animation Section
- Directly below the hero, a long scroll-driven animation plays frames extracted from the same (or a second) `.mp4`.
- Site content (text, images, cards, sections) scrolls on top of the animation — the canvas is a **fixed background**, not a blocking overlay.
- Content sections use translucent backgrounds (`rgba()` + `backdrop-filter`) so the animation bleeds through.
- The animation scrubs forward on scroll down, backward on scroll up — fully bidirectional.

### 3. Remaining Sections
- Built per the branch brief (about, menu, features, contact, etc.).
- All section backgrounds are translucent — never solid. Frosted glass / glassmorphism effect throughout.
- Consistent typography pairing (serif headlines + sans-serif body) loaded from Google Fonts.
- Fully responsive: 375px · 768px · 1200px+.
- `@media (prefers-reduced-motion: reduce)` — static fallback, no animations.

---

## SCROLL-SCRUB ANIMATION WORKFLOW

When an `.mp4` is available in `assets/`, follow this process:

### Step 1: Find the video
Look in `assets/` for `.mp4` files. One file → use it. Multiple → ask the user.

### Step 2: Check FFmpeg
Verify FFmpeg is available. If not:
```bash
apt-get update -qq && apt-get install -y -qq ffmpeg
```
Fallback: `pip install imageio[ffmpeg]` or Python with `opencv-python-headless`.

### Step 3: Analyze the video
```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,r_frame_rate,nb_frames -of csv=p=0 assets/<filename>.mp4
```
Report: duration, native FPS, resolution, estimated frame count at 30fps.

### Step 4: Extract frames
```bash
mkdir -p <project-folder>/frames
ffmpeg -i assets/<filename>.mp4 -vf "fps=30,scale=1920:-2" -q:v 3 <project-folder>/frames/frame-%04d.jpg
```
- Videos > 15s: ask user to confirm or trim.
- Videos > 60s: suggest 24fps.
- Always report total frames and folder size.

### Step 5: Build the scroll-scrub

**Canvas:** Fixed to viewport, `z-index: 0`, behind all content. Full-screen, `cover` scaling (no letterboxing).

**Frame preloading:** Load all frames as `Image()` objects. Show a loading bar with percentage. Fade out loader when complete. Draw frame 1 immediately on load.

**Scroll sync:** Map `scrollY / totalScrollableHeight` to frame index. Update canvas on every scroll event (passive listener). Bidirectional — scroll up plays backward.

**Content layering:** All page content sits above the canvas (`z-index: 1+`) and scrolls naturally. A hero spacer (empty transparent section, ~300vh) gives the video room to play before content appears.

### Step 6: Loading screen
Show brand name + progress bar while frames preload. Fade out on completion.

---

## DESIGN RULES

1. **No solid backgrounds** — every surface uses `rgba()` with `backdrop-filter: blur()`. Translucent mask vibe throughout.
2. **Contrast text** — all text must be readable against its background. White text on dark/video areas, dark text on light translucent areas. Use text-shadow or translucent panels when needed.
3. **CSS custom properties** — all colors, fonts, spacing defined once in `:root`.
4. **Typography** — always pair an elegant serif (Playfair Display, Lora) with a clean sans-serif (Inter, DM Sans).
5. **No Lorem ipsum** — write real copy for every section based on the brand brief.
6. **Semantic HTML** — one `h1` per page, `alt` text on images, keyboard navigable.
7. **Image placeholders** — use gradient `<div>` blocks with `<!-- REPLACE: [description] -->` comments.
8. **Vanilla HTML/CSS/JS** — no frameworks unless the brief specifies one. CDN libraries only if genuinely needed.
9. **GPU-safe animations** — `transform` and `opacity` only. Never animate layout properties.
10. **No console errors, no broken links.**
11. **No boring entrances** — every element must animate into view. Use fade-ins, slide-ups, scale reveals, or staggered entrances depending on the site's vibe. Elegant sites get slow, subtle fades. Energetic sites get snappy slides and bounces. Elements should also fade/transition out when scrolling away if appropriate. Use `IntersectionObserver` for scroll-triggered animations. Stagger child elements (cards, list items) so they cascade in sequence, not all at once.
12. **Micro-interactions** — every interactive element must have hover/focus/active states. Buttons: scale, glow, or color shift on hover. Cards: lift with shadow on hover. Links: underline slide or color transition. Inputs: border glow on focus. Click feedback on CTAs (subtle press/scale). Nothing should feel dead when you interact with it.
13. **Smart loading** — beyond the frame loader, use skeleton screens or shimmer placeholders for content areas that load asynchronously. Images should fade in on load, not pop. Use `loading="lazy"` on below-fold images. Progressive enhancement — the page should feel fast even on slow connections.
14. **Scroll progress indicator** — include a thin progress bar at the top of the viewport or a dot-nav on the side showing current section. Especially important on long scroll-scrub pages. Style it to match the site's palette — translucent, not solid.
15. **Spacing system** — define a consistent spacing scale in `:root` (e.g. `--space-xs: 0.5rem` through `--space-3xl: 8rem`). Use these variables everywhere. Consistent vertical rhythm between sections, consistent gaps between elements. No magic numbers.
16. **Dark mode** — support `prefers-color-scheme: dark` with a second set of CSS custom properties. Optionally include a toggle switch in the nav. Dark mode backgrounds should be rich dark tones (not pure black), with adjusted text opacity and accent colors that pop on dark surfaces.
17. **Custom cursor** — on desktop, replace the default cursor with a custom dot-follower or blend-mode circle that reacts to hoverable elements (grows on buttons, changes blend mode on images). Disable on mobile/touch. Keep it subtle — enhance, don't distract.
18. **Page transitions** — when navigating between pages, use a smooth fade, slide, or wipe transition instead of hard reloads. Intercept link clicks, animate the current page out, load the new page, animate it in. Keep transitions fast (300–500ms). Fall back gracefully if JS fails.
19. **No stray elements** — no element should overlap where it doesn't belong. Check `z-index` stacking, `position: fixed/sticky` elements, and `overflow` behavior. Fixed elements (hero text, nav, scroll hints, custom cursor) must have explicit show/hide logic tied to scroll position — they must disappear when they should, not linger. But sections themselves should flow cohesively into each other — no hard edges, no straight-line dividers, no solid borders between sections. Use gradient fades, soft blurs, overlapping translucent layers, curved SVG dividers, or natural color transitions so the page feels like one continuous experience. Straight angles and solid borders are only used when the client brief specifically asks for them.
20. **Fast-scroll safety** — all scroll-driven logic must handle rapid scrolling and momentum scroll. Use `requestAnimationFrame` for canvas updates, not raw scroll events. Clamp all frame indices and progress values. Fixed/sticky elements (hero text, scroll hints, loaders) must use hard cutoffs, not just opacity transitions — set `visibility: hidden` or `display: none` past their scroll zone so they can't ghost over other content. Test: if you slam the scrollbar from top to bottom instantly, nothing should flash, overlap, or stick around.
21. **Clean sections** — before finishing, audit every section visually. No orphaned elements, no stray borders, no phantom padding, no placeholder text left behind (unless marked with `<!-- REPLACE -->`). Every section should look intentional and complete on its own. If a section looks empty or broken without real images, make the placeholder styling good enough to present.
22. **Mobile-first, always** — 80% of traffic is mobile. Design for 375px FIRST, then scale up to tablet (768px) and desktop (1200px+). Every layout decision starts mobile. Specific requirements:
    - **Touch targets:** all buttons/links minimum 44×44px tap area. No tiny links or cramped nav items.
    - **Scroll-scrub on mobile:** use every 2nd frame to reduce memory usage. If device has <4GB RAM or is iOS Safari, fall back to a static hero image or looping `<video>` instead of canvas frame scrub. Detect with `navigator.deviceMemory` and `navigator.userAgent`.
    - **No hover-dependent UI** — anything revealed on hover must have a tap/click alternative on mobile. Tooltips, dropdown menus, card reveals — all must work without hover.
    - **Typography:** base font size minimum 16px on mobile (prevents iOS zoom on input focus). Line length max ~45 characters on mobile for readability.
    - **Custom cursor:** disabled entirely on touch devices. Detect with `matchMedia('(pointer: coarse)')`.
    - **Navigation:** hamburger menu on mobile/tablet. Full nav only on desktop. Menu must be thumb-reachable — consider bottom-sheet or full-screen overlay, not a tiny dropdown.
    - **Images/placeholders:** stack to single column on mobile. No side-by-side layouts below 768px unless items are very small (icons, badges).
    - **Scroll progress:** use a thin top bar on mobile, not a side dot-nav (too small to tap, wastes horizontal space).
    - **Performance:** lazy load everything below the fold. Minimize JS payload. Test on throttled 3G — the site must still feel usable.
    - **Viewport:** always include `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. Never use `maximum-scale=1` or `user-scalable=no` — accessibility violation.
    - **Test breakpoints:** 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1024px (iPad landscape), 1200px+ (desktop). Every section must look intentional at each size.
23. Scroll-scrub companion content — the scroll animation section must never feel like an empty video playing behind a blank space. Layer in supporting text or image elements that appear, move, 
	and fade alongside the animation as the user scrolls. Examples: a headline that fades in at 20% progress and out at 50%, a product callout that slides in from the side at 40%, a subtle 
	tagline pinned briefly at center screen. These elements support the animation — they don't compete with it. Keep them minimal, translucent, and timed to complement what's happening in the 
	video. Use scroll-progress-based opacity and transforms, not static placement. On mobile, simplify to one element at a time to avoid clutter.
---

## UI/UX PRO MAX

Always invoke the `ui-ux-pro-max` skill before building any UI. Use it for:
- Color palette selection and validation
- Typography and font pairing
- Layout and spacing decisions
- Accessibility checks
- Responsive design guidance
- Style direction (glassmorphism, minimalism, etc.)

Do not wait to be asked. Use it proactively on every frontend task.

---

## BUILD OUTPUT

Standard file structure per project:
```
webfiles/
  index.html
  menu.html (or other pages per brief)
  style.css
  script.js
  frames/        ← extracted video frames
assets/
  *.mp4          ← source videos (shared across branches)
```

---

## COMMIT & PUSH

- Keep everything local by default.
- Only push when explicitly told.
- Warn if `frames/` folder exceeds 50MB — suggest `.gitignore` + external hosting.
- Never force push. Never skip hooks.

---

## CLIENT BRIEF — FILL THIS IN PER BRANCH

# CLAUDE.md — Tim Chang Portfolio
---

## IDENTITY

| | |
|---|---|
| Name | Tim Chang |
| Title | Designer · Marketer · Developer |
| Domain | timchang.com |
| Aesthetic | Cyberpunk industrial → deep space. Dark, neon-lit, cinematic. |
| Fonts | Orbitron 900 (headlines/name) · JetBrains Mono (labels/eyebrows) · Inter (body) |
| Primary accent | #7b6ee0 (purple) |
| Secondary accent | #ff8c00 (rocket flame / amber) |
| Background | #000000 → #080810 |
| Text primary | #f2f2f4 |
| Text secondary | #888892 |
| Text muted | #4a4a55 |

Load all three fonts via Google Fonts CDN. Define every value above as a CSS custom property in `:root`.

---

## ROLE

You are a professional full-stack web developer and designer. Build a complete, production-ready single-page portfolio for Tim Chang. Read every section of this file before writing a single line of code. Build exactly what is described — do not simplify, do not substitute, do not ask questions.

---

## FILE STRUCTURE

```
webfiles/
  index.html
  style.css
  script.js
  frames/                 ← FFmpeg will extract frames here (do not create manually)
assets/
  rocket-video.mp4        ← generate via Higgsfield (see ASSET GENERATION section) or drop in manually
```

---

## PAGE STRUCTURE

Single page. Five scenes rendered in sequence. The entire experience is scroll-driven — no page reloads, no routing.

```
[00] Loading screen
[01A] Hero — black + neon name reveal
[01B] Hero — curtains open (split layout)
[02] Scroll-scrub — rocket journey + services reveal  ← ONE continuous video sequence
[03] Contact
```

---

## SCENE 00 — LOADING SCREEN

**What it is:** Full black screen with a minimal progress bar. Shown while all assets preload. No branding visible yet — just anticipation.

**Build:**
- `#000000` background, full viewport
- A single 120px × 1px progress bar, horizontally centred, vertically centred
- Bar fill: `#7b6ee0` with `box-shadow: 0 0 12px rgba(123,110,224,0.9)`
- Below bar: `loading assets...` in JetBrains Mono, 11px, `#333348`, letter-spacing 0.1em
- JS: preload every frame image using `new Image()`. Track `onload` count vs total. Update bar width as `(loaded / total * 100)%`
- When 100% loaded: fade loader `opacity` to 0 over 600ms, then `display:none`, then begin Scene 01A automatically

---

## SCENE 01A — HERO: NEON NAME REVEAL

**What it is:** Loader fades. Black screen remains. TIM CHANG appears letter by letter, like a neon sign warming up — flickering voltage before it stabilises.

**Build:**
- Full viewport, `#000` background
- Font: Orbitron 900, `clamp(32px, 6vw, 64px)`, letter-spacing 0.12em, colour `#fff`
- Text-shadow stack (neon glow):
  ```css
  text-shadow:
    0 0 7px #fff,
    0 0 20px #fff,
    0 0 40px #7b6ee0,
    0 0 80px #7b6ee0,
    0 0 120px #7b6ee0;
  ```
- Letter animation: each letter starts `opacity: 0`. Reveal T → I → M → [space] → C → H → A → N → G, 80ms apart using JS `setTimeout` stagger
- Each letter flickers before locking: `opacity` oscillates 3× (0.6 → 1 → 0.5 → 1) over ~200ms before settling at `opacity: 1`
- After all 9 letters are stable (~1.8s total): automatically begin Scene 01B curtain animation

---

## SCENE 01B — HERO: CURTAINS OPEN

**What it is:** Two dark panels slide apart left and right, revealing the industrial warehouse backdrop. The layout splits into two halves — skills left, rocket right. Name and tagline remain. A dormant rocket waits on the right.

### Layout
CSS Grid: `grid-template-columns: 1fr 1fr`. Full viewport height.

### Background (revealed behind curtains)
```css
background:
  radial-gradient(ellipse at 30% 60%, rgba(123,110,224,0.08) 0%, transparent 60%),
  radial-gradient(ellipse at 70% 40%, rgba(255,80,80,0.05) 0%, transparent 50%),
  linear-gradient(160deg, #0a0a14 0%, #060608 50%, #0d0508 100%);
```

Industrial floor overlay (absolute, bottom 45% of viewport):
```css
background:
  repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 60px, rgba(255,255,255,0.03) 61px),
  repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 40px, rgba(255,255,255,0.03) 41px);
```

Neon strip lights (absolute, top 12%, full width, 2px tall):
```css
background: linear-gradient(90deg,
  transparent 5%,
  rgba(123,110,224,0.6) 15%, rgba(123,110,224,0.6) 18%, transparent 20%,
  transparent 35%,
  rgba(255,80,100,0.5) 40%, rgba(255,80,100,0.5) 43%, transparent 45%,
  transparent 60%,
  rgba(123,110,224,0.6) 65%, rgba(123,110,224,0.6) 68%, transparent 70%
);
box-shadow: 0 0 20px rgba(123,110,224,0.4), 0 0 40px rgba(123,110,224,0.15);
```

### Curtain panels
- Two `div`s — left and right — each `width: 50%`, full height, `position: absolute`
- Left: `background: linear-gradient(to right, #0a0510, #150d20)`, `border-right: 2px solid rgba(123,110,224,0.4)`, `box-shadow: inset -20px 0 40px rgba(0,0,0,0.8), 4px 0 30px rgba(123,110,224,0.2)`
- Right: mirror of left with border-left instead
- Animation (triggered after Scene 01A completes):
  ```css
  transition: transform 1.2s cubic-bezier(0.76, 0, 0.24, 1);
  ```
  Left panel: `translateX(-100%)` · Right panel: `translateX(100%)`

### Left column — identity + skills
Content centred vertically, padded 20px left.

**Name:** Orbitron 900, `clamp(14px, 2.5vw, 22px)`, `#fff`, full neon glow text-shadow stack (same as 01A but smaller)

**Tagline:** JetBrains Mono, `clamp(8px, 1.2vw, 10px)`, `rgba(200,190,255,0.5)`, letter-spacing 0.25em, uppercase. Text: `Designer · Marketer · Developer`

**Three skill rows** — stagger-reveal starting when curtains are 60% open (600ms into curtain animation):
Each row:
```css
background: rgba(123,110,224,0.04);
border: 1px solid rgba(123,110,224,0.15);
border-left: 2px solid #7b6ee0;
border-radius: 8px;
padding: 8px 12px;
display: flex; align-items: center; gap: 10px;
```
Left border glow: `box-shadow: -4px 0 12px rgba(123,110,224,0.4)` on the left border

Row 1: icon `⬡` · title `WEB DEVELOPMENT` · sub `Fast · Responsive · Built to convert`
Row 2: icon `◈` · title `DIGITAL MARKETING` · sub `Campaigns that actually perform`
Row 3: icon `◎` · title `DESIGN` · sub `Brand identity that sticks`

Title: Orbitron 700, `clamp(7px, 1.1vw, 10px)`, `#a090f0`, uppercase, letter-spacing 0.06em
Sub: JetBrains Mono, `clamp(6px, 0.9vw, 9px)`, `#44445a`

Stagger: row 1 at 600ms, row 2 at 750ms, row 3 at 900ms after curtain open starts. Each fades in from `opacity:0, translateX(-10px)` → `opacity:1, translateX(0)` over 300ms.

### Right column — rocket at rest
Vertically centred. Rocket sits in the lower 60% of the column.

**Vertical neon divider** between columns:
```css
/* on .wh-right::before */
position: absolute; left: 0; top: 10%; bottom: 10%;
width: 1px;
background: linear-gradient(to bottom, transparent, rgba(123,110,224,0.3), transparent);
box-shadow: 0 0 12px rgba(123,110,224,0.2);
```

**Rocket (CSS shape):**
- Body: `width: clamp(18px, 2.5vw, 28px)`, `height: clamp(80px, 14vw, 130px)`
- `background: linear-gradient(135deg, #d8d8e8 0%, #a0a0b8 35%, #707088 70%, #505068 100%)`
- `border-radius: 50% 50% 8% 8% / 55% 55% 8% 8%`
- `box-shadow: 0 0 20px rgba(123,110,224,0.2), inset -3px 0 8px rgba(0,0,0,0.3)`
- Porthole window (::after): `width:30%, height:14%`, radial-gradient purple glow, `border-radius:50%`, positioned at top 20%
- Panel lines: 2× horizontal `::before` pseudo-lines at 40% and 60% down the body, `rgba(255,255,255,0.1)`
- Fins (separate div): `width:170%`, trapezoidal `clip-path: polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)`, positioned at bottom of body
- Exhaust (separate div): `clamp(10px, 1.8vw, 18px)` wide, `clamp(20px, 3.5vw, 32px)` tall, gradient `rgba(255,140,0,0.3)→transparent`, pulsing animation:
  ```css
  @keyframes exhaustPulse {
    0%,100% { opacity:0.3; transform:scaleX(1); }
    50% { opacity:0.6; transform:scaleX(1.2); }
  }
  animation: exhaustPulse 1.8s ease-in-out infinite;
  ```
- Label below: `scroll to launch ↓`, JetBrains Mono 8px, `rgba(123,110,224,0.35)`, pulsing opacity animation

---

## SCENE 02 — SCROLL-SCRUB: ROCKET JOURNEY + SERVICES

**What it is:** One continuous scroll-driven animation covering the entire journey — launch, zoom to centre, drift left, and all three service cards arriving from the right like clouds the rocket passes through. This is a single video file broken into frames and driven by scroll position.

---

### 2A — VIDEO / FRAME EXTRACTION

Check `assets/` for `rocket-video.mp4`.

**If the file exists:**

Install FFmpeg:
```bash
apt-get update -qq && apt-get install -y -qq ffmpeg
```

Analyze first:
```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,duration,r_frame_rate,nb_frames \
  -of csv=p=0 assets/rocket-video.mp4
```

Extract frames at 30fps, capped at 1920px wide:
```bash
mkdir -p frames
ffmpeg -i assets/rocket-video.mp4 -vf "fps=30,scale=1920:-2" -q:v 3 frames/frame-%04d.jpg
```

Report total frame count and folder size when done.

**If no video file exists:**
Build a pure CSS + canvas JS animation (see Section 2C below). Do not halt — proceed with the generative fallback.

---

### 2B — SCROLL-SCRUB ENGINE (when video frames exist)

```javascript
const TOTAL_FRAMES = /* insert extracted count */;
const images = [];
let loaded = 0;

function framePath(i) {
  return 'frames/frame-' + String(i).padStart(4, '0') + '.jpg';
}

// Preload all frames (include in loading screen progress)
for (let i = 1; i <= TOTAL_FRAMES; i++) {
  const img = new Image();
  img.src = framePath(i);
  img.onload = () => { loaded++; updateLoader(); };
  images[i] = img;
}

// Canvas — fixed, full viewport, z-index 10
const canvas = document.getElementById('scrubCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function drawFrame(index) {
  if (!images[index]?.complete) return;
  const img = images[index];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Cover scaling — no letterbox
  const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
}

let currentFrame = 1;

function onScroll() {
  const spacer = document.getElementById('scrubSpacer');
  const maxScroll = spacer.offsetHeight - window.innerHeight;
  const progress = Math.max(0, Math.min(1, window.scrollY / maxScroll));
  const frameIndex = Math.max(1, Math.min(TOTAL_FRAMES,
    Math.round(progress * (TOTAL_FRAMES - 1)) + 1
  ));
  if (frameIndex !== currentFrame) {
    currentFrame = frameIndex;
    drawFrame(frameIndex);
  }
  updateOverlays(progress);
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => { resizeCanvas(); drawFrame(currentFrame); });
```

**Spacer height:**
```javascript
// scrubSpacer height = total duration of journey in scroll distance
// Formula: TOTAL_FRAMES / 30 * 300vh — minimum 400vh
document.getElementById('scrubSpacer').style.height =
  Math.max(400, (TOTAL_FRAMES / 30) * 300) + 'vh';
```

Canvas: `position:fixed`, `top:0`, `left:0`, `width:100%`, `height:100%`, `z-index:10`, `pointer-events:none`.

---

### 2C — GENERATIVE FALLBACK (no video file)

Build a CSS + JS animated version that replicates the five keyframe states using scroll-driven transforms:

**Scroll progress → rocket state mapping:**

| Progress | Rocket state |
|---|---|
| 0% | Right side, small, at rest — `translateX(25vw) translateY(10vh) scale(0.4)` |
| 0→25% | Lifts off — `translateY` decreases (rises), flame grows, exhaust trail appears |
| 25→50% | Moves to centre AND scales up — `translateX(0) translateY(0) scale(1.4)` |
| 50→70% | Scales back down, drifts left — `translateX(-30vw) scale(0.5)` |
| 70→100% | Holds left, small — `translateX(-35vw) scale(0.35)` |

Rocket is a CSS-shaped element (same spec as Scene 01B but larger). All transforms driven by `window.scrollY` mapped to progress %. Interpolate linearly between keyframe values. Use `requestAnimationFrame`.

Background transitions with scroll:
- 0→25%: warehouse grid fades out, stars fade in
- 25→50%: deep space, radial purple glow behind rocket
- 50→100%: stars hold, ambient nebula wisps (CSS blur gradients, `position:fixed`)

Flame size and glow scale with `progress`:
```javascript
const flameHeight = progress < 0.5
  ? 20 + progress * 100  // grows to launch
  : 60 - (progress - 0.5) * 60; // shrinks as rocket coasts
```

---

### 2D — SERVICE CARDS OVERLAY

Service cards are **HTML elements overlaid on top of the canvas** — not part of the video. This keeps hover effects, click targets, and interactivity fully functional.

Cards use `position: fixed`, hidden by default, revealed at specific scroll thresholds via JS.

**Reveal sequence (tied to scroll progress):**

| Progress | Event |
|---|---|
| 65% | Card 1 (Web Development) slides in from `translateX(110vw)` → `translateX(0)` over 400ms CSS transition |
| 75% | Card 2 (Digital Marketing) slides in same way |
| 85% | Card 3 (Design) slides in same way |

Cards stack vertically on the right side of the screen (`right: 4vw`, `top: 50%`, `transform: translateY(-50%)`), each offset by `(index * (card-height + gap))`.

**Card spec:**
```css
.service-card {
  width: clamp(200px, 35vw, 380px);
  background: rgba(123,110,224,0.08);
  border: 1px solid rgba(123,110,224,0.3);
  border-radius: 12px;
  padding: 20px 24px;
  position: fixed;
  right: 4vw;
  cursor: pointer;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
              border-color 0.15s, box-shadow 0.15s;
  z-index: 20;
}

/* top neon edge */
.service-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(123,110,224,0.8), transparent);
}

/* hover */
.service-card:hover {
  transform: translateY(-4px) !important;
  border-color: rgba(123,110,224,0.6);
  box-shadow: 0 8px 40px rgba(123,110,224,0.2);
}
```

Each card contains:
- Icon (16px): `⬡` / `◈` / `◎`
- Title: Orbitron 700, `clamp(9px, 1.4vw, 13px)`, `#a090f0`, uppercase
- 20px wide × 1px divider line, `rgba(123,110,224,0.4)`
- Description: Inter 13px, `#44445a`, line-height 1.6
- Arrow: `→`, `rgba(123,110,224,0.5)`, margin-top auto

Card content:
- **Web Development** — "Fast, responsive sites built to convert"
- **Digital Marketing** — "Campaigns that actually perform"
- **Design** — "Brand identity that sticks"

Each card links to a `#contact` anchor (for now). Replace with modal or detail page when ready.

**Nebula wisps** (atmosphere effect as cards enter):
3 CSS `div`s, `position:fixed`, `pointer-events:none`, `z-index:15`:
- `background: radial-gradient(ellipse, rgba(180,160,255,0.04), transparent)`
- `filter: blur(8px)`
- Staggered horizontal positions, fade in/out tied to scroll progress 60%→90%

---

### 2E — REDUCED MOTION FALLBACK

```css
@media (prefers-reduced-motion: reduce) {
  /* Hide canvas and scrub spacer */
  #scrubCanvas, #scrubSpacer { display: none; }
  /* Show static services section instead */
  #staticServices { display: flex; }
}
```

`#staticServices`: standard three-column card layout, same card spec but static, no animation.

---

## SCENE 03 — CONTACT

**What it is:** Minimal, dark, neon-accented. One headline. One button. Links to the client intake questionnaire.

**Triggers:** Fades in after the scroll-scrub spacer ends and service cards have all revealed.

**Layout:** Full viewport, `display:flex`, `flex-direction:column`, `align-items:center`, `justify-content:center`, `background:#000`.

**Ambient glow:**
```css
/* ::before on the section */
position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
width: 400px; height: 300px;
background: radial-gradient(ellipse, rgba(123,110,224,0.07) 0%, transparent 70%);
```

**Eyebrow:** `// let's work together` — JetBrains Mono 11px, `rgba(123,110,224,0.5)`, letter-spacing 0.2em, uppercase

**Headline:** `Got a project?` + line break + `Let's build it.` — Orbitron 900, `clamp(28px, 5vw, 52px)`, `#fff`, letter-spacing 0.06em, `text-align:center`, line-height 1.2

**Sub:** `Tell me what you need — I'll get back within 24 hours.` — Inter 14px, `#44445a`, centred, margin-bottom 32px

**CTA button:**
```css
.contact-btn {
  display: inline-flex; align-items: center; gap: 10px;
  background: linear-gradient(135deg, #7b6ee0, #5a4cc0);
  color: #fff;
  font-family: 'Orbitron', sans-serif;
  font-size: clamp(10px, 1.4vw, 13px);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 14px 32px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  box-shadow: 0 0 40px rgba(123,110,224,0.4), 0 4px 20px rgba(0,0,0,0.4);
  cursor: pointer;
  text-decoration: none;
  transition: filter 0.15s, box-shadow 0.15s;
}
.contact-btn:hover {
  filter: brightness(1.15);
  box-shadow: 0 0 60px rgba(123,110,224,0.6), 0 4px 20px rgba(0,0,0,0.4);
}
```

Button text: `Work with me →`
Button href: link to the WebBrief intake questionnaire URL (placeholder `#` until Tim provides the live URL)

**Closing neon line** at very bottom of the section:
```css
position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
background: linear-gradient(90deg, transparent, rgba(123,110,224,0.4), transparent);
box-shadow: 0 0 20px rgba(123,110,224,0.3);
```

**Footer** below contact section: `© Tim Chang` · `JetBrains Mono` · 12px · `#333348` · centred · 40px padding

---

## DESIGN SYSTEM

### Colors (all as CSS vars)
```css
:root {
  --bg: #000000;
  --bg-surface: #080810;
  --bg-card: rgba(123,110,224,0.06);
  --border: rgba(255,255,255,0.07);
  --border-accent: rgba(123,110,224,0.3);
  --accent: #7b6ee0;
  --accent-soft: #a090f0;
  --accent-glow: rgba(123,110,224,0.4);
  --flame: #ff8c00;
  --text-1: #f2f2f4;
  --text-2: #888892;
  --text-3: #4a4a55;
}
```

### Typography
- `Orbitron` — headlines, name, card titles, button — always uppercase or near-uppercase
- `JetBrains Mono` — eyebrows, labels, code-style text, captions
- `Inter` — body copy, descriptions, sub-text

### Motion principles
- Only animate `transform` and `opacity` — never layout properties
- Easing: `cubic-bezier(0.76, 0, 0.24, 1)` for curtains · `cubic-bezier(0.34, 1.56, 0.64, 1)` for card entrances · `ease-in-out` for ambient pulses
- All animations respect `@media (prefers-reduced-motion: reduce)`

---

## HIGGSFIELD ASSET GENERATION

Before building any section, check `assets/` for existing files. If a required asset is missing, follow this workflow to generate it via the Higgsfield MCP — **do not proceed silently with a placeholder if the asset can be generated**.

---

### WORKFLOW

**Step 1 — Identify missing assets**
At the start of the session, scan `assets/` and list every file present. Cross-reference against the asset manifest below. For each missing asset, print a generation request in this format:

```
ASSET REQUEST
─────────────────────────────────────────────
Section   : [scene name]
File name : assets/[filename]
Type      : image | video
Purpose   : [one sentence describing what it is]
Prompt    : [exact generation prompt]
Model     : [recommended Higgsfield model]
─────────────────────────────────────────────
Approve this generation? (yes / skip)
```

Wait for approval before generating. Never auto-generate without explicit confirmation.

**Step 2 — Generate on approval**
When approved, call the Higgsfield MCP `generate_image` or `generate_video` tool with the prompt and model specified. Pass `get_cost: true` first to confirm credit cost, then generate.

**Step 3 — Save to assets/**
When the generation completes, download the output and save it to `assets/` using the exact filename specified in the manifest. Do not rename, do not use generic filenames like `output.jpg`.

**Step 4 — Reference in code**
Use the saved filename in the HTML/CSS exactly as specified. Add a comment above the reference: `<!-- GENERATED: [filename] via Higgsfield [model] -->`.

---

### ASSET MANIFEST

Every asset this site needs, with generation details if missing:

#### 01 — ROCKET SCROLL VIDEO

| | |
|---|---|
| File | `assets/hero-rocket-scroll.mp4` |
| Section | Scene 02 — scroll-scrub hero |
| Type | Video |
| Required | Yes — the entire scroll-scrub section depends on this |

**Generation prompt (Higgsfield):**
```
Cinematic dark cyberpunk rocket launch sequence. The rocket begins at rest on the right side of frame against a dark industrial warehouse backdrop, neon purple strip lights above. As the scene progresses the rocket ignites — orange and amber flame erupts beneath it — and it lifts off. The rocket moves to center frame and zooms in close, engine blazing, exhaust trail below. Then it zooms back out and drifts to the left side of frame, smaller now, against a deep star field. The entire sequence is slow, cinematic, smooth — shot as if from a fixed camera. Dark background throughout, no text, no UI. 16:9 aspect ratio.
```

**Model:** Kling 3.0 (`kling3_0`), mode: `pro`, duration: 15s, aspect: 16:9, sound: off
**Estimated cost:** ~50 credits
**After generation:** Extract frames with FFmpeg (see Scene 02 — Section 2A)

---

#### 02 — HERO BACKGROUND STILL (fallback)

| | |
|---|---|
| File | `assets/hero-bg-warehouse.jpg` |
| Section | Scene 01B — curtain reveal background |
| Type | Image |
| Required | Recommended — used if video is not available yet |

**Generation prompt (Higgsfield):**
```
Dark industrial warehouse interior, cyberpunk aesthetic, viewed from the center. Concrete floors with faint perspective grid lines receding into the distance. Neon strip lights overhead — purple on the left side, deep red on the right — casting dramatic pools of coloured light on the floor. Heavy metal structural beams. No people. Extremely dark, moody, cinematic. Background for a hero section. 16:9.
```

**Model:** `nano_banana_2` (Nano Banana Pro), aspect: 16:9
**Estimated cost:** ~5–8 credits
**File usage:** `background-image` on `.curtain-bg` fallback, behind the CSS gradients

---

#### 03 — DEEP SPACE BACKGROUND

| | |
|---|---|
| File | `assets/scene-space-bg.jpg` |
| Section | Scene 02 — scroll-scrub background (behind canvas) |
| Type | Image |
| Required | Optional — enhances atmosphere behind the canvas |

**Generation prompt (Higgsfield):**
```
Deep space star field, extremely dark background, scattered stars of varying sizes and brightness. Subtle purple and indigo nebula wisps in the far distance, very faint. No planets, no rockets, no text. Pure cosmic atmosphere. Ultra wide, 16:9.
```

**Model:** `nano_banana_2`, aspect: 16:9
**Estimated cost:** ~5–8 credits
**File usage:** `background-image` on `body` or the scroll-scrub section wrapper

---

#### 04 — OG / SOCIAL PREVIEW IMAGE

| | |
|---|---|
| File | `assets/og-preview.jpg` |
| Section | `<meta og:image>` tag in `<head>` |
| Type | Image |
| Required | Yes — needed for link previews when sharing timchang.com |

**Generation prompt (Higgsfield):**
```
Dark cyberpunk portfolio preview card. The text "TIM CHANG" in large glowing neon Orbitron-style letters, white with purple glow, centered on a pure black background. Below it in smaller letters: "Designer · Marketer · Developer" in a subtle purple monospace font. Minimal, striking, dark. 16:9 aspect ratio, looks good as a social media link preview card.
```

**Model:** `nano_banana_2`, aspect: 16:9
**Estimated cost:** ~5–8 credits
**File usage:**
```html
<meta property="og:image" content="https://timchang.com/assets/og-preview.jpg">
<meta name="twitter:image" content="https://timchang.com/assets/og-preview.jpg">
```

---

### NAMING CONVENTION

All generated assets follow this pattern:

```
assets/[scene]-[description]-[variant].[ext]

Examples:
  assets/hero-rocket-scroll.mp4
  assets/hero-bg-warehouse.jpg
  assets/scene-space-bg.jpg
  assets/og-preview.jpg
  assets/contact-bg-dark.jpg      ← if added later
```

Never use: `image1.jpg`, `output.png`, `generated.mp4`, `untitled.jpg`

---

### CREDIT ESTIMATE SUMMARY

| Asset | Model | Est. Credits |
|---|---|---|
| Rocket scroll video (15s pro) | Kling 3.0 pro | ~50 |
| Hero warehouse bg | Nano Banana Pro | ~6 |
| Space background | Nano Banana Pro | ~6 |
| OG preview image | Nano Banana Pro | ~6 |
| **Total** | | **~68 credits** |

Current balance: 1,210 credits (Plus plan) — well within budget.

---

## BUILD RULES

1. Single page — `index.html` + `style.css` + `script.js`
2. All CSS values from CSS custom properties — no hardcoded hex except inside `:root`
3. Fully responsive: 375px · 768px · 1200px+. On mobile, the scroll-scrub sequence uses every 2nd frame to reduce memory
4. No frameworks, no build step — vanilla HTML/CSS/JS only. CDN only for Google Fonts
5. No Lorem ipsum — all copy is written above, use it verbatim
6. No console errors. No broken links. No `href="#"` without a comment explaining the placeholder
7. Semantic HTML — `<main>`, `<section>`, `<nav>` — one `<h1>` (the name), `<h2>` for section headlines
8. Canvas `aria-hidden="true"` · service cards have `role="button"` and keyboard focus styles
9. Scroll events use `{ passive: true }`
10. `requestAnimationFrame` for all scroll-driven rendering — no direct DOM writes inside scroll handlers

---

## COMPLETION CHECKLIST

When done, confirm every item:

- [ ] Loading screen preloads frames and shows real progress %
- [ ] Scene 01A: name flickers on letter by letter with neon glow
- [ ] Scene 01B: curtains open, split layout renders correctly — skills left, rocket right
- [ ] Skill rows stagger in during curtain animation
- [ ] Scroll-scrub canvas: frame advances forward on scroll down, backward on scroll up
- [ ] Rocket position + scale correctly mapped to scroll progress (5 keyframe states)
- [ ] Service cards slide in from right in sequence at correct scroll thresholds
- [ ] Card hover: lift + border glow works
- [ ] Contact section visible after scroll-scrub ends
- [ ] "Work with me" button styled and linked (href: timchang.com intake form)
- [ ] Fully responsive at 375px, 768px, 1200px+
- [ ] `prefers-reduced-motion` fallback renders static services section
- [ ] No console errors
- [ ] All CSS via custom properties
- [ ] All generated assets saved in `assets/` with correct filenames per manifest
- [ ] Every asset reference in HTML has a `<!-- GENERATED: -->` comment
- [ ] OG meta tags in `<head>` reference `assets/og-preview.jpg`
- [ ] Domain in all meta tags is `timchang.com`

---
*Tim Chang Portfolio · Internal brief · Not for client · Built with Claude Code*


Read every field before building. If a field is blank, use sensible defaults based on the business type and style. If critical info is missing (business name, website type), ask the user before proceeding.

---

## SEO & OPEN GRAPH

Every page must include in `<head>`:

### Meta Tags
- `<meta name="description" content="...">` — unique per page, 150–160 chars, includes primary keyword and value prop.
- `<meta name="keywords" content="...">` — 5–8 relevant keywords based on business type and location.
- `<link rel="canonical" href="...">` — self-referencing canonical URL on every page.

### Open Graph (Social Sharing)
```html
<meta property="og:title" content="Page Title — Business Name">
<meta property="og:description" content="Same as meta description or slightly more conversational">
<meta property="og:image" content="assets/og-image.jpg">
<meta property="og:url" content="https://example.com/page">
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
```

### Twitter Card
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Page Title — Business Name">
<meta name="twitter:description" content="Short description">
<meta name="twitter:image" content="assets/og-image.jpg">
```

### Rules
- Write unique title tags per page: `Page Name — Business Name` (under 60 chars).
- OG image should be 1200×630px. Use a placeholder with `<!-- REPLACE: OG share image -->` if no real image exists.
- If a Google Business URL is provided, include LocalBusiness JSON-LD structured data:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  "address": { ... },
  "telephone": "...",
  "openingHours": "...",
  "image": "...",
  "url": "..."
}
</script>
```
- For restaurants/cafés, use `"@type": "Restaurant"` or `"CafeOrCoffeeShop"` instead.
- Structured data fields should match the client brief and Google Business data if available.

---

## LEGAL FOOTER

Every website must include a footer with:
- © [year] [business name]. All rights reserved.
- Privacy Policy link (placeholder `#privacy` unless a real URL is provided).
- Terms of Service link (placeholder `#terms` unless a real URL is provided).
- If the site collects any data (contact form, newsletter signup, booking), add a brief one-liner: "We respect your privacy. Your information is never shared."
- Cookie consent is NOT required unless the brief specifies analytics/tracking.

---

## TRUST & SOCIAL PROOF

When the business type benefits from social proof (cafés, restaurants, e-commerce, SaaS, agencies, services, local businesses), include a testimonials or reviews section:
- 3–5 short customer quotes with name and context (e.g. "— Sarah, regular since 2022").
- Star ratings if applicable.
- "As seen in" or partner logos if the brief mentions press/partnerships.
- Google review rating badge if a Google Business URL is provided.
- Write realistic placeholder testimonials based on the brand voice — mark them with `<!-- REPLACE: real customer review -->` so the client knows to swap them.
- Skip this section only for portfolios, personal sites, or when the brief explicitly says no social proof.

---

## GOOGLE BUSINESS INTEGRATION

If a Google Business URL or Place ID is provided in the client brief:

### Business Info Extraction
- Use `WebFetch` to pull the Google Business page.
- Extract: business name, address, phone, hours, rating, review count, categories, photos URL.
- Use this data to auto-populate the website — contact section, hours, footer, map location.
- If extracted data conflicts with the client brief, the brief wins.

### Google Maps Embed
- When the business has a physical location, embed a Google Map in the location/contact section.
- Use the Google Maps Embed API: `https://www.google.com/maps/embed/v1/place?key=API_KEY&q=PLACE_NAME_OR_ADDRESS`
- If no API key is available, use a static map placeholder with a "Get Directions" link to `https://www.google.com/maps/search/?api=1&query=ADDRESS`.
- Style the map container to match the site — rounded corners, translucent border, no hard edges.
- On mobile, make the map full-width with a minimum height of 250px.
- Skip the map for online-only businesses (SaaS, digital products, portfolios) unless the brief requests it.

### Client Brief Field
Add these to the client brief template:
```
GOOGLE BUSINESS URL:  ___ (paste full Google Maps/Business link, or "none")
GOOGLE MAPS API KEY:  ___ (if available, or "none" for static fallback)
```

---

## HIGGSFIELD (OPTIONAL)

# higgsfield.md — Asset Generation Rules
> Read this file at the start of every session before generating any asset via Higgsfield.
> This file works alongside `CLAUDE.md`. The project brief lives there. Generation rules live here.

---

## 1. PURPOSE

This file defines how Claude Code interacts with the Higgsfield MCP to generate images and videos for any project. It is not project-specific — it applies to every site build that includes a `CLAUDE.md` with a Higgsfield asset manifest.

When to read this file:
- At session start, before scanning `assets/`
- Before calling any Higgsfield generation tool
- Before overwriting any existing asset
- When the operator asks about credit usage or generation options

---

## 2. CORE PRINCIPLES

These are non-negotiable. No exceptions.

1. **Never auto-generate.** Every generation requires explicit operator approval. Print the approval request, wait for `yes`. Do not proceed on assumption.
2. **Always preflight cost.** Call `get_cost: true` before every generation. Never submit a job without knowing the credit cost first.
3. **Always fetch live balance first.** Before printing any approval request, call the Higgsfield `balance` tool so the operator sees real numbers, not estimates.
4. **Never overwrite silently.** If a file already exists in `assets/`, do not regenerate it without explicit instruction. Ask first.
5. **Save with the correct filename immediately.** The moment a generation completes, save it to `assets/` using the exact name from the manifest. Never leave output in a temp location.
6. **Log every generation.** Append a line to `assets/generation-log.md` after every successful generation.

---

## 3. APPROVAL REQUEST FORMAT

Before generating any asset, print this block in full. One block per asset. Print all pending blocks at once before waiting for any reply — do not drip them one at a time.

```
╔══════════════════════════════════════════════════════════════╗
  HIGGSFIELD ASSET REQUEST
══════════════════════════════════════════════════════════════
  Section       : [scene or section name from CLAUDE.md]
  File          : assets/[exact-filename.ext]
  Type          : Image | Video
  Purpose       : [one sentence — what this asset does on the page]

  Model         : [model name + id]
  Settings      : [duration / aspect ratio / mode / sound]
  Prompt        : "[exact prompt to be sent]"

  ── CREDIT CHECK ───────────────────────────────────────────
  Current balance   : [X] credits
  This generation   : ~[Y] credits
  Balance after     : [X - Y] credits
  ───────────────────────────────────────────────────────────

  Approve? → yes | skip | edit prompt
╚══════════════════════════════════════════════════════════════╝
```

**Operator responses:**
- `yes` — proceed to preflight then generate
- `skip` — leave the asset as a placeholder, continue building
- `edit prompt` — operator will provide a revised prompt, reprint the block with the new prompt before proceeding

If multiple assets are pending, the operator can reply with a list:
```
1 yes
2 skip
3 yes
```

---

## 4. GENERATION WORKFLOW

Follow these steps in order. Do not skip any step.

**Step 1 — Scan `assets/`**
List every file currently in the folder. Note filenames, types, and sizes.

**Step 2 — Cross-reference the manifest**
Compare what exists against the asset manifest in `CLAUDE.md`. Identify every missing or placeholder asset.

**Step 3 — Fetch live balance**
Call the Higgsfield `balance` tool:
```
tool: higgsfield:balance
```
Store the result. Use this number in every approval request block. Do not use a cached or estimated value.

**Step 4 — Print all approval requests**
Print one approval block per missing asset (see Section 3 format). Print all of them together before waiting for any reply. Include the running balance after each — subtract each asset's estimated cost from the previous balance so the operator can see cumulative spend.

Example with two assets:
```
Asset 1 — balance after: 1,210 - 50 = 1,160 credits
Asset 2 — balance after: 1,160 - 6  = 1,154 credits
```

**Step 5 — Wait for approval**
Do not proceed until the operator has replied to all pending requests.

**Step 6 — Preflight each approved asset**
For each approved asset, call the generation tool with `get_cost: true` first:
```javascript
// Example
higgsfield:generate_video({ ...params, get_cost: true })
```
If the preflighted cost differs from the estimate by more than 10 credits, print a warning and ask for re-confirmation before proceeding.

**Step 7 — Generate**
Submit the job. If the generation fails, print the error and ask whether to retry or skip. Do not retry automatically.

**Step 8 — Save to `assets/`**
Download the output and save it immediately to `assets/[exact-filename]` as specified in the manifest. Confirm the save by printing:
```
✓ Saved: assets/[filename] ([file size])
```

**Step 9 — Log the generation**
Append to `assets/generation-log.md`:
```markdown
| [date] | [filename] | [model] | [credits spent] | [prompt — first 80 chars] |
```

**Step 10 — Reference in code**
When writing the HTML or CSS that uses this asset, add a comment directly above the reference:
```html
<!-- GENERATED: assets/hero-rocket-scroll.mp4 · Kling 3.0 pro · 50cr -->
<video src="assets/hero-rocket-scroll.mp4" ...></video>
```

---

## 5. MODEL SELECTION GUIDE

Choose the model based on what the asset needs to do. When in doubt, use the recommended model. Always confirm with `get_cost: true` before generating.

### Images

| Use case | Model ID | Aspect | Notes |
|---|---|---|---|
| Dark atmospheric backgrounds | `nano_banana_2` | 16:9 | Fast, consistent for non-character scenes |
| Portraits / character images | `soul_2` | 1:1 or 9:16 | Requires Soul ID if identity consistency needed |
| Product / UI preview cards | `nano_banana_2` | 16:9 or 1:1 | Good for OG images and section headers |
| High detail / 4K output | `nano_banana_2` | any | Request 4K in prompt description |
| Text in image (OG cards, labels) | `nano_banana_2` | 16:9 | Keep text short — model handles short strings well |
| Multi-character scenes | `nano_banana_2` | any | Use reference elements for consistency |

### Videos

| Use case | Model ID | Duration | Notes |
|---|---|---|---|
| Cinematic hero animation | `kling3_0` mode: `pro` | up to 15s | Best for complex motion, scroll-scrub source |
| Fast draft / iteration | `kling3_0` mode: `std` | up to 15s | ~40% cheaper, good for prompt testing |
| Atmospheric loops | `cinematic_studio_3_0` | 4–15s | Best for subtle ambient background video |
| Product showcase | `marketing_studio_video` | varies | Use Marketing Studio workflow |
| Text-to-video (no reference image) | `kling3_0_turbo` | 5–10s | Fast and cheap for concept tests |

### Default recommendation
- **Images:** `nano_banana_2` at 16:9 unless a specific need overrides
- **Videos:** `kling3_0` mode `std` for first draft, `pro` for final output

---

## 6. PROMPT ENGINEERING RULES

Follow these rules when writing or refining generation prompts to get consistent, on-brand results.

**Always include:**
- Aspect ratio in the prompt text: `"16:9 aspect ratio"` or `"ultra wide horizontal"`
- Lighting direction: `"neon purple light from above left"`, `"backlit"`, `"rim lighting"`
- Mood anchor: `"dark"`, `"cinematic"`, `"moody"`, `"atmospheric"` — be specific
- What is NOT in the image: `"no text"`, `"no people"`, `"no UI elements"` — prevents unwanted additions

**For Tim Chang's brand specifically:**
- Always include: `"dark background"`, `"cyberpunk"`, `"neon purple accent"`, `"cinematic"`
- Avoid: bright backgrounds, cartoon style, flat illustration, daylight scenes
- Colour anchors to include where relevant: `"purple #7b6ee0"`, `"amber orange flame"`, `"deep black background"`

**For backgrounds:**
```
[Subject]. Dark, moody, cinematic. [Lighting]. No people, no text, no UI. 16:9 aspect ratio.
```

**For video:**
```
[Subject and motion description]. Slow, cinematic movement. [Camera behaviour]. Dark background. No text. 16:9.
```

**For OG / social preview images:**
```
[Brand name] in large glowing [style] letters on pure black background. [Tagline] below in smaller text. Minimal, striking. 16:9, social media preview card format.
```

**Prompt length:** 40–120 words is the sweet spot. Too short = vague output. Too long = model ignores later instructions.

**Iterating on a bad result:**
- If composition is wrong → add camera direction: `"centered"`, `"wide shot"`, `"close up"`
- If lighting is wrong → be more explicit: `"single neon strip light from above"` not just `"neon light"`
- If style drifts → add a negative anchor at the end: `"avoid cartoon, avoid illustration, avoid bright colours"`

---

## 7. NAMING CONVENTION

All generated assets follow this exact pattern:

```
assets/[scene]-[description]-[variant].[ext]
```

**Rules:**
- `scene` — the section or scene number from `CLAUDE.md`: `hero`, `scene01`, `scene02`, `contact`, `og`
- `description` — 1–3 words describing the content, hyphen-separated, lowercase: `rocket-launch`, `warehouse-bg`, `space-field`
- `variant` — omit on first generation. Use `-v2`, `-v3` for re-generations. Never overwrite v1.
- `ext` — `jpg` for images (not `.jpeg`), `mp4` for video, `png` only if transparency is required

**Good examples:**
```
assets/hero-rocket-scroll.mp4
assets/hero-bg-warehouse.jpg
assets/scene02-space-field.jpg
assets/og-preview.jpg
assets/contact-bg-dark.jpg
assets/hero-rocket-scroll-v2.mp4
```

**Bad examples — never use these:**
```
assets/image1.jpg          ← no scene, no description
assets/output.mp4          ← meaningless
assets/generated.png       ← meaningless
assets/untitled.jpg        ← meaningless
assets/IMG_4821.jpg        ← camera roll name
assets/rocket.jpg          ← missing scene prefix
```

---

## 8. CREDIT MANAGEMENT

**Before any session with planned generations:**
1. Call `higgsfield:balance` and print the result
2. Sum the estimated costs of all planned assets from the manifest
3. Confirm the balance covers the full session before starting

**Per-generation rules:**
- Always run `get_cost: true` before submitting — no exceptions
- If a single asset costs more than 30 credits, print an extra warning line in the approval block:
  ```
  ⚠ HIGH COST: This generation costs [X] credits. Confirm?
  ```
- If the preflighted cost is more than 20% higher than the estimate, stop and re-confirm with the operator

**Balance thresholds:**
| Balance | Action |
|---|---|
| > 500 credits | Proceed normally |
| 200–500 credits | Print a low balance notice before each generation |
| 100–200 credits | Print a warning before each generation, recommend topping up |
| < 100 credits | Stop all generation. Print: `⚠ BALANCE LOW: [X] credits remaining. Top up before continuing.` Do not generate anything. |

**Generation log** — maintain `assets/generation-log.md` with this table:

```markdown
# Generation Log

| Date | File | Model | Credits | Prompt (truncated) |
|---|---|---|---|---|
| 2026-06-21 | assets/hero-rocket-scroll.mp4 | kling3_0 pro | 50 | Cinematic dark cyberpunk rocket launch... |
| 2026-06-21 | assets/hero-bg-warehouse.jpg | nano_banana_2 | 6 | Dark industrial warehouse interior... |
```

---

## 9. RE-GENERATION RULES

**When re-generation is allowed:**
- Operator explicitly says `regenerate`, `redo`, or `try again`
- Operator provides a revised prompt
- The generated file is corrupt or unreadable

**When re-generation is NOT allowed:**
- The file exists and looks reasonable — even if not perfect
- No explicit instruction was given
- Auto-retrying after a failed generation without asking

**How to handle re-generation:**
1. Never overwrite the original file
2. Save the new version as `-v2`, `-v3`, etc.
3. Print both filenames and ask the operator which to use in the build
4. Update the HTML/CSS reference only after the operator confirms the winner
5. Log both generations in `generation-log.md`

**When to stop iterating:**
After 3 versions of the same asset with no approval, stop and print:
```
⚠ 3 versions generated for [filename] with no selection.
  Pausing generation for this asset.
  Current versions: v1, v2, v3 — in assets/
  Please review and tell me which to use, or provide a new prompt direction.
```

---

## 10. ASSET REFERENCE RULES

**Always add a comment above every generated asset reference in HTML/CSS:**

```html
<!-- GENERATED: assets/hero-rocket-scroll.mp4 · Kling 3.0 pro · 50cr · 2026-06-21 -->
<video src="assets/hero-rocket-scroll.mp4" autoplay muted loop playsinline></video>
```

```css
/* GENERATED: assets/hero-bg-warehouse.jpg · nano_banana_2 · 6cr · 2026-06-21 */
background-image: url('assets/hero-bg-warehouse.jpg');
```

**Always define a CSS fallback** for every image or video reference:
```css
.hero-bg {
  /* GENERATED: assets/hero-bg-warehouse.jpg · nano_banana_2 · 6cr */
  background-image: url('assets/hero-bg-warehouse.jpg');
  background-color: #0a0a14; /* fallback if image fails to load */
}
```

**Always add `alt` text** on `<img>` tags. For decorative generated images:
```html
<img src="assets/scene02-space-field.jpg" alt="Deep space background" role="presentation">
```

**For video assets used as scroll-scrub source:**
- The video itself is never embedded as a `<video>` tag — it is processed into frames by FFmpeg
- Reference the `frames/` folder in JS, not the `.mp4` directly
- Keep the `.mp4` in `assets/` as the source of truth

---

## QUICK REFERENCE

```
Session start
  └─ Read CLAUDE.md + higgsfield.md
  └─ Scan assets/
  └─ Call higgsfield:balance
  └─ Print all approval requests (with live balance)
  └─ Wait for operator response

Per asset (approved)
  └─ get_cost: true → confirm
  └─ Generate
  └─ Save to assets/[scene]-[description].[ext]
  └─ Log to assets/generation-log.md
  └─ Add <!-- GENERATED --> comment in code

Balance rules
  └─ > 500cr  → proceed
  └─ 200–500  → notice
  └─ 100–200  → warning
  └─ < 100    → stop everything
```

---
*higgsfield.md · Asset Generation Rules · Applies to all projects using the Higgsfield MCP*


---

## IMPORTANT NOTES

- Never autoplay the video as a `<video>` element for the scroll section — the entire point is frame-by-frame scroll control.
- The hero section CAN use a looping `<video>` with `autoplay muted loop playsinline`.
- Scrolling UP must scrub the video BACKWARDS.
- Frame 1 must show on page load before any scroll.
- Use `poster` or first frame as static fallback while loading.
- On mobile: consider using fewer frames (every 2nd) or a static hero fallback.
