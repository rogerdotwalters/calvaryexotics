/**
 * render/scene/table.js
 * Purpose: draw every station's table: floor shadow, body, then top.
 * Inputs:  ctx, state, { registry, layout }
 * Outputs: pixels on ctx (layer 'table').
 */
import { ROOM_PALETTE } from '../../data/palettes/room.js';
import { getSprite, drawTiled } from '../spriteCache.js';
import { resolveColor } from '../paletteSwap.js';
import { ditherRect } from '../dither.js';
import { BODY_PAINTERS } from './tableBodies.js';

function drawOne(ctx, station, rect, registry) {
  const style = registry.get('tables', station.table.style);
  const color = registry.get('tableColors', station.table.color);
  const { x, y, w, feetY } = rect;
  const c = (slot) => resolveColor(ROOM_PALETTE, color.swaps, slot);
  const sprites = {
    top: getSprite(style.topTile, ROOM_PALETTE, color.swaps),
    body: getSprite(style.bodyTile, ROOM_PALETTE, color.swaps),
  };

  ditherRect(ctx, x - 3, feetY - 3, w + 6, 5, resolveColor(ROOM_PALETTE, {}, 8));

  const g = { style, sprites, c, feetY, bx: x + style.inset, bw: w - style.inset * 2, by: y + style.topH };
  g.bh = feetY - g.by;
  BODY_PAINTERS[style.kind](ctx, g);

  drawTiled(ctx, sprites.top, x, y, w, style.topH);
  if (style.kind !== 'rack') {
    ctx.fillStyle = c(0); // shadow under the slab
    ctx.fillRect(g.bx, g.by, g.bw, 1);
  }
}

export function drawTables(ctx, state, { registry, layout }) {
  layout.stations.forEach((s, i) => drawOne(ctx, state.stations[i], s.table, registry));
}
