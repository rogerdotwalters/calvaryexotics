/**
 * data/registry.js
 * Purpose: the one place content catalogs are registered. To add content,
 *          add a data file (or an entry in one) and list it here.
 * Inputs:  none
 * Outputs: registry.list(kind) -> array, registry.get(kind, id) -> entry
 * Notes:   get() falls back to the first entry for unknown ids, so old saves
 *          and removed content never crash the renderer.
 */
import { WALL_COLORS, WALLPAPER_COLORS, TRIM_COLORS, TABLE_COLORS } from './palettes/room.js';
import { BACKGROUND_COLORS } from './palettes/terrarium.js';
import { WALLPAPERS } from './items/wallpapers.js';
import { TRIMS } from './items/trims.js';
import { TABLES, TABLE_HEIGHTS } from './items/tables.js';
import { PLANTS } from './items/plants.js';
import { ROCKS } from './items/rocks.js';
import { SUBSTRATES } from './items/substrates.js';
import { DRAINAGE } from './items/drainage.js';
import { CHARCOAL } from './items/charcoal.js';
import { LITTER } from './items/litter.js';
import { BARRIER } from './items/barrier.js';
import { MOSS } from './items/moss.js';
import { DECOR } from './items/decor.js';
import { LEDGES } from './items/ledges.js';
import { BACKGROUNDS } from './items/backgrounds.js';
import { LIGHTING, LIGHT_COLORS } from './items/lighting.js';
import { SPECIES } from './species/index.js';
import { TANK_SIZES, TANK_MATERIALS } from './tankSizes.js';
import { scaleGrid, px } from '../utils/pixelScale.js';

const catalogs = {
  wallColors: WALL_COLORS,
  wallpapers: WALLPAPERS,
  wallpaperColors: WALLPAPER_COLORS,
  trims: TRIMS,
  trimColors: TRIM_COLORS,
  tables: TABLES,
  tableColors: TABLE_COLORS,
  tableHeights: TABLE_HEIGHTS,
  tankSizes: TANK_SIZES,
  tankMaterials: TANK_MATERIALS,
  plants: PLANTS,
  rocks: ROCKS,
  substrates: SUBSTRATES,
  drainage: DRAINAGE,
  charcoal: CHARCOAL,
  litter: LITTER,
  barrier: BARRIER,
  moss: MOSS,
  decor: DECOR,
  ledges: LEDGES,
  backgrounds: BACKGROUNDS,
  backgroundColors: BACKGROUND_COLORS,
  lights: LIGHTING,
  lightColors: LIGHT_COLORS,
  animals: SPECIES,
};

// All art was drawn at 3 pixels per inch; the game now runs at 4. Every grid is
// enlarged by 4/3 here, once, and pixel sizes are scaled to match, so the rest
// of the game only ever sees the new resolution.
const TILES = new Set(['wallpapers', 'trims', 'backgrounds', 'substrates', 'drainage', 'charcoal', 'litter', 'barrier']);
const SPRITES = new Set(['plants', 'moss', 'rocks', 'decor', 'ledges']);
const FLOOR_HEIGHT = new Set(['substrates', 'drainage', 'charcoal', 'litter']);

function enlarge(kind, entry) {
  if (TILES.has(kind)) {
    const next = { ...entry, grid: scaleGrid(entry.grid, true) };
    if (FLOOR_HEIGHT.has(kind) && entry.height) next.height = px(entry.height);
    return next;
  }
  if (SPRITES.has(kind)) return { ...entry, grid: scaleGrid(entry.grid) };
  if (kind === 'tables') {
    return {
      ...entry,
      topTile: scaleGrid(entry.topTile, true),
      bodyTile: scaleGrid(entry.bodyTile, true),
      ...Object.fromEntries(['topH', 'inset', 'margin', 'minW', 'legW', 'apronH', 'drawerW', 'drawerH']
        .filter((k) => entry[k] !== undefined).map((k) => [k, px(entry[k])])),
    };
  }
  if (kind === 'tableHeights') return { ...entry, px: px(entry.px) };
  return entry;
}

for (const [kind, list] of Object.entries(catalogs)) catalogs[kind] = list.map((entry) => enlarge(kind, entry));

const index = {};
for (const [kind, list] of Object.entries(catalogs)) {
  index[kind] = new Map(list.map((entry) => [entry.id, entry]));
}

export const registry = {
  list(kind) {
    return catalogs[kind];
  },
  get(kind, id) {
    return index[kind].get(id) ?? catalogs[kind][0];
  },
};
