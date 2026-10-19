/**
 * data/species/reptiles.js
 * Purpose: reptiles added after the crested gecko: viper gecko, bearded dragon, veiled chameleon, giant and gold dust day geckos, green anole and box turtle, defined entirely as data (see crestedGecko.js for what each
 *          field means). The extra needs a species can list are explained in
 *          systems/needs.js: basking, uvb, minLengthIn, openSpace, substrate, airflow.
 * Inputs:  none (pure data)
 * Outputs: VIPER_GECKO, BEARDED_DRAGON, VEILED_CHAMELEON, GIANT_DAY_GECKO, GOLD_DUST_DAY_GECKO, GREEN_ANOLE, BOX_TURTLE
 *
 * Care:    numbers come from keeper care sheets (ReptiFiles, Josh's Frogs, PetMD,
 *          Calvary Exotics' own viper gecko guide) and are rounded for the game.
 *          Temperatures are F, humidity is %, UVB is UV Index at the tank's
 *          strongest spot, and lengths are inches. Where sheets disagree the
 *          range is wide enough to include the common recommendations.
 */
const ramp = (hexes, from) => Object.fromEntries(hexes.map((h, i) => [from + i, h]));

export const VIPER_GECKO = {
  id: 'viper-gecko',
  name: 'Viper gecko',
  description: 'Nocturnal, social and dry. Squeezes into tight cork crevices by day.',
  category: 'reptile',
  sprite: 'viper-gecko',
  size: { w: 26, h: 10 },
  maxPerTank: 4,
  movement: 'climb',
  zone: 'mid',
  activity: 'nocturnal',
  speed: { climb: 11, crawl: 9 },
  behaviors: ['crawl', 'climb', 'hide', 'idle', 'hunt'],
  prey: ['isopod'],
  needs: {
    temperature: { range: [72, 82], tolerance: 8 },
    humidity: { range: [30, 45], tolerance: 20 },
    basking: { range: [88, 97], tolerance: 10 },
    uvb: { range: [0.7, 2.6], tolerance: 1.5 },
    minLengthIn: 20,
    openSpace: { max: 0.55 },
    substrate: ['sand', 'bioactive', 'topsoil'],
    hides: 3,
    climbing: 2,
    foliage: 0,
    food: true,
    water: true,
    minHeightIn: 12,
    volumePerAnimal: 1100,
  },
  diet: ['insects'],
  lifecycle: [
    { id: 'hatchling', days: 3, scale: 0.5 },
    { id: 'juvenile', days: 9, scale: 0.75 },
    { id: 'adult', days: null, scale: 1 },
  ],
  variants: [
    { id: 'sandy', name: 'Sandy', description: 'Tan with dark bands.', morph: { color: 'sandy', pattern: 'none' } },
    { id: 'grey', name: 'Grey', description: 'Cool grey bands.', morph: { color: 'grey', pattern: 'none' } },
    { id: 'red', name: 'Red', description: 'Warm rusty bands.', morph: { color: 'red', pattern: 'none' } },
  ],
  genetics: {
    traits: {
      color: {
        alleles: ['sandy', 'grey', 'red'],
        dominance: ['sandy', 'grey', 'red'],
        palette: {
          'sandy': { ...ramp(['#3a2a1c','#7a6044','#b89a6a','#dcc592'], 0), ...ramp(['#4a3624','#6a4c30','#8a6a44','#a88a5c'], 4) },
          'grey': { ...ramp(['#26262c','#55555e','#8a8a94','#bcbcc6'], 0), ...ramp(['#2a2a30','#40404a','#5a5a66','#767684'], 4) },
          'red': { ...ramp(['#4a2214','#8a4a2c','#c27c52','#e8aa7a'], 0), ...ramp(['#5a2a18','#7a3a20','#9a4e2c','#b86a3e'], 4) },
        },
      },
    },
  },
};

