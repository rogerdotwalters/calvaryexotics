/**
 * data/environmentRules.js
 * Purpose: every number the tank simulation uses, in one place, so balance
 *          changes never touch engine code.
 * Inputs:  none (pure data)
 * Outputs: RULES, COMFORT, METERS, DAY
 * Notes:   temperature is in degrees Fahrenheit; other levels are 0-100.
 *          Rates are per second of real time. Everything is gentle: values
 *          drift slowly and nothing here can hurt an animal.
 *          ambient is the default room temperature; the player sets it with the wall
 *          thermostat (state.room.ambient) and the night setpoint is nightDrop lower.
 *          thermal feeds systems/thermal.js (how a closed tank holds lamp heat).
 *          COMFORT is a generic range used for the meter colors until species
 *          define their own needs.
 */
export const RULES = {
  ambient: { day: 73, nightDrop: 5, min: 55, max: 90 },
  refVolume: 7776, // 18x18x24 inches; larger tanks react more slowly, smaller ones faster
  thermal: {
    airShare: 0.6, // share of a lamp's watts that ends up warming the tank's air (a fixture can set its own)
    stratification: 0.4, // top-to-floor air difference, as a share of the enclosure rise (for a 24 inch tank)
    refHeight: 24, // inches
  },
  tau: { temperature: 45, humidity: 90 }, // seconds to settle toward the target
  humidity: { base: 52, avgMax: 20, freshLitter: 4, ventLoss: 28 }, // ventLoss: points lost if every face were screen // what items add: data/humidityRules.js
  substrateMoisture: { none: -10, bioactive: 8, coco: 10, topsoil: 4, sand: -12 },
  drainageMoisture: { none: 0, 'clay-balls': 2, pebbles: 1 },
  decay: { waste: 0.012, foodSpoil: 0.02, water: 0.015, litter: 0.008, animalWaste: 0.01, animalEats: 0.015, isopodLitter: 0.00004 },
  cleanupPerCrew: 0.0006, // waste each cleanup-crew animal removes per second
  // Predators catch a small share of a colony each time and gain food from it.
  predation: { eatFraction: 0.01, maxBite: 6, foodPerPrey: 0.8 },
  mist: { humidity: 25, water: 20 },
  feed: { food: 100, mess: 2 },
};

export const COMFORT = {
  temperature: [72, 84],
  humidity: [50, 85],
  cleanliness: [40, 100],
  food: [20, 100],
  water: [20, 100],
};

export const METERS = [
  { key: 'temperature', label: 'Temp', unit: '', min: 50, max: 110 },
  { key: 'humidity', label: 'Hum', unit: '', min: 0, max: 100 },
  { key: 'cleanliness', label: 'Cln', unit: '', min: 0, max: 100 },
  { key: 'food', label: 'Food', unit: '', min: 0, max: 100 },
  { key: 'water', label: 'Wtr', unit: '', min: 0, max: 100 },
  { key: 'health', label: 'Hlth', unit: '', min: 0, max: 100 },
];

/** One full day takes `seconds` of real time. Day runs from dayStart to dayEnd. */
export const DAY = { seconds: 360 };
