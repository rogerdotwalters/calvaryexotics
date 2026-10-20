/**
 * ui/rangesPanel.js
 * Purpose: the "Ranges" view: a static reference chart of the temperature, UVB and
 *          humidity ranges each animal needs, with Ferguson's UVB zones behind
 *          the UVB bars. It shows no data from your tank; press View again to
 *          analyze the tank itself.
 * Inputs:  { root, bus, getState, registry }
 * Outputs: opens while settings.dataView is 'ranges'; emits 'intent'
 *          settings/dataView to close.
 * Notes:   ranges come from each species' needs, so this chart and the way
 *          animals are scored always agree (data/species/*.js).
 */
import { el } from '../utils/dom.js';
import { FERGUSON_ZONES, RANGE_CHARTS, RANGE_SOURCES } from '../data/referenceRanges.js';

const pct = (chart, v) => `${Math.max(0, Math.min(100, ((v - chart.min) / (chart.max - chart.min)) * 100)).toFixed(1)}%`;
const span = ([lo, hi]) => `${lo}-${hi}`;

/** The bars to draw for a species on a chart: [{ range, kind }] and a text summary. */
function barsFor(chartId, needs) {
  if (chartId === 'heat') {
    const bars = [{ range: needs.temperature.range, kind: 'cool' }];
    if (needs.basking) bars.push({ range: needs.basking.range, kind: 'hot' });
    return { bars, text: `${span(needs.temperature.range)}F${needs.basking ? `, basking ${span(needs.basking.range)}F` : ''}` };
  }
  if (chartId === 'uvb') {
    return needs.uvb
      ? { bars: [{ range: needs.uvb.range, kind: 'uvb' }], text: `${span(needs.uvb.range)} UVI` }
      : { bars: [], text: 'No UVB needed' };
  }
  return { bars: [{ range: needs.humidity.range, kind: 'wet' }], text: `${span(needs.humidity.range)}%` };
}

export function createRangesPanel({ root, bus, getState, registry }) {
  const head = el('div', 'drawer-head');
  const close = el('button', 'drawer-close', 'Close');
  close.type = 'button';
  close.addEventListener('click', () => bus.emit('intent', { action: 'settings/dataView', payload: { mode: 'off' } }));
  head.append(el('h2', null, 'Recommended ranges'), close);
  const note = el('p', 'note', 'A fixed reference, not your tank. Press View again to analyze the tank itself.');
  const tabs = el('div', 'range-tabs');
  const body = el('div', 'range-body');
  const sources = el('p', 'note', `Sources: ${RANGE_SOURCES}`);
  root.append(head, note, tabs, body, sources);

  let chartId = RANGE_CHARTS[0].id;
  const tabButtons = RANGE_CHARTS.map((chart) => {
    const button = el('button', 'opt range-tab', chart.name);
    button.type = 'button';
    button.addEventListener('click', () => { chartId = chart.id; draw(); });
    tabs.append(button);
    return { chart, button };
  });

  function draw() {
    const chart = RANGE_CHARTS.find((c) => c.id === chartId);
    for (const { chart: c, button } of tabButtons) button.setAttribute('aria-pressed', String(c.id === chartId));
    const rows = [];

    const axis = el('div', 'range-axis');
    for (const t of chart.ticks) {
      const tick = el('span', null, `${t}`);
      tick.style.left = pct(chart, t);
      axis.append(tick);
    }
    rows.push(axis);

    for (const sp of registry.list('animals')) {
      const { bars, text } = barsFor(chart.id, sp.needs);
      const row = el('div', 'range-row');
      const track = el('div', 'range-track');
      if (chart.id === 'uvb') { // Ferguson zones behind the bars, from each zone's average range
        for (const z of FERGUSON_ZONES) {
          const zone = el('span', `range-zone z${z.zone}`);
          zone.style.left = pct(chart, z.avg[0]);
          zone.style.width = `${parseFloat(pct(chart, z.avg[1])) - parseFloat(pct(chart, z.avg[0]))}%`;
          track.append(zone);
        }
      }
      for (const { range, kind } of bars) {
        const bar = el('span', `range-bar ${kind}`);
        bar.style.left = pct(chart, range[0]);
        bar.style.width = `${Math.max(1, parseFloat(pct(chart, range[1])) - parseFloat(pct(chart, range[0])))}%`;
        track.append(bar);
      }
      row.append(el('p', 'range-name', sp.name), track, el('p', 'range-text', text));
      rows.push(row);
    }

    if (chart.id === 'uvb') {
      const table = el('div', 'zone-table');
      table.append(el('p', 'range-name', 'Ferguson zones (UV Index)'));
      for (const z of FERGUSON_ZONES) {
        table.append(el('p', 'zone-line', `Zone ${z.zone}, ${z.name}: average ${span(z.avg)}, brightest ${span(z.max)}. ${z.examples}.`));
      }
      rows.push(table);
    } else if (chart.id === 'heat') {
      const key = el('p', 'note', 'Teal: the air temperature it likes. Orange: the basking spot.');
      rows.push(key);
    }
    body.replaceChildren(...rows);
  }

  function refresh() {
    const open = getState().settings.dataView === 'ranges';
    if (open && root.hidden) draw();
    root.hidden = !open;
  }
  bus.on('state:changed', (event) => { if (event.action !== 'sim/tick') refresh(); });
  root.hidden = true;
  refresh();
}
