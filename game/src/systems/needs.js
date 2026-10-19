/**
 * systems/needs.js
 * Purpose: how well a tank meets a species' needs, and so how content an
 *          animal is. Generic and driven by species data. No rendering, no DOM.
 * Inputs:  evaluateNeeds(animal, station, ctx), canAddAnimal(station, species, registry)
 * Outputs: { scores, mood, worst }; moodWord(mood); needAdvice(key, station, species)
 * Needs:   always scored: temperature, humidity, hides, climbing, foliage, food,
 *          water, cleanliness, space (tank height). Scored only when a species
 *          lists them (see data/species/*.js):
 *            basking     the tank's hottest spot, range + tolerance (F)
 *            uvb         the strongest UVB in the tank, range + tolerance (UV Index)
 *            minLengthIn the longest side of the floor, in inches
 *            openSpace   { min } at least that share of the floor is open, or
 *                        { max } no more than that share is open (cover-lovers)
 *            substrate   list of substrate ids it does well on
 *            airflow     { min } screen share of the walls (needs mesh), or { max } (needs sealed glass)
 *          At night (day/night cycle on) the temperature range drops by
 *          needs.nightDrop (default 8F) and basking and UVB are not needed.
 * Notes:   scores run 0 (bad) to 1 (fine). Unhappy animals hide and stop
 *          breeding; nothing here can hurt them.
 */
import { clamp } from '../utils/math.js';
import { cellTemperature, hotSpot, CELL } from './gradient.js';

export const rangeScore = (value, [lo, hi], tolerance) => {
  if (value >= lo && value <= hi) return 1;
  const off = value < lo ? lo - value : value - hi;
  return clamp(1 - off / tolerance, 0, 1);
};

const WEIGHTS = { temperature: 3, humidity: 3, hides: 1.5, climbing: 1.5, foliage: 1, food: 2, water: 2, cleanliness: 1, space: 1 };
// Extra needs, counted only for species that list them.
const OPTIONAL = { basking: 2, uvb: 2, length: 1, openSpace: 1, substrate: 1, airflow: 1.5 };
const NEED_FIELD = { basking: 'basking', uvb: 'uvb', length: 'minLengthIn', openSpace: 'openSpace', substrate: 'substrate', airflow: 'airflow' };

/** Share of a limit: 1 when the value reaches `min`, less below it. */
const atLeast = (value, min) => (min <= 0 ? 1 : clamp(value / min, 0, 1));
/** 1 while value is at or under `max`, falling to 0 once it is `span` over. */
const atMost = (value, max, span) => clamp(1 - Math.max(0, value - max) / span, 0, 1);

export function evaluateNeeds(animal, ctx) {
  const n = ctx.species.needs;
  const env = ctx.env;
  const x = animal.hidden ? animal.x : animal.x;
  const temp = cellTemperature(env, ctx.gradient, Math.floor(x / CELL), Math.floor(animal.y / CELL));
  const count = (tag) => ctx.items.filter((i) => i.tags.includes(tag)).length;
  const fill = (have, need) => (need <= 0 ? 1 : clamp(have / need, 0, 1));

  const shift = ctx.night ? (n.nightDrop ?? 8) : 0;
  const scores = {
    temperature: rangeScore(temp, n.temperature.range.map((v) => v - shift), n.temperature.tolerance),
    humidity: rangeScore(env.humidity, n.humidity.range, n.humidity.tolerance),
    hides: fill(count('hide'), n.hides),
    climbing: fill(count('climb') + count('perch'), n.climbing),
    foliage: fill(count('cover'), n.foliage),
    food: n.food ? clamp((n.foodFrom === 'litter' ? env.litter : env.food) / (n.foodFrom === 'litter' ? 30 : 20), 0, 1) : 1,
    water: n.water ? clamp(env.water / 20, 0, 1) : 1,
    cleanliness: clamp(env.cleanliness / 40, 0, 1),
    space: clamp(ctx.tankHeightIn / n.minHeightIn, 0, 1),
  };
  if (n.basking) scores.basking = ctx.night ? 1 : rangeScore(ctx.hotTemp, n.basking.range, n.basking.tolerance);
  if (n.uvb) scores.uvb = ctx.night ? 1 : rangeScore(ctx.maxUvb, n.uvb.range, n.uvb.tolerance);
  if (n.minLengthIn) scores.length = atLeast(ctx.lengthIn, n.minLengthIn);
  if (n.openSpace) scores.openSpace = n.openSpace.min !== undefined ? atLeast(ctx.openFrac, n.openSpace.min) : atMost(ctx.openFrac, n.openSpace.max, 1 - n.openSpace.max);
  if (n.substrate) scores.substrate = n.substrate.includes(ctx.substrate) ? 1 : 0.35;
  if (n.airflow) scores.airflow = n.airflow.min !== undefined ? atLeast(ctx.airflow, n.airflow.min) : atMost(ctx.airflow, n.airflow.max, 0.4);

  const weights = { ...WEIGHTS };
  for (const [key, w] of Object.entries(OPTIONAL)) if (n[NEED_FIELD[key]]) weights[key] = w;
  let total = 0;
  let weight = 0;
  let worst = 'temperature';
  for (const [key, w] of Object.entries(weights)) {
    total += scores[key] * w;
    weight += w;
    if (scores[key] < scores[worst]) worst = key;
  }
  // A cleanup crew in the same tank makes everyone a little happier.
  const crewBonus = ctx.species.role === 'cleanup' ? 0 : Math.min(0.08, (ctx.crew ?? 0) / 300);
  return { scores, mood: Math.min(1, total / weight + crewBonus), worst };
}

