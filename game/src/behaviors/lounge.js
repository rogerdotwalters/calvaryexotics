/**
 * behaviors/lounge.js
 * Purpose: settle on a comfortable perch and rest for a long while. Crested
 *          geckos spend much of their time lounging: stretched out on a ledge or
 *          branch, or clinging head-down, eyes half closed.
 * Inputs:  animal, ctx { items, w, groundY, rng, species }, dt
 * Outputs: behavior module { name, score, begin, step }
 * Notes:   it walks to the spot first (animal.settled is false), then rests
 *          for 40-120 seconds, less when it is busy (settled is true). Spots are chosen for comfort
 *          using the saved heat gradient.
 */
import { moveToward, pickTarget, settleOn } from './common.js';

export const lounge = {
  name: 'lounge',
  // Lounging is the default; a busy (night-time) gecko lounges a little less and for shorter spells.
  score: (animal, ctx) => 0.9 - 0.35 * ctx.activity + 0.2 * animal.mood,
  begin(animal, ctx) {
    const { rng } = ctx;
    const candidates = ctx.items
      .filter((i) => ['perch', 'climb', 'cover'].some((t) => i.tags.includes(t)))
      .map((i) => ({
        x: i.rect.x + rng.range(0.25, 0.75) * i.rect.w,
        y: i.rect.y + (i.tags.includes('perch') ? 0.1 : rng.range(0.2, 0.8)) * i.rect.h,
        bonus: 0.4,
        tall: i.rect.h > i.rect.w * 1.4,
        surface: 'item',
      }));
    candidates.push({ x: rng.range(8, ctx.w - 8), y: ctx.groundY - 3, bonus: 0, tall: false, surface: 'ground' });
    for (let k = 0; k < 2; k++) candidates.push({ x: rng.range(8, ctx.w - 8), y: rng.range(8, ctx.groundY - 8), bonus: 0.3, tall: false, surface: 'wall' });
    const target = pickTarget(ctx, candidates, rng.next);
    return {
      ...animal, mode: 'lounge', settled: false, timer: rng.range(40, 120) * (1.1 - 0.75 * ctx.activity),
      target: { x: target.x, y: target.y, surface: target.surface },
      // tall branches and the wall: head-down is a favorite; ledges and the ground: facing sideways
      restHeading: target.tall || target.surface === 'wall' ? (rng.next() < 0.7 ? 'down' : 'up') : rng.next() < 0.5 ? 'left' : 'right',
    };
  },
  step(animal, ctx, dt) {
    if (!animal.settled) {
      const { animal: moved, arrived } = moveToward(animal, ctx, dt, ctx.species.speed.climb);
      return { animal: arrived ? { ...settleOn(moved), settled: true, heading: animal.restHeading } : moved, done: false };
    }
    const timer = animal.timer - dt;
    return { animal: { ...animal, timer }, done: timer <= 0 };
  },
};
