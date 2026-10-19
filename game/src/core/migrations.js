/**
 * core/migrations.js
 * Purpose: upgrade old saves to the current shape so updates never break them.
 * Inputs:  a parsed save object (state) with an optional saveVersion
 * Outputs: migrate(save) -> { ok: true, state } | { ok: false, error }
 *
 * How to change the save format later:
 *   1. bump SAVE_VERSION in core/defaultState.js (say 3 -> 4)
 *   2. add MIGRATIONS[3] = (save) => ({ ...save, <changes> }) below
 *   Each step upgrades exactly one version, and they run in order, so a v0
 *   save still reaches v2. Additive changes (new optional fields) need no
 *   migration: core/sanitize.js fills missing fields with defaults.
 */
import { SAVE_VERSION, createStation } from './defaultState.js';
import { LIGHTING } from '../data/items/lighting.js';

export const MIGRATIONS = {
  /**
   * v0 -> v1: the first builds had one table, tank, item list, lighting and
   * animals at the top level. v1 keeps them in stations[] so a room can hold
   * several tables.
   */
  0: (save) => {
    if (Array.isArray(save.stations)) return save;
    const { table, tank, placedItems, animals, lighting, ...rest } = save;
    const base = createStation('s1');
    return {
      ...rest,
      stations: [{
        ...base,
        table: { ...base.table, ...(table ?? {}) },
        tank: { ...base.tank, ...(tank ?? {}) },
        placedItems: Array.isArray(placedItems) ? placedItems : [],
        animals: Array.isArray(animals) ? animals : [],
        lighting: { ...base.lighting, ...(lighting ?? {}) },
      }],
      selectedStation: 's1',
      nextStationId: 2,
    };
  },
};

MIGRATIONS[1] = (save) => ({
  /**
   * v1 -> v2: a tank had one light ({ type, color }). v2 has two lamp slots
   * with wattage, so the old light becomes lamp 1 at its default wattage.
   */
  ...save,
  stations: (Array.isArray(save.stations) ? save.stations : []).map((st) => {
    const old = st?.lighting ?? {};
    if (Array.isArray(old.lamps)) return st;
    const type = LIGHTING.some((f) => f.id === old.type) ? old.type : 'none';
    const fixture = LIGHTING.find((f) => f.id === type);
    return {
      ...st,
      lighting: {
        lamps: [
          { type, color: typeof old.color === 'string' ? old.color : 'warm', watts: fixture.defaultWatts },
          { type: 'none', color: 'warm', watts: 0 },
        ],
        slot: 0,
      },
    };
  }),
});

MIGRATIONS[2] = (save) => ({
  /**
   * v2 -> v3: the isopod pattern "zebra" became "striped" (colonies are
   * identified by color and pattern, not by real-world names). The collection
   * log keys follow.
   */
  ...save,
  stations: (Array.isArray(save.stations) ? save.stations : []).map((st) => ({
    ...st,
    animals: (Array.isArray(st?.animals) ? st.animals : []).map((a) => (
      a?.morph?.pattern === 'zebra' ? { ...a, morph: { ...a.morph, pattern: 'striped' } } : a)),
  })),
  discoveredLog: save.discoveredLog
    ? { ...save.discoveredLog, morphs: (save.discoveredLog.morphs ?? []).map((m) => String(m).replace('+zebra', '+striped')) }
    : save.discoveredLog,
});

export function migrate(save) {
  let version = Number.isInteger(save?.saveVersion) ? save.saveVersion : 0;
  if (version < 0) version = 0;
  if (version > SAVE_VERSION) {
    return { ok: false, error: 'This save is from a newer version of the game. Update the game and try again.' };
  }
  let state = { ...save };
  while (version < SAVE_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) return { ok: false, error: `No way to upgrade a version ${version} save.` };
    state = step(state);
    version += 1;
  }
  return { ok: true, state: { ...state, saveVersion: SAVE_VERSION } };
}
