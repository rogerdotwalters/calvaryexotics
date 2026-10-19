/**
 * data/species/amphibians.js
 * Purpose: amphibians: the dart frog and the Pac-Man frog, defined entirely as data (see crestedGecko.js for what each
 *          field means). The extra needs a species can list are explained in
 *          systems/needs.js: basking, uvb, minLengthIn, openSpace, substrate, airflow.
 * Inputs:  none (pure data)
 * Outputs: DART_FROG, PACMAN_FROG
 *
 * Care:    numbers come from keeper care sheets (ReptiFiles, Josh's Frogs, PetMD,
 *          Calvary Exotics' own viper gecko guide) and are rounded for the game.
 *          Temperatures are F, humidity is %, UVB is UV Index at the tank's
 *          strongest spot, and lengths are inches. Where sheets disagree the
 *          range is wide enough to include the common recommendations.
 */
const ramp = (hexes, from) => Object.fromEntries(hexes.map((h, i) => [from + i, h]));

export const DART_FROG = {
  id: 'dart-frog',
  name: 'Dart frog',
  description: 'Small, bold and by day. Loves a damp, sealed tank full of plants and hides.',
  category: 'amphibian',
  sprite: 'dart-frog',
  size: { w: 14, h: 9 },
  maxPerTank: 3,
  movement: 'hop',
  zone: 'ground',
  activity: 'diurnal',
  speed: { hop: 18, climb: 6 },
  behaviors: ['hop', 'idle', 'hide'],
  prey: ['isopod'],
  needs: {
    temperature: { range: [70, 78], tolerance: 6 },
    humidity: { range: [75, 98], tolerance: 25 },
    minLengthIn: 18,
    openSpace: { max: 0.5 },
    substrate: ['bioactive', 'coco', 'topsoil'],
    airflow: { max: 0.2 },
    hides: 4,
    climbing: 1,
    foliage: 4,
    food: true,
    water: true,
    minHeightIn: 12,
    volumePerAnimal: 2000,
  },
  diet: ['fruit-flies', 'springtails'],
  lifecycle: [
    { id: 'hatchling', days: 3, scale: 0.5 },
    { id: 'juvenile', days: 9, scale: 0.75 },
    { id: 'adult', days: null, scale: 1 },
  ],
  variants: [
    { id: 'blue', name: 'Blue', description: 'Bright blue with black spots.', morph: { color: 'blue', pattern: 'none' } },
    { id: 'yellow', name: 'Yellow', description: 'Yellow with black spots.', morph: { color: 'yellow', pattern: 'none' } },
    { id: 'orange', name: 'Orange', description: 'Orange with black spots.', morph: { color: 'orange', pattern: 'none' } },
  ],
  genetics: {
    traits: {
      color: {
        alleles: ['blue', 'yellow', 'orange'],
        dominance: ['blue', 'yellow', 'orange'],
        palette: {
          'blue': { ...ramp(['#0c2a6a','#1c5ac8','#3f8aff','#8ac0ff'], 0), ...ramp(['#0a0a14','#0a0a14','#14142a','#202040'], 4) },
          'yellow': { ...ramp(['#6a5a0c','#c8a814','#f0d02c','#fff070'], 0), ...ramp(['#0a0a14','#0a0a14','#14142a','#202040'], 4) },
          'orange': { ...ramp(['#6a2a0c','#c85a14','#f0842c','#ffb470'], 0), ...ramp(['#0a0a14','#0a0a14','#14142a','#202040'], 4) },
        },
      },
    },
  },
};

export const PACMAN_FROG = {
  id: 'pacman-frog',
  name: 'Pac-Man frog',
  description: 'A big, round ambush hunter. Sits still, buried in damp soil, mouth wide.',
  category: 'amphibian',
  sprite: 'pacman-frog',
  size: { w: 24, h: 14 },
  maxPerTank: 1,
  movement: 'hop',
  zone: 'ground',
  activity: 'nocturnal',
  speed: { hop: 10, climb: 4 },
  hopWeight: 0.35,
  behaviors: ['idle', 'hop', 'hide'],
  prey: [],
  needs: {
    temperature: { range: [75, 83], tolerance: 7 },
    humidity: { range: [65, 85], tolerance: 25 },
    minLengthIn: 20,
    substrate: ['bioactive', 'coco', 'topsoil'],
    airflow: { max: 0.35 },
    hides: 2,
    climbing: 0,
    foliage: 2,
    food: true,
    water: true,
    minHeightIn: 8,
    volumePerAnimal: 3500,
  },
  diet: ['insects', 'worms'],
  lifecycle: [
    { id: 'hatchling', days: 3, scale: 0.5 },
    { id: 'juvenile', days: 9, scale: 0.75 },
    { id: 'adult', days: null, scale: 1 },
  ],
  variants: [
    { id: 'green', name: 'Green', description: 'Green with brown blotches.', morph: { color: 'green', pattern: 'none' } },
    { id: 'albino', name: 'Albino', description: 'Cream and yellow, pink eyed.', morph: { color: 'albino', pattern: 'none' } },
    { id: 'strawberry', name: 'Strawberry', description: 'Red-orange and spotted.', morph: { color: 'strawberry', pattern: 'none' } },
  ],
  genetics: {
    traits: {
      color: {
        alleles: ['green', 'albino', 'strawberry'],
        dominance: ['green', 'albino', 'strawberry'],
        palette: {
          'green': { ...ramp(['#243a14','#4a7a22','#6fa83a','#9cd05a'], 0), ...ramp(['#5a3a18','#7a5a26','#9a7a3a','#c0a050'], 4) },
          'albino': { ...ramp(['#8a7a3a','#c8b45a','#e8d880','#f8f0b0'], 0), ...ramp(['#c8a040','#e0b850','#f0d070','#f8e8a0'], 4) },
          'strawberry': { ...ramp(['#5a1a10','#a03a20','#d86a38','#f09a64'], 0), ...ramp(['#7a2a14','#a8481e','#d0702e','#e8984a'], 4) },
        },
      },
    },
  },
};
