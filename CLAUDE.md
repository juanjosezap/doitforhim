# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # run the server (port 3000)
npm run dev      # run with nodemon (auto-restart on change)
```

No build step — the frontend is plain HTML/CSS/JS served from `public/`.

## Architecture

**`server.js`** — Express server with two responsibilities:
- Serves `public/` as static files.
- `GET /api/media` — reads the `media/` folder and returns a JSON array of `{ url, type }` objects filtered to image/video extensions.

**`public/`** — client-side app:
- `index.html` — minimal shell: a `<div class="poster-wrap">` containing the poster image and a `#framesContainer` div where frames are injected.
- `app.js` — all logic. Key sections:
  - `FRAMES` array — 11 photo frame positions, each `{ left, top, width, height }` in percentages of the poster's rendered size. Slots 0–6 are on the blue wall outside the board; slots 7–10 are on the board itself.
  - `EDIT_MODE` flag — set to `true` to enter drag-to-position mode. Dragging a frame logs the updated `FRAMES` array to the browser console; paste it back and set `EDIT_MODE = false`.
  - `ROTATION_MS` — how often all slots advance to the next set of media (default: 3 minutes).
  - Cross-fade transition: `renderSlot` / `crossFadeSlot` fade out the old `.media-wrap` and fade in a new one.
- `style.css` — poster is `width: 100vw`, frames are `position: absolute` with percentage-based geometry.

**`public/poster.png`** — the background template image (1920×1080). Replace to change the template; frame positions in `FRAMES` will need re-tuning.

**`media/`** — drop photos (jpg/png/gif/webp/avif) and videos (mp4/webm/mov) here. The server lists them at `/api/media`. No restart needed — changes appear on next page refresh.

## Frame position tuning

Frame coordinates are percentages of the poster's rendered width/height. To adjust:
1. Set `EDIT_MODE = true` in `app.js`.
2. Open the page, drag frames to the correct positions.
3. Copy the logged `FRAMES` array from the browser console.
4. Paste back into `app.js`, set `EDIT_MODE = false`.
