/**
 * data/world.js
 * Purpose: size of the expanding room, in internal pixels.
 * Inputs:  none (pure data)
 * Outputs: VIEW_W/H (what the player sees), STATION_W (width of one table
 *          bay), EDGE_W (the "+" zone at each end), MAX_STATIONS,
 *          worldWidth(n).
 * Notes:   with one table the room is 2 x EDGE_W + STATION_W wide. A narrower
 *          view (a phone held upright) scrolls across it; a wider view centers it.
 */
// Default view size in internal pixels. The real size follows the screen (see
// render/viewport.js) and lives in state.view.w / state.view.h.
export const VIEW_W = 512;
export const VIEW_H = 288;
export const STATION_W = 320;
export const EDGE_W = 96;
export const MAX_STATIONS = 8;

// Everything was drawn at 3 pixels per inch first and then enlarged by 4/3 to 4
// (utils/pixelScale.js); hand-written pixel sizes use px() for the same reason.
export { PIXEL_SCALE, px } from '../utils/pixelScale.js';

export const worldWidth = (stationCount) => EDGE_W * 2 + stationCount * STATION_W;

/** Width of the scrollable room: at least as wide as the view. */
export const worldSize = (stationCount, viewW) => Math.max(viewW, worldWidth(stationCount));

/** Pixels the tables are shifted right so they stay centered when the view is wider than the room. */
export const worldOffset = (stationCount, viewW) => Math.floor((worldSize(stationCount, viewW) - worldWidth(stationCount)) / 2);

/**
 * Where the camera should be to center station `index` in a view of width viewW.
 * inset is how many pixels along the left edge are covered by a drawer or the tab
 * bar; the table is centered in the part that is left.
 */
export const centerOnStation = (index, stationCount, viewW, inset = 0) => {
  const center = worldOffset(stationCount, viewW) + EDGE_W + index * STATION_W + STATION_W / 2;
  return Math.max(0, Math.min(worldSize(stationCount, viewW) - viewW, Math.round(center - (viewW + inset) / 2)));
};

// Tank scale and glass frame (internal pixels), shared by layout and core.
export const PPI = 4; // pixels per inch: a 48-inch tank is 192px, a 12-inch one 48px
export const TANK_FRAME = { side: 3, lid: 7, base: 5 };

// Placed-item limits.
export const MAX_ITEMS_PER_TANK = 60;
export const MAX_ITEM_SCALE = 3;
