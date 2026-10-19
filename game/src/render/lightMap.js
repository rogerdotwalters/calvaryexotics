/**
 * render/lightMap.js
 * Purpose: work out, for every pixel inside a tank, how each lamp lights it.
 *          Light comes from the lamp's position on top of the tank, spreads in
 *          a cone and fades with distance (the same lampField() physics as the
 *          saved heat and UVB gradient), and is BLOCKED by what is in the tank.
 * Inputs:  getLightMaps(state, assets) with assets = { registry, layout, layers,
 *          lightKey }. What blocks light is found by drawing the placed items
 *          into scratch canvases by how solid they are (data/lightingRules.js),
 *          plus the substrate layer canvas.
 * Outputs: per station, per lamp: { hex, add, rim, shade } arrays over the
 *          interior pixels, in steps 0-4 (0 = not touched).
 *            add    lit, facing the lamp
 *            rim    a lit pixel with nothing above it (a top edge)
 *            shade  inside the beam but in shadow
 * How:     "raised edge logic": a pixel is lit only if nothing opaque lies
 *          between it and the lamp. So background is lit where the beam is
 *          clear, the TOP of each object (its first surface along each ray) is
 *          lit and the pixels under that surface are in shadow, and an object
 *          throws a shadow onto the background behind and below it. Done with
 *          a per-lamp shadow map of 720 angle slices: the nearest opaque pixel
 *          in each slice, so cost grows with pixel count, not pixels x steps.
 *          Rays alternate between full and slightly dimmer strength so the
 *          cone still reads as separate beams.
 * Notes:   results are cached by assets.lightKey, so the add and shade layers
 *          share one calculation. Animals do not cast shadows (they move every
 *          frame).
 */
import { PPI } from '../data/world.js';
import { lampField } from '../systems/gradient.js';
import { lampPlacements } from './scene/lamps.js';
import { drawItemsWhere } from './scene/contents.js';
import { makeCanvas } from './spriteCache.js';
import { blocksLight, lightClass } from '../data/lightingRules.js';

const BINS = 720;
const TOLERANCE = 1.5; // pixels: how far behind the first surface still counts as the surface
const RAY_DEGREES = 6;
const OPAQUE = 40; // alpha above which a layer pixel blocks light

let memo = { key: null, value: null };

const REFERENCE = 1.1; // light strength that counts as full brightness
const level = (l) => (l >= 0.8 ? 4 : l >= 0.6 ? 3 : l >= 0.4 ? 2 : l >= 0.2 ? 1 : 0);

const scratch = new Map(); // one reusable canvas per kind of blocker

function scratchCanvas(name, w, h) {
  let c = scratch.get(name);
  if (!c || c.width !== w || c.height !== h) {
    c = makeCanvas(w, h);
    scratch.set(name, c);
  }
  c.getContext('2d').clearRect(0, 0, w, h);
  return c;
}

const alphaOf = (canvas, r) => canvas.getContext('2d').getImageData(r.x, r.y, r.w, r.h).data;

/**
 * What is in the tank, by how much it blocks light (see data/lightingRules.js):
 *   hard  solid things that cast a full shadow (the substrate, ledges, rocks)
 *   dim   leafy things that only dim what is behind them
 *   surface  any of them, including thin vines: all catch light on their top edges
 */
function occupancy(state, assets, r) {
  const { layout, layers } = assets;
  const hard = new Uint8Array(r.w * r.h);
  const dim = new Uint8Array(r.w * r.h);
  const surface = new Uint8Array(r.w * r.h);
  const world = layout.world;
  for (const kind of ['hard', 'dim', 'thin']) {
    const canvas = scratchCanvas(kind, world.w, world.h);
    drawItemsWhere(canvas.getContext('2d'), state, assets, (entry) => lightClass(blocksLight(entry.id)) === kind);
    const data = alphaOf(canvas, r);
    for (let i = 0; i < surface.length; i++) {
      if (data[i * 4 + 3] <= OPAQUE) continue;
      surface[i] = 1;
      if (kind === 'hard') hard[i] = 1;
      if (kind === 'dim') dim[i] = 1;
    }
  }
  if (layers?.substrate) {
    const data = alphaOf(layers.substrate, r);
    for (let i = 0; i < surface.length; i++) if (data[i * 4 + 3] > OPAQUE) { hard[i] = 1; surface[i] = 1; }
  }
  return { hard, dim, surface };
}

