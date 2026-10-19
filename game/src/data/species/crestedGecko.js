/**
 * data/species/crestedGecko.js
 * Purpose: the crested gecko, defined entirely as data. Adding another species
 *          means adding a file like this and listing it in species/index.js.
 * Inputs:  none (pure data)
 * Outputs: CRESTED_GECKO (spends much of its time lounging)
 *
 * Fields:
 *   sprite      id in data/sprites/animals.js
 *   movement    climb | crawl | hop | burrow (the main way it gets around)
 *   zone        ground | mid | canopy (where it likes to be)
 *   activity    nocturnal | diurnal | crepuscular
 *   speed       pixels per second for each movement type
 *   behaviors   behavior modules it uses, by name (see /behaviors)
 *   prey        species ids it hunts and eats (isopod colonies)
 *   needs       temperature/humidity ranges (F, %) with a tolerance before the
 *               score hits zero; counts of hides, climbing surfaces and foliage;
 *               tank height; how much tank volume (cubic inches) each animal needs
 *   lifecycle   stages by age in game days (scale is for the sprite)
 *   genetics    traits with alleles, dominance and palette swaps
 */
const ramp = (hexes, from) => Object.fromEntries(hexes.map((h, i) => [from + i, h]));

export const CRESTED_GECKO = {
  id: 'crested-gecko',
  name: 'Crested gecko',
  description: 'Arboreal and nocturnal. Climbs, hides by day, loves humidity.',
  category: 'reptile',
  sprite: 'crested-gecko',
  size: { w: 25, h: 13 },
  maxPerTank: 4,
  movement: 'climb',
  zone: 'canopy',
  activity: 'nocturnal',
  speed: { climb: 12, crawl: 8 },
  behaviors: ['lounge', 'climb', 'hide', 'idle', 'hunt'],
  prey: ['isopod'],
  needs: {
    temperature: { range: [72, 80], tolerance: 8 },
    humidity: { range: [60, 80], tolerance: 25 },
    hides: 1,
    climbing: 2,
    foliage: 2,
    food: true,
    water: true,
    minHeightIn: 18,
    volumePerAnimal: 3500,
  },
  diet: ['fruit-mix', 'insects'],
  lifecycle: [
    { id: 'hatchling', days: 3, scale: 0.5 },
    { id: 'juvenile', days: 8, scale: 0.75 },
    { id: 'adult', days: null, scale: 1 },
  ],
  genetics: {
    traits: {
      color: {
        alleles: ['brown', 'orange', 'red', 'yellow', 'olive'],
        dominance: ['brown', 'olive', 'yellow', 'orange', 'red'], // earlier = more dominant
        palette: {
          brown: {},
          orange: { ...ramp(['#7a3412', '#b95a24', '#e0842f', '#f6b463'], 0), ...ramp(['#a24a1a', '#d9742a', '#f59a3c', '#ffc57a'], 4) },
          red: { ...ramp(['#4d1612', '#842a20', '#bd4430', '#e3735a'], 0), ...ramp(['#6a2018', '#a53a2a', '#d75a40', '#f58a6a'], 4) },
          yellow: { ...ramp(['#6e5818', '#a8892a', '#d9b640', '#f4dc82'], 0), ...ramp(['#8a6a20', '#c4a032', '#ecc84e', '#fbe69a'], 4) },
          olive: { ...ramp(['#2f3a1f', '#556a30', '#7f9645', '#a9bf6e'], 0), ...ramp(['#3e4a22', '#667c35', '#8fa84c', '#b8d06e'], 4) },
        },
      },
      pattern: { alleles: ['none', 'dalmatian', 'lilly-white'], dominance: ['none', 'dalmatian', 'lilly-white'], rare: ['lilly-white'], palette: {} },
      size: { alleles: ['small', 'medium', 'large'], dominance: ['medium', 'large', 'small'] },
    },
  },
};
