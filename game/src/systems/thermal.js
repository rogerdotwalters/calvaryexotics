/**
 * systems/thermal.js
 * Purpose: the tank as a volume of air inside walls. Works out how big the tank
 *          is, how fast heat leaks through each face, and so how much a closed
 *          tank warms above the room when its lamps are on. No rendering, no DOM.
 * Inputs:  station, on (which lamps are on, see gradient.js), registry
 * Outputs: tankGeometry(size) -> { width, depth, height, volumeIn3, liters, gallons, faces (in2) },
 *          analyzeTank(station, on, registry) -> {
 *            ...geometry, ua (W per C, all faces), faceUA, airflow (share of the surface that is screen), heatW (watts into the air),
 *            rise (F above the room), stratification (F, top minus floor), tau (response speed) },
 *          describeTank(station, state, registry) -> [[label, value]] for the Tank tab
 * Notes:   steady state: heat in = heat out, so rise = heatW / ua. A big tank has
 *          more wall, so it rises less than a small one for the same lamp. Warm
 *          air collects at the top, so the air is warmest under the lid; taller
 *          tanks stratify more. Every face is glass today, so the tank is fully
 *          enclosed; a face made of 'screen' (see data/tankSizes.js) leaks far
 *          more heat. Temperatures are Fahrenheit, as everywhere else.
 */
import { RULES } from '../data/environmentRules.js';
import { SURFACES } from '../data/tankSizes.js';
import { clamp } from '../utils/math.js';

const IN2_TO_M2 = 0.00064516;
const IN3_TO_LITERS = 0.016387;
const IN3_PER_GALLON = 231;
const C_TO_F = 1.8;

export function tankGeometry(size) {
  const { width, depth, height } = size;
  const volumeIn3 = width * depth * height;
  return {
    width, depth, height, volumeIn3,
    liters: volumeIn3 * IN3_TO_LITERS,
    gallons: volumeIn3 / IN3_PER_GALLON,
    faces: { front: width * height, back: width * height, left: depth * height, right: depth * height, top: width * depth, bottom: width * depth },
  };
}

/** Watts of lamp power that end up warming the air, counting only lamps that are on. */
function airHeat(station, on, registry) {
  return station.lighting.lamps.reduce((sum, lamp, i) => {
    if (!on?.[i] || lamp.type === 'none') return sum;
    const fixture = registry.get('lights', lamp.type);
    return sum + lamp.watts * (fixture.airShare ?? RULES.thermal.airShare);
  }, 0);
}

export function analyzeTank(station, on, registry) {
  const size = registry.get('tankSizes', station.tank.size);
  const material = registry.get('tankMaterials', station.tank.material);
  const geometry = tankGeometry(size);
  const faceUA = {};
  let ua = 0;
  let screen = 0;
  let total = 0;
  for (const [face, area] of Object.entries(geometry.faces)) {
    faceUA[face] = area * IN2_TO_M2 * (SURFACES[material.faces[face]] ?? SURFACES.glass).u;
    ua += faceUA[face];
    total += area;
    if (material.faces[face] === 'screen') screen += area;
  }
  const airflow = screen / total; // share of the tank's surface that is screen
  const heatW = airHeat(station, on, registry);
  const rise = clamp((heatW / ua) * C_TO_F, 0, 60);
  const stratification = rise * RULES.thermal.stratification * (size.height / RULES.thermal.refHeight);
  // Bigger tanks hold more heat and respond more slowly; smaller ones faster.
  const tau = RULES.tau.temperature * clamp(Math.sqrt(geometry.volumeIn3 / RULES.refVolume), 0.6, 1.8);
  return { ...geometry, ua, faceUA, airflow, heatW, rise, stratification, tau, material: material.name };
}

const f1 = (v) => (Math.round(v * 10) / 10).toString();

/** Plain-language lines for the Tank tab. */
export function describeTank(station, state, registry, on = station.tank.gradient?.on) {
  const t = analyzeTank(station, on, registry);
  const glassIn2 = Object.entries(t.faces).filter(([face]) => face !== 'bottom').reduce((sum, [, a]) => sum + a, 0);
  return [
    ['Volume', `${f1(t.gallons)} gal (${Math.round(t.liters)} L)`],
    ['Walls', `${t.material}, ${Math.round(glassIn2)} sq in`],
    ['Heat loss', `${f1(t.ua)} W per C`],
    ['Airflow', t.airflow <= 0 ? 'Sealed' : `${Math.round(t.airflow * 100)}% screen`],
    ['Room', `${Math.round(state.room.ambient)}F`],
    ['Lamp heat', t.heatW > 0 ? `${Math.round(t.heatW)}W into the air` : 'No lamps on'],
    ['Warms by', `${f1(t.rise)}F above the room`],
    ['Top vs floor', `${f1(t.stratification)}F warmer at the top`],
  ];
}
