/**
 * data/tankSizes.js
 * Purpose: terrarium sizes and tank materials.
 * Inputs:  none (pure data)
 * Outputs: TANK_SIZES, TANK_MATERIALS
 * Notes:   size ids are "WxDxH" in inches. The view is a front side-on, so
 *          width and height set the drawn size (4 pixels per inch); depth is
 *          used by the simulation (floor area, volume).
 *          A material's `swaps` recolor the tank palette (glass uses none).
 */
export const TANK_SIZES = [
  { id: '12x12x12', name: '12x12x12', description: 'Compact cube for a small colony.', width: 12, depth: 12, height: 12 },
  { id: '12x12x18', name: '12x12x18', description: 'Small and tall, just right for one.', width: 12, depth: 12, height: 18 },
  { id: '18x18x24', name: '18x18x24', description: 'Tall tank with room to climb.', width: 18, depth: 18, height: 24 },
  { id: '24x18x18', name: '24x18x18', description: 'Wide and roomy for ground dwellers.', width: 24, depth: 18, height: 18 },
  { id: '36x18x18', name: '36x18x18', description: 'Long tank with space for a full layout.', width: 36, depth: 18, height: 18 },
  { id: '18x18x36', name: '18x18x36', description: 'Very tall, with a long climb.', width: 18, depth: 18, height: 36 },
  { id: '24x24x48', name: '24x24x48', description: 'A towering rainforest display.', width: 24, depth: 24, height: 48 },
  { id: '48x48x24', name: '48x48x24', description: 'Huge floor space for a big scene.', width: 48, depth: 48, height: 24 },
];

export const TANK_MATERIALS = [
  { id: 'glass', name: 'Glass', description: 'Clear glass with a mesh lid.', swaps: {} },
];
