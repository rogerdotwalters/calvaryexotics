/**
 * data/lightingRules.js
 * Purpose: how much each item blocks light, and the shadow threshold.
 * Inputs:  none (pure data)
 * Outputs: LIGHT_BLOCK, SHADOW_THRESHOLD, DIM_FROM, blocksLight(itemId),
 *          lightClass(blocks) -> 'hard' | 'dim' | 'thin'
 * Notes:   blocks runs 0 (see-through) to 1 (solid), default 1.
 *            hard  (>= SHADOW_THRESHOLD) casts a full shadow: ledges, rocks,
 *                  hides, thick driftwood
 *            dim   (DIM_FROM up to the threshold) leaves what is behind it lit
 *                  but one step dimmer: ferns, bromeliads, thin branches
 *            thin  (below DIM_FROM) casts no shadow at all: pothos vines
 *          Every class still catches light on its own top edges.
 */
export const SHADOW_THRESHOLD = 0.5;
export const DIM_FROM = 0.25;

export const LIGHT_BLOCK = {
  // vines and fine leaves: let light through
  'golden-pothos': 0.2, 'marble-queen': 0.2, 'neon-pothos': 0.2, 'jade-pothos': 0.2, 'satin-pothos': 0.2,
  // leafy plants: filter it
  'fern': 0.4, 'snake-plant': 0.45, 'neoregelia': 0.45, 'guzmania': 0.4, 'aechmea': 0.45, 'vriesea': 0.4, 'cryptanthus': 0.4,
  'fern-moss': 0.4,
  // thin branches
  'climbing-branch': 0.45, 'driftwood-branch': 0.45,
  // moss mats and thick wood are mostly solid
  'sheet-moss': 0.6, 'cushion-moss': 0.7, 'mood-moss': 0.7, 'sphagnum': 0.6, 'driftwood-root': 0.7,
};

export const blocksLight = (itemId) => LIGHT_BLOCK[itemId] ?? 1;

export function lightClass(blocks) {
  if (blocks >= SHADOW_THRESHOLD) return 'hard';
  return blocks >= DIM_FROM ? 'dim' : 'thin';
}
