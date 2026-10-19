/**
 * data/items/drainage.js
 * Purpose: drainage layer (layer 1, the bottom of the tank floor).
 * Inputs:  none (pure data)
 * Outputs: DRAINAGE [{ id, name, description, height, swatch, grid }]
 * Notes:   a false bottom that catches extra water so the soil above never
 *          sits in a puddle. Clay balls (LECA) or pebbles; 16x8 tiles.
 */
export const DRAINAGE = [
  { id: 'none', name: 'No drainage', description: 'Soil goes right to the glass.', height: 0, swatch: '#9cc3c4', grid: null },
  {
    id: 'clay-balls', name: 'Clay balls', description: 'Light, round and airy.', height: 8, swatch: '#d06a35',
    grid: [
      'nnnmlkknmlkknlkk',
      'nmmmlnmmmlnmmmlk',
      'mmlllmmlllmmlllk',
      'mllkkmllkkmllkkk',
      'mlknnnmknnmmknnm',
      'lkknmmmlnmmmnnmm',
      'lkkmmlllmmllmmml',
      'kkkmllkkmllkmlll',
    ],
  },
  {
    id: 'pebbles', name: 'Pebbles', description: 'Smooth stones that drain well.', height: 8, swatch: '#5c606a',
    grid: [
      'cffecffedccvvucc',
      'ffeedfeedvvuuutc',
      'eeeddeeddvuuuttc',
      'eddccddccfutttsc',
      'cdcffecfffeesffe',
      'dcffeedfeeedfeee',
      'cceeedceeeddeedd',
      'cceddccedddccddc',
    ],
  },
];
