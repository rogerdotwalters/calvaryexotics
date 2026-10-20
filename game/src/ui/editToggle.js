/**
 * ui/editToggle.js
 * Purpose: the Edit button: turns moving and changing the objects in the tank on
 *          or off. Off locks them, so a tap or drag on the tank only looks around
 *          and nothing gets moved by accident (handy on a touch screen).
 * Inputs:  { button, bus, getState }
 * Outputs: emits 'intent' settings/editItems; keeps its label current.
 */
export function createEditToggle({ button, bus, getState }) {
  button.addEventListener('click', () => bus.emit('intent', { action: 'settings/editItems', payload: {} }));
  function refresh() {
    const on = getState().settings.editItems;
    button.textContent = `Edit: ${on ? 'On' : 'Off'}`;
    button.setAttribute('aria-pressed', String(on));
  }
  bus.on('state:changed', (event) => { if (event.action !== 'sim/tick') refresh(); });
  refresh();
}
