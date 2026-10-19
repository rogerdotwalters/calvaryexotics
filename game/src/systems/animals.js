/**
 * systems/animals.js
 * Purpose: moves animals and updates how they feel. Each step an animal either
 *          carries on with what it is doing or picks a new behavior from the
 *          modules its species lists. No rendering, no DOM.
 * Inputs:  stepAnimals(station, state, registry, dt) -> { animals, foodGain }
 * Outputs: animals with updated position (fx, fy as fractions of the tank
 *          interior), heading, mode, hidden, mood, needs and seed.
 * Notes:   predators (species.prey) hunt prey colonies that are out in the
 *          open and eat a few at a time; foodGain is what they got from it.
 *          activity follows the day/night cycle: a nocturnal animal is busy at
 *          night and mostly hides by day. With the cycle off it is moderately
 *          active so you can still watch it. Hot-spot comfort uses the saved
 *          gradient (tank.gradient).
 */
import { clamp } from '../utils/math.js';
import { createRng } from '../utils/rng.js';
import { BEHAVIORS } from '../behaviors/index.js';
import { tagsOf } from '../data/itemTags.js';
import { itemRect } from '../core/itemGeometry.js';
import { interiorHeight, interiorWidth, soilBand, stackHeight } from '../core/geometry.js';
import { DAY, RULES } from '../data/environmentRules.js';
import { isDay } from './daylight.js';
import { evaluateNeeds } from './needs.js';
import { crewCount } from './environment.js';
import { hotSpot } from './gradient.js';
import { restsOnGround } from './humidity.js';
import { analyzeTank } from './thermal.js';

export function activityLevel(species, state) {
  if (!state.settings?.dayNight) return 0.55;
  const day = isDay(state.time ?? 0.4);
  if (species.activity === 'nocturnal') return day ? 0.15 : 1;
  if (species.activity === 'diurnal') return day ? 1 : 0.15;
  return 0.6;
}

function contextFor(station, state, registry, species) {
  const tank = station.tank;
  const w = interiorWidth(tank, registry);
  const h = interiorHeight(tank, registry);
  const interior = { x: 0, y: 0, w, h };
  const items = station.placedItems.flatMap((p) => {
    const entry = registry.list(p.catalog)?.find((e) => e.id === p.itemId);
    if (!entry) return [];
    const r = itemRect(interior, p, entry);
    return [{ id: p.id, tags: tagsOf(p.itemId), rect: r, onGround: restsOnGround(p, entry, h - stackHeight(tank, registry), h) }];
  });
  const speciesOf = (a) => registry.list('animals').find((sp) => sp.id === a.species);
  // Prey this species can hunt: colonies out in the open and above their floor.
  const prey = (species.prey ?? []).length === 0 ? [] : station.animals.flatMap((a) => {
    const sp = speciesOf(a);
    const floor = sp?.colony?.floor ?? 0;
    return species.prey.includes(a.species) && !a.hidden && a.surface !== 'soil' && (a.count ?? 1) > floor
      ? [{ id: a.id, x: a.fx * w, y: a.fy * h, count: a.count ?? 1, floor, surface: a.surface }]
      : [];
  });
  // Awake predators in the tank make prey nervous (they burrow).
  const threat = station.animals.some((a) => !a.hidden && speciesOf(a)?.prey?.includes(species.id) && a.mode === 'hunt') ? 1 : 0;
  return {
    species, items, w, h, prey, threat,
    groundY: h - stackHeight(tank, registry),
    env: tank.environment,
    gradient: tank.gradient,
    activity: activityLevel(species, state),
    tankHeightIn: registry.get('tankSizes', tank.size).height,
    soil: soilBand(tank, registry),
    areaIn2: registry.get('tankSizes', tank.size).width * registry.get('tankSizes', tank.size).depth,
    crew: crewCount(station, registry),
    night: Boolean(state.settings?.dayNight) && !isDay(state.time ?? 0.4),
    hotTemp: hotSpot(tank.environment, tank.gradient).temp,
    maxUvb: tank.gradient?.maxUvb ?? 0,
    lengthIn: Math.max(registry.get('tankSizes', tank.size).width, registry.get('tankSizes', tank.size).depth),
    openFrac: openFloor(items, w),
    substrate: tank.substrate,
    airflow: analyzeTank(station, tank.gradient?.on, registry).airflow,
  };
}

