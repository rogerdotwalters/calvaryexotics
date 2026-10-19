/**
 * systems/gradient.js
 * Purpose: the light, heat and UVB gradients inside a tank. They are computed
 *          from the lamps and saved with the tank (tank.gradient) so animals
 *          and hot-spot checks can read them any time. No rendering, no DOM.
 * Inputs:  station, state (for the clock), registry
 * Outputs: lampPositions(lamps), lampField(fixture, watts, dxIn, dyIn), GRADIENT_MODEL,
 *          computeGradient(station, state, registry) -> grid,
 *          cellTemperature / hotSpot / coolSpot, uvbZone, describeGradient,
 *          beamReach(fixture, watts)
 * Grid:    one cell = 1 inch (PPI pixels). Row 0 is just under the lid. Arrays run
 *          row by row: index = row * cols + col.
 *            heat  degrees F above the tank's cool-side air
 *            uvb   UV Index
 *            light visible light, 0 = dark, about 1 = bright
 *          meanHeat is subtracted from the tank's average temperature to get
 *          the cool-side baseline, so a cell's temperature is
 *          environment.temperature - meanHeat + heat[cell].
 *          The heat grid also carries the air stratification from the tank analysis
 *          (systems/thermal.js): warm air collects under the lid, so the top rows are
 *          warmer than the floor. It averages out to zero, so meanHeat is unchanged.
 *          The humidity map lives in systems/humidity.js.
 * Notes:   each lamp is a cone: strength falls with the angle off straight
 *          down and with distance. A lamp's source sits SOURCE_IN above the
 *          lid. Only lamps that are on (see daylight.js) count.
 */
import { clamp } from '../utils/math.js';
import { PPI, TANK_FRAME } from '../data/world.js';
import { lightIsOn } from './daylight.js';
import { analyzeTank } from './thermal.js';

export const CELL = PPI; // one cell per inch
/** Bump when the saved grids mean something new, so older saves rebuild them. */
export const GRADIENT_MODEL = 2;
const SOURCE_IN = 3;
const round = (v, step) => Math.round(v / step) * step;

/** Where each lamp sits along the lid (0..1), or null for an empty slot. */
export function lampPositions(lamps) {
  const active = lamps.map((l, i) => (l.type !== 'none' ? i : -1)).filter((i) => i >= 0);
  return lamps.map((l, i) => {
    if (!active.includes(i)) return null;
    return active.length === 1 ? 0.5 : active.indexOf(i) === 0 ? 0.27 : 0.73;
  });
}

/** Light, heat and UVB at a point dxIn sideways and dyIn below the lid (inches). */
export function lampField(fixture, watts, dxIn, dyIn) {
  const dy = dyIn + SOURCE_IN;
  const d = Math.hypot(dxIn, dy);
  const theta = (Math.atan2(Math.abs(dxIn), dy) * 180) / Math.PI;
  const a = Math.max(0, 1 - (theta / (fixture.half || 1)) ** 2);
  return {
    heat: (fixture.heatK * watts * a) / (1 + (d / 6) ** 2),
    uvb: (fixture.uvbK * watts * a) / (1 + (d / 10) ** 2),
    light: (fixture.lightK * watts * a) / (1 + (d / 14) ** 2),
  };
}

/** How deep (inches) a lamp's beam reaches straight down: until light < 0.1, heat < 3F and UVB < 1. */
export function beamReach(fixture, watts) {
  if (!fixture.lightK && !fixture.heatK) return 0;
  for (let d = 0; d <= 40; d += 0.5) {
    const f = lampField(fixture, watts, 0, d);
    if (Math.max(f.light / 0.1, f.heat / 3, f.uvb / 1) < 1) return d;
  }
  return 40;
}

export function gridSize(tank, registry) {
  const size = registry.get('tankSizes', tank.size);
  const w = size.width * PPI - TANK_FRAME.side * 2;
  const h = size.height * PPI - TANK_FRAME.lid - TANK_FRAME.base;
  return { w, h, cols: Math.floor(w / CELL), rows: Math.floor(h / CELL) };
}

export function lampStates(station, state, registry) {
  return station.lighting.lamps.map((l) => l.type !== 'none' && lightIsOn(registry.get('lights', l.type), state));
}

