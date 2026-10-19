/**
 * data/items/rocks.js
 * Purpose: rocks and stones.
 * Inputs:  none (pure data)
 * Outputs: ROCKS [{ id, name, description, zone, anchor, grid }]
 * Notes:   grid is a palette-indexed sprite (terrarium palette; '.' is
 *          transparent). zone: ground | mid | canopy (used for habitat needs
 *          later). anchor: ground = sits on the substrate, top = hangs from the
 *          lid, free = placed anywhere. Add an item by adding an entry.
 */
export const ROCKS = [
  {
    id: 'pebbles', name: 'Pebbles', description: 'A few small stones.',
    zone: 'ground', anchor: 'ground',
    grid: [
      '..............',
      '........f.....',
      '..fffeffeee...',
      '.ffeefeeedffe.',
      'feeedeeddfeedd',
      '.edddcdddedddc',
    ],
  },
  {
    id: 'flat-stone', name: 'Flat stone', description: 'Good for basking.',
    zone: 'ground', anchor: 'ground',
    grid: [
      '....................',
      '....................',
      '....................',
      '....fffffffeeeee....',
      '.ffffffeeeeeeeedddd.',
      'fffeeeeeeeedddddddcd',
      'eeeeeeedddddddddcccc',
      '.eedddddcdddccccccc.',
    ],
  },
  {
    id: 'boulder', name: 'Boulder', description: 'A big rounded rock.',
    zone: 'ground', anchor: 'ground',
    grid: [
      '........................',
      '........................',
      '........................',
      '........ffffffff........',
      '.....ffffffeffeeeee.....',
      '...cfffffffeeeeeeeeee...',
      '..fffffffeeeeeeedeeddd..',
      '.ffffffeeeeeeeeeeecdddd.',
      'ffffeeedeeeeeedddddddddd',
      'fddeeeeeeeeedddddddddddd',
      'eeeeeeeeeedddddddddddccc',
      'eeeeeeeeddddddddddeeccce',
      '.eeeeddcddddddddccccccc.',
      '..edddddcddddddccccdcc..',
      '...ddddddcddccccccccc...',
      '.....cdddcccccccdcc.....',
    ],
  },
];
