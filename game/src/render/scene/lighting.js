/**
 * render/scene/lighting.js
 * Purpose: night shading for the whole room, the lighting from each lamp, and
 *
 *          Lighting is worked out per pixel in render/lightMap.js (cone,
 *          distance, and objects blocking the light) and drawn in two layers:
 *          lit pixels brighten the scene ("screen"), shadowed pixels darken
 *          it ("multiply"). There is no flat tint over the glass.
 * Inputs:  ctx, state, { registry, layout }
 * Outputs: drawNight(), drawLightAdd(), drawLightShade().
 * Notes:   the beam uses the same lampField() physics as the saved gradient, so
 *          a higher wattage gives a longer, wider beam.
 */
import { px } from '../../utils/pixelScale.js';
import { nightLevel } from '../../systems/daylight.js';
import { lampPlacements } from './lamps.js';
import { getLightMaps } from '../lightMap.js';
import { ditherRect } from '../dither.js';

const NIGHT_COLOR = '#0a0f2e';
const MAX_NIGHT_ALPHA = 0.5;
const RAY_DEGREES = 6;

export function drawNight(ctx, state, { layout }) {
  const level = nightLevel(state);
  if (level === 0) return;
  ctx.fillStyle = NIGHT_COLOR;
  ctx.globalAlpha = level * MAX_NIGHT_ALPHA;
  ctx.fillRect(0, 0, layout.world.w, layout.world.h);
  ctx.globalAlpha = 1;
}

// How strongly each light level shows. Surfaces facing the lamp (the tops of
// things) get more than empty background; shadows darken without washing out.
const BACKGROUND_ALPHA = [0, 0.14, 0.25, 0.36, 0.46];
const SURFACE_ALPHA = [0, 0.22, 0.4, 0.56, 0.72];
const RIM_BOOST = 0.26;
const SHADE_ALPHA = [0, 0.12, 0.22, 0.32, 0.42];
const SHADE_COLOR = '#0b1233';

/**
 * Layer 'lightAdd' (composited with "screen"): the lit pixels. Light only lands
 * where the lamp can see: open background, and the top edges and lamp-facing
 * surfaces of objects. Plus a bright lens and a small halo on top of each lamp.
 */
export function drawLightAdd(ctx, state, assets) {
  const { layout, registry } = assets;
  const maps = getLightMaps(state, assets);
  layout.stations.forEach((st, i) => {
    const { interior: r, mask, lamps } = maps[i];
    for (const lamp of lamps) {
      ctx.fillStyle = lamp.hex;
      for (let y = 0; y < r.h; y++) {
        for (let x = 0; x < r.w; x++) {
          const k = y * r.w + x;
          const lvl = lamp.add[k];
          if (!lvl) continue;
          const surface = mask[k] === 1;
          ctx.globalAlpha = Math.min(0.85, (surface ? SURFACE_ALPHA[lvl] : BACKGROUND_ALPHA[lvl]) + (lamp.rim[k] ? RIM_BOOST : 0));
          ctx.fillRect(r.x + x, r.y + y, 1, 1);
        }
      }
    }
    for (const p of lampPlacements(state.stations[i], st, state, registry)) { // the lens glows, with a small halo
      if (!p.on || !p.hex) continue;
      ctx.fillStyle = p.hex;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(p.x - px(3), p.y - px(1), px(6), px(1));
      ctx.globalAlpha = 0.35;
      ditherRect(ctx, p.x - px(10), p.y - px(15), px(20), px(4), p.hex, 0);
    }
  });
  ctx.globalAlpha = 1;
}

/** Layer 'lightShade' (composited with "multiply"): shadows inside the beam. */
export function drawLightShade(ctx, state, assets) {
  const { layout } = assets;
  const maps = getLightMaps(state, assets);
  ctx.fillStyle = SHADE_COLOR;
  layout.stations.forEach((st, i) => {
    const { interior: r, lamps } = maps[i];
    const worst = new Uint8Array(r.w * r.h); // the deepest shadow from any lamp...
    const lit = new Uint8Array(r.w * r.h); // ...softened where another lamp does reach the pixel
    for (const lamp of lamps) {
      for (let k = 0; k < worst.length; k++) {
        if (lamp.shade[k] > worst[k]) worst[k] = lamp.shade[k];
        if (lamp.add[k]) lit[k] = 1;
      }
    }
    for (let k = 0; k < worst.length; k++) if (lit[k]) worst[k] = Math.min(worst[k], 1);
    for (let y = 0; y < r.h; y++) {
      for (let x = 0; x < r.w; x++) {
        const lvl = worst[y * r.w + x];
        if (!lvl) continue;
        ctx.globalAlpha = SHADE_ALPHA[lvl];
        ctx.fillRect(r.x + x, r.y + y, 1, 1);
      }
    }
  });
  ctx.globalAlpha = 1;
}
