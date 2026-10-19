/**
 * render/morph.js
 * Purpose: the palette swaps that give an animal its look, from its morph.
 * Inputs:  morphSwaps(species, morph) with morph = { color, pattern, ... }
 * Outputs: swaps { slot: hex } merged from every trait that has a palette.
 */
export function morphSwaps(species, morph) {
  const swaps = {};
  for (const [trait, def] of Object.entries(species.genetics?.traits ?? {})) {
    Object.assign(swaps, def.palette?.[morph?.[trait]] ?? {});
  }
  return swaps;
}
