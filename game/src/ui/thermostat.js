/**
 * ui/thermostat.js
 * Purpose: the thermostat panel. Opens when you tap the dial on the wall (or
 *          press "Room thermostat" in the Room tab) and sets the room
 *          temperature that every tank warms up from.
 * Inputs:  { root, bus, getState }
 * Outputs: emits 'intent' room/ambient; opens and closes itself on the bus
 *          event 'ui:thermostat'.
 * Notes:   reads state only. The night setpoint is the room temperature minus
 *          RULES.ambient.nightDrop and applies when the Time switch is on Night.
 */
import { el } from '../utils/dom.js';
import { RULES } from '../data/environmentRules.js';

const STEPS = [-5, -1, 1, 5];

export function createThermostat({ root, bus, getState }) {
  const head = el('div', 'drawer-head');
  const close = el('button', 'drawer-close', 'Close');
  close.type = 'button';
  head.append(el('h2', null, 'Room thermostat'), close);
  const temp = el('p', 'thermo-temp');
  temp.setAttribute('role', 'status');
  const sub = el('p', 'thermo-sub');
  const row = el('div', 'thermo-row');
  const buttons = STEPS.map((delta) => {
    const button = el('button', 'opt thermo-btn', delta > 0 ? `+${delta}` : String(delta));
    button.type = 'button';
    button.setAttribute('aria-label', `${delta > 0 ? 'Warmer' : 'Cooler'} by ${Math.abs(delta)} degrees`);
    button.addEventListener('click', () => bus.emit('intent', { action: 'room/ambient', payload: { delta } }));
    row.append(button);
    return { button, delta };
  });
  const note = el('p', 'note', 'Every tank starts from the room temperature, then its lamps warm it. Press View twice to see the heat ranges, then Temp to see how a closed tank holds the heat.');
  root.append(head, temp, sub, row, note);

  const setOpen = (open) => { root.hidden = !open; };
  close.addEventListener('click', () => setOpen(false));
  bus.on('ui:thermostat', () => setOpen(root.hidden));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  function refresh() {
    const { ambient } = getState().room;
    temp.textContent = `${Math.round(ambient)}F`;
    sub.textContent = `${Math.round(ambient - RULES.ambient.nightDrop)}F at night`;
    for (const { button, delta } of buttons) button.disabled = delta < 0 ? ambient <= RULES.ambient.min : ambient >= RULES.ambient.max;
  }
  bus.on('state:changed', (event) => { if (event.action !== 'sim/tick') refresh(); });
  refresh();
  setOpen(false);
}
