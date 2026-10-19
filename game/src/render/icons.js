/**
 * render/icons.js
 * Purpose: paint the 24x24 pixel icon on each drawer card, using the
 *          current room/table colors so the icon previews what you'd get.
 *          Item sprites are shrunk by a whole factor to fit.
 * Inputs:  createIconPainter(registry) -> paint(canvas, catalog, item, state)
 * Outputs: draws into the given canvas (24x24 internal pixels).
 */
import { ROOM_PALETTE } from '../data/palettes/room.js';
import { TANK_PALETTE } from '../data/palettes/tank.js';
import { TERRARIUM_PALETTE } from '../data/palettes/terrarium.js';
import { paletteOf } from '../data/palettes/index.js';
import { getSelectedStation } from '../core/selectors.js';
import { getSprite, drawTiled } from './spriteCache.js';
import { resolveColor, backgroundSwaps } from './paletteSwap.js';

const INK = resolveColor(ROOM_PALETTE, {}, 16);
const fill = (ctx, color, x, y, w, h) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
const outline = (ctx) => {
  fill(ctx, INK, 0, 0, 16, 1); fill(ctx, INK, 0, 15, 16, 1);
  fill(ctx, INK, 0, 0, 1, 16); fill(ctx, INK, 15, 0, 1, 16);
};

function swatch(ctx, item) {
  const v = Object.values(item.swaps);
  if (v.length < 4) { // "natural": just the swatch color
    fill(ctx, INK, 1, 1, 14, 14);
    fill(ctx, item.swatch, 2, 2, 12, 12);
    return;
  }
  fill(ctx, v[0], 1, 1, 14, 14);
  fill(ctx, v[2], 2, 2, 12, 12);
  fill(ctx, v[3], 2, 2, 12, 1);
  fill(ctx, v[3], 2, 2, 1, 12);
  if (v.length >= 8) fill(ctx, v[6], 8, 3, 5, 10); // wallpaper: accent ramp
}

function tableGlyph(ctx, kind, c, legH) {
  const top = 14 - legH - 2;
  const by = top + 2;
  fill(ctx, c(3), 1, top, 14, 1);
  fill(ctx, c(1), 1, top + 1, 14, 1);
  if (kind === 'drawers') {
    fill(ctx, c(0), 2, by, 12, legH);
    fill(ctx, c(2), 3, by + 1, 10, Math.max(1, Math.floor(legH / 2) - 1));
    fill(ctx, c(2), 3, by + 1 + Math.floor(legH / 2), 10, Math.max(1, legH - Math.floor(legH / 2) - 2));
  } else if (kind === 'rack') {
    fill(ctx, c(3), 2, by, 1, legH);
    fill(ctx, c(3), 13, by, 1, legH);
    fill(ctx, c(2), 2, by + Math.floor(legH / 2), 12, 1);
  } else {
    fill(ctx, c(2), 2, by, 2, legH);
    fill(ctx, c(2), 12, by, 2, legH);
    fill(ctx, c(1), 4, by, 8, 2);
  }
}

const SPRITE_CATALOGS = new Set(['plants', 'moss', 'rocks', 'decor', 'ledges']);
const TILE_CATALOGS = new Set(['substrates', 'drainage', 'charcoal', 'litter']);

function paintSprite(ctx, item) {
  const sprite = getSprite(item.grid, paletteOf(item));
  const f = Math.max(1, Math.ceil(Math.max(sprite.width, sprite.height) / 24));
  const w = Math.max(1, Math.round(sprite.width / f));
  const h = Math.max(1, Math.round(sprite.height / f));
  ctx.drawImage(sprite, Math.floor((24 - w) / 2), 24 - h - 2, w, h);
}

function paintTile(ctx, item, swaps = {}) {
  if (item.grid) drawTiled(ctx, getSprite(item.grid, TERRARIUM_PALETTE, swaps), 2, 2, 20, 20);
  fill(ctx, INK, 1, 1, 22, 1); fill(ctx, INK, 1, 22, 22, 1);
  fill(ctx, INK, 1, 1, 1, 22); fill(ctx, INK, 22, 1, 1, 22);
}

