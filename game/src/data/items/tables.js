/**
 * data/items/tables.js
 * Purpose: table styles and heights.
 * Inputs:  none (pure data)
 * Outputs: TABLES, TABLE_HEIGHTS
 * Notes:   topTile repeats across the top; bodyTile across legs / drawer
 *          faces / wire. Digits 0-3 are the primary ramp, so a table color
 *          swaps that ramp.
 *          kind 'legs'   : two legs (legW) and an apron (apronH)
 *          kind 'drawers': a cabinet of drawers, about drawerW x drawerH each
 *          kind 'rack'   : open wire shelving; shelves are added by height
 *          inset: px the body is pulled in from the top's edge.
 *          margin/minW: table width = max(minW, tank width + margin).
 */
const GRAIN = ['22222222', '21222122', '22222222', '22212222', '22222222', '22222122', '22222222', '21222212'];
const TOP_PLAIN = ['33333333', '22232222', '22222322', '22222222', '11111111', '00000000'];
const WIRE = ['3333', '2121', '0000'];

export const TABLES = [
  {
    id: 'plain', name: 'Side table', description: 'A simple wooden table.',
    kind: 'legs', topH: 6, inset: 3, margin: 28, minW: 88, legW: 6, apronH: 6,
    topTile: TOP_PLAIN, bodyTile: GRAIN,
  },
  {
    id: 'rustic', name: 'Farm table', description: 'Chunky legs and thick planks.',
    kind: 'legs', topH: 6, inset: 3, margin: 28, minW: 88, legW: 10, apronH: 8,
    topTile: ['33333333', '23222222', '22222232', '22232222', '11111111', '00000000'],
    bodyTile: ['22212222', '22212222', '22212222', '22112222', '22212222', '22212222', '22212222', '22222222'],
  },
  {
    id: 'chest', name: 'Drawer chest', description: 'Big drawers with knobs.',
    kind: 'drawers', topH: 6, inset: 3, margin: 28, minW: 88, drawerW: 30, drawerH: 18,
    topTile: TOP_PLAIN, bodyTile: GRAIN,
  },
  {
    id: 'rack', name: 'Wire rack', description: 'Open metal shelving.',
    kind: 'rack', topH: 3, inset: 1, margin: 10, minW: 56,
    topTile: WIRE, bodyTile: WIRE,
  },
];

export const TABLE_HEIGHTS = [
  { id: 'low', name: 'Low', description: 'Close to the floor.', px: 32 },
  { id: 'medium', name: 'Medium', description: 'Standard height.', px: 44 },
  { id: 'tall', name: 'Tall', description: 'Counter height.', px: 56 },
];
