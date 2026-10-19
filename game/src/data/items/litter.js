/**
 * data/items/litter.js
 * Purpose: leaf litter (layer 4, the top of the tank floor).
 * Inputs:  none (pure data)
 * Outputs: LITTER [{ id, name, description, height, swatch, grid }]
 * Notes:   16x4 tiles with transparent gaps so the top edge looks ragged.
 */
export const LITTER = [
  { id: 'none', name: 'No leaf litter', description: 'Bare substrate.', height: 0, swatch: '#9cc3c4', grid: null },
  {
    id: 'oak-leaves', name: 'Oak leaves', description: 'Crisp brown oak leaves.', height: 4, swatch: '#86603f',
    grid: [
      'l............lbl',
      'lb........99blll',
      'llab8..999998lll',
      'llaaaa999999llll',
    ],
  },
  {
    id: 'magnolia-leaves', name: 'Magnolia leaves', description: 'Big, slow-rotting leaves.', height: 4, swatch: '#5c4130',
    grid: [
      'bb...99..ba.8.bb',
      'b99.b9bbbab8b999',
      '899a9899aaa88899',
      '999a9999aaa98999',
    ],
  },
  {
    id: 'mixed-litter', name: 'Mixed litter', description: 'A blend of leaves and bits.', height: 4, swatch: '#a8472a',
    grid: [
      '1.....mmb.....b1',
      '1bjjjmmmmb...b11',
      '119jj9mmmm1b.181',
      '118j9mmmmb181111',
    ],
  },
];
