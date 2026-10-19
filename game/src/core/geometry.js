/**
 * core/geometry.js
 * Purpose: tank-interior math that game logic needs without touching render.
 * Inputs:  tank state, registry
 * Outputs: substrateStack() (floor layers, bottom to top), stackHeight(), soilBand(),
 *          interiorWidth(), interiorHeight(), groundFraction() (0..1 down the interior).
 * Notes:   the floor is built bottom-up like a real bioactive setup:
 *          drainage, a mesh barrier (automatic, only above drainage),
 *          charcoal, base substrate, leaf litter. "none" entries add nothing.
 */
import { PPI, TANK_FRAME } from '../data/world.js';

export function substrateStack(tank, registry) {
  const layers = [];
  const add = (kind, entry) => {
    if (entry?.grid && entry.height > 0) layers.push({ kind, entry });
  };
  const drainage = registry.get('drainage', tank.drainage);
  add('drainage', drainage);
  if (drainage?.grid) add('barrier', registry.get('barrier', 'mesh'));
  add('charcoal', registry.get('charcoal', tank.charcoal));
  add('substrate', registry.get('substrates', tank.substrate));
  add('litter', registry.get('litter', tank.litter));
  return layers;
}

export const stackHeight = (tank, registry) =>
  substrateStack(tank, registry).reduce((sum, layer) => sum + layer.entry.height, 0);

export function interiorWidth(tank, registry) {
  const size = registry.get('tankSizes', tank.size);
  return size.width * PPI - TANK_FRAME.side * 2;
}

/**
 * Where the base substrate is, as pixels down from the top of the tank
 * interior: { top, bottom }. Animals can burrow in this band. null with no substrate.
 */
export function soilBand(tank, registry) {
  const stack = substrateStack(tank, registry);
  let y = interiorHeight(tank, registry) - stackHeight(tank, registry); // top of the whole floor
  for (let i = stack.length - 1; i >= 0; i--) { // walk down from the top layer
    const { kind, entry } = stack[i];
    if (kind === 'substrate') return { top: y, bottom: y + entry.height };
    y += entry.height;
  }
  return null;
}

export function interiorHeight(tank, registry) {
  const size = registry.get('tankSizes', tank.size);
  return size.height * PPI - TANK_FRAME.lid - TANK_FRAME.base;
}

export function groundFraction(tank, registry) {
  return 1 - stackHeight(tank, registry) / interiorHeight(tank, registry);
}
