/**
 * data/items/charcoal.js
 * Purpose: charcoal layer (layer 2): a very thin layer of horticultural charcoal.
 * Inputs:  none (pure data)
 * Outputs: CHARCOAL [{ id, name, description, height, swatch, grid }]
 */
export const CHARCOAL = [
  { id: 'none', name: 'No charcoal', description: 'Skip the filter layer.', height: 0, swatch: '#9cc3c4', grid: null },
  {
    id: 'charcoal', name: 'Charcoal', description: 'A thin, dark filter layer.', height: 2, swatch: '#3a3d44',
    grid: [
      'ghcdgcggcggggggg',
      'dcgdcghcdcgggcgg',
    ],
  },
];
