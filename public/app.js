// ── Configuration ─────────────────────────────────────────────────────────────
//
// Each frame position is expressed as percentages of the poster image size so
// the layout scales with any screen width.
//
//   left, top   – distance from the image's top-left corner  (% of width/height)
//   width        – frame width  (% of image width)
//   height       – frame height (% of image height)
//
// Adjust these values once you have placed your poster.jpg so the frames line
// up with Maggie's photo spots.  Use EDIT_MODE = true below to show a visual
// helper that lets you drag frames into position and prints the coords to the
// console.

// Positions are % of the poster image's rendered width/height.
// Use EDIT_MODE = true to drag-adjust them if anything is off.
const FRAMES = [
  // ── On the blue wall (outside the board) ──────────────────────────────────
  { left: -0.54, top:  4.87, width: 11.84, height: 35.07 },  //  0: top-left corner
  { left: 27.80, top:  0.15, width: 18.62, height: 16.22 },  //  1: top-centre (large)
  { left: 60.20, top:  0.70, width: 16.80, height: 10.70 },  //  2: top-right
  { left: 92.79, top: -1.63, width: 12.70, height: 22.50 },  //  3: right wall – upper
  { left: 71.37, top: 26.51, width: 28.63, height: 36.96 },  //  4: right wall – lower
  { left: -0.73, top: 47.31, width:  8.98, height: 25.50 },  //  5: left wall – middle
  { left:  4.29, top: 71.76, width: 16.94, height: 29.58 },  //  6: bottom-left
  // ── On the board ──────────────────────────────────────────────────────────
  { left: 30.50, top: 29.96, width:  4.47, height: 11.33 },  //  7: board – "I" slot (small oval)
  { left: 60.00, top: 23.30, width: 15.50, height: 19.00 },  //  8: board – right photo
  { left: 21.60, top: 44.21, width: 30.74, height: 28.10 },  //  9: board – lower-left photo
  { left: 42.98, top: 58.76, width: 26.20, height: 38.47 },  // 10: board – centre-bottom (large)
  { left: 75.55, top: 72.69, width: 24.30, height: 27.21 },  // 11: bottom-right wall
];

// Set to true to enter interactive positioning mode.
// Drag frames with the mouse; final coordinates are logged to the console.
const EDIT_MODE = false;

const ROTATION_MS = 3 * 60 * 1000; // change every 3 minutes

// ── State ─────────────────────────────────────────────────────────────────────
let mediaFiles = [];
let currentOffset = 0;
let rotationTimer = null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function slotMedia(slotIndex) {
  if (!mediaFiles.length) return null;
  return mediaFiles[(currentOffset + slotIndex) % mediaFiles.length];
}

function buildMediaEl(item) {
  if (item.type === 'video') {
    const v = document.createElement('video');
    v.src = item.url;
    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    return v;
  }
  const img = document.createElement('img');
  img.src = item.url;
  img.alt = '';
  img.draggable = false;
  return img;
}

// ── Frames ────────────────────────────────────────────────────────────────────

function createFrameEl(cfg, index) {
  const div = document.createElement('div');
  div.className = 'photo-frame';
  div.dataset.slot = index;
  applyFrameStyle(div, cfg);
  return div;
}

function applyFrameStyle(el, cfg) {
  el.style.left   = `${cfg.left}%`;
  el.style.top    = `${cfg.top}%`;
  el.style.width  = `${cfg.width}%`;
  el.style.height = `${cfg.height}%`;
}

function renderSlot(frame, item) {
  const wrap = document.createElement('div');
  wrap.className = 'media-wrap fading';
  const el = buildMediaEl(item);
  wrap.appendChild(el);
  frame.appendChild(wrap);
  if (item.type === 'video') el.play().catch(() => {});
  requestAnimationFrame(() =>
    requestAnimationFrame(() => wrap.classList.remove('fading'))
  );
}

function crossFadeSlot(frame, item) {
  const old = frame.querySelector('.media-wrap');
  if (old) {
    old.classList.add('fading');
    old.addEventListener('transitionend', () => old.remove(), { once: true });
  }
  renderSlot(frame, item);
}

function updateAllSlots(initial = false) {
  document.querySelectorAll('.photo-frame').forEach((frame, i) => {
    const item = slotMedia(i);
    if (!item) return;
    initial ? renderSlot(frame, item) : crossFadeSlot(frame, item);
  });
}

