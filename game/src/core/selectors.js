/**
 * core/selectors.js
 * Purpose: read-only helpers for finding things in state.
 * Inputs:  state
 * Outputs: getSelectedStation, getSelectedIndex, maxCameraX
 */
import { worldSize } from '../data/world.js';

export const getSelectedIndex = (s) =>
  Math.max(0, s.stations.findIndex((st) => st.id === s.selectedStation));

export const getSelectedStation = (s) => s.stations[getSelectedIndex(s)];

export const maxCameraX = (s) => Math.max(0, worldSize(s.stations.length, s.view.w) - s.view.w);

/** The selected placed item with its station and layer index, or null. */
export function getSelectedItem(s) {
  if (!s.selectedItem) return null;
  for (const station of s.stations) {
    const index = station.placedItems.findIndex((p) => p.id === s.selectedItem);
    if (index >= 0) return { station, item: station.placedItems[index], index };
  }
  return null;
}
