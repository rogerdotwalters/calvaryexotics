/**
 * systems/daylight.js
 * Purpose: day or night (no rendering, no DOM).
 * Inputs:  state (state.settings.night is the Day/Night switch)
 * Outputs: isNight(state), nightLevel(state) 0 or 1, lightIsOn(fixture, state),
 *          nightFactor(time) and isDay(time) (only used to upgrade old saves)
 * Notes:   the game is a design and testing tool, so there is no clock: you flip
 *          the Time switch between Day and Night. At night lamps go off (except
 *          fixtures that stay on, like moon lights and ceramic heaters), the
 *          room cools, and animals keep their night or day habits.
 */
import { clamp } from '../utils/math.js';

export const isNight = (state) => Boolean(state.settings?.night);

export const nightLevel = (state) => (isNight(state) ? 1 : 0);

export function lightIsOn(fixture, state) {
  if (!fixture || fixture.id === 'none') return false;
  return !isNight(state) || Boolean(fixture.nightOn);
}

/** Old saves had a clock: 0 = midnight, 0.5 = noon. Full night is before 0.2 and after 0.8. */
export function nightFactor(time) {
  const t = ((time % 1) + 1) % 1;
  return clamp((0.3 - Math.min(t, 1 - t)) / 0.1, 0, 1);
}

export const isDay = (time) => nightFactor(time) < 0.5;
