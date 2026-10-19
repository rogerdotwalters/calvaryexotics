/**
 * data/species/isopods.js
 * Purpose: isopods, a cleanup-crew colony. One colony entry stands for many
 *          animals: `count` is the population and it grows on its own.
 * Inputs:  none (pure data)
 * Outputs: ISOPODS
 *
 * Colony:  { start, growthPerDay, perAreaIn2, floor, maxVisible }
 *   start         population when added
 *   growthPerDay  fraction the population can grow per game day (logistic)
 *   perAreaIn2    carrying capacity per square inch of tank floor, scaled by
 *                 how much leaf litter there is to eat
 *   floor         the population never drops below this (nothing dies out)
 *   maxVisible    most isopods drawn at once
 * Behavior: they forage on the ground, climb the back wall and branches, and
 *          burrow into the soil (especially to escape a hunting predator).
 *          Geckos eat them; a colony never falls below `floor`.
 * Role:    'cleanup' colonies eat waste and leaf litter (see systems/environment.js)
 *          and make animals in the same tank a little happier.
 * Variants: the morphs you can start a colony from (the Animals tab shows one
 *          card each). They are identified by color and pattern only, not by
 *          names. Orange is a rare mutation.
 */
const ramp = (hexes, from) => Object.fromEntries(hexes.map((h, i) => [from + i, h]));

export const ISOPODS = {
  id: 'isopod',
  name: 'Isopods',
  description: 'A cleanup crew. They eat leaf litter and waste, and multiply.',
  category: 'invertebrate',
  sprite: 'isopod',
  size: { w: 12, h: 7 },
  movement: 'crawl',
  zone: 'ground',
  activity: 'crepuscular',
  role: 'cleanup',
  colony: { start: 6, growthPerDay: 1.2, perAreaIn2: 2.5, floor: 3, maxVisible: 12 },
  maxPerTank: 3,
  speed: { crawl: 7, climb: 4, burrow: 3.3 },
  climbWeight: 0.7, // climbs the wall now and then; mostly forages and burrows
  burrowWeight: 0.5, // digs into the soil, much more when a predator is about
  behaviors: ['crawl', 'idle', 'hide', 'burrow', 'climb'],
  needs: {
    temperature: { range: [65, 82], tolerance: 12 },
    humidity: { range: [65, 95], tolerance: 25 },
    hides: 1, climbing: 0, foliage: 0,
    food: true, foodFrom: 'litter', water: true,
    minHeightIn: 4, volumePerAnimal: 1200,
  },
  diet: ['leaf-litter', 'waste'],
  lifecycle: [
    { id: 'juvenile', days: 6, scale: 0.7 },
    { id: 'adult', days: null, scale: 1 },
  ],
  variants: [
    { id: 'white', name: 'White', description: 'Pale and quick to multiply.', morph: { color: 'white', pattern: 'none' } },
    { id: 'blue', name: 'Blue', description: 'Soft blue-grey.', morph: { color: 'blue', pattern: 'none' } },
    { id: 'black-striped', name: 'Black striped', description: 'Black with pale bands.', morph: { color: 'black', pattern: 'striped' } },
  ],
  genetics: {
    traits: {
      color: {
        alleles: ['white', 'blue', 'black', 'orange'],
        dominance: ['black', 'blue', 'white', 'orange'],
        rare: ['orange'],
        labels: { white: 'white', blue: 'blue', black: 'black', orange: 'orange' },
        palette: {
          white: { ...ramp(['#b8b2a2', '#d8d3c4', '#efeadc', '#fffdf5'], 0), ...ramp(['#a8a292', '#c8c2b2', '#e4dfd0', '#f6f3e8'], 4) },
          blue: { ...ramp(['#4a5a78', '#6d82a6', '#92a8c8', '#bcd0e8'], 0), ...ramp(['#3a4864', '#5a6e90', '#8098b8', '#a8bcd8'], 4) },
          black: { ...ramp(['#0e0e12', '#1c1c22', '#2c2c34', '#44444e'], 0), ...ramp(['#08080a', '#14141a', '#22222a', '#34343c'], 4) },
          orange: { ...ramp(['#8a3410', '#c4561c', '#ec7e2c', '#ffa85a'], 0), ...ramp(['#7a2c0c', '#b24a18', '#d8702a', '#f4944a'], 4) },
        },
      },
      pattern: {
        alleles: ['none', 'striped'],
        dominance: ['none', 'striped'],
        labels: { striped: 'striped' },
        palette: { none: {}, striped: ramp(['#8c8c8c', '#c4c4c4', '#ececec', '#ffffff'], 4) }, // pale bands
      },
    },
  },
};