const fieldCache = new Map();

/**
 * Everything about a lamp's light that does not depend on what is in the tank:
 * for each pixel its distance and angle slice from the lamp, and its brightness
 * level (cone, distance falloff and alternating rays). Cached, because dragging
 * an item changes the shadows but not the lamp.
 */
function lampField_(p, w, h, sx) {
  const key = `${p.fixture.id}|${p.lamp.watts}|${w}x${h}|${Math.round(sx)}`;
  const hit = fieldCache.get(key);
  if (hit) return hit;
  const n = w * h;
  const field = { dist: new Float32Array(n), bin: new Uint16Array(n), lo: new Uint16Array(n), hi: new Uint16Array(n), level: new Uint8Array(n) };
  const sy = -3 * PPI; // the lamp's light source sits above the tank
  const toBin = (angle) => Math.min(BINS - 1, Math.max(0, Math.floor(((angle + 90) / 180) * BINS)));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const dx = x + 0.5 - sx;
      const dy = y + 0.5 - sy;
      const dist = Math.hypot(dx, dy);
      const a = (Math.atan2(dx, dy) * 180) / Math.PI;
      const half = (Math.atan(0.5 / dist) * 180) / Math.PI; // how wide this pixel looks from the lamp
      field.dist[i] = dist;
      field.bin[i] = toBin(a);
      field.lo[i] = toBin(a - half);
      field.hi[i] = toBin(a + half);
      const f = lampField(p.fixture, p.lamp.watts, dx / PPI, (y + 0.5) / PPI);
      const stripe = Math.floor((a + 90) / RAY_DEGREES) % 2; // alternate stronger and weaker rays
      field.level[i] = f.light / REFERENCE < 0.1 ? 0 : level((f.light / REFERENCE) * (stripe === 0 ? 1 : 0.75));
    }
  }
  if (fieldCache.size > 40) fieldCache.clear();
  fieldCache.set(key, field);
  return field;
}

function nearestMap(mask, field) {
  const nearest = new Float32Array(BINS).fill(Infinity);
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i]) continue;
    const d = field.dist[i];
    for (let b = field.lo[i]; b <= field.hi[i]; b++) if (d < nearest[b]) nearest[b] = d;
  }
  return nearest;
}

function mapForLamp(p, r, occ, positionX) {
  const { w, h } = r;
  const field = lampField_(p, w, h, positionX);
  const nearestHard = nearestMap(occ.hard, field);
  const nearestDim = nearestMap(occ.dim, field);
  const add = new Uint8Array(w * h);
  const rim = new Uint8Array(w * h);
  const shade = new Uint8Array(w * h);
  for (let i = 0; i < add.length; i++) {
    let lvl = field.level[i];
    if (!lvl) continue;
    const bin = field.bin[i];
    const dist = field.dist[i];
    if (dist > nearestHard[bin] + TOLERANCE) {
      shade[i] = lvl; // in the beam but in the shadow of something solid
      continue;
    }
    if (dist > nearestDim[bin] + TOLERANCE) lvl -= 1; // behind leaves: still lit, one step dimmer
    if (!lvl) continue;
    add[i] = lvl;
    if (occ.surface[i] && (i < w || !occ.surface[i - w])) rim[i] = 1; // the top edge of anything
  }
  return { add, rim, shade };
}

export function getLightMaps(state, assets) {
  if (memo.key === assets.lightKey && memo.value) return memo.value;
  const { registry, layout, layers } = assets;
  const value = layout.stations.map((st, i) => {
    const station = state.stations[i];
    const r = st.tank.interior;
    const placements = lampPlacements(station, st, state, registry).filter((p) => p.on && p.hex);
    if (placements.length === 0) return { interior: r, lamps: [] };
    const occ = occupancy(state, { ...assets, stationIndex: i }, r);
    return {
      interior: r,
      mask: occ.surface,
      lamps: placements.map((p) => ({ hex: p.hex, ...mapForLamp(p, r, occ, p.x - r.x) })),
    };
  });
  memo = { key: assets.lightKey, value };
  return value;
}

export const resetLightCache = () => { memo = { key: null, value: null }; fieldCache.clear(); scratch.clear(); };