export const moodWord = (mood) => (mood >= 0.75 ? 'Happy' : mood >= 0.5 ? 'Okay' : 'Stressed');

/** A short, friendly tip for the weakest need. */
export function needAdvice(key, station, species) {
  const env = station.tank.environment;
  const n = species.needs;
  switch (key) {
    case 'temperature':
      return env.temperature < n.temperature.range[0] ? 'Too cool. Add or strengthen a lamp.' : 'Too warm. Use a lower wattage.';
    case 'humidity':
      return env.humidity < n.humidity.range[0] ? 'Too dry. Try misting.' : 'Too damp. Use less mist.';
    case 'hides': return 'Needs a hide. Try a cork or coconut hide.';
    case 'climbing': return 'Needs more to climb: branches or ledges.';
    case 'foliage': return 'Needs plants for cover.';
    case 'food': return n.foodFrom === 'litter' ? 'Out of leaf litter. Add some.' : 'Hungry. Feed the tank.';
    case 'water': return 'Thirsty. Mist the tank.';
    case 'cleanliness': return 'The tank is dirty. Clean it.';
    case 'space': return `Short tank. ${n.minHeightIn} in tall is better.`;
    case 'basking':
      return hotSpot(env, station.tank.gradient).temp < n.basking.range[0] ? 'No warm basking spot. Add a basking lamp.' : 'The basking spot is too hot. Use a lower wattage.';
    case 'uvb':
      return (station.tank.gradient?.maxUvb ?? 0) > n.uvb.range[1] ? 'UVB is too strong. Use a weaker tube or fewer watts.' : 'Needs more UVB. Add or strengthen a UVB lamp.';
    case 'length': return `Needs a longer floor: ${n.minLengthIn} in or more.`;
    case 'openSpace':
      return n.openSpace.min !== undefined ? 'Needs open floor to roam. Take some decor out.' : 'Feels exposed. Add plants, moss and hides.';
    case 'substrate': return `Wrong substrate. Try ${n.substrate.join(' or ')}.`;
    case 'airflow': return n.airflow.min !== undefined ? 'Needs airflow. Use a mesh enclosure.' : 'Needs a sealed tank. Mesh dries the air too much.';
    default: return '';
  }
}

/** The care a species needs, as short lines for the Animals tab. */
export function careSummary(species) {
  const n = species.needs;
  const span = ([lo, hi]) => `${lo}-${hi}`;
  const lines = [`Warmth ${span(n.temperature.range)}F${n.basking ? `, basking ${span(n.basking.range)}F` : ''}`, `Humidity ${span(n.humidity.range)}%`];
  if (n.uvb) lines.push(`UVB ${span(n.uvb.range)} UVI`);
  lines.push(`Tank ${n.minLengthIn ? `${n.minLengthIn} in long, ` : ''}${n.minHeightIn} in tall`);
  const things = [[n.hides, 'hides'], [n.climbing, 'to climb'], [n.foliage, 'plants']].filter(([count]) => count > 0);
  if (things.length) lines.push(things.map(([count, what]) => `${count} ${what}`).join(', '));
  if (n.openSpace) lines.push(n.openSpace.min !== undefined ? 'Open floor to roam' : 'Plenty of cover');
  if (n.airflow) lines.push(n.airflow.min !== undefined ? 'Mesh enclosure' : 'Sealed tank');
  if (n.substrate) lines.push(`Substrate: ${n.substrate.join(', ')}`);
  return lines;
}

/** Can this tank take another of this species? (capacity from tank volume) */
export function canAddAnimal(station, species, registry) {
  const size = registry.get('tankSizes', station.tank.size);
  const volume = size.width * size.depth * size.height;
  const capacity = Math.min(species.maxPerTank ?? Infinity, Math.max(1, Math.floor(volume / species.needs.volumePerAnimal)));
  const have = station.animals.filter((a) => a.species === species.id).length;
  return have < capacity
    ? { ok: true, capacity }
    : { ok: false, capacity, reason: `Full: this tank holds ${capacity} ${species.colony ? 'colonies of ' : ''}${species.name.toLowerCase()}${species.colony || capacity === 1 ? '' : 's'}.` };
}
