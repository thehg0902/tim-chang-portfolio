# CLAUDE.md — Tim Chang Portfolio

---

## IDENTITY

| Field | Value |
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

Load all three fonts via Google Fonts CDN. Define every value as a CSS custom property in `:root`.

---

## ROLE

You are a professional full-stack web developer and designer. Before writing any code, invoke the **ui-ux-pro-max** skill for design decisions. Build exactly what is described — do not simplify or substitute. Read every section before writing code. If critical info is missing (business name, website type), ask the user before proceeding.

---

## CORE PRINCIPLES (Required)

These apply to every build. Non-negotiable.

1. **Semantic HTML** — one `<h1>` per page, `alt` text on images, keyboard navigable, `<main>`, `<section>`, `<nav>`.
2. **Accessibility** — canvas `aria-hidden="true"`, interactive elements have `role` and focus styles, `aria-label` where needed.
3. **CSS custom properties** — all colors, fonts, spacing defined once in `:root`. No hardcoded hex outside `:root`.
4. **Responsive** — mobile-first. Breakpoints: 375px, 768px, 1200px+. Every section must look intentional at each size.
5. **GPU-safe animations** — only animate `transform` and `opacity`. Never layout properties.
6. **Reduced motion** — `@media (prefers-reduced-motion: reduce)` provides static fallback, no animations.
7. **Text contrast** — all text readable against its background. Use text-shadow or translucent panels when needed.
8. **No console errors, no broken links.** No `href="#"` without a comment explaining the placeholder.
9. **No Lorem ipsum** — write real copy based on the brand brief.
10. **Vanilla HTML/CSS/JS** — no frameworks unless the brief specifies one. CDN only for Google Fonts.
11. **Fast-scroll safety** — use `requestAnimationFrame` for canvas updates. Clamp all frame indices. Fixed elements must use `visibility: hidden` / `display: none` past their scroll zone.
12. **Scroll events** — always `{ passive: true }`. No direct DOM writes inside scroll handlers.
13. **Mobile requirements:**
    - Touch targets: minimum 44×44px.
    - Base font size: minimum 16px on mobile.
    - No hover-dependent UI — tap/click alternative required.
    - Viewport: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`. Never `user-scalable=no`.
    - Lazy load below-fold images. Use `loading="lazy"`.
    - Navigation: hamburger on mobile/tablet, full nav on desktop.
14. **No stray elements** — audit z-index stacking, fixed/sticky elements, overflow. Fixed elements must have show/hide logic tied to scroll position.
15. **Clean sections** — no orphaned elements, stray borders, phantom padding, or leftover placeholder text (except `<!-- REPLACE -->`).
16. **Image placeholders** — use gradient `<div>` blocks with `<!-- REPLACE: [description] -->` comments.

---

## BRANCH WORKFLOW

1. When creating a new branch, rename the project folder (not `assets/`) to match the branch name.
2. Read the branch-specific brief (if one exists) before building.
3. Keep everything local unless told to push.
4. Never force push. Never skip hooks.
5. Warn if `frames/` exceeds 50MB — suggest `.gitignore` + external hosting.

---

## FILE STRUCTURE

```
index.html
style.css
script.js
frames/          ← FFmpeg-extracted video frames
assets/
  *.mp4          ← source videos
  *.jpg          ← generated/provided images
```

Additional pages (e.g. `questionnaire.html`, `webdev.html`) live at root alongside `index.html`.

---

## PAGE STRUCTURE

Single page. Scroll-driven. No page reloads, no routing.

```
[00] Loading screen — progress bar while frames preload
[01A] Hero — black + neon name reveal (letter-by-letter flicker)
[01B] Hero — curtains open (split layout: skills left, rocket right)
[02] Scroll-scrub — rocket journey + service cards overlay
[03] Contact — CTA linking to questionnaire
```

---

## SCENE SPECS

### Scene 00 — Loading Screen

- `#000` background, full viewport.
- 120px × 1px progress bar, centered. Fill: accent color with glow.
- Label: `loading assets...` in JetBrains Mono 11px, muted color.
- JS: preload all frame images, track `onload` count, update bar width as percentage.
- At 100%: fade loader opacity to 0 over 600ms → `display:none` → begin Scene 01A.

### Scene 01A — Neon Name Reveal

- Full viewport, `#000` background.
- "TIM CHANG" in Orbitron 900, `clamp(32px, 6vw, 64px)`, letter-spacing 0.12em.
- Neon glow text-shadow stack (white inner → accent outer at 40/80/120px).
- Each letter reveals at 80ms intervals with 3× flicker (opacity oscillates) before settling.
- After all letters stable (~1.8s): auto-trigger Scene 01B.

