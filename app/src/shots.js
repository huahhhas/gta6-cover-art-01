// Fixed scenes for screenshots: ?shot=editor shows the page with a sample photo;
// ?shot=cover shows the cover alone. `photo` picks the sample, `caption` the title,
// `layout`, `grade` and `size` pick the cover. window.__shotReady is set once painted.
// The cover scene fills every panel with the samples, alternating them.
export async function runShot(shot, query, state) {
  const photo = query.get('photo') ?? 'pier';
  const caption = query.get('caption') ?? 'Sunset Heist';
  const subtitle = query.get('subtitle') ?? 'Vice nights, golden light';
  const layout = query.get('layout') ?? 'vice-grid';
  const grade = query.get('grade') ?? 'sunset';
  const size = query.get('size') ?? '1920x1080';
  const badge = query.get('badge') ?? 'EST. 2026 · PALM SHORES';
  const stars = Number(query.get('stars') ?? '4');
  state.layout = layout;
  state.grade = grade;
  state.size = size;
  state.title = caption;
  state.subtitle = subtitle;
  state.badge = badge;
  state.stars = stars;
  // Alternate the samples across the panels so every panel shows a photo.
  const first = state.photos.findIndex((p) => p.name === photo);
  state.panels.forEach((panel, i) => {
    panel.photo = first >= 0 ? (first + i) % state.photos.length : i % state.photos.length;
    panel.zoom = 1;
    panel.ox = 0;
    panel.oy = 0;
  });
  if (shot === 'cover') document.body.classList.add('shot-cover');
  if (shot === 'editor') document.body.classList.add('shot-editor');
}
