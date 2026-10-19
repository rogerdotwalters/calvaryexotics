/**
 * behaviors/hunt.js
 * Purpose: stalk and catch prey. A predator picks the nearest prey colony that
 *          is out in the open, chases it, and when it gets close, catches a
 *          few. It then rests while it digests.
 * Inputs:  animal, ctx { prey: [{ id, x, y, count, floor, surface }], activity,
 *          env, rng, species }, dt
 * Outputs: behavior module { name, score, begin, step }. step can return
 *          effects: [{ type: 'eat', preyId, amount }] for the animal system to apply.
 * Notes:   a colony never drops below its floor, so prey is never wiped out.
 *          Hungrier (and more active) animals hunt more.
 */
import { moveToward } from './common.js';
import { RULES } from '../data/environmentRules.js';
import { px } from '../utils/pixelScale.js';

const REACH = px(6);
const GIVE_UP = 30;

export const hunt = {
  name: 'hunt',
  score: (animal, ctx) => (ctx.prey.length ? (0.35 + 0.65 * ctx.activity) * (0.7 + 0.3 * (1 - ctx.env.food / 100)) : 0),
  begin(animal, ctx) {
    const near = [...ctx.prey].sort((a, b) => Math.hypot(a.x - animal.x, a.y - animal.y) - Math.hypot(b.x - animal.x, b.y - animal.y))[0];
    return { ...animal, mode: 'hunt', preyId: near.id, timer: 0, settled: false, target: { x: near.x, y: near.y, surface: near.surface } };
  },
  step(animal, ctx, dt) {
    const prey = ctx.prey.find((p) => p.id === animal.preyId);
    const timer = animal.timer + dt;
    if (!prey || timer > GIVE_UP) return { animal: { ...animal, timer: 0 }, done: true }; // it burrowed or hid, or we gave up
    if (Math.hypot(prey.x - animal.x, prey.y - animal.y) <= REACH) {
      const P = RULES.predation;
      const amount = Math.min(prey.count - prey.floor, Math.max(1, Math.min(P.maxBite, Math.ceil(prey.count * P.eatFraction))));
      return {
        animal: { ...animal, mode: 'idle', preyId: null, timer: ctx.rng.range(6, 16), surface: prey.surface, target: null }, // digest
        done: false,
        effects: amount > 0 ? [{ type: 'eat', preyId: prey.id, amount }] : [],
      };
    }
    const chasing = { ...animal, timer, target: { x: prey.x, y: prey.y, surface: prey.surface } };
    return { animal: moveToward(chasing, ctx, dt, ctx.species.speed.climb).animal, done: false };
  },
};
