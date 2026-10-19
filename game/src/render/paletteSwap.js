/**
 * render/paletteSwap.js
 * Purpose: recolor by replacing palette slots, never by drawing new art.
 * Inputs:  palette { id, colors[] }, swaps { slot: hex }
 * Outputs: resolvePalette -> hex[]; resolveColor -> hex; swapKey -> cache key;
 *          hexToRgba -> [r,g,b,a]
 */
export function hexToRgba(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

export function resolvePalette(palette, swaps = {}) {
  return palette.colors.map((hex, i) => swaps[i] ?? hex);
}

export function resolveColor(palette, swaps, slot) {
  return swaps?.[slot] ?? palette.colors[slot];
}

export function swapKey(swaps = {}) {
  return Object.keys(swaps)
    .sort((a, b) => a - b)
    .map((slot) => `${slot}:${swaps[slot]}`)
    .join(',');
}

/**
 * Swaps for a background: its own default look (baseSwaps) with the chosen
 * color ramp (4 colors, dark -> light) laid onto the background's ramp slots.
 */
export function backgroundSwaps(bg, color) {
  const out = { ...(bg?.baseSwaps ?? {}) };
  Object.values(color?.swaps ?? {}).forEach((hex, i) => { out[(bg?.ramp ?? 0) + i] = hex; });
  return out;
}
