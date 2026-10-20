/**
 * data/dataViews.js
 * Purpose: the data views of a tank (temperature, humidity, UVB): what each
 *          shows, its color gradient and its legend, in one place so the
 *          picture and the legend can never disagree.
 * Inputs:  none (pure data)
 * Outputs: DATA_VIEWS { [id]: view }, DATA_VIEW_ORDER, isLiveView(mode), MAP_OPACITIES,
 *          colorFor(view, value), cssGradient(view), STEPS
 *          The order is Normal, Ranges (a static chart of recommended ranges, see
 *          ui/rangesPanel.js), then the live maps of the selected tank.
 * View:    { id, name, unit, min, max, stops: [[value, '#hex'], ...],
 *            ticks: [values for the legend], format(value),
 *            notes: [[label, text]] what raises and lowers it, shown under the legend }
 * Notes:   colors are blended between the stops and then stepped into STEPS
 *          bands, so the map reads as clean pixel bands, not a smooth blur.
 *          Humidity is a blue gradient down to black at zero.
 */
import { HUMIDITY_NOTES } from './humidityRules.js';

export const STEPS = 28;

export const DATA_VIEWS = {
  temperature: {
    id: 'temperature', name: 'Temp', title: 'Temperature (F)', unit: 'F', min: 55, max: 110,
    stops: [[55, '#16205e'], [65, '#2563c9'], [72, '#2bb7c4'], [78, '#4cc864'], [84, '#e2e24a'], [92, '#f29a2c'], [100, '#dd3a28'], [110, '#7d0f22']],
    ticks: [60, 70, 80, 90, 100, 110],
    format: (v) => `${Math.round(v)}F`,
    notes: [
      ['Room', 'Set on the wall thermostat. Every tank starts from it.'],
      ['Lamps', 'Warm the air under them. A closed glass tank holds that heat, and small tanks hold the most.'],
      ['Rises', 'Warm air collects at the top, so the floor is cooler.'],
    ],
  },
  humidity: {
    id: 'humidity', name: 'Humid', title: 'Humidity (%)', unit: '%', min: 0, max: 100,
    stops: [[0, '#000000'], [100, '#3da5ff']],
    ticks: [0, 25, 50, 75, 100],
    format: (v) => `${Math.round(v)}%`,
    notes: HUMIDITY_NOTES,
  },
  uvb: {
    id: 'uvb', name: 'UVB', title: 'UV index (zones 1-4)', unit: 'UVI', min: 0, max: 8,
    stops: [[0, '#000000'], [0.7, '#2c2266'], [2.6, '#7b4fd6'], [3.5, '#c28cff'], [8, '#ffffff']],
    ticks: [0, 0.7, 2.6, 3.5, 8],
    format: (v) => v.toFixed(1),
  },
};

export const DATA_VIEW_ORDER = ['off', 'ranges', 'temperature', 'humidity', 'uvb'];

/** Is this a live map of the selected tank? ('ranges' is the static reference chart instead.) */
export const isLiveView = (mode) => Boolean(DATA_VIEWS[mode]);

/** How solid the live map is over the tank. Below 1 you see the tank through it and can move items. */
export const MAP_OPACITIES = [1, 0.6, 0.3];

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** [r, g, b] for a value, blended between stops and stepped into bands. */
export function colorFor(view, value) {
  const t = Math.min(1, Math.max(0, (value - view.min) / (view.max - view.min)));
  const band = Math.min(STEPS - 1, Math.floor(t * STEPS));
  const v = view.min + (band / (STEPS - 1)) * (view.max - view.min); // the band's value: first band is exactly min, last exactly max
  const stops = view.stops;
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i][0]) {
      const [v0, c0] = stops[i - 1];
      const [v1, c1] = stops[i];
      const k = (v - v0) / (v1 - v0 || 1);
      const a = hexToRgb(c0);
      const b = hexToRgb(c1);
      return a.map((x, j) => Math.round(x + (b[j] - x) * k));
    }
  }
  return hexToRgb(stops.at(-1)[1]);
}

/** A CSS linear-gradient (bottom = min) matching the stops, for the legend. */
export function cssGradient(view) {
  const parts = view.stops.map(([v, hex]) => `${hex} ${(((v - view.min) / (view.max - view.min)) * 100).toFixed(1)}%`);
  return `linear-gradient(to top, ${parts.join(', ')})`;
}
