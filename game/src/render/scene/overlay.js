/**
 * render/scene/overlay.js
 * Purpose: draw the "+" add-table buttons at both ends of the room, a marker
 *          under the selected table (2+ tables), and a dashed box around the
 *          selected item.
 * Inputs:  ctx, state, { registry, layout }
 * Outputs: pixels on ctx (layer 'overlay').
 */
import { TANK_PALETTE } from '../../data/palettes/tank.js';
import { MAX_STATIONS } from '../../data/world.js';
import { resolveColor } from '../paletteSwap.js';
import { itemRect, rotatedBounds } from '../itemGeometry.js';
import { px } from '../../utils/pixelScale.js';
import { getSelectedItem } from '../../core/selectors.js';

const AMBER = resolveColor(TANK_PALETTE, {}, 12);
const INK = resolveColor(TANK_PALETTE, {}, 0);

function plusButton(ctx, x, y, size) {
  const edge = px(2); // hard drop shadow
  ctx.fillStyle = INK;
  ctx.fillRect(x + edge, y + edge, size, size);
  ctx.fillStyle = AMBER;
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = INK;
  ctx.fillRect(x + 1, y + 1, size - 2, size - 2);
  ctx.fillStyle = AMBER; // the plus sign: centered, 3 thick
  const arm = Math.round(size * 0.43);
  const mid = Math.floor(size / 2);
  ctx.fillRect(x + mid - arm, y + mid - 1, arm * 2, 3);
  ctx.fillRect(x + mid - 1, y + mid - arm, 3, arm * 2);
}

function dashBox(ctx, x, y, w, h) {
  for (const color of [INK, AMBER]) {
    ctx.fillStyle = color;
    const off = color === INK ? 1 : 0;
    for (let i = 0; i < w; i += 4) {
      ctx.fillRect(x + i, y - off, Math.min(2, w - i), 1);
      ctx.fillRect(x + i + (off ? 2 : 0), y + h - 1 + off, Math.min(2, w - i), 1);
    }
    for (let j = 0; j < h; j += 4) {
      ctx.fillRect(x - off, y + j, 1, Math.min(2, h - j));
      ctx.fillRect(x + w - 1 + off, y + j, 1, Math.min(2, h - j));
    }
  }
}

export function drawOverlay(ctx, state, { registry, layout }) {
  const count = state.stations.length;
  if (count < MAX_STATIONS) {
    plusButton(ctx, layout.plus.leftX, layout.plus.y, layout.plus.size);
    plusButton(ctx, layout.plus.rightX, layout.plus.y, layout.plus.size);
  }
  if (count > 1) {
    const sel = layout.stations.find((s) => s.id === state.selectedStation);
    if (sel) {
      ctx.fillStyle = AMBER;
      for (let x = sel.table.x; x + px(4) <= sel.table.x + sel.table.w; x += px(6)) {
        ctx.fillRect(x, sel.table.feetY + px(5), px(4), 2);
      }
    }
  }
  const picked = getSelectedItem(state);
  if (picked) {
    const entry = registry.list(picked.item.catalog)?.find((e) => e.id === picked.item.itemId);
    const st = layout.stations[state.stations.indexOf(picked.station)];
    if (entry && st) {
      const r = rotatedBounds(itemRect(st.tank.interior, picked.item, entry), picked.item.rotation);
      dashBox(ctx, r.x - 1, r.y - 1, r.w + 2, r.h + 2);
    }
  }
}
