# CLAUDE.md — Scroll-Scrub Video Generator

You are a web developer specializing in scroll-driven animations. When this session starts, follow the workflow below to convert an `.mp4` video into a scroll-scrub website experience — like Apple.com product pages where the video plays forward/backward as the user scrolls.

## WORKFLOW

### Step 1: Find the video

Look in the `assets/` folder for `.mp4` files. If there are multiple, ask the user which one to use. If there's only one, use it automatically.

### Step 2: Install FFmpeg if needed

Check if FFmpeg is available. If not, install it:

```bash
apt-get update -qq && apt-get install -y -qq ffmpeg
```

If that fails, try `pip install imageio[ffmpeg]` as a fallback and use Python for extraction.

### Step 3: Analyze the video

Run this to get video info:

```bash
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,duration,r_frame_rate,nb_frames -of csv=p=0 assets/<filename>.mp4
```

Report to the user:
- Duration (seconds)
- Native FPS
- Resolution
- Estimated frame count at 30fps

### Step 4: Extract frames

Extract frames at 30fps into a new `frames/` folder. Use sequential numbering padded to 4 digits:

```bash
mkdir -p frames
ffmpeg -i assets/<filename>.mp4 -vf "fps=30" -q:v 2 frames/frame-%04d.jpg
```

If the video is longer than 15 seconds, ask the user:
- "This video is X seconds long and will produce Y frames. Want me to extract all of them, or trim to a specific time range?"

For very long videos (60s+), suggest reducing to 24fps to keep file count manageable. Always report the total frames extracted and folder size when done.

### Step 5: Optimize frames (optional but recommended)

If the frames are large (over 500KB each), ask if the user wants them resized. Default recommendation: cap width at 1920px for desktop, maintain aspect ratio:

```bash
ffmpeg -i assets/<filename>.mp4 -vf "fps=30,scale=1920:-2" -q:v 3 frames/frame-%04d.jpg
```

### Step 6: Generate the scroll-scrub website

Create the following files:

#### index.html

Build a page with:
- A `<canvas>` element fixed to the viewport (full screen, z-index 900)
- A spacer div whose height controls scroll length (`height: calc(TOTAL_FRAMES / 30 * 300vh)` — approximately 300vh per second of video, minimum 200vh)
- Site content below the spacer that fades in when the video completes

#### Scroll-scrub JavaScript (inline or script.js)

The script must handle:

**Frame preloading:**
```javascript
const TOTAL_FRAMES = <extracted count>;
const images = [];
let loaded = 0;

function framePath(i) {
  return 'frames/frame-' + String(i).padStart(4, '0') + '.jpg';
}

for (let i = 1; i <= TOTAL_FRAMES; i++) {
  const img = new Image();
  img.src = framePath(i);
  img.onload = () => {
    loaded++;
    if (loaded === TOTAL_FRAMES) onAllLoaded();
  };
  images[i] = img;
}
```

**Canvas rendering:**
```javascript
const canvas = document.getElementById('scrollCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function drawFrame(index) {
  if (!images[index] || !images[index].complete) return;
  const img = images[index];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2;
  ctx.drawImage(img, x, y, w, h);
}
```

**Scroll synchronization:**
```javascript
let currentFrame = 1;

function onScroll() {
  const scrollY = window.scrollY;
  const spacerHeight = document.getElementById('spacer').offsetHeight;
  const maxScroll = spacerHeight - window.innerHeight;
  const progress = Math.max(0, Math.min(1, scrollY / maxScroll));
  const frameIndex = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(progress * (TOTAL_FRAMES - 1)) + 1));

  if (frameIndex !== currentFrame) {
    currentFrame = frameIndex;
    drawFrame(frameIndex);
  }

  // Fade canvas out and content in during last 20% of scroll
  const fadeStart = 0.8;
  if (progress >= fadeStart) {
    const fadeProgress = (progress - fadeStart) / (1 - fadeStart);
    canvas.style.opacity = 1 - fadeProgress;
    document.getElementById('siteContent').style.opacity = fadeProgress;
  } else {
    canvas.style.opacity = 1;
    document.getElementById('siteContent').style.opacity = 0;
  }
}

window.addEventListener('scroll', onScroll);
window.addEventListener('resize', () => { resizeCanvas(); drawFrame(currentFrame); });
```

**Loading screen:**
Show a loading progress indicator while frames preload. Fade it out when all frames are loaded. Example:

```javascript
function onAllLoaded() {
  document.getElementById('loader').style.opacity = 0;
  setTimeout(() => document.getElementById('loader').style.display = 'none', 500);
  resizeCanvas();
  drawFrame(1);
}
```

#### style.css

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: #000;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow-x: hidden;
}

#scrollCanvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 900;
  pointer-events: none;
}

#spacer {
  position: relative;
  /* height set dynamically or via variable */
}

#siteContent {
  position: relative;
  z-index: 1;
  opacity: 0;
  transition: opacity 0.2s linear;
}

#loader {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
  transition: opacity 0.5s;
}

.loader-bar {
  width: 200px;
  height: 2px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
}

.loader-fill {
  height: 100%;
  background: #fff;
  width: 0%;
  transition: width 0.1s;
}
```

#### Optional enhancements to offer the user:

1. **Autoplay intro** — play the first N frames automatically before handing control to scroll (like the Tim Chang rocket)
2. **Overlay text** — text that appears/disappears at specific scroll positions
3. **Scroll hint** — "Scroll to explore" indicator at the bottom
4. **Reduced motion** — `@media (prefers-reduced-motion: reduce)` shows a static image instead
5. **Mobile handling** — on mobile, either use fewer frames (every 2nd or 3rd) or show a static hero image with a fallback message

### Step 7: Ask what goes below

After the scroll-scrub section, ask the user:
- "What content should appear after the video finishes? (e.g. product info, about section, features, contact, or nothing — just the video experience)"

Build that content section accordingly.

### Step 8: Commit and push

Commit all files (frames folder, HTML, CSS, JS) and push to the current branch. Warn the user if the frames folder is large (>50MB) — suggest adding frames to `.gitignore` and hosting them separately if needed.

## IMPORTANT NOTES

- Always use `poster` or first frame as a static fallback while loading
- Never autoplay the actual video — the entire point is frame-by-frame scroll control
- The canvas must cover the full viewport and scale frames with `cover` behavior (no letterboxing)
- Scrolling UP must scrub the video BACKWARDS — this is bidirectional
- Test that frame 1 shows on page load (before any scroll)
- If FFmpeg is unavailable and cannot be installed, fall back to Python with opencv-python-headless:

```python
import cv2, os
os.makedirs('frames', exist_ok=True)
video = cv2.VideoCapture('assets/<filename>.mp4')
fps = video.get(cv2.CAP_PROP_FPS)
total = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
# Extract at 30fps intervals
interval = max(1, int(fps / 30))
count = 0
frame_num = 0
while True:
    ret, frame = video.read()
    if not ret: break
    if count % interval == 0:
        frame_num += 1
        cv2.imwrite(f'frames/frame-{frame_num:04d}.jpg', frame)
    count += 1
video.release()
```
