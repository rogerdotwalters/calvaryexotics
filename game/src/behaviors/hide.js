/**
 * behaviors/hide.js
 * Purpose: go to a hiding spot (a hide, or failing that dense foliage) and
 *          stay out of sight for a while. Wanted most in the day, and when the
 *          animal is unhappy. With no hiding spot it is never chosen.
 * Inputs:  animal, ctx { items, activity }, dt
 * Outputs: behavior module { name, score, begin, step }
 */
import { moveToward } from './common.js';

const spots = (ctx) => {
  const hides = ctx.items.filter((i) => i.tags.includes('hide'));
  return hides.length ? hides : ctx.items.filter((i) => i.tags.includes('cover'));
};

export const hide = {
  name: 'hide',
  score: (animal, ctx) => (spots(ctx).length ? (1 - ctx.activity) * 0.9 + (1 - animal.mood) * 0.8 : 0),
  begin(animal, ctx) {
    const spot = ctx.rng.pick(spots(ctx));
    return {
      ...animal, mode: 'hide', timer: ctx.rng.range(20, 50),
      target: { x: spot.rect.x + spot.rect.w / 2, y: ctx.species.zone === 'ground' ? ctx.groundY - 2 : spot.rect.y + spot.rect.h * 0.7, surface: ctx.species.zone === 'ground' ? 'ground' : 'item' },
      spotId: spot.id,
    };
  },
  step(animal, ctx, dt) {
    if (animal.hidden) { // already out of sight: wait
      const timer = animal.timer - dt;
      return { animal: { ...animal, timer, hidden: timer > 0 ? animal.hidden : null }, done: timer <= 0 };
    }
    const { animal: moved, arrived } = moveToward(animal, ctx, dt, ctx.species.speed.climb ?? 6);
    return { animal: arrived ? { ...moved, hidden: animal.spotId, surface: moved.target.surface } : moved, done: false };
  },
};
