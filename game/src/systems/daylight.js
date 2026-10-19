/**
 * systems/daylight.js
 * Purpose: time-of-day rules (no rendering, no DOM).
 * Inputs:  time = fraction of a day (0 = midnight, 0.5 = noon), state
 * Outputs: nightFactor(time) 0..1, nightLevel(state) in quarter steps,
 *          isDay(time), lightIsOn(fixture, state)
 * Notes:   full night is before 0.2 and after 0.8; full day is 0.3 to 0.7.
 *          With the day/night cycle off it is always day.
 */
import { clamp } from '../utils/math.js';

export function nightFactor(time) {
  const t = ((time % 1) + 1) % 1;
  return clamp((0.3 - Math.min(t, 1 - t)) / 0.1, 0, 1);
}

export const isDay = (time) => nightFactor(time) < 0.5;

/** 0, 0.25, 0.5, 0.75 or 1: stepped on purpose so the dusk looks pixel-hard. */
export const nightLevel = (state) =>
  (state.settings?.dayNight ? Math.round(nightFactor(state.time ?? 0.4) * 4) / 4 : 0);

export function lightIsOn(fixture, state) {
  if (!fixture || fixture.id === 'none') return false;
  if (!state.settings?.dayNight) return true;
  return isDay(state.time ?? 0.4) || Boolean(fixture.nightOn);
}
