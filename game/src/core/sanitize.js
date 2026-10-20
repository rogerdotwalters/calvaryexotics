/**
 * core/sanitize.js
 * Purpose: make any loaded save safe to use: fill missing fields with
 *          defaults, drop items that no longer exist, fix broken references.
 * Inputs:  a migrated state object
 * Outputs: sanitize(state) -> a complete, consistent state
 * Notes:   never throws on odd data; it repairs instead, so a hand-edited or
 *          partly old save still loads.
 */
import { clamp } from '../utils/math.js';
import { MAX_ITEMS_PER_TANK, MAX_ITEM_SCALE, MAX_STATIONS, VIEW_H, VIEW_W, worldSize } from '../data/world.js';
import { registry } from '../data/registry.js';
import { createDefaultState, createStation } from './defaultState.js';
import { LIGHT_COLORS } from '../data/items/lighting.js';
import { DATA_VIEW_ORDER } from '../data/dataViews.js';
import { RULES } from '../data/environmentRules.js';
import { isDay } from '../systems/daylight.js';
import { MAP_OPACITIES } from '../data/dataViews.js';
import { computeGradient, gradientMatches } from '../systems/gradient.js';

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Copy `value` over `defaults`, recursing into plain objects. Arrays are kept as given. */
function fill(value, defaults) {
  if (!isObject(value)) return defaults;
  const out = { ...value };
  for (const [key, def] of Object.entries(defaults)) {
    out[key] = key in value ? (isObject(def) ? fill(value[key], def) : value[key]) : def;
  }
  return out;
}

function cleanAnimals(list, seen) {
  const out = [];
  for (const raw of Array.isArray(list) ? list : []) {
    const species = registry.list('animals').find((x) => x.id === raw?.species);
    if (!species || typeof raw.id !== 'string' || seen.has(raw.id)) continue;
    seen.add(raw.id);
    const colors = species.genetics.traits.color.alleles;
    out.push({
      ...raw,
      fx: clamp(num(raw.fx, 0.5), 0, 1),
      fy: clamp(num(raw.fy, 0.8), 0, 1),
      morph: {
        ...(raw.morph ?? {}),
        color: colors.includes(raw.morph?.color) ? raw.morph.color : colors[0],
        pattern: (species.genetics.traits.pattern?.alleles ?? ['none']).includes(raw.morph?.pattern) ? raw.morph.pattern : 'none',
      },
      settled: Boolean(raw.settled),
      preyId: typeof raw.preyId === 'string' ? raw.preyId : null,
      surface: ['ground', 'item', 'wall', 'soil'].includes(raw.surface) ? raw.surface : 'ground',
      ...(species.colony ? { count: clamp(num(raw.count, species.colony.start), species.colony.floor, 100000) } : {}),
      heading: ['left', 'right', 'up', 'down'].includes(raw.heading) ? raw.heading : 'right',
      mode: typeof raw.mode === 'string' ? raw.mode : 'idle',
      timer: num(raw.timer, 2),
      mood: clamp(num(raw.mood, 0.8), 0, 1),
      age: Math.max(0, num(raw.age, 0)),
      seed: num(raw.seed, 1),
      hidden: typeof raw.hidden === 'string' ? raw.hidden : null,
      target: isObject(raw.target) && Number.isFinite(raw.target.x) && Number.isFinite(raw.target.y) ? raw.target : null,
    });
  }
  return out;
}

const num = (v, fallback) => (Number.isFinite(v) ? v : fallback);
const maxIdNumber = (ids) => ids.reduce((max, id) => Math.max(max, Number(String(id).slice(1)) || 0), 0);

function cleanItems(list, seen) {
  const items = [];
  for (const raw of Array.isArray(list) ? list : []) {
    if (!isObject(raw)) continue;
    const entry = registry.list(raw.catalog)?.find((e) => e.id === raw.itemId);
    if (!entry || typeof raw.id !== 'string' || seen.has(raw.id)) continue;
    seen.add(raw.id);
    items.push({
      id: raw.id,
      catalog: raw.catalog,
      itemId: raw.itemId,
      fx: clamp(num(raw.fx, 0.5), 0, 1),
      fy: clamp(num(raw.fy, 0.5), 0, 1),
      scale: clamp(Math.round(num(raw.scale, 1)), 1, MAX_ITEM_SCALE),
      rotation: ((Math.round(num(raw.rotation, 0)) % 360) + 360) % 360,
      flip: Boolean(raw.flip),
      behind: entry.plane === 'back' ? false : Boolean(raw.behind),
      plane: entry.plane ?? 'main',
    });
    if (items.length >= MAX_ITEMS_PER_TANK) break;
  }
  // Same order the layer logic keeps: wall items, then behind-substrate items, then the rest.
  return [
    ...items.filter((p) => p.plane === 'back'),
    ...items.filter((p) => p.plane !== 'back' && p.behind),
    ...items.filter((p) => p.plane !== 'back' && !p.behind),
  ];
}

