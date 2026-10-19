/**
 * core/save.js
 * Purpose: saving and loading: autosave to storage, export/import as JSON.
 * Inputs:  a storage object (localStorage-like: getItem/setItem/removeItem)
 * Outputs: serialize(state) -> JSON text
 *          parseSave(text) -> { ok, state } | { ok: false, error }  (migrates + sanitizes)
 *          readSave(storage) / writeSave(storage, state)
 *          createAutosave({ store, bus, storage }) -> { flush, status }
 * Events:  emits 'save:status' { status: 'saved' | 'error' | 'unavailable', at }
 * Notes:   the exported file is { format, saveVersion, exportedAt, state }.
 *          parseSave also accepts a bare state object. A save that fails to
 *          load is copied to a backup key before anything overwrites it.
 */
import { SAVE_VERSION } from './defaultState.js';
import { migrate } from './migrations.js';
import { sanitize } from './sanitize.js';

export const SAVE_KEY = 'vivarium:save';
export const BACKUP_KEY = 'vivarium:save:backup';
const FORMAT = 'vivarium-save';

export function serialize(state, now = Date.now()) {
  return JSON.stringify({ format: FORMAT, saveVersion: SAVE_VERSION, exportedAt: new Date(now).toISOString(), state }, null, 2);
}

export function parseSave(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'That is not a valid save file (it could not be read as JSON).' };
  }
  const raw = data && typeof data === 'object' && 'state' in data && data.format === FORMAT ? data.state : data;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'That file does not look like a Vivarium save.' };
  }
  const migrated = migrate(raw);
  if (!migrated.ok) return migrated;
  return { ok: true, state: sanitize(migrated.state) };
}

export function readSave(storage) {
  if (!storage) return { ok: false, unavailable: true };
  let text;
  try {
    text = storage.getItem(SAVE_KEY);
  } catch {
    return { ok: false, unavailable: true };
  }
  if (text === null) return { ok: false, empty: true };
  const result = parseSave(text);
  if (!result.ok) {
    try { storage.setItem(BACKUP_KEY, text); } catch { /* keep going */ }
  }
  return result;
}

export function writeSave(storage, state) {
  if (!storage) return false;
  try {
    storage.setItem(SAVE_KEY, serialize(state));
    return true;
  } catch {
    return false;
  }
}

export function createAutosave({ store, bus, storage, delay = 600, setTimer = setTimeout, clearTimer = clearTimeout, now = Date.now }) {
  let timer = null;
  let last = storage ? null : { status: 'unavailable', at: now() };

  function flush() {
    if (timer !== null) { clearTimer(timer); timer = null; }
    if (!storage) return;
    last = { status: writeSave(storage, store.getState()) ? 'saved' : 'error', at: now() };
    bus.emit('save:status', last);
  }

  bus.on('state:changed', (event) => {
    if (!storage || event?.action === 'sim/tick') return; // ticks are saved with the next change or on exit
    if (timer !== null) clearTimer(timer);
    timer = setTimer(flush, delay);
  });

  return { flush, status: () => last };
}
