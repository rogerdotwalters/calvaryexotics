/**
 * render/spriteCache.js
 * Purpose: turn palette-indexed grids into cached canvases, and tile them.
 * Inputs:  getSprite(grid, palette, swaps) with grid = array of equal-length
 *          strings; '.' is transparent, other chars are base-32 palette slots.
 * Outputs: a canvas per (grid, palette, swaps); drawTiled() fills a rect.
 * Notes:   cached by grid identity, so keep grids as module-level constants.
 *          setCanvasFactory() exists so tests can run without a DOM.
 */
import { hexToRgba, resolvePalette, swapKey } from './paletteSwap.js';

let factory = (w, h) => {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
};

export const setCanvasFactory = (fn) => { factory = fn; };
export const makeCanvas = (w, h) => factory(w, h);

const cache = new WeakMap();

function bake(grid, colors) {
  const h = grid.length;
  const w = grid[0].length;
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    if (grid[y].length !== w) throw new Error(`Sprite row ${y} is ${grid[y].length} wide, expected ${w}`);
    for (let x = 0; x < w; x++) {
      const ch = grid[y][x];
      if (ch === '.') continue;
      const hex = colors[parseInt(ch, 32)];
      if (!hex) throw new Error(`Sprite uses palette slot '${ch}' which does not exist`);
      image.data.set(hexToRgba(hex), (y * w + x) * 4);
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

export function getSprite(grid, palette, swaps = {}) {
  let byKey = cache.get(grid);
  if (!byKey) { byKey = new Map(); cache.set(grid, byKey); }
  const key = `${palette.id}|${swapKey(swaps)}`;
  let canvas = byKey.get(key);
  if (!canvas) {
    canvas = bake(grid, resolvePalette(palette, swaps));
    byKey.set(key, canvas);
  }
  return canvas;
}

/** Repeat a sprite across a rect, with the tile origin at the rect's top-left. */
export function drawTiled(ctx, sprite, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = ctx.createPattern(sprite, 'repeat');
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
