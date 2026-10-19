/**
 * render/scene/tableBodies.js
 * Purpose: painters for each table kind (legs, drawers, rack), below the top.
 * Inputs:  ctx, g = { style, sprites:{top,body}, c(slot), feetY, bx, bw, by, bh }
 * Outputs: pixels on ctx. Registered by kind in BODY_PAINTERS.
 * Notes:   shading uses ramp slots 3 (light) and 0 (dark) so any colorway works.
 */
import { drawTiled } from '../spriteCache.js';
import { px } from '../../utils/pixelScale.js';

function rim(ctx, r, light, dark) {
  ctx.fillStyle = light;
  ctx.fillRect(r.x, r.y, 1, r.h);
  ctx.fillStyle = dark;
  ctx.fillRect(r.x + r.w - 1, r.y, 1, r.h);
}

function paintLegs(ctx, g) {
  const { style, sprites, c, bx, bw, by, bh } = g;
  const legs = [
    { x: bx, y: by, w: style.legW, h: bh },
    { x: bx + bw - style.legW, y: by, w: style.legW, h: bh },
  ];
  for (const leg of legs) {
    drawTiled(ctx, sprites.body, leg.x, leg.y, leg.w, leg.h);
    rim(ctx, leg, c(3), c(0));
  }
  const apron = { x: bx + style.legW, y: by, w: bw - style.legW * 2, h: style.apronH };
  drawTiled(ctx, sprites.body, apron.x, apron.y, apron.w, apron.h);
  ctx.fillStyle = c(1);
  ctx.fillRect(apron.x, apron.y + apron.h - 1, apron.w, 1);
}

function paintDrawers(ctx, g) {
  const { style, sprites, c, bx, bw, by, bh } = g;
  const plinth = px(3);
  const h = bh - plinth;
  ctx.fillStyle = c(0); // gaps between drawers and the plinth
  ctx.fillRect(bx, by, bw, bh);

  const rows = Math.max(1, Math.round(h / style.drawerH));
  const cols = Math.max(1, Math.round(bw / style.drawerW));
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const x0 = Math.round(bx + (k * bw) / cols) + 1;
      const x1 = Math.round(bx + ((k + 1) * bw) / cols) - 1;
      const y0 = Math.round(by + (r * h) / rows) + 1;
      const y1 = Math.round(by + ((r + 1) * h) / rows) - 1;
      const w = x1 - x0;
      const fh = y1 - y0;
      drawTiled(ctx, sprites.body, x0, y0, w, fh);
      ctx.fillStyle = c(3);
      ctx.fillRect(x0, y0, w, 1);
      ctx.fillRect(x0, y0, 1, fh);
      ctx.fillStyle = c(1);
      ctx.fillRect(x0, y1 - 1, w, 1);
      ctx.fillRect(x1 - 1, y0, 1, fh);
      const kx = Math.round((x0 + x1) / 2) - 1;
      const ky = Math.round((y0 + y1) / 2) - 1;
      ctx.fillStyle = c(0);
      ctx.fillRect(kx, ky + 1, 3, 2);
      ctx.fillStyle = c(3);
      ctx.fillRect(kx, ky, 2, 2);
    }
  }
}

function paintRack(ctx, g) {
  const { sprites, c, bx, bw, by, bh, feetY } = g;
  for (const post of [bx + 1, bx + bw - 4]) {
    ctx.fillStyle = c(2);
    ctx.fillRect(post, by, 3, bh);
    ctx.fillStyle = c(3);
    ctx.fillRect(post, by, 1, bh);
    ctx.fillStyle = c(0);
    ctx.fillRect(post, feetY - 1, 3, 1);
  }
  const shelves = Math.max(1, Math.floor(bh / px(16)));
  for (let k = 1; k <= shelves; k++) {
    drawTiled(ctx, sprites.body, bx, by + Math.round((k * bh) / (shelves + 1)) - 1, bw, px(3));
  }
}

export const BODY_PAINTERS = { legs: paintLegs, drawers: paintDrawers, rack: paintRack };
