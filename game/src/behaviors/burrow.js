/**
 * behaviors/burrow.js
 * Purpose: dig down into the soil and stay there for a while. Colonies do this
 *          to get away from light and dryness, and above all to hide from
 *          predators: a burrowed colony cannot be caught. Needs a base
 *          substrate to dig in.
 * Inputs:  animal, ctx { soil: { top, bottom }, threat, activity, rng, species }, dt
 * Outputs: behavior module { name, score, begin, step }
 * Notes:   the animal walks (digs) slowly to a spot inside the soil band
 *          (animal.settled false), rests there (settled true), and then the
 *          next behavior brings it back up. surface is 'soil' once it arrives.
 */
import { moveToward, settleOn } from './common.js';

export const burrow = {
  name: 'burrow',
  score: (animal, ctx) => (ctx.soil ? (ctx.species.burrowWeight ?? 0) * (0.3 + 0.4 * (1 - ctx.activity)) + 0.9 * ctx.threat : 0),
  begin(animal, ctx) {
    const { rng, soil } = ctx;
    return {
      ...animal, mode: 'burrow', settled: false, timer: rng.range(20, 60),
      target: { x: rng.range(6, ctx.w - 6), y: rng.range(soil.top + 2, soil.bottom - 2), surface: 'soil' },
    };
  },
  step(animal, ctx, dt) {
    if (!animal.settled) {
      const { animal: moved, arrived } = moveToward(animal, ctx, dt, ctx.species.speed.burrow ?? 2.5);
      return { animal: arrived ? { ...settleOn(moved), settled: true } : moved, done: false };
    }
    const timer = animal.timer - dt;
    return { animal: { ...animal, timer }, done: timer <= 0 };
  },
};
