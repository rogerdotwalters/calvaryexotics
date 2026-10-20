/**
 * ui/mapHover.js
 * Purpose: a small readout of the value under the pointer while a live data map
 *          is showing: the temperature, humidity or UVB at that spot of the tank.
 * Inputs:  { canvas, tip, bus, getState, registry }
 * Outputs: moves and fills the `tip` element. Read only.
 * Notes:   a mouse shows it on hover; a finger shows it while touching and for a
 *          moment after. Humidity says whether the spot is air or soil, and UVB
 *          gives its Ferguson zone.
 */
import { getLayout } from '../render/layout.js';
import { DATA_VIEWS, isLiveView } from '../data/dataViews.js';
import { fieldFor } from '../render/scene/dataView.js';
import { uvbZone } from '../systems/gradient.js';

export function createMapHover({ canvas, tip, getState, registry }) {
  let hideTimer = null;
  const hide = () => { tip.hidden = true; };

  /** Lines of text for the point (view pixels), or null when it is not over a tank. */
  function describe(px, py) {
    const state = getState();
    const mode = state.settings.dataView;
    if (!isLiveView(mode)) return null;
    const layout = getLayout(state, registry);
    const wx = state.view.cameraX + px;
    const index = layout.stations.findIndex((s) => {
      const r = s.tank.interior;
      return wx >= r.x && wx < r.x + r.w && py >= r.y && py < r.y + r.h;
    });
    if (index < 0) return null;
    const r = layout.stations[index].tank.interior;
    const field = fieldFor(mode, state.stations[index], registry);
    if (!field) return null;
    const cell = r.w / field.cols;
    const col = Math.min(field.cols - 1, Math.max(0, Math.floor((wx - r.x) / cell)));
    const row = Math.min(field.rows - 1, Math.max(0, Math.floor((py - r.y) / cell)));
    const value = field.at(col, row);
    const view = DATA_VIEWS[mode];
    const depth = `${row + 1} in down`;
    if (mode === 'humidity') return [`${view.format(value)} humidity`, py - r.y > layout.stations[index].ground ? 'In the soil' : `Air, ${depth}`];
    if (mode === 'uvb') return [`${value.toFixed(1)} UVI`, value > 0 ? `Zone ${uvbZone(value)}, ${depth}` : `No UVB, ${depth}`];
    return [`${view.format(value)} air`, depth];
  }

  function show(e) {
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) * canvas.width) / rect.width;
    const py = ((e.clientY - rect.top) * canvas.height) / rect.height;
    const lines = describe(px, py);
    if (!lines) { hide(); return; }
    tip.replaceChildren(...lines.map((text, i) => {
      const p = document.createElement('p');
      p.textContent = text;
      if (i === 0) p.className = 'map-tip-value';
      return p;
    }));
    tip.hidden = false;
    const box = tip.getBoundingClientRect();
    const left = e.clientX + 14 + box.width > window.innerWidth ? e.clientX - 14 - box.width : e.clientX + 14;
    const top = e.clientY + 14 + box.height > window.innerHeight ? e.clientY - 14 - box.height : e.clientY + 14;
    tip.style.left = `${Math.max(4, left)}px`;
    tip.style.top = `${Math.max(4, top)}px`;
  }

  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'mouse' && e.buttons !== 0) { hide(); return; } // dragging: not hovering
    clearTimeout(hideTimer);
    show(e);
  });
  canvas.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') show(e); });
  const later = (e) => { if (e.pointerType !== 'mouse') { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 1600); } };
  canvas.addEventListener('pointerup', later);
  canvas.addEventListener('pointercancel', later);
  canvas.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hide(); });
  hide();
}