### Scene 01B — Curtains Open

Two dark panels slide apart revealing the warehouse backdrop.

**Layout:** CSS Grid `1fr 1fr`, full viewport.

**Curtain panels:** Two absolute `div`s, each 50% width. Dark gradients with accent border. Slide out via `transform: translateX(±100%)` with `cubic-bezier(0.76, 0, 0.24, 1)` over 1.2s.

**Left column — identity + skills:**
- Name: Orbitron 900, neon glow text-shadow.
- Tagline: JetBrains Mono, muted accent, uppercase, letter-spacing 0.25em.
- Three skill rows stagger-reveal at 600ms/750ms/900ms into curtain animation:
  - `⬡ WEB DEVELOPMENT` — "Fast · Responsive · Built to convert"
  - `◈ DIGITAL MARKETING` — "Campaigns that actually perform"
  - `◎ DESIGN` — "Brand identity that sticks"
- Each row: accent left border with glow, fade in from `translateX(-10px)`.

**Right column:** Rocket at rest (CSS-shaped or canvas), vertical neon divider. "scroll to launch ↓" label with pulsing opacity.

**Mobile (< 768px):** Single column, hide right column. Skills overlay on left.

### Scene 02 — Scroll-Scrub

One continuous scroll-driven animation. Video frames driven by scroll position. Service cards are HTML overlays on top of canvas.

**Canvas:** `position: fixed`, full viewport, behind content. Cover scaling (no letterbox).

**Scroll sync:** Map `scrollY / maxScroll` to frame index. Bidirectional — scroll up plays backward. Frame 1 shows on load before any scroll.

**Service card reveal** (tied to scroll progress):
- 65%: Web Development slides in
- 75%: Digital Marketing slides in
- 85%: Design slides in

Cards: `position: fixed`, translucent background, accent border, top neon edge. Hover: lift + border glow. Each links to contact or detail page.

**Scroll-scrub companion content:** Layer supporting text/image elements that fade in/out at specific scroll progress points. Minimal, translucent, timed to complement the video. Mobile: one element at a time.

**Generative fallback (no video):** CSS + JS animated rocket with scroll-driven transforms mapping progress to position/scale/flame states. Background transitions from warehouse grid → stars → deep space.

**Reduced motion fallback:** Hide canvas and spacer, show `#staticServices` — static three-column card layout.

**Spacer height:** `Math.max(400, (TOTAL_FRAMES / 30) * 300) + 'vh'`.

**Mobile scroll-scrub:** Use every 2nd frame. If low memory (<4GB) or iOS Safari, fall back to static hero or looping `<video>`.

### Scene 03 — Contact

- Full viewport, centered column, `#000` background.
- Ambient radial glow behind content.
- Eyebrow: `// let's work together` — JetBrains Mono 11px, muted accent.
- Headline: `Got a project? / Let's build it.` — Orbitron 900.
- Sub: `Tell me what you need — I'll get back within 24 hours.` — Inter 14px.
- CTA: `Work with me →` — accent gradient button with glow. Links to `questionnaire.html`.
- Closing neon line at bottom of section.
- Footer: `© [year] Tim Chang. All rights reserved.` + Privacy/Terms links.

---

## DESIGN SYSTEM

### Colors (CSS vars)
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
- **Orbitron** — headlines, name, card titles, buttons. Always uppercase.
- **JetBrains Mono** — eyebrows, labels, code-style text, captions.
- **Inter** — body copy, descriptions, sub-text.

### Spacing Scale
Define in `:root`: `--space-xs: 0.5rem` through `--space-3xl: 8rem`. Use everywhere. No magic numbers.

### Motion
- Only animate `transform` and `opacity`.
- Easing: `cubic-bezier(0.76, 0, 0.24, 1)` for curtains · `cubic-bezier(0.34, 1.56, 0.64, 1)` for card entrances · `ease-in-out` for ambient pulses.
- All animations respect `prefers-reduced-motion`.

---

## SCROLL-SCRUB WORKFLOW

When an `.mp4` is available in `assets/`:

### 1. Find the video
Look in `assets/` for `.mp4` files. One file → use it. Multiple → ask.

### 2. Ensure FFmpeg
```bash
apt-get update -qq && apt-get install -y -qq ffmpeg
```

### 3. Analyze
```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,duration,r_frame_rate,nb_frames \
  -of csv=p=0 assets/<filename>.mp4
```

