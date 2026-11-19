// Palm Cover Studio cover renderer: six poster layouts, five colour grades, bold
// Anton lettering with a Pacifico script subtitle, film grain and vignette.
// drawCover draws the same cover at any size, so the editor preview and the
// exported PNG are the same picture. All coordinates are fractions of the cover.

export const SIZES = {
  '1080x1080': { w: 1080, h: 1080, label: 'Square 1080 × 1080' },
  '1080x1350': { w: 1080, h: 1350, label: 'Portrait 1080 × 1350' },
  '1920x1080': { w: 1920, h: 1080, label: 'Wide 1920 × 1080' },
};

export const LAYOUTS = {
  'vice-grid': { label: 'Vice Grid', panels: 4 },
  'hero-three': { label: 'Hero + Three', panels: 4 },
  'full-bleed': { label: 'Full Bleed', panels: 1 },
  'nine-panel': { label: 'Nine Panel', panels: 8 },
  tilted: { label: 'Tilted Snapshots', panels: 3 },
  story: { label: 'Story Stack', panels: 3 },
};

export const GRADES = {
  sunset: { label: 'Sunset', filter: 'saturate(1.45) contrast(1.1) sepia(0.28)', tint: ['rgba(255,120,60,0.30)', 'rgba(190,30,110,0.42)'] },
  neon: { label: 'Neon Vice', filter: 'saturate(1.7) contrast(1.14) hue-rotate(10deg)', tint: ['rgba(255,60,160,0.28)', 'rgba(0,200,220,0.30)'] },
  golden: { label: 'Golden Hour', filter: 'saturate(1.3) contrast(1.06) sepia(0.45)', tint: ['rgba(255,190,80,0.26)', 'rgba(160,80,10,0.30)'] },
  teal: { label: 'Teal Night', filter: 'saturate(1.25) contrast(1.12) hue-rotate(-35deg)', tint: ['rgba(0,180,200,0.24)', 'rgba(10,30,90,0.42)'] },
  noir: { label: 'Mono Noir', filter: 'grayscale(1) contrast(1.28) brightness(1.06)', tint: ['rgba(255,255,255,0.10)', 'rgba(0,0,0,0.34)'] },
};

const PAPER = '#f4ecdd';
const INK = '#16121f';
const POLAROIDS = ['golden hour', 'night drive', 'pier pressure'];

/** Panel rectangles for a layout, in fractions of the cover (x, y, w, h, rot). */
export function layoutPanels(layout, w, h) {
  const g = 0.016; // gap between panels, as a fraction of the short side
  const m = 0.028; // outer margin
  const gap = g * Math.min(w, h);
  const mar = m * Math.min(w, h);
  const px = (x, y, ww, hh, rot = 0) => ({ x: x * w, y: y * h, w: ww * w, h: hh * h, rot });
  switch (layout) {
    case 'vice-grid': {
      const top = mar;
      const bottom = h * 0.8;
      const colW = (w - mar * 2 - gap) / 2;
      const rowH = (bottom - top - gap) / 2;
      return [
        px(mar / w, top / h, colW / w, rowH / h),
        px((mar + colW + gap) / w, top / h, colW / w, rowH / h),
        px(mar / w, (top + rowH + gap) / h, colW / w, rowH / h),
        px((mar + colW + gap) / w, (top + rowH + gap) / h, colW / w, rowH / h),
      ];
    }
    case 'hero-three': {
      const heroW = w * 0.6;
      const sideX = w * 0.648;
      const sideW = w - sideX - mar;
      const top = mar;
      const bottom = h * 0.76;
      const rowH = (bottom - top - gap * 2) / 3;
      return [
        px(mar / w, top / h, heroW / w, (bottom - top) / h),
        px(sideX / w, top / h, sideW / w, rowH / h),
        px(sideX / w, (top + rowH + gap) / h, sideW / w, rowH / h),
        px(sideX / w, (top + (rowH + gap) * 2) / h, sideW / w, rowH / h),
      ];
    }
    case 'full-bleed':
      return [px(0, 0, 1, 1)];
    case 'nine-panel': {
      const cell = (w - mar * 2 - gap * 2) / 3;
      const cells = [];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          if (r === 1 && c === 1) continue; // centre cell is the title block
          cells.push(px((mar + c * (cell + gap)) / w, (mar + r * (cell + gap)) / h, cell / w, cell / h));
        }
      }
      return cells;
    }
    case 'tilted': {
      const pw = w * 0.34;
      const ph = h * 0.58;
      const cy = h * 0.48;
      return [
        px(0.06, (cy - ph / 2) / h, pw / w, ph / h, -0.1),
        px(0.33, (cy - ph / 2) / h, pw / w, ph / h, 0.02),
        px(0.60, (cy - ph / 2) / h, pw / w, ph / h, 0.09),
      ];
    }
    case 'story': {
      const heroH = h * 0.5;
      const botY = h * 0.68;
      const botH = h * 0.27;
      const colW = (w - mar * 2 - gap) / 2;
      return [
        px(mar / w, mar / h, (w - mar * 2) / w, heroH / h),
        px(mar / w, botY / h, colW / w, botH / h),
        px((mar + colW + gap) / w, botY / h, colW / w, botH / h),
      ];
    }
    default:
      return [px(0, 0, 1, 1)];
  }
}