export const BEARDED_DRAGON = {
  id: 'bearded-dragon',
  name: 'Bearded dragon',
  description: 'Sun-loving and sturdy. Needs a long, open, hot, bright home.',
  category: 'reptile',
  sprite: 'bearded-dragon',
  size: { w: 42, h: 11 },
  maxPerTank: 1,
  movement: 'crawl',
  zone: 'ground',
  activity: 'diurnal',
  speed: { crawl: 10, climb: 7 },
  climbWeight: 0.5,
  behaviors: ['crawl', 'climb', 'lounge', 'hide', 'idle', 'hunt'],
  prey: ['isopod'],
  needs: {
    temperature: { range: [75, 88], tolerance: 10 },
    humidity: { range: [20, 40], tolerance: 25 },
    basking: { range: [100, 110], tolerance: 12 },
    uvb: { range: [3, 7], tolerance: 2.5 },
    minLengthIn: 48,
    openSpace: { min: 0.5 },
    substrate: ['sand', 'topsoil', 'none'],
    hides: 2,
    climbing: 2,
    foliage: 0,
    food: true,
    water: true,
    minHeightIn: 24,
    volumePerAnimal: 27000,
  },
  diet: ['insects', 'greens'],
  lifecycle: [
    { id: 'hatchling', days: 3, scale: 0.5 },
    { id: 'juvenile', days: 9, scale: 0.75 },
    { id: 'adult', days: null, scale: 1 },
  ],
  variants: [
    { id: 'normal', name: 'Normal', description: 'Classic sandy tan.', morph: { color: 'normal', pattern: 'none' } },
    { id: 'citrus', name: 'Citrus', description: 'Bright yellow-orange.', morph: { color: 'citrus', pattern: 'none' } },
    { id: 'red', name: 'Red', description: 'Deep red-orange.', morph: { color: 'red', pattern: 'none' } },
    { id: 'white', name: 'Hypo white', description: 'Pale and creamy.', morph: { color: 'white', pattern: 'none' } },
  ],
  genetics: {
    traits: {
      color: {
        alleles: ['normal', 'citrus', 'red', 'white'],
        dominance: ['normal', 'citrus', 'red', 'white'],
        palette: {
          'normal': { ...ramp(['#4a3524','#8a6a40','#c49a5c','#e6c488'], 0), ...ramp(['#7a5230','#a87c48','#d49a50','#f0c070'], 4) },
          'citrus': { ...ramp(['#6a3a0c','#c07a14','#f0a828','#ffd868'], 0), ...ramp(['#8a4a0c','#c4701c','#e89a2c','#ffc050'], 4) },
          'red': { ...ramp(['#4a1410','#8a2e20','#c45038','#ec8466'], 0), ...ramp(['#6a1c14','#a03020','#c84a30','#e87050'], 4) },
          'white': { ...ramp(['#6a6458','#a8a090','#d8d2c0','#f6f2e6'], 0), ...ramp(['#8a8272','#b0a894','#d0c8b2','#e8e0cc'], 4) },
        },
      },
    },
  },
};

export const VEILED_CHAMELEON = {
  id: 'veiled-chameleon',
  name: 'Veiled chameleon',
  description: 'Slow, tall and watchful. Needs a screen cage, climbing and bright light.',
  category: 'reptile',
  sprite: 'veiled-chameleon',
  size: { w: 29, h: 26 },
  maxPerTank: 1,
  movement: 'climb',
  zone: 'canopy',
  activity: 'diurnal',
  speed: { climb: 4, crawl: 3 },
  climbWeight: 1.2,
  behaviors: ['climb', 'lounge', 'hide', 'idle'],
  prey: [],
  needs: {
    temperature: { range: [75, 85], tolerance: 8 },
    humidity: { range: [40, 65], tolerance: 25 },
    basking: { range: [88, 105], tolerance: 10 },
    uvb: { range: [2.5, 5], tolerance: 2 },
    minLengthIn: 24,
    airflow: { min: 0.4 },
    hides: 0,
    climbing: 4,
    foliage: 4,
    food: true,
    water: true,
    minHeightIn: 48,
    volumePerAnimal: 27000,
  },
  diet: ['insects', 'leaves'],
  lifecycle: [
    { id: 'hatchling', days: 3, scale: 0.5 },
    { id: 'juvenile', days: 9, scale: 0.75 },
    { id: 'adult', days: null, scale: 1 },
  ],
  variants: [
    { id: 'green', name: 'Green', description: 'Classic green with gold bars.', morph: { color: 'green', pattern: 'none' } },
    { id: 'lime', name: 'Lime', description: 'Bright yellow-green.', morph: { color: 'lime', pattern: 'none' } },
    { id: 'jade', name: 'Jade', description: 'Cool blue-green.', morph: { color: 'jade', pattern: 'none' } },
  ],
  genetics: {
    traits: {
      color: {
        alleles: ['green', 'lime', 'jade'],
        dominance: ['green', 'lime', 'jade'],
        palette: {
          'green': { ...ramp(['#18381a','#3a7a28','#62b238','#92dc58'], 0), ...ramp(['#e0c838','#e0c838','#a89020','#d0a020'], 4) },
          'lime': { ...ramp(['#3a4a10','#80a018','#b4d82c','#e0f464'], 0), ...ramp(['#e8d040','#f0e060','#c0a828','#d8bc30'], 4) },
          'jade': { ...ramp(['#103a3a','#2a7a6a','#4cb89a','#82e0c0'], 0), ...ramp(['#e0d070','#e0d070','#a89a30','#d0c050'], 4) },
        },
      },
    },
  },
};

