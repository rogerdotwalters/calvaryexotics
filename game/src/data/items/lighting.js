/**
 * data/items/lighting.js
 * Purpose: lamp fixtures (they sit on top of the tank) and LED colors.
 * Inputs:  none (pure data)
 * Outputs: LIGHTING (fixtures), LIGHT_COLORS (LED colors, warm to cool),
 *          lightHex(fixture, colorId)
 * Fixture: { id, name, description, kind, color, colorable, watts[],
 *            defaultWatts, half, heatK, uvbK, lightK, dryK, nightOn?, swatch }
 *   watts       wattages you can pick; more watts = longer beam, more heat/UVB
 *   half        half-angle of the cone of light, in degrees
 *   heatK       degrees F added per watt, 4 in below the lamp, on-axis
 *   uvbK        UVB index per watt (same units as the UV Index)
 *   lightK      visible light per watt
 *   dryK        humidity points removed per watt while on
 *   nightOn     stays on at night when the day/night cycle is enabled
 * Notes:   the physics lives in systems/gradient.js.
 */
export const LIGHTING = [
  { id: 'none', name: 'No lamp', description: 'Empty slot.', kind: 'none', color: null, watts: [], defaultWatts: 0, half: 0, heatK: 0, uvbK: 0, lightK: 0, dryK: 0, swatch: '#5c606a' },
  { id: 'led', name: 'LED bar', description: 'Pick any color.', kind: 'led', color: null, colorable: true, watts: [10, 20, 40], defaultWatts: 20, half: 58, heatK: 0.05, uvbK: 0, lightK: 0.05, dryK: 0.04, swatch: '#fff4e0' },
  { id: 'uvb-5', name: 'UVB 5.0', description: 'Tube for forest dwellers.', kind: 'uvb', color: '#e6f2ff', watts: [14, 24, 39], defaultWatts: 24, half: 62, heatK: 0.1, uvbK: 0.21, lightK: 0.04, dryK: 0.1, swatch: '#e6f2ff' },
  { id: 'uvb-10', name: 'UVB 10.0', description: 'Strong tube for desert.', kind: 'uvb', color: '#dcecff', watts: [24, 39, 54], defaultWatts: 39, half: 62, heatK: 0.1, uvbK: 0.3, lightK: 0.04, dryK: 0.1, swatch: '#dcecff' },
  { id: 'heat-lamp', name: 'Basking lamp', description: 'Warm spot, dries the air.', kind: 'heat', color: '#ffb36b', watts: [25, 40, 60, 75, 100, 150], defaultWatts: 60, half: 38, heatK: 0.5, uvbK: 0, lightK: 0.04, dryK: 0.09, swatch: '#ffb36b' },
  { id: 'ceramic', name: 'Ceramic heater', description: 'Heat with no light.', kind: 'heat', color: null, watts: [60, 100, 150, 200], defaultWatts: 100, half: 80, heatK: 0.18, uvbK: 0, lightK: 0, dryK: 0.06, nightOn: true, swatch: '#8a8f98' },
  { id: 'moon', name: 'Moon light', description: 'Dim blue, for night.', kind: 'led', color: '#8fa8ff', watts: [3, 5, 10], defaultWatts: 5, half: 50, heatK: 0, uvbK: 0, lightK: 0.1, dryK: 0, nightOn: true, swatch: '#8fa8ff' },
];

export const LIGHT_COLORS = [
  { id: 'warm', name: 'Warm white', description: '2700K, cozy.', swaps: {}, hex: '#ffd09a', swatch: '#ffd09a' },
  { id: 'soft', name: 'Soft white', description: '3500K.', swaps: {}, hex: '#ffe7bd', swatch: '#ffe7bd' },
  { id: 'daylight', name: 'Daylight', description: '5000K, neutral.', swaps: {}, hex: '#fff6e8', swatch: '#fff6e8' },
  { id: 'cool', name: 'Cool white', description: '6500K, crisp.', swaps: {}, hex: '#d9ebff', swatch: '#d9ebff' },
  { id: 'amber', name: 'Amber', description: 'Warm orange glow.', swaps: {}, hex: '#ffa94d', swatch: '#ffa94d' },
  { id: 'leaf', name: 'Leaf green', description: 'Plant glow.', swaps: {}, hex: '#b6f5a8', swatch: '#b6f5a8' },
  { id: 'rose', name: 'Rose', description: 'Soft pink.', swaps: {}, hex: '#ff9fc6', swatch: '#ff9fc6' },
];

/** The color a fixture shines, or null when it gives no visible light. */
export function lightHex(fixture, colorId) {
  if (fixture?.color) return fixture.color;
  if (fixture?.colorable) return (LIGHT_COLORS.find((c) => c.id === colorId) ?? LIGHT_COLORS[0]).hex;
  return null;
}