### 4. Extract frames
```bash
mkdir -p frames
ffmpeg -i assets/<filename>.mp4 -vf "fps=30,scale=1920:-2" -q:v 3 frames/frame-%04d.jpg
```
- Videos > 15s: ask user to confirm or trim.
- Videos > 60s: suggest 24fps.
- Report total frames and folder size.

### 5. Build scroll-scrub engine
- Preload all frames as `Image()` objects. Track progress in loading screen.
- Canvas: fixed, full viewport, cover scaling.
- Scroll sync: map `scrollY / maxScroll` to frame index. Update via `requestAnimationFrame`. Bidirectional.
- Draw frame 1 immediately on load.

### 6. No video fallback
Build CSS + JS generative animation (see Scene 02 generative fallback above).

---

## ASSET GENERATION (Higgsfield)

### Core Rules
1. **Never auto-generate.** Every generation requires explicit operator approval.
2. **Always preflight cost.** Call `get_cost: true` before every generation.
3. **Always fetch live balance first** via `balance` tool before printing approval requests.
4. **Never overwrite silently.** If a file exists in `assets/`, ask before regenerating.
5. **Save immediately** with the exact manifest filename. Never leave output in temp.
6. **Log every generation** to `assets/generation-log.md`.

### Approval Format
Print one block per missing asset. Print all at once before waiting for reply:

```
╔═══════════════════════════════════════════════╗
  HIGGSFIELD ASSET REQUEST
  Section: [scene name]  |  File: assets/[filename]
  Type: Image|Video  |  Model: [model id]
  Prompt: "[prompt]"
  Cost: ~[Y]cr  |  Balance after: [X-Y]cr
  Approve? → yes | skip | edit prompt
╚═══════════════════════════════════════════════╝
```

### Asset Manifest

| File | Section | Type | Required | Model | Est. Credits |
|---|---|---|---|---|---|
| `assets/hero-rocket-scroll.mp4` | Scene 02 scroll-scrub | Video | Yes | `kling3_0` pro 15s 16:9 | ~50 |
| `assets/hero-bg-warehouse.jpg` | Scene 01B fallback bg | Image | Recommended | `nano_banana_2` 16:9 | ~6 |
| `assets/scene-space-bg.jpg` | Scene 02 bg atmosphere | Image | Optional | `nano_banana_2` 16:9 | ~6 |
| `assets/og-preview.jpg` | `<meta og:image>` | Image | Yes | `nano_banana_2` 16:9 | ~6 |

**Total estimated:** ~68 credits.

### Generation Prompts

**Rocket scroll video:**
> Cinematic dark cyberpunk rocket launch sequence. Rocket begins at rest on right side, dark industrial warehouse backdrop, neon purple strip lights. Ignites — orange/amber flame — lifts off. Moves to center, zooms in close. Zooms back out, drifts left against deep star field. Slow, cinematic, smooth. Dark background, no text, no UI. 16:9.

**Hero warehouse bg:**
> Dark industrial warehouse interior, cyberpunk. Concrete floors, perspective grid lines. Neon strip lights — purple left, deep red right. Heavy metal beams. No people, no text. Dark, moody, cinematic. 16:9.

**Space background:**
> Deep space star field, extremely dark. Scattered stars, subtle purple/indigo nebula wisps. No planets, no rockets, no text. 16:9.

**OG preview:**
> "TIM CHANG" in large glowing neon letters, white with purple glow, black background. Below: "Designer · Marketer · Developer" in subtle purple monospace. Minimal, striking, dark. 16:9.

### Naming Convention
```
assets/[scene]-[description].[ext]
```
- Use `-v2`, `-v3` for re-generations. Never overwrite v1.
- `jpg` for images, `mp4` for video, `png` only if transparency needed.
- Never use generic names (`image1.jpg`, `output.mp4`, `untitled.jpg`).

### Model Defaults
- **Images:** `nano_banana_2` at 16:9.
- **Videos:** `kling3_0` mode `std` for drafts, `pro` for final.

### Credit Thresholds
| Balance | Action |
|---|---|
| > 500 | Proceed normally |
| 200–500 | Low balance notice |
| 100–200 | Warning, recommend top-up |
| < 100 | Stop all generation |

### Re-generation
- Only on explicit request or corrupt file.
- Save as `-v2`, `-v3` — never overwrite.
- After 3 versions with no selection, pause and ask for direction.

### Asset References in Code
Add a comment above every generated asset reference:
```html
<!-- GENERATED: assets/hero-rocket-scroll.mp4 · Kling 3.0 pro · 50cr -->
```
Always define a CSS fallback color for every background-image. Always add `alt` text on `<img>` tags.

