/**
 * systems/humidity.js
 * Purpose: where the tank is damp and where it is dry. Turns the items in a tank
 *          into a humidity map (one value per 1-inch cell) and into a boost for the
 *          tank's overall average. No rendering, no DOM.
 * Inputs:  station, registry (rules: data/humidityRules.js)
 * Outputs: humidityField(station, registry) -> { cols, rows, values, groundRow },
 *          humidityBoost(station, registry) -> points added to the tank average,
 *          restsOnGround(placed, entry, ground, interiorH)
 * Notes:   the grid is the same one the heat gradient uses (tank.gradient).
 *          Air cells (above the substrate) get the tank average, a little damper
 *          near the floor, drier where a lamp heats the air, and a boost around
 *          moss, ferns and bromeliads.
 *          Soil cells (the substrate rows) get the substrate's own dampness (sand is
 *          drier) and a damp patch under anything resting on the ground: most under
 *          moss and mossy rocks, a little under bare rocks, sticks and hides.
 *          An item that is lifted off the ground leaves no damp patch.
 *          Derived, not saved: it follows the environment, the saved heat gradient
 *          and what is in the tank.
 */
import { PPI } from '../data/world.js';
import { RULES } from '../data/environmentRules.js';
import { AIR_REACH, RESTING_TOLERANCE_PX, SOIL_DEPTH_CELLS, SOIL_ZONE, humidityEffect } from '../data/humidityRules.js';
import { itemRect } from '../core/itemGeometry.js';
import { interiorHeight, interiorWidth, stackHeight } from '../core/geometry.js';

const CELL = PPI;

/** Is this item sitting on the substrate (not hanging on the wall, not lifted, not buried)? */
export function restsOnGround(placed, entry, ground, interiorH) {
  if (placed.plane === 'back' || placed.behind || entry.anchor !== 'ground') return false;
  return Math.abs(placed.fy * interiorH - ground) <= RESTING_TOLERANCE_PX;
}

/** Every placed item that matters for humidity, with its effect and where it sits (pixels in the interior). */
function sources(station, registry, interior, ground) {
  const out = [];
  for (const placed of station.placedItems) {
    const entry = registry.list(placed.catalog)?.find((e) => e.id === placed.itemId);
    if (!entry) continue;
    const effect = humidityEffect(placed.catalog, entry);
    if (!effect.air && !effect.soil && !effect.avg) continue;
    out.push({
      effect,
      rect: itemRect(interior, placed, entry),
      resting: restsOnGround(placed, entry, ground, interior.h),
    });
  }
  return out;
}

const interiorOf = (tank, registry) => ({ x: 0, y: 0, w: interiorWidth(tank, registry), h: interiorHeight(tank, registry) });

/** Points added to the tank's average humidity by what is in it. Pothos and snake plants add nothing. */
export function humidityBoost(station, registry) {
  const interior = interiorOf(station.tank, registry);
  const ground = interior.h - stackHeight(station.tank, registry);
  const total = sources(station, registry, interior, ground).reduce((sum, s) => sum + s.effect.avg, 0);
  return Math.min(total, RULES.humidity.avgMax);
}

export function humidityField(station, registry) {
  const g = station.tank.gradient;
  const env = station.tank.environment;
  if (!g?.cols) return { cols: 0, rows: 0, values: [], groundRow: 0 };
  const { cols, rows } = g;
  const { tank } = station;
  const interior = interiorOf(tank, registry);
  const ground = interior.h - stackHeight(tank, registry);
  const items = sources(station, registry, interior, ground);
  const hasSoil = tank.substrate !== 'none';
  const soilBase = SOIL_ZONE[tank.substrate] ?? SOIL_ZONE.default;

  const values = new Array(cols * rows);
  for (let r = 0; r < rows; r++) {
    const y = (r + 0.5) * CELL;
    const inSoil = hasSoil && y > ground;
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5) * CELL;
      const k = r * cols + c;
      let rh;
      if (inSoil) {
        rh = env.humidity + soilBase;
        const depth = (y - ground) / CELL;
        const fade = Math.max(0, 1 - depth / (SOIL_DEPTH_CELLS + 1));
        for (const s of items) {
          if (!s.resting || !s.effect.soil) continue;
          const away = Math.max(0, s.rect.x - x, x - (s.rect.x + s.rect.w)) / CELL; // cells outside the item's width
          rh += s.effect.soil * fade * Math.max(0, 1 - away / 1.5);
        }
      } else {
        rh = env.humidity + ((r + 0.5) / rows - 0.5) * 12 - g.heat[k] * 0.5; // damper low down, drier under a lamp
        for (const s of items) {
          if (!s.effect.air) continue;
          const reach = 1.5 + AIR_REACH * Math.max(s.rect.w, s.rect.h) / CELL;
          const dist = Math.hypot(x - (s.rect.x + s.rect.w / 2), y - (s.rect.y + s.rect.h / 2)) / CELL;
          rh += s.effect.air * Math.exp(-dist / reach);
        }
      }
      values[k] = Math.min(100, Math.max(0, rh));
    }
  }
  return { cols, rows, values, groundRow: Math.min(rows, Math.ceil(ground / CELL)) };
}
