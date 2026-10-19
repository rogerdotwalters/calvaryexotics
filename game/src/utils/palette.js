/**
 * utils/palette.js
 * Purpose: helpers for writing colorway data compactly.
 * Inputs:  ramp(startSlot, [hex...]) / colorway(id, name, swaps)
 * Outputs: swaps objects ({ slot: hex }) and colorway entries
 *          ({ id, name, swaps, swatch }).
 * Notes:   a colorway recolors a sprite by replacing palette slots; the sprite
 *          art itself never changes.
 */
export function ramp(startSlot, hexes) {
  const swaps = {};
  hexes.forEach((hex, i) => { swaps[startSlot + i] = hex; });
  return swaps;
}

export function colorway(id, name, swaps) {
  const values = Object.values(swaps);
  return { id, name, swaps, swatch: values[Math.min(2, values.length - 1)] };
}