export const GIANT_DAY_GECKO = {
  id: 'giant-day-gecko',
  name: 'Giant day gecko',
  description: 'Big, bright and territorial. Basks, drinks dew, loves UVB and tall bamboo.',
  category: 'reptile',
  sprite: 'giant-day-gecko',
  size: { w: 37, h: 13 },
  maxPerTank: 1,
  movement: 'climb',
  zone: 'canopy',
  activity: 'diurnal',
  speed: { climb: 16, crawl: 8 },
  climbWeight: 1.2,
  behaviors: ['climb', 'lounge', 'hide', 'idle', 'hunt'],
  prey: ['isopod'],
  needs: {
    temperature: { range: [75, 82], tolerance: 8 },
    humidity: { range: [55, 75], tolerance: 25 },
    basking: { range: [88, 97], tolerance: 10 },
    uvb: { range: [2.5, 4.5], tolerance: 2 },
    minLengthIn: 18,
    airflow: { min: 0.08 },
    hides: 1,
    climbing: 4,
    foliage: 3,
    food: true,
    water: true,
    minHeightIn: 36,
    volumePerAnimal: 11000,
  },
  diet: ['nectar-mix', 'insects'],
  lifecycle: [
    { id: 'hatchling', days: 3, scale: 0.5 },
    { id: 'juvenile', days: 9, scale: 0.75 },
    { id: 'adult', days: null, scale: 1 },
  ],
  variants: [
    { id: 'green', name: 'Green', description: 'Emerald with red marks.', morph: { color: 'green', pattern: 'none' } },
    { id: 'lime', name: 'Lime', description: 'Lighter, yellow-green.', morph: { color: 'lime', pattern: 'none' } },
  ],
  genetics: {
    traits: {
      color: {
        alleles: ['green', 'lime'],
        dominance: ['green', 'lime'],
        palette: {
          'green': { ...ramp(['#14401c','#2f7a2a','#52b838','#86dc58'], 0), ...ramp(['#a02818','#c8442a','#e0603a','#f08a5a'], 4) },
          'lime': { ...ramp(['#2a4a10','#6a9a1c','#98cc30','#c8ee58'], 0), ...ramp(['#a03a14','#c8582a','#e0783a','#f09a5a'], 4) },
        },
      },
    },
  },
};

export const GOLD_DUST_DAY_GECKO = {
  id: 'gold-dust-day-gecko',
  name: 'Gold dust day gecko',
  description: 'A small, bright day gecko flecked with gold. Likes warmth, UVB and tall plants.',
  category: 'reptile',
  sprite: 'gold-dust-day-gecko',
  size: { w: 27, h: 10 },
  maxPerTank: 2,
  movement: 'climb',
  zone: 'canopy',
  activity: 'diurnal',
  speed: { climb: 16, crawl: 8 },
  climbWeight: 1.2,
  behaviors: ['climb', 'lounge', 'hide', 'idle', 'hunt'],
  prey: ['isopod'],
  needs: {
    temperature: { range: [75, 82], tolerance: 8 },
    humidity: { range: [55, 75], tolerance: 25 },
    basking: { range: [86, 94], tolerance: 10 },
    uvb: { range: [2.5, 4], tolerance: 2 },
    minLengthIn: 12,
    airflow: { min: 0.08 },
    hides: 1,
    climbing: 3,
    foliage: 3,
    food: true,
    water: true,
    minHeightIn: 18,
    volumePerAnimal: 3500,
  },
  diet: ['nectar-mix', 'insects'],
  lifecycle: [
    { id: 'hatchling', days: 3, scale: 0.5 },
    { id: 'juvenile', days: 9, scale: 0.75 },
    { id: 'adult', days: null, scale: 1 },
  ],
  variants: [
    { id: 'green', name: 'Green', description: 'Green with gold dust.', morph: { color: 'green', pattern: 'none' } },
    { id: 'blue', name: 'Hawaiian blue', description: 'Teal-blue with gold dust.', morph: { color: 'blue', pattern: 'none' } },
  ],
  genetics: {
    traits: {
      color: {
        alleles: ['green', 'blue'],
        dominance: ['green', 'blue'],
        palette: {
          'green': { ...ramp(['#14401c','#2f7a2a','#52b838','#86dc58'], 0), ...ramp(['#a02818','#c8442a','#e0603a','#f0d040'], 4) },
          'blue': { ...ramp(['#0c3050','#1c6a9a','#38a0cc','#72d0f0'], 0), ...ramp(['#a02818','#c8442a','#e0603a','#f0d040'], 4) },
        },
      },
    },
  },
};

