/**
 * data/items/trims.js
 * Purpose: baseboard styles as 8x8 tiles repeated along the wall.
 * Inputs:  none (pure data)
 * Outputs: TRIMS [{ id, name, description, grid }]
 * Notes:   digits 0-3 are the primary ramp (dark -> light); a trim color
 *          swaps that ramp.
 */
export const TRIMS = [
  {
    id: 'plain', name: 'Plain', description: 'Flat and simple.',
    grid: ['33333333', '22222222', '22222222', '22222222', '22222222', '22222222', '11111111', '00000000'],
  },
  {
    id: 'stepped', name: 'Stepped', description: 'A groove along the top.',
    grid: ['33333333', '22222222', '11111111', '22222222', '22222222', '22222222', '11111111', '00000000'],
  },
  {
    id: 'paneled', name: 'Paneled', description: 'Inset panels.',
    grid: ['33333333', '22222222', '23333332', '23222212', '23222212', '21111112', '22222222', '00000000'],
  },
  {
    id: 'checkered', name: 'Checkered', description: 'Chunky two-tone blocks.',
    grid: ['33332222', '33332222', '33332222', '33332222', '22223333', '22223333', '22223333', '00000000'],
  },
];
