/**
 * render/scene/room.js
 * Purpose: draw the wall, wallpaper, floor and baseboard across the whole room.
 * Inputs:  ctx, state, { registry, layout }
 * Outputs: pixels on ctx (layer 'room').
 */
import { ROOM_PALETTE } from '../../data/palettes/room.js';
import { FLOOR } from '../../data/items/floors.js';
import { getSprite, drawTiled } from '../spriteCache.js';
import { scaleGrid } from '../../utils/pixelScale.js';
import { resolveColor } from '../paletteSwap.js';
import { ditherRect } from '../dither.js';

export function drawRoom(ctx, state, { registry, layout }) {
  const { room } = state;
  const L = layout.room;
  const W = layout.world.w;

  // Wall paint, with a dithered shadow under the ceiling line.
  const wall = registry.get('wallColors', room.wallColor);
  ctx.fillStyle = resolveColor(ROOM_PALETTE, wall.swaps, 2);
  ctx.fillRect(0, 0, W, L.floorTop);
  const shade = resolveColor(ROOM_PALETTE, wall.swaps, 1);
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, W, 1);
  ditherRect(ctx, 0, 1, W, 3, shade);

  // Wallpaper pattern over the paint.
  const paper = registry.get('wallpapers', room.wallpaper);
  if (paper.grid) {
    const colors = registry.get('wallpaperColors', room.wallpaperColor);
    drawTiled(ctx, getSprite(paper.grid, ROOM_PALETTE, colors.swaps), 0, 0, W, L.baseboardY);
  }

  // Floor with a dithered shadow where it meets the wall.
  drawTiled(ctx, getSprite(scaleGrid(FLOOR.grid, true), ROOM_PALETTE), 0, L.floorTop, W, layout.world.h - L.floorTop);
  ditherRect(ctx, 0, L.floorTop, W, 4, resolveColor(ROOM_PALETTE, {}, 16));

  // Baseboard.
  const trim = registry.get('trims', room.trim);
  const trimColor = registry.get('trimColors', room.trimColor);
  drawTiled(ctx, getSprite(trim.grid, ROOM_PALETTE, trimColor.swaps), 0, L.baseboardY, W, L.baseboardH);
}