// ── Rotation ──────────────────────────────────────────────────────────────────

function rotate() {
  currentOffset = (currentOffset + FRAMES.length) % Math.max(mediaFiles.length, 1);
  updateAllSlots(false);
}

function startRotation() {
  clearInterval(rotationTimer);
  rotationTimer = setInterval(rotate, ROTATION_MS);
}

// ── Edit mode (drag to move + corner handles to resize) ──────────────────────

function logFrames(frames) {
  console.log('Full FRAMES array:\n' + JSON.stringify(
    frames.map(f => ({
      left:   +parseFloat(f.style.left).toFixed(2),
      top:    +parseFloat(f.style.top).toFixed(2),
      width:  +parseFloat(f.style.width).toFixed(2),
      height: +parseFloat(f.style.height).toFixed(2),
    })), null, 2
  ));
}

function enableEditMode(frames) {
  console.log('[EDIT MODE] Drag frame body = move. Drag yellow corner = resize. Coords logged on release.');
  const wrap = document.getElementById('posterWrap');

  frames.forEach((frame, i) => {
    frame.style.cursor = 'move';
    frame.style.border = '2px dashed red';
    frame.style.background = 'rgba(255,0,0,0.12)';
    frame.style.overflow = 'visible'; // allow handles to render outside the frame

    // ── Move on frame body drag ──────────────────────────────────────────────
    frame.addEventListener('mousedown', e => {
      if (e.target !== frame) return; // handles stop propagation
      e.preventDefault();
      const r = wrap.getBoundingClientRect();
      const x0 = e.clientX, y0 = e.clientY;
      const l0 = parseFloat(frame.style.left);
      const t0 = parseFloat(frame.style.top);

      function onMove(e) {
        frame.style.left = `${l0 + (e.clientX - x0) / r.width  * 100}%`;
        frame.style.top  = `${t0 + (e.clientY - y0) / r.height * 100}%`;
      }
      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        logFrames(frames);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    // ── Resize handles at the 4 corners ─────────────────────────────────────
    const CORNERS = ['nw', 'ne', 'sw', 'se'];
    CORNERS.forEach(c => {
      const h = document.createElement('div');
      const isN = c[0] === 'n', isW = c[1] === 'w';
      h.style.cssText = [
        'position:absolute',
        'width:14px', 'height:14px',
        'background:yellow',
        'border:2px solid #c00',
        'border-radius:3px',
        'z-index:999',
        `cursor:${c}-resize`,
        isN ? 'top:-7px'    : 'bottom:-7px',
        isW ? 'left:-7px'   : 'right:-7px',
      ].join(';');

      h.addEventListener('mousedown', e => {
        e.preventDefault();
        e.stopPropagation();
        const r  = wrap.getBoundingClientRect();
        const x0 = e.clientX, y0 = e.clientY;
        const l0 = parseFloat(frame.style.left);
        const t0 = parseFloat(frame.style.top);
        const w0 = parseFloat(frame.style.width);
        const h0 = parseFloat(frame.style.height);

        function onMove(e) {
          const dx = (e.clientX - x0) / r.width  * 100;
          const dy = (e.clientY - y0) / r.height * 100;
          if (isW) {
            frame.style.left  = `${l0 + dx}%`;
            frame.style.width = `${Math.max(1, w0 - dx)}%`;
          } else {
            frame.style.width = `${Math.max(1, w0 + dx)}%`;
          }
          if (isN) {
            frame.style.top    = `${t0 + dy}%`;
            frame.style.height = `${Math.max(1, h0 - dy)}%`;
          } else {
            frame.style.height = `${Math.max(1, h0 + dy)}%`;
          }
        }
        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
          logFrames(frames);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      frame.appendChild(h);
    });
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

async function init() {
  const container = document.getElementById('framesContainer');
  const frameEls = FRAMES.map((cfg, i) => {
    const el = createFrameEl(cfg, i);
    container.appendChild(el);
    return el;
  });

  if (EDIT_MODE) {
    enableEditMode(frameEls);
    return;
  }

  let files = [];
  try {
    const res = await fetch('/api/media');
    files = await res.json();
  } catch {
    // server not available
  }

  mediaFiles = shuffle(files);

  const noMedia = document.getElementById('noMedia');
  if (!mediaFiles.length) {
    noMedia.classList.add('visible');
    return;
  }

  noMedia.classList.remove('visible');
  updateAllSlots(true);
  startRotation();
}

init();
