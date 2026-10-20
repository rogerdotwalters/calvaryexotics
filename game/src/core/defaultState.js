/**
 * core/defaultState.js
 * Purpose: the starting state of a new game, in the shape of the data model.
 * Inputs:  none
 * Outputs: createDefaultState(), createStation(id)
 * Notes:   view is the camera: cameraX is how far the room is scrolled, w and h
 *          are the size of the screen in internal pixels (set by the UI); inset is how
 *          much of the left edge a drawer or tab bar covers (also set by the UI).
 *          lighting has two lamp slots (they sit on top of the tank); slot is
 *          the one being edited. tank.gradient holds the saved light, heat and
 *          UVB grids (see systems/gradient.js). placedItems are in layer order (first = back). Item positions are
 *          fractions of the tank interior (fx across, fy down) so they survive
 *          tank resizes. the room is shared; each station is one table with its own tank,
 *          items, animals and lighting. Temperature is in degrees Fahrenheit.
 *          view.cameraX is how far the room is scrolled. room.ambient is the room temperature (F) that
 *          every tank warms up from. settings.night is the Day/Night switch. settings.mapOpacity: how solid
 *          a data map is; below 1 you see the tank through it and can still move items.
 *          settings.editItems: off locks the tank's objects (no selecting, moving or changing).
 */
import { VIEW_H, VIEW_W } from '../data/world.js';

export const SAVE_VERSION = 3;

export function createStation(id) {
  return {
    id,
    table: { style: 'plain', color: 'oak', height: 'medium' },
    tank: {
      size: '18x18x24',
      material: 'glass',
      drainage: 'clay-balls',
      charcoal: 'charcoal',
      substrate: 'bioactive',
      litter: 'oak-leaves',
      background: 'none',
      backgroundColor: 'natural',
      gradient: null, // filled in by systems/gradient.js
      environment: { temperature: 75, humidity: 60, cleanliness: 100, food: 100, water: 100, litter: 60 },
    },
    placedItems: [],
    animals: [],
    lighting: {
      lamps: [
        { type: 'none', color: 'warm', watts: 0 },
        { type: 'none', color: 'warm', watts: 0 },
      ],
      slot: 0,
    },
  };
}

export function createDefaultState() {
  return {
    saveVersion: SAVE_VERSION,
    room: {
      wallColor: 'cream',
      wallpaper: 'stripes',
      wallpaperColor: 'sage',
      trim: 'stepped',
      trimColor: 'white',
      ambient: 73, // room temperature in F, set with the wall thermostat
    },
    stations: [createStation('s1')],
    selectedStation: 's1',
    nextStationId: 2,
    selectedItem: null,
    nextItemId: 1,
    nextAnimalId: 1,
    view: { cameraX: 0, w: VIEW_W, h: VIEW_H, inset: 0 },
    discoveredLog: { species: [], morphs: [] },
    settings: { night: false, dataView: 'off', mapOpacity: 0.6, editItems: true },
  };
}
