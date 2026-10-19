/**
 * core/actions.js
 * Purpose: every way the state can change, by name. Pure functions.
 * Inputs:  (state, payload)
 * Outputs: a patch of top-level state keys (merged by the store).
 * Notes:   ids are not validated here; the renderer falls back to the first
 *          catalog entry for unknown ids, so old saves still draw.
 *          table/* and tank/* act on the selected station.
 *          world/tap takes x in view pixels: it adds a table at either end,
 *          selects the table that was tapped, and clears the item selection.
 *          item/* edit placed items (position is fx/fy = 0..1 of the tank
 *          interior; layer order = array order, first is furthest back;
 *          rotation is in degrees, turned in steps; behind = drawn behind the
 *          substrate, see core/layers.js).
 */
import { clamp } from '../utils/math.js';
import {
  EDGE_W, MAX_ITEMS_PER_TANK, MAX_ITEM_SCALE, MAX_STATIONS, STATION_W, centerOnStation, worldOffset, worldSize,
} from '../data/world.js';
import { registry } from '../data/registry.js';
import { createDefaultState, createStation } from './defaultState.js';
import { sanitize } from './sanitize.js';
import { DATA_VIEW_ORDER } from '../data/dataViews.js';
import { getSelectedIndex, getSelectedStation, maxCameraX } from './selectors.js';
import { groundFraction, interiorHeight, interiorWidth } from './geometry.js';
import { moveLayer } from './layers.js';
import { DAY, RULES } from '../data/environmentRules.js';
import { environmentInputs, stepEnvironment } from '../systems/environment.js';
import { computeGradient, lampStates } from '../systems/gradient.js';
import { stepAnimals } from '../systems/animals.js';
import { canAddAnimal } from '../systems/needs.js';
import { createAnimal } from '../entities/animal.js';

const editSelected = (s, fn) => ({
  stations: s.stations.map((st) => (st.id === s.selectedStation ? fn(st) : st)),
});

const editItems = (s, id, fn) => ({
  stations: s.stations.map((st) =>
    st.placedItems.some((p) => p.id === id) ? { ...st, placedItems: fn(st.placedItems) } : st),
});

const mapItem = (s, id, fn) => editItems(s, id, (list) => list.map((p) => (p.id === id ? fn(p) : p)));

const panTo = (s, x, count = s.stations.length) => ({
  view: { ...s.view, cameraX: clamp(x, 0, Math.max(0, worldSize(count, s.view.w) - s.view.w)) },
});

const clearItem = (s) => (s.selectedItem ? { selectedItem: null } : {});

function addStation(s, side) {
  if (s.stations.length >= MAX_STATIONS) return {};
  const station = createStation(`s${s.nextStationId}`);
  const stations = side === 'left' ? [station, ...s.stations] : [...s.stations, station];
  return withGradients(s, {
    stations,
    selectedStation: station.id,
    nextStationId: s.nextStationId + 1,
    ...clearItem(s),
    ...panTo(s, centerOnStation(side === 'left' ? 0 : stations.length - 1, stations.length, s.view.w), stations.length),
  });
}

function placeItem(s, { catalog, itemId }) {
  const entry = registry.list(catalog)?.find((e) => e.id === itemId);
  const station = getSelectedStation(s);
  if (!entry || station.placedItems.length >= MAX_ITEMS_PER_TANK) return {};
  const count = station.placedItems.length;
  const placed = {
    id: `i${s.nextItemId}`,
    catalog,
    itemId,
    fx: 0.5 + ((count % 5) - 2) * 0.1,
    fy: entry.anchor === 'top' ? 0 : entry.anchor === 'free' ? 0.45 : groundFraction(station.tank, registry),
    scale: 1,
    rotation: 0,
    flip: false,
    behind: false,
    plane: entry.plane ?? 'main',
  };
  return {
    ...editSelected(s, (st) => ({
      ...st,
      // Wall items join the back group; everything else goes on top.
      placedItems: placed.plane === 'back'
        ? [...st.placedItems.filter((p) => p.plane === 'back'), placed, ...st.placedItems.filter((p) => p.plane !== 'back')]
        : [...st.placedItems, placed],
    })),
    selectedItem: placed.id,
    nextItemId: s.nextItemId + 1,
  };
}

// Keep every tank's saved gradient up to date. A gradient is recomputed when its
// lamps, tank size or on/off state changed (or it is missing).
function withGradients(state, patch, all = false) {
  const next = { ...state, ...patch };
  const stations = (patch.stations ?? state.stations).map((st) => {
    const old = state.stations.find((o) => o.id === st.id);
    const stale = all || !st.tank.gradient || !old || old.lighting !== st.lighting || old.tank.size !== st.tank.size
      || JSON.stringify(lampStates(st, next, registry)) !== JSON.stringify(st.tank.gradient.on);
    return stale ? { ...st, tank: { ...st.tank, gradient: computeGradient(st, next, registry) } } : st;
  });
  return { ...patch, stations };
}

