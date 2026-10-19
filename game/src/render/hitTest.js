/**
 * render/hitTest.js
 * Purpose: answer "what is under this point?" for the stage input.
 * Inputs:  { getState, registry }
 * Outputs: { pickItem(wx, wy), toFraction(stationIndex, wx, wy),
 *            snap(stationIndex, placed, fx, fy) }  (world pixel coordinates)
 * Notes:   read-only; uses the same geometry as the renderer.
 */
import { getLayout } from './layout.js';
import { itemRect, snapPosition, containsPoint } from './itemGeometry.js';

export function createPicker({ getState, registry }) {
  const entryOf = (p) => registry.list(p.catalog)?.find((e) => e.id === p.itemId);

  function pickItem(wx, wy) {
    const state = getState();
    const layout = getLayout(state, registry);
    for (let si = 0; si < state.stations.length; si++) {
      const { interior } = layout.stations[si].tank;
      if (wx < interior.x || wx >= interior.x + interior.w || wy < interior.y || wy >= interior.y + interior.h) continue;
      const items = state.stations[si].placedItems;
      const soilTop = interior.y + layout.stations[si].ground;
      // Front items first (top layer first), then items behind the substrate,
      // which can only be reached where they show above the soil.
      const order = [
        ...items.filter((p) => p.plane !== 'back' && !p.behind).reverse(),
        ...items.filter((p) => p.plane !== 'back' && p.behind).reverse().filter(() => wy < soilTop),
        ...items.filter((p) => p.plane === 'back').reverse(),
      ];
      for (const placed of order) {
        const entry = entryOf(placed);
        if (!entry) continue;
        const r = itemRect(interior, placed, entry);
        if (containsPoint(r, placed.rotation, wx, wy)) {
          return { id: placed.id, stationIndex: si, fx: placed.fx, fy: placed.fy };
        }
      }
    }
    return null;
  }

  function toFraction(stationIndex, wx, wy) {
    const { interior } = getLayout(getState(), registry).stations[stationIndex].tank;
    return { fx: (wx - interior.x) / interior.w, fy: (wy - interior.y) / interior.h };
  }

  function snap(stationIndex, placed, fx, fy) {
    const st = getLayout(getState(), registry).stations[stationIndex];
    return snapPosition(st.tank.interior, st.ground, entryOf(placed) ?? { anchor: 'ground' }, fx, fy);
  }

  return { pickItem, toFraction, snap };
}