/** Share of the floor width not covered by anything standing on the ground. */
function openFloor(items, width) {
  const spans = items.filter((i) => i.onGround).map((i) => [i.rect.x, i.rect.x + i.rect.w]).sort((a, b) => a[0] - b[0]);
  let covered = 0;
  let end = -Infinity;
  for (const [from, to] of spans) {
    const start = Math.max(from, end);
    if (to > start) covered += to - start;
    end = Math.max(end, to);
  }
  return Math.max(0, 1 - covered / Math.max(1, width));
}

function chooseBehavior(animal, ctx) {
  const names = ctx.species.behaviors.filter((n) => BEHAVIORS[n]);
  const scored = names.map((n) => [n, Math.max(0, BEHAVIORS[n].score(animal, ctx)) ** 2]);
  const total = scored.reduce((s, [, v]) => s + v, 0);
  if (total <= 0) return BEHAVIORS.idle;
  let roll = ctx.rng.next() * total;
  for (const [n, v] of scored) { roll -= v; if (roll <= 0) return BEHAVIORS[n]; }
  return BEHAVIORS[scored.at(-1)[0]];
}

/**
 * Logistic growth: fast while the colony is small and comfortable, slowing as
 * it nears what the tank can feed. Too little leaf litter shrinks the target,
 * so a big colony thins out slowly to match, but never below the floor.
 */
function growColony(animal, ctx, comfort, dt) {
  const c = ctx.species.colony;
  const n = animal.count ?? c.start;
  const food = clamp(ctx.env.litter / 50, 0.15, 1.5);
  const capacity = ctx.areaIn2 * c.perAreaIn2 * food;
  const perDay = dt / DAY.seconds;
  const change = n < capacity
    ? c.growthPerDay * n * (1 - n / capacity) * comfort ** 1.5 * perDay
    : -0.3 * (n - capacity) * perDay;
  return Math.max(c.floor, n + change);
}

function stepOne(raw, ctx, dt, effects) {
  const rng = createRng(raw.seed);
  const c = { ...ctx, rng, effects };
  let a = { ...raw, x: raw.fx * ctx.w, y: raw.fy * ctx.h };

  const { scores, mood, worst } = evaluateNeeds(a, c);
  a.mood = a.mood + (mood - a.mood) * Math.min(1, dt / 20);
  a.needs = scores;
  a.worst = worst;
  a.age = (a.age ?? 0) + dt / DAY.seconds;
  if (ctx.species.colony) a.count = growColony(a, ctx, mood, dt);

  if (a.hidden) { // out of sight: wait, and wake when it is time to be active
    const timer = a.timer - dt;
    const wake = timer <= 0 || (ctx.activity > 0.7 && rng.next() < 0.08);
    a = wake ? { ...a, hidden: null, mode: 'idle', target: null, timer: 1 } : { ...a, timer };
  } else {
    const current = BEHAVIORS[a.mode];
    let done = !current;
    if (current) {
      const result = current.step(a, c, dt);
      a = result.animal;
      done = result.done;
      if (result.effects) c.effects.push(...result.effects);
    }
    if (done) a = chooseBehavior(a, c).begin(a, c);
  }

  return {
    ...a,
    fx: clamp(a.x / ctx.w, 0, 1),
    fy: clamp(a.y / ctx.h, 0, 1),
    seed: rng.seed(),
  };
}

export function stepAnimals(station, state, registry, dt) {
  if (station.animals.length === 0) return { animals: station.animals, foodGain: 0 };
  const effects = [];
  let animals = station.animals.map((animal) => {
    const species = registry.list('animals').find((s) => s.id === animal.species);
    if (!species) return animal;
    const next = stepOne(animal, contextFor(station, state, registry, species), dt, effects);
    const { x, y, ...saved } = next;
    return saved;
  });

  // Catches: prey loses a few (never below its floor); predators gain food.
  const eaten = new Map();
  for (const e of effects) if (e.type === 'eat') eaten.set(e.preyId, (eaten.get(e.preyId) ?? 0) + e.amount);
  if (eaten.size > 0) {
    animals = animals.map((a) => {
      if (!eaten.has(a.id)) return a;
      const floor = registry.list('animals').find((s) => s.id === a.species)?.colony?.floor ?? 0;
      return { ...a, count: Math.max(floor, a.count - eaten.get(a.id)) };
    });
  }
  const foodGain = [...eaten.values()].reduce((sum, n) => sum + n * RULES.predation.foodPerPrey, 0);
  return { animals, foodGain };
}