function cleanLighting(raw) {
  const lamps = [0, 1].map((i) => {
    const lamp = raw?.lamps?.[i] ?? {};
    const fixture = registry.list('lights').find((f) => f.id === lamp.type) ?? registry.list('lights')[0];
    const watts = fixture.watts.includes(lamp.watts) ? lamp.watts : fixture.defaultWatts;
    const color = LIGHT_COLORS.some((c) => c.id === lamp.color) ? lamp.color : 'warm';
    return { type: fixture.id, color, watts };
  });
  return { lamps, slot: raw?.slot === 1 ? 1 : 0 };
}

export function sanitize(input) {
  const defaults = createDefaultState();
  const state = fill(input, defaults);

  const stationIds = new Set();
  const itemIds = new Set();
  const animalIds = new Set();
  let stations = (Array.isArray(input?.stations) ? input.stations : []).filter(isObject).slice(0, MAX_STATIONS);
  stations = stations.map((raw, i) => {
    let id = typeof raw.id === 'string' && !stationIds.has(raw.id) ? raw.id : `s${i + 1}x`;
    while (stationIds.has(id)) id += 'x';
    stationIds.add(id);
    const station = fill({ ...raw, id }, createStation(id));
    station.placedItems = cleanItems(raw.placedItems, itemIds);
    station.animals = cleanAnimals(raw.animals, animalIds);
    station.lighting = cleanLighting(raw.lighting);
    const env = station.tank.environment;
    env.temperature = clamp(num(env.temperature, 75), 50, 110);
    for (const key of ['humidity', 'cleanliness', 'food', 'water', 'litter']) env[key] = clamp(num(env[key], 100), 0, 100);
    return station;
  });
  if (stations.length === 0) stations = defaults.stations;
  state.stations = stations;

  if (!stations.some((s) => s.id === state.selectedStation)) state.selectedStation = stations[0].id;
  if (state.selectedItem && !itemIds.has(state.selectedItem)) state.selectedItem = null;
  if (!itemIds.has(state.selectedItem)) state.selectedItem = null;

  state.nextStationId = Math.max(num(state.nextStationId, 1), maxIdNumber(stations.map((s) => s.id)) + 1);
  state.nextItemId = Math.max(num(state.nextItemId, 1), maxIdNumber([...itemIds]) + 1);
  state.nextAnimalId = Math.max(num(state.nextAnimalId, 1), maxIdNumber([...animalIds]) + 1);

  // Saves from before the Day/Night switch had a clock and a cycle option; keep where they were.
  const old = input?.settings ?? {};
  state.settings.night = old.night !== undefined ? Boolean(old.night) : Boolean(old.dayNight) && !isDay(num(input?.time, 0.4));
  delete state.settings.dayNight;
  delete state.time;
  state.settings.mapOpacity = MAP_OPACITIES.includes(old.mapOpacity) ? old.mapOpacity : (old.mapEdit === false ? 1 : 0.6);
  delete state.settings.mapEdit;
  state.settings.editItems = old.editItems !== false;
  state.room.ambient = clamp(Math.round(num(state.room.ambient, RULES.ambient.day)), RULES.ambient.min, RULES.ambient.max);
  // Saves from before the data views had a single on/off map; that becomes the temperature view.
  const view = DATA_VIEW_ORDER.includes(input?.settings?.dataView) ? input.settings.dataView : (input?.settings?.showGradients ? 'temperature' : 'off');
  delete state.settings.showGradients;
  state.settings.dataView = view;

  // Saved gradients are rebuilt unless they still match their tank and lamps.
  state.stations = state.stations.map((st) => {
    const fresh = computeGradient(st, state, registry);
    const keep = gradientMatches(st.tank.gradient, st, registry)
      && JSON.stringify(st.tank.gradient.on) === JSON.stringify(fresh.on);
    return keep ? st : { ...st, tank: { ...st.tank, gradient: fresh } };
  });

  const viewW = clamp(Math.round(num(state.view?.w, VIEW_W)), 120, 4000);
  const viewH = clamp(Math.round(num(state.view?.h, VIEW_H)), 120, 4000);
  const maxCamera = Math.max(0, worldSize(stations.length, viewW) - viewW);
  state.view = { cameraX: clamp(Math.round(num(state.view?.cameraX, 0)), 0, maxCamera), w: viewW, h: viewH, inset: 0 }; // the inset belongs to this screen; the UI sets it
  return state;
}
