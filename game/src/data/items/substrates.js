/**
 * data/items/substrates.js
 * Purpose: base substrate (layer 3 of the tank floor). One per tank.
 * Inputs:  none (pure data)
 * Outputs: SUBSTRATES [{ id, name, description, height, swatch, grid }]
 * Notes:   grid is a 16x16 tile repeated across the floor; height is in
 *          pixels. The bioactive mix pictures what real mixes contain: soil,
 *          orchid bark, coco and sphagnum fibre, charcoal and perlite.
 *          grid: null means no substrate.
 */
export const SUBSTRATES = [
  { id: 'none', name: 'No substrate', description: 'Bare glass.', height: 0, swatch: '#9cc3c4', grid: null },
  {
    id: 'bioactive', name: 'Bioactive mix', description: 'Soil, bark, fibre and charcoal.', height: 10, swatch: '#4a3727',
    grid: [
      'ihihhhhgghahhhhh',
      'iiighhhhhhaajjjj',
      'hihhhhhihgahhhhh',
      'hihhhfhghihiahii',
      'hhhia99hhihhaghi',
      'hhhha9hfhhhhghih',
      'ccghhhhhhiihhhih',
      'hhhhighiihghjjjc',
      'hhhjjjhghhihhhig',
      'iihhhiihigihhjih',
      'jhihhghhihighjjj',
      'ahhhhhihhhihhhgh',
      'ahhhiihghhhhhhgh',
      'iihhhghihiihhhcg',
      'hhhighahihfhhghg',
      'hhgiihahhhahhchi',
    ],
  },
  {
    id: 'coco', name: 'Coco fiber', description: 'Holds moisture well.', height: 10, swatch: '#6f553a',
    grid: [
      'jiiiiiiiiiijijii',
      'jjjiiiihjihiiiij',
      'ijjihiiiiiiiiiji',
      'hjjjhiiiijijijjh',
      'iihhjjiiiihiijii',
      'ijjijijijibbbjih',
      'jjjhjhhhhhhijbbb',
      'jjjiiiihiibbbiij',
      'hiijiiiihhhhiiii',
      'jjijijjjjjjiihjh',
      'iiiiiijihjiiiiii',
      'iiiiiiiiiijiihii',
      'iiijjiijjijbbbii',
      'jiiiiiiiiiijiiih',
      'jhbbbbbbihihihii',
      'jiiiiiiibbbihijj',
    ],
  },
  {
    id: 'topsoil', name: 'Topsoil', description: 'Plain, dense garden soil.', height: 10, swatch: '#2d2118',
    grid: [
      'ghggiggghhgggihg',
      'gggiggiggggihggg',
      'igghhgghgggggggi',
      'ggghghihhiiggigg',
      'gggggghhhhhghhhg',
      'ghgghghhgghgghgg',
      'ghhgghigghgggghh',
      'hhhgighhgggggghh',
      'ghhggghhhhgggghh',
      'ghgghggggihigggg',
      'igghghhhgggggggg',
      'igiggghhggghhhgg',
      'gghggggiighhhhgi',
      'ggggghgggggggggi',
      'ggghghgggggggigh',
      'ghghghgggigggggg',
    ],
  },
  {
    id: 'sand', name: 'Sand', description: 'Dry and bright.', height: 8, swatch: '#dcc590',
    grid: [
      'qqqqqqpqqqqqqqqp',
      'qqqpqqqqpqqqqrqq',
      'prqqqqqqqqqpqrrq',
      'qqrqoqqqqqrprpqq',
      'rqqoqqqqqqqqqrqq',
      'qqqqqqqqqrqqqrqq',
      'qppqqqrqqqqqqqpp',
      'qqqqqqqqqqpqrqoq',
      'qqqqpprqqpqqrqqq',
      'pqqqqqqppqpqqqrr',
      'qqqrqqprqofqqqqq',
      'qrqqrqrqqqqrfqqq',
      'pqqqpqqqqrqqqqqq',
      'qqqqqqqqppqqqrqq',
      'pqqfqqqqqqqqqqqp',
      'rqqoqrqqppqqqofp',
    ],
  },
];
