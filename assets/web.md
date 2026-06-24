# CLAUDE.md — Tim Chang Portfolio
> Internal build brief · Do not publish · Generated from approved storyboard

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
index.html
style.css
script.js
assets/
  rocket-video.mp4        ← generate via Higgsfield (see ASSET GENERATION section) or drop in manually
frames/                   ← FFmpeg will extract frames here (do not create manually)
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
