# Journey PNG Frames

Drop puppet-show PNG frames here for the customer buying journey scroll-scrub animation.

## Expected format
- Files: `frame-0001.png` through `frame-0050.png`
- Transparent background
- Consistent canvas size (recommended: 900×540px)
- 50 frames total across 5 acts (10 frames each)

## Acts
- Frames 1–10: Stranger (walks in, unaware)
- Frames 11–20: Aware (stops, notices something)
- Frames 21–30: Interested (leans in, curious)
- Frames 31–40: Desire (reaches toward something)
- Frames 41–50: Buyer (completes action, celebrates)

When frames are added, update `marketing.js` to load them via the scroll-scrub engine instead of the CSS fallback puppet.
