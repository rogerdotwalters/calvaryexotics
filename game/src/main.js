/**
 * main.js
 * Purpose: wire the modules together. Contains no game logic.
 * Inputs:  DOM elements #app, #tabbar, #drawer, #stage, #game, #actionbar, #editbar
 * Outputs: starts the game loop.
 * Flow:    UI emits 'intent' -> store.dispatch -> 'state:changed' -> renderer + UI
 *          + autosave. On start, the last autosave (if any) is loaded.
 */
import { createEventBus } from './core/eventBus.js';
import { createStore } from './core/store.js';
import { actions } from './core/actions.js';
import { createDefaultState } from './core/defaultState.js';
import { sanitize } from './core/sanitize.js';
import { createGameLoop } from './core/gameLoop.js';
import { registry } from './data/registry.js';
import { TABS } from './data/tabs.js';
import { createRenderer } from './render/renderer.js';
import { createIconPainter } from './render/icons.js';
import { createPicker } from './render/hitTest.js';
import { watchFit } from './render/viewport.js';
import { createShell } from './ui/shell.js';
import { createStageInput } from './ui/stageInput.js';
import { createSavePanel } from './ui/savePanel.js';
import { createAnimalsPanel } from './ui/animalsPanel.js';
import { saveTextFile } from './ui/download.js';
import { createAutosave, readSave, serialize, parseSave } from './core/save.js';
import { createEditBar } from './ui/editBar.js';
import { createActionBar } from './ui/actionBar.js';
import { createChrome } from './ui/chrome.js';
import { createDataLegend } from './ui/dataLegend.js';

// Autosave uses localStorage when the browser allows it.
function openStorage() {
  try {
    const storage = window.localStorage;
    storage.setItem('vivarium:probe', '1');
    storage.removeItem('vivarium:probe');
    return storage;
  } catch {
    return null;
  }
}
const storage = openStorage();
const loaded = readSave(storage);

const bus = createEventBus();
const store = createStore({ initialState: loaded.ok ? loaded.state : sanitize(createDefaultState()), actions, bus });
const autosave = createAutosave({ store, bus, storage });
bus.on('intent', ({ action, payload }) => store.dispatch(action, payload));

const canvas = document.getElementById('game');
const renderer = createRenderer({ canvas, bus, getState: store.getState, registry });

watchFit({ canvas, container: document.getElementById('stage'), bus });
const picker = createPicker({ getState: store.getState, registry });
createStageInput({ canvas, bus, getState: store.getState, picker });
createActionBar({ root: document.getElementById('actionbar'), bus, getState: store.getState, registry });
createEditBar({ root: document.getElementById('editbar'), bus, getState: store.getState, registry });

const shell = createShell({
  app: document.getElementById('app'),
  tabBarRoot: document.getElementById('tabbar'),
  drawerRoot: document.getElementById('drawer'),
  tabs: TABS,
  bus,
  getState: store.getState,
  registry,
  paint: createIconPainter(registry),
  panels: {
    animals: (root) => createAnimalsPanel({ root, bus, getState: store.getState, registry }),
    save: (root) => createSavePanel({ root, bus, getState: store.getState, autosave, serialize, parseSave, saveTextFile }),
  },
});
shell.setActive(null); // start with the whole tank in view; open a drawer from the tab bar
createChrome({ app: document.getElementById('app'), toggle: document.getElementById('uiToggle'), tabBar: document.getElementById('tabbar'), editBar: document.getElementById('editbar'), topBar: document.getElementById('topbar') });
createDataLegend({ button: document.getElementById('viewToggle'), legend: document.getElementById('legend'), bus, getState: store.getState, registry });

window.addEventListener('pagehide', autosave.flush);
document.addEventListener('visibilitychange', () => { if (document.hidden) autosave.flush(); });

// The simulation advances four times a second of real time.
const TICK = 0.25;

let elapsed = 0;
function update(dt) {
  elapsed += dt;
  if (elapsed >= TICK) { // every quarter second, so animals move smoothly
    const seconds = elapsed;
    elapsed = 0;
    store.dispatch('sim/tick', { dt: seconds });
  }
}

createGameLoop({ update, render: renderer.render }).start();
