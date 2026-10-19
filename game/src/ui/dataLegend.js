/**
 * ui/dataLegend.js
 * Purpose: the View button and the color legend of the data views. The button
 *          cycles Normal -> Temp -> Humid -> UVB. While a data view is on, a
 *          legend shows its color gradient with values, plus the numbers that
 *          matter for the selected tank (hot spot, driest and dampest zones,
 *          peak UVB).
 * Inputs:  { button, legend, bus, getState, registry }
 * Outputs: emits 'intent' settings/dataView; keeps the legend current.
 * Notes:   the gradient and ticks come from data/dataViews.js, the same data
 *          the map is drawn from. No game logic here.
 */
import { el } from '../utils/dom.js';
import { DATA_VIEWS, DATA_VIEW_ORDER, cssGradient } from '../data/dataViews.js';
import { getSelectedStation } from '../core/selectors.js';
import { coolSpot, hotSpot, humidityField, uvbZone } from '../systems/gradient.js';

function info(viewId, station, registry) {
  const g = station.tank.gradient;
  const env = station.tank.environment;
  if (viewId === 'temperature') {
    if (!g?.cols || g.maxHeat <= 0) return [`Tank ${Math.round(env.temperature)}F`, 'No lamp heat'];
    return [`Hot spot ${Math.round(hotSpot(env, g).temp)}F`, `Cool end ${Math.round(coolSpot(env, g).temp)}F`];
  }
  if (viewId === 'humidity') {
    const h = humidityField(station, registry);
    if (!h.values.length) return [`Average ${Math.round(env.humidity)}%`];
    return [`Dampest ${Math.round(Math.max(...h.values))}%`, `Driest ${Math.round(Math.min(...h.values))}%`];
  }
  if (!g?.cols || g.maxUvb <= 0) return ['No UVB lamp on'];
  return [`Peak ${g.maxUvb.toFixed(1)} UVI`, `Zone ${uvbZone(g.maxUvb)}`];
}

export function createDataLegend({ button, legend, bus, getState, registry }) {
  const title = el('p', 'legend-title');
  const bar = el('div', 'legend-bar');
  const ticks = el('ul', 'legend-ticks');
  const body = el('div', 'legend-body');
  const lines = el('div', 'legend-info');
  body.append(bar, ticks);
  legend.append(title, body, lines);

  button.addEventListener('click', () => {
    const now = DATA_VIEW_ORDER.indexOf(getState().settings.dataView);
    bus.emit('intent', { action: 'settings/dataView', payload: { mode: DATA_VIEW_ORDER[(now + 1) % DATA_VIEW_ORDER.length] } });
  });

  let built = null;
  function refresh() {
    const state = getState();
    const mode = state.settings.dataView;
    const view = DATA_VIEWS[mode];
    button.textContent = `View: ${view ? view.name : 'Normal'}`;
    button.setAttribute('aria-pressed', String(Boolean(view)));
    legend.hidden = !view;
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
    }
    lines.replaceChildren(...info(mode, getSelectedStation(state), registry).map((t) => el('p', null, t)));
  }

  bus.on('state:changed', refresh);
  refresh();
  return { refresh };
}
