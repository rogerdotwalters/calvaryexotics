/**
 * data/referenceRanges.js
 * Purpose: the fixed reference numbers behind the "Ranges" view: Ferguson's UVB
 *          zones and the axes of the range charts. Species ranges themselves come
 *          from each species' needs (data/species/*.js), so the chart and the
 *          animals' scoring can never disagree.
 * Inputs:  none (pure data)
 * Outputs: FERGUSON_ZONES, RANGE_CHARTS, RANGE_SOURCES
 * Zones:   average and maximum UV Index for each Ferguson zone, from Ferguson et al.
 *          (2010) as summarised by Exo Terra and Reptile Centre. Zone 1: shade
 *          dwellers and twilight animals; 2: occasional baskers; 3: open or partial
 *          sun baskers; 4: midday sun baskers. A zone's average is what the animal
 *          usually sits in; the maximum is the brightest spot it can reach.
 */
export const FERGUSON_ZONES = [
  { zone: 1, name: 'Shade and twilight', avg: [0, 0.7], max: [0.6, 1.4], examples: 'crested gecko, leopard gecko' },
  { zone: 2, name: 'Occasional basker', avg: [0.7, 1.0], max: [1.1, 3.0], examples: 'green anole, ornate box turtle' },
  { zone: 3, name: 'Open or partial sun', avg: [1.0, 2.6], max: [2.9, 7.4], examples: 'Yemen chameleon, tegu' },
  { zone: 4, name: 'Midday sun', avg: [2.6, 3.5], max: [4.5, 9.5], examples: 'uromastyx, chuckwalla' },
];

/** The three charts: what each plots, its axis, and where each species' range comes from. */
export const RANGE_CHARTS = [
  { id: 'heat', name: 'Heat', unit: 'F', min: 50, max: 115, ticks: [60, 70, 80, 90, 100, 110] },
  { id: 'uvb', name: 'UVB', unit: ' UVI', min: 0, max: 8, ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  { id: 'humidity', name: 'Humidity', unit: '%', min: 0, max: 100, ticks: [0, 25, 50, 75, 100] },
];

export const RANGE_SOURCES = 'Care sheets from ReptiFiles, Josh\'s Frogs, PetMD and Calvary Exotics, and Ferguson\'s UVB zones (Exo Terra, Reptile Centre).';
