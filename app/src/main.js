// Palm Cover Studio editor: photo library, panel crop by drag and wheel, layout /
// grade / size pickers, caption editing, PNG export, undo and redo. The preview
// canvas and the exported PNG are drawn by the same drawCover in ./cover.js.
import { drawCover, layoutPanels, LAYOUTS, GRADES, SIZES } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('cover');
const $ = (id) => document.getElementById(id);
const statusEl = $('status');
const panelLabel = $('panelLabel');
const zoomInput = $('zoom');

const SAMPLES = [
  { name: 'pier', url: 'samples/pier.jpg', label: 'Pier' },
  { name: 'boulevard', url: 'samples/boulevard.jpg', label: 'Boulevard' },
];

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

const state = {
  layout: 'vice-grid',
  grade: 'sunset',
  size: '1920x1080',
  title: 'SUNSET HEIST',
  subtitle: 'Vice nights, golden light',
  badge: 'EST. 2026 · PALM SHORES',
  stars: 4,
  grain: true,
  vignette: true,
  photos: [], // Image objects, in library order
  panels: Array.from({ length: 8 }, (_, i) => ({ photo: -1, zoom: 1, ox: 0, oy: 0 })),
};

let picked = -1; // library index picked to place into a panel
let selected = -1; // panel index selected in the preview
let history = [];
let future = [];

function snapshot() {
  return JSON.stringify({
    layout: state.layout, grade: state.grade, size: state.size,
    title: state.title, subtitle: state.subtitle, badge: state.badge, stars: state.stars,
    grain: state.grain, vignette: state.vignette, panels: state.panels,
  });
}

function restore(json) {
  const s = JSON.parse(json);
  Object.assign(state, s);
  syncControls();
  redraw();
}

function pushHistory() {
  history.push(snapshot());
  if (history.length > 60) history.shift();
  future = [];
}

function undo() {
  if (!history.length) return;
  future.push(snapshot());
  restore(history.pop());
}

function redo() {
  if (!future.length) return;
  history.push(snapshot());
  restore(future.pop());
}

function redraw() {
  const size = SIZES[state.size];
  if (canvas.width !== size.w || canvas.height !== size.h) {
    canvas.width = size.w;
    canvas.height = size.h;
  }
  drawCover(canvas, state);
  const panel = state.panels[selected];
  if (selected >= 0 && panel) {
    panelLabel.textContent = `Panel ${selected + 1} — photo ${panel.photo >= 0 ? state.photos[panel.photo]?.name ?? '?' : 'none'}, zoom ${panel.zoom.toFixed(2)}×`;
    zoomInput.value = String(panel.zoom);
  } else {
    panelLabel.textContent = 'No panel selected — click the cover.';
  }
}

function buildChoices(el, items, current, onPick) {
  el.innerHTML = '';
  for (const [key, item] of Object.entries(items)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = item.label;
    if (key === current) b.classList.add('on');
    b.addEventListener('click', () => {
      pushHistory();
      onPick(key);
      buildChoices(el, items, key, onPick);
      redraw();
    });
    el.appendChild(b);
  }
}

function syncControls() {
  $('title').value = state.title;
  $('subtitle').value = state.subtitle;
  $('badge').value = state.badge;
  $('stars').value = String(state.stars);
  $('grain').checked = state.grain;
  $('vignette').checked = state.vignette;
  buildChoices($('layouts'), LAYOUTS, state.layout, (k) => { state.layout = k; });
  buildChoices($('grades'), GRADES, state.grade, (k) => { state.grade = k; });
  buildChoices($('sizes'), SIZES, state.size, (k) => { state.size = k; });
  renderLibrary();
}

function renderLibrary() {
  const lib = $('library');
  lib.innerHTML = '';
  state.photos.forEach((photo, i) => {
    const img = document.createElement('img');
    img.src = photo.thumb;
    img.alt = photo.name;
    img.title = photo.name;
    if (i === picked) img.classList.add('picked');
    img.addEventListener('click', () => {
      picked = i;
      renderLibrary();
      statusEl.textContent = `Picked ${photo.name} — click a panel to place it.`;
    });
    lib.appendChild(img);
  });
}

async function addPhoto(file, name) {
  const url = URL.createObjectURL(file);
  const img = await loadImage(url);
  state.photos.push({ img, name, thumb: url });
  return state.photos.length - 1;
}

function placePicked(panelIndex) {
  if (picked < 0 || panelIndex < 0) return;
  pushHistory();
  state.panels[panelIndex].photo = picked;
  state.panels[panelIndex].zoom = 1;
  state.panels[panelIndex].ox = 0;
  state.panels[panelIndex].oy = 0;
  redraw();
}

function canvasPoint(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * (canvas.width / r.width),
    y: (e.clientY - r.top) * (canvas.height / r.height),
  };
}