/** Title block rectangle for a layout, in fractions of the cover. */
export function layoutTitle(layout, w, h) {
  const m = 0.028 * Math.min(w, h);
  switch (layout) {
    case 'vice-grid': return { x: m, y: h * 0.8, w: w - m * 2, h: h * 0.17, align: 'center', dark: false };
    case 'hero-three': return { x: m, y: h * 0.78, w: w - m * 2, h: h * 0.19, align: 'left', dark: false };
    case 'full-bleed': return { x: m, y: h * 0.66, w: w - m * 2, h: h * 0.3, align: 'left', dark: true };
    case 'nine-panel': {
      const cell = (w - m * 2 - 0.016 * Math.min(w, h) * 2) / 3;
      return { x: m + cell + 0.016 * Math.min(w, h), y: m + cell + 0.016 * Math.min(w, h), w: cell, h: cell, align: 'center', dark: true, centre: true };
    }
    case 'tilted': return { x: m, y: h * 0.03, w: w - m * 2, h: h * 0.13, align: 'center', dark: true };
    case 'story': return { x: m, y: h * 0.53, w: w - m * 2, h: h * 0.13, align: 'center', dark: true };
    default: return { x: m, y: h * 0.8, w: w - m * 2, h: h * 0.17, align: 'center', dark: false };
  }
}

let noiseTile = null;
function grainTile() {
  if (noiseTile) return noiseTile;
  const t = document.createElement('canvas');
  t.width = 128; t.height = 128;
  const c = t.getContext('2d');
  const img = c.createImageData(128, 128);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 100 + Math.floor(Math.random() * 110);
    img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
  noiseTile = t;
  return t;
}

/** Fits a font size so `text` fits `maxW`, starting from `startPx`. */
export function fitFont(ctx, text, family, maxW, startPx, weight = '') {
  let size = startPx;
  ctx.font = `${weight} ${size}px ${family}`;
  while (size > 10 && ctx.measureText(text).width > maxW) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }
  return size;
}