export const GREEN_ANOLE = {
  id: 'green-anole',
  name: 'Green anole',
  description: 'Quick and slender. Basks, sips dew, and flashes a pink dewlap.',
  category: 'reptile',
  sprite: 'green-anole',
  size: { w: 34, h: 10 },
  maxPerTank: 2,
  movement: 'climb',
  zone: 'mid',
  activity: 'diurnal',
  speed: { climb: 15, crawl: 9 },
  climbWeight: 1.1,
  behaviors: ['climb', 'lounge', 'hide', 'idle', 'hunt'],
  prey: ['isopod'],
  needs: {
    temperature: { range: [72, 82], tolerance: 8 },
    humidity: { range: [60, 80], tolerance: 25 },
    basking: { range: [88, 94], tolerance: 10 },
    uvb: { range: [2.5, 4.5], tolerance: 2 },
    minLengthIn: 12,
    airflow: { min: 0.08 },
    hides: 2,
    climbing: 3,
    foliage: 3,
    food: true,
    water: true,
    minHeightIn: 18,
    volumePerAnimal: 2500,
  },
  diet: ['insects'],
  lifecycle: [
    { id: 'hatchling', days: 3, scale: 0.5 },
    { id: 'juvenile', days: 9, scale: 0.75 },
    { id: 'adult', days: null, scale: 1 },
  ],
  variants: [
    { id: 'green', name: 'Green', description: 'Bright leaf green.', morph: { color: 'green', pattern: 'none' } },
    { id: 'brown', name: 'Brown', description: 'Brown, when cool or stressed.', morph: { color: 'brown', pattern: 'none' } },
  ],
  genetics: {
    traits: {
      color: {
        alleles: ['green', 'brown'],
        dominance: ['green', 'brown'],
        palette: {
          'green': { ...ramp(['#1c4a1c','#3f8a2a','#68b838','#98dc5a'], 0), ...ramp(['#1c4a1c','#3f8a2a','#68b838','#98dc5a'], 4) },
          'brown': { ...ramp(['#3a2a18','#6a5030','#946e44','#c09a68'], 0), ...ramp(['#3a2a18','#6a5030','#946e44','#c09a68'], 4) },
        },
      },
    },
  },
};

export const BOX_TURTLE = {
  id: 'box-turtle',
  name: 'Box turtle',
  description: 'A slow, shelled forager. Wants floor space, damp soil and a warm bright spot.',
  category: 'reptile',
  sprite: 'box-turtle',
  size: { w: 30, h: 14 },
  maxPerTank: 1,
  movement: 'crawl',
  zone: 'ground',
  activity: 'diurnal',
  speed: { crawl: 5, climb: 3 },
  climbWeight: 0,
  behaviors: ['crawl', 'idle', 'hide'],
  prey: [],
  needs: {
    temperature: { range: [70, 80], tolerance: 8 },
    humidity: { range: [60, 80], tolerance: 25 },
    basking: { range: [85, 92], tolerance: 10 },
    uvb: { range: [2.5, 5], tolerance: 2.5 },
    minLengthIn: 48,
    openSpace: { min: 0.4 },
    substrate: ['bioactive', 'coco', 'topsoil'],
    airflow: { max: 0.5 },
    hides: 2,
    climbing: 0,
    foliage: 2,
    food: true,
    water: true,
    minHeightIn: 12,
    volumePerAnimal: 28000,
  },
  diet: ['worms', 'greens', 'fruit'],
  lifecycle: [
    { id: 'hatchling', days: 3, scale: 0.5 },
    { id: 'juvenile', days: 9, scale: 0.75 },
    { id: 'adult', days: null, scale: 1 },
  ],
  variants: [
    { id: 'eastern', name: 'Eastern', description: 'Orange and yellow on brown.', morph: { color: 'eastern', pattern: 'none' } },
    { id: 'olive', name: 'Olive', description: 'Darker, olive shell.', morph: { color: 'olive', pattern: 'none' } },
  ],
  genetics: {
    traits: {
      color: {
        alleles: ['eastern', 'olive'],
        dominance: ['eastern', 'olive'],
        palette: {
          'eastern': { ...ramp(['#1c1610','#3a2c1c','#5a4428','#7a6038'], 0), ...ramp(['#8a4a10','#d07a14','#f0b830','#ffd860'], 4) },
          'olive': { ...ramp(['#1a1a0c','#3a3a1c','#5a5a2c','#7c7c40'], 0), ...ramp(['#6a5a14','#a08a20','#c8b038','#e8d870'], 4) },
        },
      },
    },
  },
};
