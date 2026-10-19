/**
 * behaviors/idle.js
 * Purpose: stay put for a while.
 * Inputs:  animal, ctx { activity, rng }, dt
 * Outputs: behavior module { name, score, begin, step }
 */
export const idle = {
  name: 'idle',
  score: () => 0.5,
  begin: (animal, ctx) => ({ ...animal, mode: 'idle', target: null, timer: ctx.rng.range(2, 6) / (0.3 + ctx.activity) }),
  step(animal, ctx, dt) {
    const timer = animal.timer - dt;
    return { animal: { ...animal, timer }, done: timer <= 0 };
  },
};
