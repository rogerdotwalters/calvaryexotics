/**
 * ui/timeToggle.js
 * Purpose: the Time button: switches the room between Day and Night. Night turns
 *          the lamps off (moon lights and ceramic heaters stay on), cools the
 *          room and sends day animals to rest.
 * Inputs:  { button, bus, getState }
 * Outputs: emits 'intent' settings/night; keeps its label current.
 */
export function createTimeToggle({ button, bus, getState }) {
  button.addEventListener('click', () => bus.emit('intent', { action: 'settings/night', payload: {} }));
  function refresh() {
    const night = getState().settings.night;
    button.textContent = `Time: ${night ? 'Night' : 'Day'}`;
    button.setAttribute('aria-pressed', String(night));
  }
  bus.on('state:changed', (event) => { if (event.action !== 'sim/tick') refresh(); });
  refresh();
}
