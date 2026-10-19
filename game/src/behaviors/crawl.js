/**
 * behaviors/crawl.js
 * Purpose: walk along the ground (substrate) to a spot, for ground dwellers
 *          like isopods.
 * Inputs:  animal, ctx, dt
 * Outputs: behavior module { name, score, begin, step }
 */
import { moveToward, pickTarget, settleOn } from './common.js';

export const crawl = {
  name: 'crawl',
  score: (animal, ctx) => 0.2 + 0.8 * ctx.activity,
  begin(animal, ctx) {
    const { rng } = ctx;
    const candidates = Array.from({ length: 4 }, () => ({ x: rng.range(4, ctx.w - 4), y: ctx.groundY - 2, bonus: 0, surface: 'ground' }));
    const target = pickTarget(ctx, candidates, rng.next);
    return { ...animal, mode: 'crawl', target: { x: target.x, y: target.y, surface: 'ground' }, timer: 0 };
  },
  step(animal, ctx, dt) {
    const { animal: moved, arrived } = moveToward(animal, ctx, dt, ctx.species.speed.crawl ?? 5);
    return { animal: arrived ? settleOn(moved) : moved, done: arrived };
  },
};