const editEnv = (s, fn) =>
  editSelected(s, (st) => ({ ...st, tank: { ...st.tank, environment: fn(st.tank.environment, st) } }));
const cap = (v) => Math.min(100, v);

export const actions = {
  // Whole-game replacement. The payload state must already be migrated and sanitized
  // (see core/save.js parseSave).
  // The screen size belongs to this device, so loading or resetting keeps it.
  'game/load': (s, { state }) => ({
    ...state,
    view: { ...state.view, w: s.view.w, h: s.view.h, cameraX: clamp(state.view.cameraX, 0, Math.max(0, worldSize(state.stations.length, s.view.w) - s.view.w)) },
  }),
  'game/reset': (s) => { const fresh = sanitize(createDefaultState()); return { ...fresh, view: { ...fresh.view, w: s.view.w, h: s.view.h } }; },
  // The UI reports the size of the screen (in internal pixels) and asks to center a table.
  'view/resize': (s, { w, h }) => (w === s.view.w && h === s.view.h ? {} : {
    view: { ...s.view, w, h, cameraX: clamp(s.view.cameraX, 0, Math.max(0, worldSize(s.stations.length, w) - w)) },
  }),
  'view/focus': (s) => panTo(s, centerOnStation(getSelectedIndex(s), s.stations.length, s.view.w)),

  'room/set': (s, patch) => ({ room: { ...s.room, ...patch } }),
  'table/set': (s, patch) => editSelected(s, (st) => ({ ...st, table: { ...st.table, ...patch } })),
  'tank/set': (s, patch) => editSelected(s, (st) => ({ ...st, tank: { ...st.tank, ...patch } })),
  'tank/setSize': (s, { size }) => withGradients(s, editSelected(s, (st) => ({ ...st, tank: { ...st.tank, size } }))),

  'light/slot': (s, { slot }) => editSelected(s, (st) => ({ ...st, lighting: { ...st.lighting, slot: clamp(slot, 0, 1) } })),
  // Changes the lamp in the slot being edited. Picking a new fixture resets its
  // wattage to that fixture's default, unless a wattage is given with it.
  'light/set': (s, patch) => withGradients(s, editSelected(s, (st) => ({
    ...st,
    lighting: {
      ...st.lighting,
      lamps: st.lighting.lamps.map((lamp, i) => {
        if (i !== st.lighting.slot) return lamp;
        const next = { ...lamp, ...patch };
        if (patch.type && patch.type !== lamp.type && patch.watts === undefined) next.watts = registry.get('lights', patch.type).defaultWatts;
        return next;
      }),
    },
  }))),
  // Which data the tank shows: 'off', 'temperature', 'humidity' or 'uvb'.
  'settings/dataView': (s, { mode }) => ({ settings: { ...s.settings, dataView: DATA_VIEW_ORDER.includes(mode) ? mode : 'off' } }),
  'settings/toggle': (s, { key }) => {
    const settings = { ...s.settings, [key]: !s.settings[key] };
    return key === 'dayNight' ? withGradients({ ...s, settings }, { settings, stations: s.stations }, true) : { settings };
  },

  // Simulation step: every tank's environment, and the clock when day/night is on.
  'sim/tick': (s, { dt }) => {
    const time = s.settings.dayNight ? (s.time + dt / DAY.seconds) % 1 : s.time;
    const clock = { ...s, time };
    const stations = s.stations.map((st) => {
      const { animals, foodGain } = stepAnimals(st, clock, registry, dt);
      const environment = stepEnvironment(st.tank.environment, environmentInputs(clock, st, registry), dt);
      return {
        ...st,
        tank: { ...st.tank, environment: foodGain ? { ...environment, food: Math.min(100, environment.food + foodGain) } : environment },
        animals,
      };
    });
    return withGradients(clock, { stations, ...(s.settings.dayNight ? { time } : {}) });
  },

  // Care actions act on the selected tank.
  'care/mist': (s) => editEnv(s, (e) => ({ ...e, humidity: cap(e.humidity + RULES.mist.humidity), water: cap(e.water + RULES.mist.water) })),
  'care/feed': (s) => editEnv(s, (e) => ({ ...e, food: RULES.feed.food, cleanliness: Math.max(0, e.cleanliness - RULES.feed.mess) })),
  'care/clean': (s) => editEnv(s, (e) => ({ ...e, cleanliness: 100 })),
  'care/litter': (s) => editSelected(s, (st) => ({
    ...st,
    tank: { ...st.tank, litter: st.tank.litter === 'none' ? 'oak-leaves' : st.tank.litter, environment: { ...st.tank.environment, litter: 100 } },
  })),

  // Animals. Adding one is limited by the tank's size; the log remembers what you have found.
  'animal/add': (s, { speciesId, variantId }) => {
    const species = registry.list('animals').find((x) => x.id === speciesId);
    const station = getSelectedStation(s);
    if (!species || !canAddAnimal(station, species, registry).ok) return {};
    const variant = species.variants?.find((v) => v.id === variantId) ?? species.variants?.[0];
    const animal = createAnimal({ id: `a${s.nextAnimalId}`, species, variant, tank: station.tank, count: station.animals.length, registry });
    const log = s.discoveredLog;
    const pattern = animal.morph.pattern && animal.morph.pattern !== 'none' ? `+${animal.morph.pattern}` : '';
    const morphKey = `${species.id}:${animal.morph.color}${pattern}`;
    return {
      ...editSelected(s, (st) => ({ ...st, animals: [...st.animals, animal] })),
      nextAnimalId: s.nextAnimalId + 1,
      discoveredLog: {
        species: log.species.includes(species.id) ? log.species : [...log.species, species.id],
        morphs: log.morphs.includes(morphKey) ? log.morphs : [...log.morphs, morphKey],
      },
    };
  },
  'animal/remove': (s, { id }) => ({
    stations: s.stations.map((st) => (st.animals.some((a) => a.id === id) ? { ...st, animals: st.animals.filter((a) => a.id !== id) } : st)),
  }),
  // Move an animal to another table (it must fit there).
  'animal/move': (s, { id, toStation }) => {
    const from = s.stations.find((st) => st.animals.some((a) => a.id === id));
    const to = s.stations.find((st) => st.id === toStation);
    if (!from || !to || from === to) return {};
    const animal = from.animals.find((a) => a.id === id);
    const species = registry.list('animals').find((x) => x.id === animal.species);
    if (!canAddAnimal(to, species, registry).ok) return {};
    const moved = { ...animal, fx: 0.5, fy: Math.max(0.05, groundFraction(to.tank, registry) - 0.04), mode: 'idle', target: null, hidden: null, timer: 2 };
    return {
      stations: s.stations.map((st) => (st === from ? { ...st, animals: st.animals.filter((a) => a.id !== id) }
        : st === to ? { ...st, animals: [...st.animals, moved] } : st)),
    };
  },

  'view/pan': (s, { dx }) => panTo(s, s.view.cameraX + dx),
  'station/select': (s, { id }) => (id === s.selectedStation ? {} : { selectedStation: id }),
  'station/add': (s, { side }) => addStation(s, side),
  'station/remove': (s) => {
    if (s.stations.length < 2) return {};
    const at = getSelectedIndex(s);
    const removed = s.stations[at];
    const stations = s.stations.filter((_, i) => i !== at);
    const next = stations[Math.min(at, stations.length - 1)];
    const lostItem = removed.placedItems.some((p) => p.id === s.selectedItem);
    return {
      stations,
      selectedStation: next.id,
      ...(lostItem ? { selectedItem: null } : {}),
      ...panTo(s, s.view.cameraX, stations.length),
    };
  },

  'world/tap': (s, { x }) => {
    const count = s.stations.length;
    const wx = s.view.cameraX + x - worldOffset(count, s.view.w);
    if (wx < EDGE_W) return addStation(s, 'left');
    if (wx >= EDGE_W + count * STATION_W) return addStation(s, 'right');
    const station = s.stations[Math.floor((wx - EDGE_W) / STATION_W)];
    return { ...clearItem(s), ...(station.id === s.selectedStation ? {} : { selectedStation: station.id }) };
  },

  'item/place': placeItem,
  'item/select': (s, { id }) => {
    if (id === null) return clearItem(s);
    const owner = s.stations.find((st) => st.placedItems.some((p) => p.id === id));
    return owner ? { selectedItem: id, selectedStation: owner.id } : {};
  },
  'item/move': (s, { id, fx, fy }) => mapItem(s, id, (p) => ({ ...p, fx: clamp(fx, 0, 1), fy: clamp(fy, 0, 1) })),
  'item/scale': (s, { id, delta }) =>
    mapItem(s, id, (p) => ({ ...p, scale: clamp(p.scale + delta, 1, MAX_ITEM_SCALE) })),
  'item/rotate': (s, { id, delta }) =>
    mapItem(s, id, (p) => ({ ...p, rotation: ((((p.rotation ?? 0) + delta) % 360) + 360) % 360 })),
  'item/flip': (s, { id }) => mapItem(s, id, (p) => ({ ...p, flip: !p.flip })),
  'item/layer': (s, { id, dir }) => editItems(s, id, (list) => moveLayer(list, id, dir)),
  // Move by whole pixels (dx, dy) without dragging.
  'item/nudge': (s, { id, dx = 0, dy = 0 }) => ({
    stations: s.stations.map((st) => {
      if (!st.placedItems.some((p) => p.id === id)) return st;
      const w = interiorWidth(st.tank, registry);
      const h = interiorHeight(st.tank, registry);
      return {
        ...st,
        placedItems: st.placedItems.map((p) => (p.id !== id ? p : {
          ...p,
          fx: clamp((Math.round(p.fx * w) + dx) / w, 0, 1),
          fy: clamp((Math.round(p.fy * h) + dy) / h, 0, 1),
        })),
      };
    }),
  }),
  'item/remove': (s, { id }) => ({
    ...editItems(s, id, (list) => list.filter((p) => p.id !== id)),
    ...clearItem(s),
  }),
};

export { maxCameraX };