/** Draws one photo into a panel rect, honouring its crop (zoom, offset x/y). */
export function drawPanelPhoto(ctx, img, rect, crop, grade) {
  const { x, y, w, h, rot } = rect;
  ctx.save();
  ctx.beginPath();
  if (rot) {
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rot);
    ctx.rect(-w / 2, -h / 2, w, h);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();
  ctx.translate(rot ? 0 : x + w / 2, rot ? 0 : y + h / 2);
  if (rot) ctx.translate(0, 0);
  if (img) {
    const base = Math.max(w / img.naturalWidth, h / img.naturalHeight) * (crop.zoom || 1);
    const pw = img.naturalWidth * base;
    const ph = img.naturalHeight * base;
    ctx.filter = grade.filter;
    ctx.drawImage(img, -pw / 2 + (crop.ox || 0) * w, -ph / 2 + (crop.oy || 0) * h, pw, ph);
    ctx.filter = 'none';
    const tint = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    tint.addColorStop(0, grade.tint[0]);
    tint.addColorStop(1, grade.tint[1]);
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = tint;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.globalCompositeOperation = 'source-over';
  } else {
    ctx.fillStyle = '#3a2b52';
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = `600 ${Math.max(14, w * 0.035)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Add a photo', 0, 0);
  }
  ctx.restore();
}

/** Draws the title block: big Anton title, Pacifico subtitle, badge and stars. */
export function drawTitleBlock(ctx, w, h, titleRect, state) {
  const { x, y, w: tw, h: th, align, dark, centre } = titleRect;
  const title = (state.title || '').trim().toUpperCase();
  const sub = state.subtitle || '';
  ctx.save();
  if (dark) {
    ctx.fillStyle = centre ? INK : 'rgba(10,6,18,0.55)';
    if (!centre) {
      const grad = ctx.createLinearGradient(0, y, 0, y + th);
      grad.addColorStop(0, 'rgba(10,6,18,0)');
      grad.addColorStop(0.45, 'rgba(10,6,18,0.72)');
      grad.addColorStop(1, 'rgba(10,6,18,0.85)');
      ctx.fillStyle = grad;
    }
    ctx.fillRect(x, y, tw, th);
  }
  const ink = dark ? '#ffffff' : INK;
  const accent = '#ff5e8a';
  ctx.textAlign = align;
  const tx = align === 'center' ? x + tw / 2 : x;
  if (title) {
    const size = fitFont(ctx, title, 'Anton, sans-serif', tw * 0.96, centre ? th * 0.26 : th * 0.42);
    ctx.font = `${size}px Anton, sans-serif`;
    ctx.fillStyle = ink;
    ctx.shadowColor = dark ? 'rgba(255,94,138,0.65)' : 'rgba(0,0,0,0.18)';
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.05;
    const lines = wrapTitle(ctx, title, tw * 0.96, size);
    const lineH = size * 1.02;
    // Stack the band top to bottom so nothing overlaps: title, subtitle, stars.
    let ty = centre ? y + th * 0.5 - (lines.length - 1) * lineH * 0.5 : y + th * 0.38;
    for (const line of lines) {
      ctx.fillText(line, tx, ty);
      ty += lineH;
    }
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    if (sub && !centre) {
      const subSize = fitFont(ctx, sub, 'Pacifico, cursive', tw * 0.62, th * 0.16);
      ctx.font = `${subSize}px Pacifico, cursive`;
      ctx.fillStyle = accent;
      ctx.fillText(sub, tx, y + th * 0.68);
    }
  }
  if (state.stars > 0) {
    ctx.font = `${Math.max(12, th * 0.13)}px system-ui, sans-serif`;
    ctx.fillStyle = '#ffb347';
    ctx.textAlign = align;
    const stars = '★'.repeat(state.stars) + '☆'.repeat(5 - state.stars);
    ctx.fillText(stars, tx, y + th * (centre ? 0.88 : 0.93));
  }
  if (state.badge && !centre) {
    const bw = ctx.measureText(state.badge).width + th * 0.5;
    const bx = x + tw - bw;
    // A centred title runs wide: tuck the ribbon under it instead of across it.
    const by = align === 'center' ? y + th * 0.70 : y + th * 0.08;
    ctx.save();
    ctx.translate(bx + bw / 2, by + th * 0.1);
    ctx.rotate(-0.06);
    ctx.fillStyle = accent;
    ctx.fillRect(-bw / 2, -th * 0.1, bw, th * 0.2);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 ${Math.max(10, th * 0.11)}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(state.badge, 0, th * 0.035);
    ctx.restore();
  }
  ctx.restore();
}

function wrapTitle(ctx, title, maxW, size) {
  ctx.font = `${size}px Anton, sans-serif`;
  const words = title.split(/\s+/);
  if (words.length === 1) return [title];
  const lines = [];
  let cur = '';
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(next).width <= maxW) cur = next;
    else { if (cur) lines.push(cur); cur = word; }
  }
  if (cur) lines.push(cur);
  return lines.length > 2 ? [title] : lines;
}

/** Draws the whole cover onto `canvas` (at its own width/height) from `state`. */
export function drawCover(canvas, state) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const layout = state.layout || 'vice-grid';
  const grade = GRADES[state.grade] || GRADES.sunset;
  const paper = layout === 'full-bleed' || layout === 'tilted' ? null : PAPER;
  if (paper) {
    ctx.fillStyle = paper;
    ctx.fillRect(0, 0, w, h);
  } else {
    const bg = ctx.createLinearGradient(0, 0, w, h);
    bg.addColorStop(0, '#2b1145');
    bg.addColorStop(0.55, '#7a1e5e');
    bg.addColorStop(1, '#ff7a3d');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
  }
  const panels = layoutPanels(layout, w, h);
  const border = paper ? INK : '#ffffff';
  panels.forEach((rect, i) => {
    const panel = state.panels[i] || { photo: -1, zoom: 1, ox: 0, oy: 0 };
    // A photo entry is either an Image or a library record { img, name, thumb }.
    const entry = panel.photo >= 0 ? state.photos[panel.photo] : null;
    const img = entry && typeof entry === 'object' && 'img' in entry ? entry.img : entry;
    if (layout === 'tilted') {
      // Polaroid frame: thick white border with a caption strip.
      ctx.save();
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(rect.rot);
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = w * 0.02;
      ctx.shadowOffsetY = h * 0.008;
      ctx.fillStyle = '#fdfbf6';
      ctx.fillRect(-rect.w / 2 - w * 0.012, -rect.h / 2 - w * 0.012, rect.w + w * 0.024, rect.h + w * 0.024 + h * 0.07);
      ctx.restore();
      const inner = { x: rect.x, y: rect.y, w: rect.w, h: rect.h - h * 0.07, rot: rect.rot };
      drawPanelPhoto(ctx, img, inner, panel, grade);
      ctx.save();
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2);
      ctx.rotate(rect.rot);
      ctx.fillStyle = '#3a2b52';
      ctx.font = `${Math.max(12, w * 0.02)}px Pacifico, cursive`;
      ctx.textAlign = 'center';
      ctx.fillText(POLAROIDS[i] || '', 0, rect.h / 2 + h * 0.035);
      ctx.restore();
    } else {
      drawPanelPhoto(ctx, img, rect, panel, grade);
      ctx.save();
      ctx.lineWidth = Math.max(3, w * 0.004);
      ctx.strokeStyle = border;
      ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
      ctx.restore();
    }
  });
  drawTitleBlock(ctx, w, h, layoutTitle(layout, w, h), state);
  if (state.vignette) {
    const v = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.72);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.32)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  }
  if (state.grain) {
    ctx.save();
    ctx.globalAlpha = 0.07;
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = ctx.createPattern(grainTile(), 'repeat');
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
  return canvas;
}
