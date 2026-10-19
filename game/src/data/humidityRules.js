/**
 * data/humidityRules.js
 * Purpose: what each item does to humidity, in one place so the map, the tank
 *          average and the legend always agree.
 * Inputs:  none (pure data)
 * Outputs: HUMIDITY_EFFECTS, SOIL_ZONE, SOIL_DEPTH_CELLS, AIR_REACH,
 *          humidityEffect(catalog, entry) -> { air, soil, avg }
 *          HUMIDITY_NOTES (lines for the legend)
 * Effect:  air   humidity points added in the air around the item (peak, falls off with distance)
 *          soil  humidity points added in the soil right under the item, but only
 *                while it rests on the ground
 *          avg   points added to the whole tank's average humidity
 * Rules:   moss raises humidity the most, sphagnum most of all; ferns less; bromeliads
 *          a little (water in their leaf cups); mossy rocks hold far more water
 *          underneath than bare rocks; any rock, stick or hide resting on the ground
 *          leaves damp soil under it but does not change the air; pothos and snake
 *          plants do nothing. Sand is a drier soil than the damp substrates.
 */
export const HUMIDITY_EFFECTS = {
  // moss: air and soil, strongest of all
  'sphagnum': { air: 10, soil: 20, avg: 4 },
  'sheet-moss': { air: 7, soil: 15, avg: 3 },
  'cushion-moss': { air: 7, soil: 15, avg: 3 },
  'mood-moss': { air: 7, soil: 15, avg: 3 },
  'fern-moss': { air: 7, soil: 15, avg: 3 },
  // ferns and bromeliads: air only
  'fern': { air: 4, avg: 2 },
  'neoregelia': { air: 1.5, avg: 0.6 },
  'guzmania': { air: 1.5, avg: 0.6 },
  'aechmea': { air: 1.5, avg: 0.6 },
  'vriesea': { air: 1.5, avg: 0.6 },
  'cryptanthus': { air: 1.5, avg: 0.6 },
  // mossy rocks and logs hold water underneath
  'mossy-rock': { soil: 12, avg: 1 },
  'mossy-boulder': { soil: 12, avg: 1 },
  'mossy-log': { soil: 12, avg: 1 },
  // snake plant and pothos: no effect (not listed)
};

/** Bare rocks, sticks and hides resting on the ground: a little damp under them, nothing in the air. */
const RESTING_SOIL = 5;
const RESTING_CATALOGS = new Set(['rocks', 'decor']);

export function humidityEffect(catalog, entry) {
  const listed = HUMIDITY_EFFECTS[entry.id];
  if (listed) return { air: 0, soil: 0, avg: 0, ...listed };
  if (RESTING_CATALOGS.has(catalog) && entry.anchor === 'ground') return { air: 0, soil: RESTING_SOIL, avg: 0 };
  return { air: 0, soil: 0, avg: 0 };
}

/** Points added to a soil zone by the substrate, relative to the tank average. Sand is about 9 lower than damp substrates. */
export const SOIL_ZONE = { none: 0, sand: -3, default: 6 };

/** How many 1-inch rows of soil the damp patch under an item shows. */
export const SOIL_DEPTH_CELLS = 3;

/** An item counts as resting on the ground within this many pixels of the soil surface. */
export const RESTING_TOLERANCE_PX = 4;

/** Distance (inches) over which an item's air effect fades, per inch of its width. */
export const AIR_REACH = 0.5;

export const HUMIDITY_NOTES = [
  ['Raises', 'Moss most, sphagnum highest. Ferns less. Bromeliads a little.'],
  ['Damp soil', 'Under moss, mossy rocks, and rocks, sticks and hides resting on the ground.'],
  ['Lowers', 'Sand (drier soil), lamps and hot spots.'],
  ['No effect', 'Pothos, snake plants, and rocks lifted off the ground.'],
];
