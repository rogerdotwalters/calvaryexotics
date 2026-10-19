/**
 * behaviors/common.js
 * Purpose: helpers the behavior modules share: moving toward a target and
 *          choosing a comfortable target point.
 * Inputs:  animal, ctx (see systems/animals.js), dt
 * Outputs: moveToward(), pickTarget(), headingFor(), settleOn()
 * Notes:   a target is { x, y, surface } where surface is 'wall' (the back wall,
 *          shown from above), 'item' (a branch, ledge or plant, shown from the
 *          side) or 'ground'.
 */
import { cellTemperature, CELL } from '../systems/gradient.js';
import { rangeScore } from '../systems/needs.js';

export function headingFor(dx, dy, fallback) {
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return fallback;
  if (Math.abs(dy) > Math.abs(dx) * 1.2) return dy < 0 ? 'up' : 'down';
  return dx < 0 ? 'left' : 'right';
}

/** Walk straight toward the target. Returns the moved animal and whether it arrived. */
export function moveToward(animal, ctx, dt, speed) {
  const dx = animal.target.x - animal.x;
  const dy = animal.target.y - animal.y;
  const dist = Math.hypot(dx, dy);
  const step = speed * dt;
  const arrived = dist <= Math.max(1.2, step);
  const x = arrived ? animal.target.x : animal.x + (dx / dist) * step;
  const y = arrived ? animal.target.y : animal.y + (dy / dist) * step;
  return { animal: { ...animal, x, y, heading: headingFor(dx, dy, animal.heading) }, arrived };
}

/** How comfortable a point is for a species: temperature from the saved heat gradient. */
export function comfortAt(ctx, x, y) {
  const need = ctx.species.needs.temperature;
  const temp = cellTemperature(ctx.env, ctx.gradient, Math.floor(x / CELL), Math.floor(y / CELL));
  return rangeScore(temp, need.range, need.tolerance);
}

/** Try a few candidate points and take the best by comfort, with a little luck. */
export function pickTarget(ctx, candidates, rand) {
  let best = null;
  let bestScore = -1;
  for (const c of candidates) {
    const score = comfortAt(ctx, c.x, c.y) + (c.bonus ?? 0) + rand() * 0.3;
    if (score > bestScore) { best = c; bestScore = score; }
  }
  return best;
}

/** After arriving, the animal is on the surface of its target (wall, item or ground). */
export const settleOn = (animal) => ({ ...animal, surface: animal.target?.surface ?? animal.surface });