export function computeGradient(station, state, registry) {
  const { w, cols, rows } = gridSize(station.tank, registry);
  const lamps = station.lighting.lamps;
  const positions = lampPositions(lamps);
  const on = lampStates(station, state, registry);
  const heat = new Array(cols * rows).fill(0);
  const uvb = new Array(cols * rows).fill(0);
  const light = new Array(cols * rows).fill(0);

  lamps.forEach((lamp, i) => {
    if (!on[i]) return;
    const fixture = registry.get('lights', lamp.type);
    const sourceX = positions[i] * w;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const f = lampField(fixture, lamp.watts, ((c + 0.5) * CELL - sourceX) / PPI, ((r + 0.5) * CELL) / PPI);
        heat[r * cols + c] += f.heat;
        uvb[r * cols + c] += f.uvb;
        light[r * cols + c] += f.light;
      }
    }
  });

  // Warm air rises: the rows under the lid run warmer than the floor, by the tank analysis.
  const strat = analyzeTank(station, on, registry).stratification;
  if (strat > 0) {
    for (let r = 0; r < rows; r++) {
      const offset = strat * (0.5 - (r + 0.5) / rows);
      for (let c = 0; c < cols; c++) heat[r * cols + c] += offset;
    }
  }

  const n = Math.max(1, cols * rows);
  const meanHeat = heat.reduce((a, b) => a + b, 0) / n;
  let hot = 0;
  heat.forEach((v, i) => { if (v > heat[hot]) hot = i; });
  // The cool end: the coolest cell, and if many tie (the far side of the tank), the one farthest from the hot spot.
  const minHeat = Math.min(...heat);
  const hotCol = hot % Math.max(1, cols);
  const hotRow = Math.floor(hot / Math.max(1, cols));
  let cool = 0;
  let farthest = -1;
  heat.forEach((v, i) => {
    if (v > minHeat + 0.05) return;
    const d = Math.hypot((i % Math.max(1, cols)) - hotCol, Math.floor(i / Math.max(1, cols)) - hotRow);
    if (d > farthest) { farthest = d; cool = i; }
  });
  return {
    model: GRADIENT_MODEL, cols, rows, cell: CELL, on,
    heat: heat.map((v) => round(v, 0.1)),
    uvb: uvb.map((v) => round(v, 0.01)),
    light: light.map((v) => round(v, 0.01)),
    meanHeat: round(meanHeat, 0.1),
    maxHeat: round(Math.max(0, ...heat), 0.1),
    maxUvb: round(Math.max(0, ...uvb), 0.01),
    hot: { col: hot % Math.max(1, cols), row: Math.floor(hot / Math.max(1, cols)) },
    cool: { col: cool % Math.max(1, cols), row: Math.floor(cool / Math.max(1, cols)) },
  };
}

/** Is a saved gradient usable for this tank and lamp setup? */
export function gradientMatches(gradient, station, registry) {
  if (!gradient || !Array.isArray(gradient.heat)) return false;
  const { cols, rows } = gridSize(station.tank, registry);
  return gradient.model === GRADIENT_MODEL && gradient.cols === cols && gradient.rows === rows && gradient.heat.length === cols * rows;
}

/** Air temperature (F) in one cell, from the tank's average temperature. */
export function cellTemperature(env, gradient, col, row) {
  if (!gradient || !gradient.cols) return env.temperature;
  const c = clamp(col, 0, gradient.cols - 1);
  const r = clamp(row, 0, gradient.rows - 1);
  return env.temperature - gradient.meanHeat + gradient.heat[r * gradient.cols + c];
}

export function hotSpot(env, gradient) {
  if (!gradient?.cols) return { temp: env.temperature, col: 0, row: 0 };
  return { temp: cellTemperature(env, gradient, gradient.hot.col, gradient.hot.row), ...gradient.hot };
}

export function coolSpot(env, gradient) {
  if (!gradient?.cols) return { temp: env.temperature, col: 0, row: 0 };
  return { temp: cellTemperature(env, gradient, gradient.cool.col, gradient.cool.row), ...gradient.cool };
}

/** Ferguson UVB zones, by UV Index. */
export function uvbZone(uvi) {
  return uvi >= 3.5 ? 4 : uvi >= 2.6 ? 3 : uvi >= 0.7 ? 2 : uvi > 0 ? 1 : 0;
}

/** Plain-language lines for the Lights tab. */
export function describeGradient(station, env, registry) {
  const g = station.tank.gradient;
  const lines = [];
  const lamps = station.lighting.lamps.filter((l) => l.type !== 'none');
  if (lamps.length === 0) return [['Lamps', 'None. Add a lamp to make a warm spot.']];
  lamps.forEach((l) => {
    const f = registry.get('lights', l.type);
    lines.push([f.name, `${l.watts}W, beam reaches about ${Math.round(beamReach(f, l.watts))} in`]);
  });
  if (!g?.cols) return lines;
  const on = g.on.some(Boolean);
  if (!on) lines.push(['Lamps', 'Off right now (night).']);
  const hs = hotSpot(env, g);
  const cs = coolSpot(env, g);
  lines.push(['Hot spot', `${Math.round(hs.temp)}F`], ['Cool end', `${Math.round(cs.temp)}F`]);
  lines.push(['Peak UVB', g.maxUvb > 0 ? `${g.maxUvb.toFixed(1)} UVI (zone ${uvbZone(g.maxUvb)})` : 'none']);
  return lines;
}
