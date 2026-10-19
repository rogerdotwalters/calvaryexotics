/**
 * ui/dataLegend.js
 * Purpose: the View button and the color legend of the data views. The button
 *          cycles Normal -> Temp -> Humid -> UVB. While a data view is on, a
 *          legend shows its color gradient with values, plus the numbers that
 *          matter for the selected tank (hot spot, driest and dampest zones,
 *          peak UVB) and a short note on what raises and lowers it. The Edit
 *          button (shown while a view is on) switches between a see-through map
 *          with movable items and the map alone.
 * Inputs:  { button, editButton, legend, bus, getState, registry }
 * Outputs: emits 'intent' settings/dataView and settings/mapEdit; keeps the
 *          legend current.
 * Notes:   the gradient and ticks come from data/dataViews.js, the same data
 *          the map is drawn from. No game logic here.
 */
import { el } from '../utils/dom.js';
import { DATA_VIEWS, DATA_VIEW_ORDER, cssGradient } from '../data/dataViews.js';
import { getSelectedStation } from '../core/selectors.js';
import { coolSpot, hotSpot, uvbZone } from '../systems/gradient.js';
import { humidityField } from '../systems/humidity.js';
import { analyzeTank } from '../systems/thermal.js';

function info(viewId, station, state, registry) {
  const g = station.tank.gradient;
  const env = station.tank.environment;
  if (viewId === 'temperature') {
    const room = `Room ${Math.round(state.room.ambient)}F`;
    if (!g?.cols || g.maxHeat <= 0) return [room, `Tank ${Math.round(env.temperature)}F`, 'No lamp heat'];
    const t = analyzeTank(station, g.on, registry);
    return [
      room, `Tank average ${Math.round(env.temperature)}F`, `Closed tank +${t.rise.toFixed(1)}F`,
      `Hot spot ${Math.round(hotSpot(env, g).temp)}F`, `Cool end ${Math.round(coolSpot(env, g).temp)}F`,
    ];
  }
  if (viewId === 'humidity') {
    const h = humidityField(station, registry);
    if (!h.values.length) return [`Average ${Math.round(env.humidity)}%`];
    return [`Dampest ${Math.round(Math.max(...h.values))}%`, `Driest ${Math.round(Math.min(...h.values))}%`];
  }
  if (!g?.cols || g.maxUvb <= 0) return ['No UVB lamp on'];
  return [`Peak ${g.maxUvb.toFixed(1)} UVI`, `Zone ${uvbZone(g.maxUvb)}`];
}

export function createDataLegend({ button, editButton, legend, bus, getState, registry }) {
  const title = el('p', 'legend-title');
  const bar = el('div', 'legend-bar');
  const ticks = el('ul', 'legend-ticks');
  const body = el('div', 'legend-body');
  const lines = el('div', 'legend-info');
  body.append(bar, ticks);
  const notes = el('details', 'legend-notes');
  const notesTitle = el('summary', null, 'What changes it');
  const notesList = el('div', 'legend-note-list');
  notes.append(notesTitle, notesList);
  notes.open = window.innerWidth >= 700 && window.innerHeight >= 560; // roomy screens show it; phones keep it folded
  legend.append(title, body, lines, notes);

  button.addEventListener('click', () => {
    const now = DATA_VIEW_ORDER.indexOf(getState().settings.dataView);
    bus.emit('intent', { action: 'settings/dataView', payload: { mode: DATA_VIEW_ORDER[(now + 1) % DATA_VIEW_ORDER.length] } });
  });

  editButton.addEventListener('click', () => bus.emit('intent', { action: 'settings/mapEdit', payload: {} }));

  let built = null;
  function refresh() {
    const state = getState();
    const mode = state.settings.dataView;
    const view = DATA_VIEWS[mode];
    button.textContent = `View: ${view ? view.name : 'Normal'}`;
    button.setAttribute('aria-pressed', String(Boolean(view)));
    legend.hidden = !view;
    editButton.hidden = !view;
    editButton.textContent = `Edit: ${state.settings.mapEdit ? 'On' : 'Off'}`;
    editButton.setAttribute('aria-pressed', String(state.settings.mapEdit));
    if (!view) return;
    if (built !== mode) { // the gradient and its labels only change with the view
      built = mode;
      title.textContent = view.title;
      bar.style.background = cssGradient(view);
      ticks.replaceChildren(...view.ticks.map((v) => {
        const li = el('li', null, view.format(v));
        li.style.bottom = `${((v - view.min) / (view.max - view.min)) * 100}%`;
        return li;
      }));
      notes.hidden = !view.notes;
      notesList.replaceChildren(...(view.notes ?? []).map(([label, text]) => {
        const p = el('p', 'legend-note');
        p.append(el('b', null, `${label}: `), text);
        return p;
      }));
    }
    lines.replaceChildren(...info(mode, getSelectedStation(state), state, registry).map((t) => el('p', null, t)));
  }

  bus.on('state:changed', refresh);
  refresh();
  return { refresh };
}
