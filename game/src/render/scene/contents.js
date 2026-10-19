/**
 * render/scene/contents.js
 * Purpose: draw what is inside each tank: back-wall design, the layered
 *          floor (drainage, barrier, charcoal, substrate, leaf litter), then
 *          placed items in layer order (all clipped to the glass interior).
 *          Items can be flipped, scaled in whole steps and rotated.
 * Inputs:  ctx, state, { registry, layout }
 * Outputs: drawBackgrounds / drawSubstrates / drawItems for their layers.
 * Notes:   items are integer-scaled and can be flipped; sprites are cached
 *          per palette, so scaling and flipping never blur.
 */
import { TERRARIUM_PALETTE } from '../../data/palettes/terrarium.js';
import { paletteOf } from '../../data/palettes/index.js';
import { backgroundSwaps } from '../paletteSwap.js';
import { getSprite, drawTiled } from '../spriteCache.js';
import { substrateStack } from '../../core/geometry.js';
import { itemRect } from '../itemGeometry.js';

export function drawBackgrounds(ctx, state, { registry, layout }) {
  layout.stations.forEach((st, i) => {
    const bg = registry.get('backgrounds', state.stations[i].tank.background);
    if (!bg?.grid) return;
    const r = st.tank.interior;
    const color = registry.get('backgroundColors', state.stations[i].tank.backgroundColor);
    drawTiled(ctx, getSprite(bg.grid, TERRARIUM_PALETTE, backgroundSwaps(bg, color)), r.x, r.y, r.w, r.h);
  });
}

export function drawSubstrates(ctx, state, { registry, layout }) {
  layout.stations.forEach((st, i) => {
    const r = st.tank.interior;
    let y = r.y + r.h; // build the floor from the glass bottom upward
    for (const { entry } of substrateStack(state.stations[i].tank, registry)) {
      y -= entry.height;
      drawTiled(ctx, getSprite(entry.grid, TERRARIUM_PALETTE), r.x, y, r.w, entry.height);
    }
  });
}

function drawItemPass(ctx, state, { registry, layout }, plane, behind, accept = () => true) {
  layout.stations.forEach((st, i) => {
    const r = st.tank.interior;
    ctx.save();
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.clip();
    for (const placed of state.stations[i].placedItems) {
      if ((placed.plane ?? 'main') !== plane || (plane === 'main' && Boolean(placed.behind) !== behind)) continue;
      const entry = registry.list(placed.catalog)?.find((e) => e.id === placed.itemId);
      if (!entry || !accept(entry)) continue;
      const rect = itemRect(r, placed, entry);
      ctx.save();
      ctx.translate(rect.x + rect.w / 2, rect.y + rect.h / 2); // turn around the middle
      ctx.rotate(((placed.rotation ?? 0) * Math.PI) / 180);
      ctx.scale(placed.flip ? -placed.scale : placed.scale, placed.scale);
      const sprite = getSprite(entry.grid, paletteOf(entry));
      ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
      ctx.restore();
    }
    ctx.restore();
  });
}

/** Items in front of the substrate (the default). */
export const drawItems = (ctx, state, assets) => drawItemPass(ctx, state, assets, 'main', false);

/** Items tucked behind the substrate (layer below 0). */
export const drawItemsBehind = (ctx, state, assets) => drawItemPass(ctx, state, assets, 'main', true);

/** Ledges and other items hanging on the back wall. */
export const drawWallItems = (ctx, state, assets) => drawItemPass(ctx, state, assets, 'back', false);

/** Every item in tank order (wall, behind the substrate, front) that passes `accept(entry)`. */
export function drawItemsWhere(ctx, state, assets, accept) {
  drawItemPass(ctx, state, assets, 'back', false, accept);
  drawItemPass(ctx, state, assets, 'main', true, accept);
  drawItemPass(ctx, state, assets, 'main', false, accept);
}
