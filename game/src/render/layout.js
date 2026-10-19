/**
 * render/layout.js
 * Purpose: all scene geometry in internal pixels, derived from state.
 * Inputs:  state (state.view is the screen size), registry
 * Outputs: getLayout() -> { view, world, room, stations[], plus }.
 *          Each station has { id, table, tank } rects in world coordinates;
 *          tank.interior is the glass area items live in; station.ground is the
 *          pixel offset down the interior where the substrate surface sits.
 * Notes:   PPI pixels per inch. Tanks sit on the table top; tables stand on the
 *          floor line (feetY). On a landscape screen the floor is near the
 *          bottom;  on a portrait screen it sits about half way down so the
 *          tank stays above a bottom drawer and below the care bar. The room is as tall as the view and
 *          as wide as the view or the tables, whichever is larger.
 */
import { STATION_W, EDGE_W, PPI, TANK_FRAME, px, worldOffset, worldSize, worldWidth } from '../data/world.js';
import { stackHeight } from '../core/geometry.js';

export { PPI, TANK_FRAME };

const BASEBOARD_H = px(8);
const FLOOR_DEPTH = px(18); // how far the table feet stand into the floor
const LAMP_ROOM = px(16); // space kept above the tallest tank for lamps
const MIN_TABLE = px(24);
const PLUS = { size: px(28) };
const TOP_UI = 56; // portrait: room kept clear for the care bar floating over the top

function stationLayout(station, index, registry, feetY, centerX, reserve) {
  const size = registry.get('tankSizes', station.tank.size);
  const style = registry.get('tables', station.table.style);
  const tankH = size.height * PPI;
  // A very tall tank gets a lower table so the lamps still fit in the view.
  const tableH = Math.max(MIN_TABLE, Math.min(registry.get('tableHeights', station.table.height).px, feetY - reserve - tankH));

  const cx = centerX + index * STATION_W + STATION_W / 2;
  const tankW = size.width * PPI;
  const tableW = Math.max(style.minW, tankW + style.margin);
  const topY = feetY - tableH;

  const tank = { x: Math.round(cx - tankW / 2), y: topY - tankH, w: tankW, h: tankH };
  tank.interior = {
    x: tank.x + TANK_FRAME.side,
    y: tank.y + TANK_FRAME.lid,
    w: tank.w - TANK_FRAME.side * 2,
    h: tank.h - TANK_FRAME.lid - TANK_FRAME.base,
  };
  const table = { x: Math.round(cx - tableW / 2), y: topY, w: tableW, h: tableH, feetY };
  const ground = tank.interior.h - stackHeight(station.tank, registry);
  return { id: station.id, table, tank, ground };
}

export function getLayout(state, registry) {
  const { w: viewW, h: viewH } = state.view;
  const count = state.stations.length;
  const offset = worldOffset(count, viewW);

  // The floor line: low on a wide screen, around the middle on a tall one.
  const tallest = Math.max(...state.stations.map((st) => registry.get('tankSizes', st.tank.size).height * PPI));
  const portrait = viewH > viewW * 1.15;
  const reserve = LAMP_ROOM + (portrait ? TOP_UI : 0); // clear space above the tallest tank
  const needed = tallest + MIN_TABLE + reserve;
  const feetY = Math.max(needed, Math.min(viewH - px(12), portrait ? Math.round(viewH * 0.52) : viewH - px(12)));
  const floorTop = feetY - FLOOR_DEPTH;

  const baseW = worldWidth(count);
  return {
    view: { w: viewW, h: viewH },
    world: { w: worldSize(count, viewW), h: Math.max(viewH, feetY + px(12)) },
    room: { floorTop, baseboardY: floorTop - BASEBOARD_H, baseboardH: BASEBOARD_H },
    stations: state.stations.map((st, i) => stationLayout(st, i, registry, feetY, offset + EDGE_W, reserve)),
    plus: {
      size: PLUS.size,
      y: feetY - px(70),
      leftX: offset + Math.round((EDGE_W - PLUS.size) / 2),
      rightX: offset + EDGE_W + count * STATION_W + Math.round((EDGE_W - PLUS.size) / 2),
    },
    baseW,
  };
}
