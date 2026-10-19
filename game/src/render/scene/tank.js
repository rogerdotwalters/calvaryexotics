/**
 * render/scene/tank.js
 * Purpose: draw every station's glass tank in two parts: the back glass
 *          (behind the contents) and the front (glints, mesh lid, frame).
 * Inputs:  ctx, state, { registry, layout }
 * Outputs: pixels on ctx (layer 'tank').
 * Notes:   material swaps recolor the tank palette. A material's faces say what
 *          is screen: a screen lid is drawn as mesh, screen sides as mesh strips
 *          down both edges, and a screen front as mesh across the whole tank (no
 *          glass glints). Glass faces are clear.
 */
import { TANK_PALETTE } from '../../data/palettes/tank.js';
import { TANK_FRAME } from '../layout.js';
import { getSprite, drawTiled } from '../spriteCache.js';
import { resolveColor } from '../paletteSwap.js';
import { ditherRect } from '../dither.js';
import { scaleGrid, px } from '../../utils/pixelScale.js';

const MESH = scaleGrid(['abab', 'baba', 'abab'], true);

function glint(ctx, x, y, len, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < len; i++) {
    if (i % 4 === 3) continue; // dashed, so it reads as a reflection
    ctx.fillRect(x + i, y + len - 1 - i, 2, 1);
  }
}

function back(ctx, station, t, registry) {
  const mat = registry.get('tankMaterials', station.tank.material);
  const c = (slot) => resolveColor(TANK_PALETTE, mat.swaps, slot);
  const i = t.interior;
  ctx.fillStyle = c(4);
  ctx.fillRect(i.x, i.y, i.w, i.h);
  ditherRect(ctx, i.x, i.y, i.w, 4, c(5));
}

function front(ctx, station, t, registry) {
  const mat = registry.get('tankMaterials', station.tank.material);
  const c = (slot) => resolveColor(TANK_PALETTE, mat.swaps, slot);
  const i = t.interior;

  const mesh = getSprite(MESH, TANK_PALETTE, mat.swaps);
  const meshOver = (x, y, w, h, alpha) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    drawTiled(ctx, mesh, x, y, w, h);
    ctx.restore();
  };
  if (mat.faces.front !== 'screen') {
    const len = Math.max(8, Math.min(19, i.h - 13));
    glint(ctx, i.x + 8, i.y + 7, len, c(8));
    glint(ctx, i.x + 16, i.y + 7, Math.floor(len / 2), c(9));
  } else {
    meshOver(i.x, i.y, i.w, i.h, 0.4);
  }
  const edge = Math.min(px(6), Math.floor(i.w / 4)); // screen sides, seen at an angle
  if (mat.faces.left === 'screen') meshOver(i.x, i.y, edge, i.h, 0.7);
  if (mat.faces.right === 'screen') meshOver(i.x + i.w - edge, i.y, edge, i.h, 0.7);

  ctx.fillStyle = c(3);
  ctx.fillRect(t.x, t.y, t.w, 1);
  if (mat.faces.top === 'screen') {
    drawTiled(ctx, mesh, t.x, t.y + 1, t.w, TANK_FRAME.lid - 2);
  } else { // a solid glass lid
    ctx.fillStyle = c(1);
    ctx.fillRect(t.x, t.y + 1, t.w, TANK_FRAME.lid - 2);
    ctx.fillStyle = c(2);
    ctx.fillRect(t.x, t.y + 1, t.w, 1);
  }
  ctx.fillStyle = c(0);
  ctx.fillRect(t.x, t.y + TANK_FRAME.lid - 1, t.w, 1);

  const sideH = t.h - TANK_FRAME.lid - TANK_FRAME.base;
  const sy = t.y + TANK_FRAME.lid;
  ctx.fillStyle = c(0); // outer edge
  ctx.fillRect(t.x, sy, 1, sideH);
  ctx.fillRect(t.x + t.w - 1, sy, 1, sideH);
  ctx.fillStyle = c(2); // lit glass edge (left) and its shadow (right)
  ctx.fillRect(t.x + 1, sy, 1, sideH);
  ctx.fillStyle = c(1);
  ctx.fillRect(t.x + t.w - 2, sy, 1, sideH);
  ctx.fillStyle = c(3); // silicone line along the inside
  ctx.fillRect(t.x + 2, sy, 1, sideH);
  ctx.fillStyle = c(1);
  ctx.fillRect(t.x + t.w - 3, sy, 1, sideH);

  const by = t.y + t.h - TANK_FRAME.base;
  ctx.fillStyle = c(2);
  ctx.fillRect(t.x, by, t.w, 1);
  ctx.fillStyle = c(1);
  ctx.fillRect(t.x, by + 1, t.w, TANK_FRAME.base - 2);
  ctx.fillStyle = c(0);
  ctx.fillRect(t.x, by + TANK_FRAME.base - 1, t.w, 1);
}

export function drawTankBack(ctx, state, { registry, layout }) {
  layout.stations.forEach((s, i) => back(ctx, state.stations[i], s.tank, registry));
}

export function drawTankFront(ctx, state, { registry, layout }) {
  layout.stations.forEach((s, i) => front(ctx, state.stations[i], s.tank, registry));
}
