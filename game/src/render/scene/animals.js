/**
 * render/scene/animals.js
 * Purpose: draw the animals inside their tanks, animated. A gecko has idle,
 *          lounge (flat and relaxed) and walk loops, flipped to face left and
 *          turned 90 degrees to climb. On the back wall it is shown from above,
 *          on branches and ledges from the side. A colony (isopods) is drawn as
 *          several small animals around the colony's spot: the more there are,
 *          the more you see and the wider they spread. Colonies climb the wall
 *          (seen from above) and dig into the soil (seen dimmed, through the glass). Hidden animals are not drawn.
 * Inputs:  ctx, state, layout, registry, cameraX, now (ms)
 * Outputs: pixels on the screen canvas, between the items and the glass front.
 * Notes:   drawn every animation frame (not cached), so it is the only part of
 *          the scene that redraws while animals are visible.
 */
import { ANIMAL_PALETTE } from '../../data/palettes/animals.js';
import { ANIMAL_SPRITES } from '../../data/sprites/animals.js';
import { getSprite } from '../spriteCache.js';
import { morphSwaps } from '../morph.js';
import { scaleGrid, px } from '../../utils/pixelScale.js';

const MOVING = new Set(['climb', 'crawl', 'hop', 'hunt']);
const hash = (k) => (Math.imul(k + 1, 2654435761) >>> 0) / 4294967296;

function frameSet(animal, set) {
  const moving = MOVING.has(animal.mode) || (animal.mode === 'lounge' && !animal.settled) || (animal.mode === 'hide' && !animal.hidden);
  if (moving) return { frames: set.walk, ms: 120, moving };
  if (animal.mode === 'lounge' && set.lounge) return { frames: set.lounge, ms: 1100, moving };
  return { frames: set.idle, ms: 700, moving };
}

/**
 * On the back wall a gecko is seen from above (legs splayed, both eyes showing);
 * on branches, ledges, plants and the ground it is seen from the side.
 */
function drawGecko(ctx, animal, species, sprites, r, now) {
  const moving = MOVING.has(animal.mode) || (animal.mode === 'lounge' && !animal.settled);
  const fromAbove = animal.surface === 'wall' || (moving && animal.target?.surface === 'wall');
  const set = fromAbove && species.top ? species.top : species.side;
  const { frames, ms } = frameSet(animal, set);
  const sprite = sprites(frames[Math.floor(now / ms) % frames.length]);

  ctx.save();
  ctx.translate(Math.round(r.x + animal.fx * r.w), Math.round(r.y + animal.fy * r.h));
  if (animal.heading === 'left') ctx.scale(-1, 1);
  else if (animal.heading === 'up') ctx.rotate(-Math.PI / 2);
  else if (animal.heading === 'down') ctx.rotate(Math.PI / 2);
  if (fromAbove) ctx.drawImage(sprite, -Math.floor(sprite.width / 2), -Math.floor(sprite.height / 2)); // centered on the spot
  else ctx.drawImage(sprite, -Math.floor(sprite.width / 2), -sprite.height + 1);                      // feet on the spot
  ctx.restore();
}

/**
 * A colony is drawn as several small animals around its spot. On the ground
 * they are seen from the side; climbing the back wall, from above; digging in
 * the soil, from the side and dimmed, as if seen through the glass. Moving up
 * or down turns them 90 degrees.
 */
function drawColony(ctx, animal, species, set, sprites, r, now) {
  const count = Math.floor(animal.count ?? 1);
  const visible = Math.max(1, Math.min(species.colony.maxVisible, Math.round(Math.log2(count + 1) * 1.6)));
  const spread = Math.min(r.w / 2 - px(6), px(4) + visible * 2.1);
  const digging = animal.mode === 'burrow' && !animal.settled;
  const moving = (MOVING.has(animal.mode) || digging) && !animal.hidden;
  const onWall = animal.surface === 'wall' || (moving && animal.target?.surface === 'wall');
  const inSoil = animal.surface === 'soil' || (moving && animal.target?.surface === 'soil');
  const view = onWall && set.top ? set.top : set.frames;
  const frames = moving ? view.walk : view.idle;
  const cx = r.x + animal.fx * r.w;
  const cy = r.y + animal.fy * r.h;
  const lead = animal.heading === 'left' ? -1 : 1;
  const vertical = animal.heading === 'up' || animal.heading === 'down';
  const rise = onWall ? spread * 0.8 : inSoil ? 2 : 1; // how far up and down they scatter

  ctx.save();
  if (inSoil) ctx.globalAlpha = 0.7;
  for (let k = 0; k < visible; k++) {
    const x = cx + (hash(k) - 0.5) * 2 * spread + (moving && !vertical ? Math.sin(now / 600 + k * 1.7) * 1.5 : 0);
    const y = cy + (hash(k + 40) - 0.5) * 2 * rise + (moving && vertical ? Math.sin(now / 600 + k * 1.7) * 1.5 : 0);
    const sprite = sprites(frames[Math.floor(now / 200 + k) % frames.length]);
    ctx.save();
    ctx.translate(Math.round(Math.max(r.x + px(5), Math.min(r.x + r.w - px(5), x))), Math.round(Math.max(r.y + px(4), y)));
    if (vertical) ctx.rotate(animal.heading === 'up' ? -Math.PI / 2 : Math.PI / 2);
    else if ((k % 4 === 0 ? -lead : lead) < 0) ctx.scale(-1, 1);
    if (onWall || inSoil) ctx.drawImage(sprite, -Math.floor(sprite.width / 2), -Math.floor(sprite.height / 2));
    else ctx.drawImage(sprite, -Math.floor(sprite.width / 2), -sprite.height + 2);
    ctx.restore();
  }
  ctx.restore();
}

export function drawAnimals(ctx, state, layout, registry, cameraX, now) {
  state.stations.forEach((station, i) => {
    if (station.animals.length === 0) return;
    const r = layout.stations[i].tank.interior;
    ctx.save();
    ctx.translate(-cameraX, 0);
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.clip();
    for (const animal of station.animals) {
      if (animal.hidden) continue;
      const species = registry.list('animals').find((s) => s.id === animal.species);
      const set = species && ANIMAL_SPRITES[species.sprite];
      if (!set) continue;
      const swaps = morphSwaps(species, animal.morph);
      const sprites = (grid) => getSprite(scaleGrid(grid), ANIMAL_PALETTE, swaps);
      if (species.colony) drawColony(ctx, animal, species, set, sprites, r, now);
      else drawGecko(ctx, animal, { side: set.frames, top: set.top }, sprites, r, now);
    }
    ctx.restore();
  });
}
