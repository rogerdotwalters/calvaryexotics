/**
 * data/items/moss.js
 * Purpose: moss you can place, like rocks. Based on common terrarium mosses:
 *          sheet moss (flat mats), cushion/bun moss (tight pale mounds),
 *          mood moss (rolling hummocks), fern moss (feathery), sphagnum
 *          (fluffy, holds water), and moss growing on rocks and logs.
 * Inputs:  none (pure data)
 * Outputs: MOSS [{ id, name, description, zone, anchor, grid }]
 */
export const MOSS = [
  {
    id: 'sheet-moss', name: 'Sheet moss', description: 'A flat green carpet.',
    zone: 'ground', anchor: 'ground',
    grid: [
      '.........2332.......',
      '2.3....332222133..2.',
      '23223332222222222223',
      '11111111121111111111',
    ],
  },
  {
    id: 'cushion-moss', name: 'Cushion moss', description: 'Tight, pale green mounds.',
    zone: 'ground', anchor: 'ground',
    grid: [
      '............',
      '....7774....',
      '..77767666..',
      '.7777666664.',
      '.7774666455.',
      '777666665555',
      '666666655545',
      '444444444444',
    ],
  },
  {
    id: 'mood-moss', name: 'Mood moss', description: 'Rolling, wild hummocks.',
    zone: 'ground', anchor: 'ground',
    grid: [
      '................',
      '................',
      '........321322..',
      '..3333233332222.',
      '.303323303222020',
      '.333013122222212',
      '3312223322222111',
      '3322223221121111',
      '0000000000000000',
    ],
  },
  {
    id: 'fern-moss', name: 'Fern moss', description: 'Feathery little fronds.',
    zone: 'ground', anchor: 'ground',
    grid: [
      '........3.......',
      '...3...123...3..',
      '..122..123..223.',
      '...12331231323..',
      '323.122123223.23',
      '.22311232123322.',
      '..12232222232.3.',
      '....123222223...',
      '.....122222.....',
      '.....000000.....',
    ],
  },
  {
    id: 'sphagnum', name: 'Sphagnum', description: 'Fluffy and very absorbent.',
    zone: 'ground', anchor: 'ground',
    grid: [
      '..............',
      '....rrrrrq....',
      '..rqrrq2qqqq..',
      '.3rrr2q33qq33.',
      'rrrq22qqqq3233',
      'rrqqqqqq333333',
      '22222222222222',
    ],
  },
  {
    id: 'mossy-rock', name: 'Mossy rock', description: 'A small rock with a green cap.',
    zone: 'ground', anchor: 'ground',
    grid: [
      '................',
      '................',
      '......3303......',
      '...3333332222...',
      '.33333202222211.',
      '33f0222e2c2d2d11',
      '3feeeee21ddcdc1d',
      'ede2eed1dedcddcc',
      'eeee1ddddddccccc',
      '.edddddddcccccc.',
      '...ddddccccce...',
    ],
  },
  {
    id: 'mossy-boulder', name: 'Mossy boulder', description: 'A big rock, well covered.',
    zone: 'ground', anchor: 'ground',
    grid: [
      '........................',
      '........................',
      '........................',
      '........33333330........',
      '.....33333333322222.....',
      '...333033332222220222...',
      '..33333332222222222111..',
      '.3333332222020e22d1d11d.',
      '33132222e22e220d1dd1dddd',
      '3f2d22e0e2eedddddd1ddd1c',
      '222122ee2edddd1ddddddccc',
      '20eeeceeddddddcddcdccccc',
      '.ceeed1dddddedddcccccce.',
      '..edcddddddddccccccccc..',
      '...dddddddddccccccccc...',
      '.....ddddccdccccccc.....',
    ],
  },
  {
    id: 'mossy-log', name: 'Mossy log', description: 'A mossy fallen log.',
    zone: 'ground', anchor: 'ground',
    grid: [
      '1.2..2...223.....1..........',
      '122222222331...2.1.22.......',
      '223313223222bbb2b1b11b.aba..',
      '111111111111bbb1b1b11bababa.',
      'aaaaaaaaaaaaaaaaaaaaaaba8ab.',
      'aaaaaaaaaaaaaaaaaaaaaaba8ab.',
      '9999999999999999999999ababa.',
      '8888888888888888888888.aba..',
      '............................',
    ],
  },
];
