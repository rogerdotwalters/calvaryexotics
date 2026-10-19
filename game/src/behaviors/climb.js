/**
 * behaviors/climb.js
 * Purpose: climb to a comfortable perch: the top of a branch or ledge, a
 *          plant, or a spot on the back wall. Prefers spots in its comfort
 *          range (using the saved heat gradient).
 * Inputs:  animal, ctx { species, items, w, groundY, activity, rng }, dt
 * Outputs: behavior module { name, score, begin, step }
 */
import { moveToward, pickTarget, settleOn } from './common.js';

export const climb = {
  name: 'climb',
  score: (animal, ctx) => (0.1 + 0.9 * ctx.activity) * (ctx.species.climbWeight ?? 1),
  begin(animal, ctx) {
    const { rng } = ctx;
    const candidates = ctx.items
      .filter((i) => i.tags.includes('climb') || i.tags.includes('perch'))
      .map((i) => ({ x: i.rect.x + rng.range(0.2, 0.8) * i.rect.w, y: i.rect.y + rng.range(0.05, 0.6) * i.rect.h, bonus: 0.3, surface: 'item' }));
    for (let k = 0; k < 3; k++) candidates.push({ x: rng.range(6, ctx.w - 6), y: rng.range(6, ctx.groundY - 6), bonus: 0.2, surface: 'wall' }); // back wall (seen from above)
    const target = pickTarget(ctx, candidates, rng.next);
    return { ...animal, mode: 'climb', target: { x: target.x, y: target.y, surface: target.surface }, timer: 0 };
  },
  step(animal, ctx, dt) {
    const { animal: moved, arrived } = moveToward(animal, ctx, dt, ctx.species.speed.climb);
    return { animal: arrived ? settleOn(moved) : moved, done: arrived };
  },
};
