/**
 * utils/math.js
 * Purpose: small numeric helpers.
 * Inputs/Outputs: plain numbers.
 */
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const lerp = (a, b, t) => a + (b - a) * t;
