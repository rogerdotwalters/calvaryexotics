/**
 * data/items/ledges.js
 * Purpose: ledges mounted on the back wall of the tank: stone, slate, rock,
 *          cork bark and driftwood. Animals perch on them.
 * Inputs:  none (pure data)
 * Outputs: LEDGES [{ id, name, description, zone, anchor, plane, grid }]
 * Notes:   plane 'back' means the item hangs on the back wall: it is drawn
 *          behind plants and decor (and can only be layered among other
 *          wall items). anchor 'free' means it can sit at any height.
 */
export const LEDGES = [
  {
    id: 'stone-ledge', name: 'Stone ledge', description: 'Flat stacked stone shelf.',
    zone: 'mid', anchor: 'free', plane: 'back',
    grid: [
      '...fffdfffdfffdfffffffdffffdff..',
      '...deeeedeeeeeeeeeeeeeeeeeeedede',
      'eeeeeeeeeeededeeeededeeeeeeee...',
      'ccdeeedddddddddddddcdedededeced.',
      'cddccdcccccdcccccdcccdcdcdccc...',
      'deddeddddeeddddcededddededdded..',
      '.ddccceccddcdddcdecdccccddccc...',
      '...ddddeddddddddddcdddecdcdde...',
      'dccdddddcdddddcddddcddddccdddd..',
      'cccccccccccccccccccccccccccccc..',
    ],
  },
  {
    id: 'slate-ledge', name: 'Slate ledge', description: 'Dark, layered slate.',
    zone: 'mid', anchor: 'free', plane: 'back',
    grid: [
      '....eeedeeeeeeeeeeecdeeeece...',
      '.eeeeeedeeeeeeeecdeeeedeeed...',
      '...ddcccdcccdcccdcccdddcccccdc',
      'cccccdcccdcccddcddccdcccccc...',
      '....cdccdccccddccccdcdccddddc.',
      '..ccccccdcccccdccccccccccdc...',
      '..cdcccccccccdcdccccccdccdcc..',
      'cccccccccccccccccccccccccccccc',
    ],
  },
  {
    id: 'rock-ledge', name: 'Rock ledge', description: 'Rugged outcrop with a flat top.',
    zone: 'mid', anchor: 'free', plane: 'back',
    grid: [
      '............................',
      '............................',
      '............................',
      '.......ffeffeffeffeff.......',
      '....eeeeeeeeeeeeeeeeeeee....',
      '...fffffffffeeeeeeeeeeced...',
      '..fffcdcfeeeeeeeeeeeeedcdd..',
      '.ffffffceeeeeeeeeeecddddddd.',
      'fffffeeeeeeeeeeeedddddddcddd',
      'ffeeeeeeeeeeeedddddddddcdedc',
      'eeeecceeeeeedcddddddddddcccc',
      'eeeeceeeeedddddddddccdcccccd',
      '.eeedeeddddddcdcdcdccdccccc.',
      '..ecdddddddddddddccccccccc..',
      '...dcdcdddddddcccccccccce...',
      '....dddddddccccccccccccc....',
    ],
  },
  {
    id: 'cork-ledge', name: 'Cork ledge', description: 'Curved cork bark shelf.',
    zone: 'mid', anchor: 'free', plane: 'back',
    grid: [
      '..999.........................',
      'b9aaa9bbbbbbbbbbbbbbbbbbbbbbbb',
      'ba999abbbbbbb8b98bbb9bb9bbbbbb',
      '99aaa9aaaaa8aaaaa8aa88aaabbbbb',
      '99a8a9a9aaaaaa9a9aaaaaaaaaaaaa',
      '99a8a98aaaaaaaaaaaa8aa9aaaaaaa',
      '99aaa99999999999999989999aaaaa',
      '9a999a999899999999999999999999',
      '89aaa9888888888898888888899988',
      '..999....................88888',
    ],
  },
  {
    id: 'driftwood-ledge', name: 'Driftwood ledge', description: 'Bleached driftwood plank.',
    zone: 'mid', anchor: 'free', plane: 'back',
    grid: [
      '..................................',
      '..rrrprrrrrrrrrrrrrrrrrrrurrrrrrrr',
      'prqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqq',
      'qquqqqquuutuutqqqqqqqqqqqqqqqqqqpp',
      'ppppppppttsuuttttttutptspuutuuuuup',
      'pqpppppppppppqppputuuuuuqpppppppuu',
      'uuuuppuuuuuuuupuuuuuuuuuuuuuuuuu..',
      '..................................',
    ],
  },
];
