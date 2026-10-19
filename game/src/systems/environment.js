/**
 * systems/environment.js
 * Purpose: how a tank's temperature, humidity, cleanliness, food and water
 *          change over time. No rendering, no DOM.
 * Inputs:  environmentInputs(state, station, registry) -> targets and flags
 *          stepEnvironment(env, inputs, dt) -> next environment
 * Outputs: plain objects; values stay in range and nothing ever fails.
 * Notes:   temperature settles toward the room temperature (the wall thermostat,
 *          state.room.ambient) plus how much the closed tank holds in the lamp heat
 *          (systems/thermal.js); humidity toward a target from substrate, what the
 *          items add (data/humidityRules.js), fresh litter and how much the lamps
 *          dry the air.
 *          Waste builds slowly, more with food sitting out, less with fresh
 *          litter, and cleanup-crew animals (isopods, added later) remove it.
 */
import { clamp } from '../utils/math.js';
import { COMFORT, RULES } from '../data/environmentRules.js';
import { isDay } from './daylight.js';
import { computeGradient } from './gradient.js';
import { analyzeTank } from './thermal.js';
import { humidityBoost } from './humidity.js';

/** Total number of cleanup-crew animals (isopods) in a station. */
export function crewCount(station, registry) {
  return station.animals.reduce((sum, a) => {
    const species = registry.list('animals').find((s) => s.id === a.species);
    return species?.role === 'cleanup' ? sum + Math.floor(a.count ?? 1) : sum;
  }, 0);
}

/** One number for how healthy the tank is: clean, comfortable, with a crew to keep it that way. */
export function tankHealth(env, crew) {
  const fit = (v, [lo, hi], tol) => (v >= lo && v <= hi ? 1 : clamp(1 - (v < lo ? lo - v : v - hi) / tol, 0, 1));
  return clamp(
    0.4 * (env.cleanliness / 100) + 0.2 * fit(env.humidity, COMFORT.humidity, 25) + 0.2 * fit(env.temperature, COMFORT.temperature, 10)
      + 0.2 * Math.min(1, crew / 30),
    0, 1,
  );
}

export function environmentInputs(state, station, registry) {
  const { tank } = station;
  const size = registry.get('tankSizes', tank.size);
  const gradient = tank.gradient ?? computeGradient(station, state, registry);
  const night = Boolean(state.settings?.dayNight) && !isDay(state.time ?? 0.4);
  const H = RULES.humidity;
  const dryness = station.lighting.lamps.reduce((sum, lamp, i) => (
    gradient.on?.[i] ? sum + registry.get('lights', lamp.type).dryK * lamp.watts : sum), 0);

  const room = state.room?.ambient ?? RULES.ambient.day;
  const thermal = analyzeTank(station, gradient.on, registry);

  return {
    // The tank's average air temperature: the room (a little cooler at night) plus the heat the closed tank holds in.
    tempTarget: (night ? room - RULES.ambient.nightDrop : room) + thermal.rise,
    tauTemp: thermal.tau,
    humTarget: clamp(
      H.base
        + (RULES.substrateMoisture[tank.substrate] ?? 0)
        + (RULES.drainageMoisture[tank.drainage] ?? 0)
        + humidityBoost(station, registry)
        - RULES.humidity.ventLoss * thermal.airflow // screen lets moist air out
        + ((tank.environment.litter ?? 0) > 30 ? H.freshLitter : 0)
        - dryness,
      10, 98,
    ),
    crew: crewCount(station, registry),
    animals: station.animals.length,
    volume: size.width * size.depth * size.height,
  };
}

const approach = (value, target, tau, dt) => value + (target - value) * (1 - Math.exp(-dt / tau));

export function stepEnvironment(env, inputs, dt) {
  const litter = env.litter ?? 0;
  const wasteRate = (RULES.decay.waste * (env.food > 0 ? 1.5 : 1) + (inputs.animals ?? 0) * RULES.decay.animalWaste) * (litter > 30 ? 0.7 : 1);
  const netWaste = Math.max(0, wasteRate - inputs.crew * RULES.cleanupPerCrew);
  const litterEaten = inputs.crew * RULES.decay.isopodLitter;
  return {
    ...env,
    temperature: clamp(approach(env.temperature, inputs.tempTarget, inputs.tauTemp ?? RULES.tau.temperature, dt), 50, 110),
    humidity: clamp(approach(env.humidity, inputs.humTarget, RULES.tau.humidity, dt), 0, 100),
    cleanliness: clamp(env.cleanliness - netWaste * dt, 0, 100),
    food: clamp(env.food - (RULES.decay.foodSpoil + (inputs.animals ?? 0) * RULES.decay.animalEats) * dt, 0, 100),
    water: clamp(env.water - RULES.decay.water * (env.temperature / 75) * dt, 0, 100),
    litter: clamp(litter - (RULES.decay.litter + litterEaten) * dt, 0, 100),
  };
}