function hitPanel(p) {
  const panels = layoutPanels(state.layout, canvas.width, canvas.height);
  for (let i = panels.length - 1; i >= 0; i--) {
    const r = panels[i];
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const dx = p.x - cx;
    const dy = p.y - cy;
    const lx = Math.cos(-r.rot) * dx - Math.sin(-r.rot) * dy;
    const ly = Math.sin(-r.rot) * dx + Math.cos(-r.rot) * dy;
    if (Math.abs(lx) <= r.w / 2 && Math.abs(ly) <= r.h / 2) return i;
  }
  return -1;
}

let dragging = null;
canvas.addEventListener('pointerdown', (e) => {
  const p = canvasPoint(e);
  const i = hitPanel(p);
  if (i < 0) return;
  selected = i;
  if (picked >= 0) { placePicked(i); return; }
  dragging = { panel: i, x: p.x, y: p.y, moved: false };
  canvas.setPointerCapture(e.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const p = canvasPoint(e);
  const panel = state.panels[dragging.panel];
  const rects = layoutPanels(state.layout, canvas.width, canvas.height);
  const rect = rects[dragging.panel];
  const dx = (p.x - dragging.x) / rect.w;
  const dy = (p.y - dragging.y) / rect.h;
  if (Math.abs(dx) + Math.abs(dy) > 0.002) dragging.moved = true;
  panel.ox += dx;
  panel.oy += dy;
  panel.ox = Math.max(-0.6, Math.min(0.6, panel.ox));
  panel.oy = Math.max(-0.6, Math.min(0.6, panel.oy));
  dragging.x = p.x;
  dragging.y = p.y;
  redraw();
});
canvas.addEventListener('pointerup', () => {
  if (dragging?.moved) pushHistory();
  dragging = null;
});
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const p = canvasPoint(e);
  const i = hitPanel(p);
  if (i < 0) return;
  selected = i;
  pushHistory();
  const panel = state.panels[i];
  panel.zoom = Math.max(1, Math.min(3, panel.zoom * (1 - e.deltaY * 0.001)));
  redraw();
}, { passive: false });

zoomInput.addEventListener('input', () => {
  if (selected < 0) return;
  state.panels[selected].zoom = Number(zoomInput.value);
  redraw();
});
zoomInput.addEventListener('change', () => pushHistory());
$('resetCrop').addEventListener('click', () => {
  if (selected < 0) return;
  pushHistory();
  Object.assign(state.panels[selected], { zoom: 1, ox: 0, oy: 0 });
  redraw();
});
$('fillPanel').addEventListener('click', () => placePicked(selected));

$('upload').addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    const idx = await addPhoto(file, file.name);
    picked = idx;
  }
  renderLibrary();
  redraw();
  statusEl.textContent = 'Photo added — click a panel to place it.';
});

$('title').addEventListener('input', (e) => { state.title = e.target.value; redraw(); });
$('subtitle').addEventListener('input', (e) => { state.subtitle = e.target.value; redraw(); });
$('badge').addEventListener('input', (e) => { state.badge = e.target.value; redraw(); });
$('stars').addEventListener('change', (e) => { pushHistory(); state.stars = Number(e.target.value); redraw(); });
$('grain').addEventListener('change', (e) => { state.grain = e.target.checked; redraw(); });
$('vignette').addEventListener('change', (e) => { state.vignette = e.target.checked; redraw(); });
$('undo').addEventListener('click', undo);
$('redo').addEventListener('click', redo);

/** Renders the current state at `sizeKey` and downloads it as a PNG. */
export function exportCover(sizeKey) {
  return new Promise((resolve) => {
    const size = SIZES[sizeKey];
    const off = document.createElement('canvas');
    off.width = size.w;
    off.height = size.h;
    drawCover(off, { ...state, size: sizeKey });
    off.toBlob((blob) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `palm-cover-${sizeKey}.png`;
      a.click();
      statusEl.textContent = `Saved palm-cover-${sizeKey}.png`;
      resolve();
    }, 'image/png');
  });
}

$('export').addEventListener('click', () => exportCover(state.size));
$('exportAll').addEventListener('click', async () => {
  for (const key of Object.keys(SIZES)) {
    // eslint-disable-next-line no-await-in-loop
    await exportCover(key);
  }
});

async function init() {
  await Promise.all([
    document.fonts.load('100px Anton'),
    document.fonts.load('100px Pacifico'),
  ]).catch(() => {});
  for (const sample of SAMPLES) {
    const img = await loadImage(sample.url);
    state.photos.push({ img, name: sample.name, thumb: sample.url });
  }
  // Default cover: alternate the two samples across the panels.
  state.panels.forEach((panel, i) => { panel.photo = i % state.photos.length; });
  picked = 0;
  selected = 0;
  syncControls();
  const params = new URLSearchParams(location.search);
  const shot = params.get('shot');
  if (shot) {
    await runShot(shot, params, state);
    // Keep the sidebar in step with the scene the shot asked for.
    syncControls();
    document.body.classList.add(shot === 'cover' ? 'shot-cover' : 'shot-editor');
    redraw();
    requestAnimationFrame(() => requestAnimationFrame(() => { window.__shotReady = true; }));
  } else {
    redraw();
  }
}

init();