export function createIconPainter(registry) {
  const painters = {
    wallColors: swatch,
    trimColors: swatch,
    tableColors: swatch,
    wallpaperColors: swatch,
    lightColors: swatch,
    backgroundColors: swatch,

    wallpapers(ctx, item, state) {
      const wall = registry.get('wallColors', state.room.wallColor);
      fill(ctx, resolveColor(ROOM_PALETTE, wall.swaps, 2), 0, 0, 16, 16);
      if (item.grid) {
        const colors = registry.get('wallpaperColors', state.room.wallpaperColor);
        drawTiled(ctx, getSprite(item.grid, ROOM_PALETTE, colors.swaps), 0, 0, 16, 16);
      }
      outline(ctx);
    },

    trims(ctx, item, state) {
      const wall = registry.get('wallColors', state.room.wallColor);
      fill(ctx, resolveColor(ROOM_PALETTE, wall.swaps, 2), 0, 0, 16, 16);
      const color = registry.get('trimColors', state.room.trimColor);
      drawTiled(ctx, getSprite(item.grid, ROOM_PALETTE, color.swaps), 0, 8, 16, 8);
      outline(ctx);
    },

    tables(ctx, item, state) {
      const color = registry.get('tableColors', getSelectedStation(state).table.color);
      tableGlyph(ctx, item.kind, (slot) => resolveColor(ROOM_PALETTE, color.swaps, slot), 9);
    },

    tableHeights(ctx, item, state) {
      const station = getSelectedStation(state);
      const style = registry.get('tables', station.table.style);
      const color = registry.get('tableColors', station.table.color);
      tableGlyph(ctx, style.kind, (slot) => resolveColor(ROOM_PALETTE, color.swaps, slot), Math.round((item.px / 56) * 11));
    },

    lights(ctx, item) {
      const body = item.swatch;
      if (!item.kind) return;
      fill(ctx, INK, 6, 1, 4, 3);                       // mount
      if (item.kind === 'heat') {                      // dome lamp
        fill(ctx, INK, 3, 4, 10, 5); fill(ctx, body, 4, 5, 8, 3);
      } else if (item.kind === 'none') {
        fill(ctx, '#3a3d44', 4, 4, 8, 3);
      } else {                                         // bar / tube
        fill(ctx, INK, 1, 4, 14, 4); fill(ctx, body, 2, 5, 12, 2);
      }
      if (item.lightK > 0) {                           // dithered beams
        for (let y = 9; y < 15; y++) for (let x = 3; x < 13; x++) if ((x + y) % 2 === 0 && x > 5 - (y - 9) && x < 10 + (y - 9)) fill(ctx, body, x, y, 1, 1);
      }
    },

    lampSlots(ctx, item) {
      painters.lights(ctx, item.fixture);
    },

    watts(ctx, item) { // more bars = more watts
      const bars = Math.max(2, Math.round((item.w / item.max) * 6));
      for (let i = 0; i < 6; i++) {
        const h = 3 + i * 2;
        fill(ctx, i < bars ? '#ffb36b' : '#5c606a', 1 + i * 2 + i, 15 - h, 2, h);
      }
    },

    tankSizes(ctx, item) {
      const t = (slot) => resolveColor(TANK_PALETTE, {}, slot);
      const scale = 14 / 36;
      const w = Math.round(item.width * scale);
      const h = Math.round(item.height * scale);
      const x = Math.floor((16 - w) / 2);
      const y = 14 - h;
      fill(ctx, t(0), x, y, w, h);
      fill(ctx, t(4), x + 1, y + 2, w - 2, h - 3);
      fill(ctx, t(11), x + 1, y + 1, w - 2, 1);
    },
  };

  return function paint(canvas, catalog, item, state) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 24, 24);
    if (SPRITE_CATALOGS.has(catalog)) return paintSprite(ctx, item);
    if (catalog === 'backgrounds') {
      const tank = getSelectedStation(state).tank;
      return paintTile(ctx, item, backgroundSwaps(item, registry.get('backgroundColors', tank.backgroundColor)));
    }
    if (TILE_CATALOGS.has(catalog)) return paintTile(ctx, item);
    ctx.save();
    ctx.translate(4, 4); // the older 16x16 icons sit centered in the 24x24 card icon
    (painters[catalog] ?? ((c) => outline(c)))(ctx, item, state);
    ctx.restore();
  };
}
