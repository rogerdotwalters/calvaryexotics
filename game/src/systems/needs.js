/**
 * systems/needs.js
 * Purpose: how well a tank meets a species' needs, and so how content an
 *          animal is. Generic and driven by species data. No rendering, no DOM.
 * Inputs:  evaluateNeeds(animal, station, ctx), canAddAnimal(station, species, registry)
 * Outputs: { scores, mood, worst }; moodWord(mood); needAdvice(key, station, species)
 * Notes:   scores run 0 (bad) to 1 (fine). Unhappy animals hide and stop
 *          breeding; nothing here can hurt them.
 */
import { clamp } from '../utils/math.js';
import { cellTemperature, CELL } from './gradient.js';

export const rangeScore = (value, [lo, hi], tolerance) => {
  if (value >= lo && value <= hi) return 1;
  const off = value < lo ? lo - value : value - hi;
  return clamp(1 - off / tolerance, 0, 1);
};

const WEIGHTS = { temperature: 3, humidity: 3, hides: 1.5, climbing: 1.5, foliage: 1, food: 2, water: 2, cleanliness: 1, space: 1 };

export function evaluateNeeds(animal, ctx) {
  const n = ctx.species.needs;
  const env = ctx.env;
  const x = animal.hidden ? animal.x : animal.x;
  const temp = cellTemperature(env, ctx.gradient, Math.floor(x / CELL), Math.floor(animal.y / CELL));
  const count = (tag) => ctx.items.filter((i) => i.tags.includes(tag)).length;
  const fill = (have, need) => (need <= 0 ? 1 : clamp(have / need, 0, 1));

  const scores = {
    temperature: rangeScore(temp, n.temperature.range, n.temperature.tolerance),
    humidity: rangeScore(env.humidity, n.humidity.range, n.humidity.tolerance),
    hides: fill(count('hide'), n.hides),
    climbing: fill(count('climb') + count('perch'), n.climbing),
    foliage: fill(count('cover'), n.foliage),
    food: n.food ? clamp((n.foodFrom === 'litter' ? env.litter : env.food) / (n.foodFrom === 'litter' ? 30 : 20), 0, 1) : 1,
    water: n.water ? clamp(env.water / 20, 0, 1) : 1,
    cleanliness: clamp(env.cleanliness / 40, 0, 1),
    space: clamp(ctx.tankHeightIn / n.minHeightIn, 0, 1),
  };
  let total = 0;
  let weight = 0;
  let worst = 'temperature';
  for (const [key, w] of Object.entries(WEIGHTS)) {
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
    default: return '';
  }
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
