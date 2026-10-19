/**
 * ui/actionBar.js
 * Purpose: the care bar under the tank: Mist, Feed, Clean, Leaf litter, and
 *          small meters for the selected tank (temperature, humidity,
 *          cleanliness, food, water, and overall health, which a cleanup
 *          crew raises).
 * Inputs:  { root, bus, getState, registry }
 * Outputs: emits 'intent' care/* and 'fx' (pixel effects); updates meters
 *          every tick.
 * Notes:   reads state only. Meter color: blue = low, green = comfortable,
 *          amber = high (ranges in data/environmentRules.js).
 */
import { el } from '../utils/dom.js';
import { COMFORT, METERS } from '../data/environmentRules.js';
import { getSelectedStation } from '../core/selectors.js';
import { crewCount, tankHealth } from '../systems/environment.js';

const ACTIONS = [
  { label: 'Mist', action: 'care/mist', fx: 'mist', message: 'Misted. The air feels damper.' },
  { label: 'Feed', action: 'care/feed', fx: 'feed', message: 'Fed. Food is topped up.' },
  { label: 'Clean', action: 'care/clean', fx: 'clean', message: 'Cleaned. Spotless.' },
  { label: 'Litter', action: 'care/litter', fx: 'litter', message: 'Added fresh leaf litter.' },
];

export function createActionBar({ root, bus, getState, registry }) {
  const row = el('div', 'care-buttons');
  const message = el('p', 'care-message');
  let toast = null;
  message.setAttribute('role', 'status');

  for (const def of ACTIONS) {
    const button = el('button', 'opt care-btn', def.label);
    button.type = 'button';
    button.addEventListener('click', () => {
      bus.emit('intent', { action: def.action, payload: {} });
      bus.emit('fx', { kind: def.fx, stationId: getState().selectedStation });
      message.textContent = def.message;
      clearTimeout(toast);
      toast = setTimeout(() => { message.textContent = ''; }, 2500); // a brief note that fades away
    });
    row.append(button);
  }

  const meters = METERS.map((def) => {
    const cell = el('div', 'meter');
    const label = el('span', 'meter-label');
    const bar = el('span', 'meter-bar');
    const fill = el('span', 'meter-fill');
    bar.append(fill);
    cell.append(label, bar);
    return { def, cell, label, fill };
  });
  const grid = el('div', 'meters');
  grid.append(...meters.map((m) => m.cell));
  root.append(row, grid, message);

  function refresh() {
    const station = getSelectedStation(getState());
    const env = { ...station.tank.environment, health: tankHealth(station.tank.environment, crewCount(station, registry)) * 100 };
    for (const { def, cell, label, fill } of meters) {
      const value = env[def.key];
      const [lo, hi] = COMFORT[def.key] ?? [60, 100];
      cell.dataset.state = value < lo ? 'low' : value > hi ? 'high' : 'ok';
      label.textContent = `${def.label} ${Math.round(value)}${def.unit}`;
      fill.style.width = `${Math.max(0, Math.min(100, ((value - def.min) / (def.max - def.min)) * 100))}%`;
    }
  }

  bus.on('state:changed', refresh);
  refresh();
}