### Prompt Engineering Tips
- Include: aspect ratio, lighting direction, mood anchor, negative anchors ("no text, no people").
- Tim Chang brand: always `"dark background"`, `"cyberpunk"`, `"neon purple accent"`, `"cinematic"`.
- Prompt length: 40–120 words.

---

## SEO & META

Every page must include in `<head>`:

- `<title>` — `Page Name — Tim Chang` (under 60 chars).
- `<meta name="description">` — unique per page, 150–160 chars.
- `<meta name="keywords">` — 5–8 relevant keywords.
- `<link rel="canonical">` — self-referencing.
- Open Graph: `og:title`, `og:description`, `og:image` (assets/og-preview.jpg), `og:url`, `og:type`, `og:locale`.
- Twitter Card: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`.
- OG image: 1200×630px. Use placeholder with `<!-- REPLACE: OG share image -->` if none exists.
- If Google Business URL provided, include JSON-LD structured data (`LocalBusiness` or appropriate `@type`).

---

## LEGAL FOOTER

Every page:
- `© [year] [business name]. All rights reserved.`
- Privacy Policy link (`#privacy` placeholder).
- Terms of Service link (`#terms` placeholder).
- If data collection exists: "We respect your privacy. Your information is never shared."

---

## OPTIONAL ENHANCEMENTS

Use these when they improve the current project. Not required on every build.

- **Translucent backgrounds** — `rgba()` + `backdrop-filter: blur()` for glassmorphism. Use when the design calls for layered depth.
- **Custom cursor** — dot-follower or blend-mode circle on desktop. Disable on touch (`pointer: coarse`). Keep subtle.
- **Page transitions** — smooth fade/slide between pages (300–500ms). Fall back if JS fails.
- **Scroll progress indicator** — thin bar at top or dot-nav on side. Top bar on mobile.
- **Dark mode** — `prefers-color-scheme: dark` with alternate CSS vars and optional toggle.
- **Micro-interactions** — hover/focus/active states on interactive elements: scale, glow, lift, underline slide. Click feedback on CTAs.
- **Animated entrances** — fade-ins, slide-ups, staggered reveals via `IntersectionObserver`. Match energy to site vibe. Fade/transition out when scrolling away if appropriate.
- **Smart loading** — skeleton screens, shimmer placeholders, image fade-in on load.
- **Scroll-scrub companion content** — text/image elements that appear/fade alongside scroll animation. Scroll-progress-based opacity/transforms. Mobile: one element at a time.
- **Section flow** — gradient fades, soft blurs, overlapping translucent layers, or curved SVG dividers between sections instead of hard edges. Use when the design is fluid/cinematic.
- **Trust & social proof** — testimonials, reviews, partner logos. Skip for portfolios/personal sites unless brief says otherwise. Mark placeholders with `<!-- REPLACE: real customer review -->`.
- **Google Maps embed** — for businesses with physical locations. Use embed API or static fallback with "Get Directions" link.
- **Hero video background** — looping `<video autoplay muted loop playsinline>` for hero sections.
- **Nebula wisps** — atmospheric radial gradient divs with blur, fading in/out with scroll progress.

---

## BUILD CHECKLIST

- [ ] Loading screen preloads frames with real progress %
- [ ] Scene 01A: name flickers on letter by letter with neon glow
- [ ] Scene 01B: curtains open, split layout — skills left, rocket right
- [ ] Skill rows stagger in during curtain animation
- [ ] Scroll-scrub: frames advance forward/backward with scroll
- [ ] Service cards slide in at correct scroll thresholds
- [ ] Card hover: lift + border glow
- [ ] Contact section visible after scroll-scrub
- [ ] "Work with me" button linked to `questionnaire.html`
- [ ] Responsive at 375px, 768px, 1200px+
- [ ] `prefers-reduced-motion` fallback shows static services
- [ ] No console errors
- [ ] All CSS via custom properties
- [ ] Generated assets in `assets/` with correct filenames
- [ ] Asset references have `<!-- GENERATED: -->` comments
- [ ] OG meta tags reference `assets/og-preview.jpg`
- [ ] Domain in meta tags is `timchang.com`

---

## IMPORTANT NOTES

- Never autoplay video as `<video>` for scroll-scrub — use frame-by-frame scroll control.
- Hero section CAN use looping `<video autoplay muted loop playsinline>`.
- Frame 1 must show on page load before any scroll.
- Use `poster` or first frame as static fallback while loading.
- Mobile: use every 2nd frame or static hero fallback for low-memory devices.
