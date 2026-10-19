/**
 * behaviors/hop.js
 * Purpose: short quick hops along the ground, for frogs.
 * Inputs:  animal, ctx, dt
 * Outputs: behavior module { name, score, begin, step }
 */
import { moveToward, settleOn } from './common.js';

export const hop = {
  name: 'hop',
  score: (animal, ctx) => 0.2 + 0.7 * ctx.activity,
  begin(animal, ctx) {
    const x = Math.min(ctx.w - 4, Math.max(4, animal.x + ctx.rng.range(-18, 18)));
    return { ...animal, mode: 'hop', target: { x, y: ctx.groundY - 2, surface: 'ground' }, timer: 0 };
  },
  step(animal, ctx, dt) {
    const { animal: moved, arrived } = moveToward(animal, ctx, dt, (ctx.species.speed.hop ?? 20));
    return { animal: arrived ? settleOn(moved) : moved, done: arrived };
  },
};
