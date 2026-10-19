/**
 * data/palettes/terrarium.js
 * Purpose: shared palette for everything inside the tank (plants, moss,
 *          rocks, decor, substrate layers, backgrounds).
 * Inputs:  none (pure data)
 * Outputs: TERRARIUM_PALETTE
 *
 * Sprite grids use base-32 digits, one 4-color ramp (dark -> light) per group:
 *   0-3 green    4-7 teal      8-b wood (cork, branches)   c-f stone
 *   g-j soil     k-n rust (clay balls, flowers)            o-r sand
 *   s-v bark (grey-brown, like oak bark)
 */
export const TERRARIUM_PALETTE = {
  id: 'terrarium',
  colors: [
    '#1f3a2a', '#2f5d3f', '#4f8a52', '#86b86a', // 0-3 green
    '#1e4a46', '#2f6f65', '#4f9a86', '#8fc9ad', // 4-7 teal
    '#3b2a1e', '#5c4130', '#86603f', '#b08a5a', // 8-b wood
    '#3a3d44', '#5c606a', '#8a8f98', '#bcc1c8', // c-f stone
    '#2d2118', '#4a3727', '#6f553a', '#977a55', // g-j soil
    '#7a2f1f', '#a8472a', '#d06a35', '#eb9a5c', // k-n rust
    '#9a7f55', '#c2a672', '#dcc590', '#efe0b0', // o-r sand
    '#2e2b27', '#4b4640', '#746e63', '#a29c8f', // s-v bark
  ],
};

/**
 * Background colors: each is one 4-color ramp (dark -> light). A background
 * applies it to its own ramp slot (`ramp` in data/items/backgrounds.js), so
 * any color works with any background. "Natural" keeps the original look.
 */
import { ramp, colorway } from '../../utils/palette.js';

export const BACKGROUND_COLORS = [
  { id: 'natural', name: 'Natural', swaps: {}, swatch: '#86603f' },
  colorway('charcoal', 'Charcoal', ramp(0, ['#131518', '#24272c', '#3d4148', '#686e77'])),
  colorway('slate', 'Slate blue', ramp(0, ['#2c3a46', '#46596a', '#6b839a', '#9db4c6'])),
  colorway('moss', 'Moss', ramp(0, ['#232f22', '#394d37', '#587a52', '#86a878'])),
  colorway('sand', 'Sand', ramp(0, ['#5d4a2c', '#8a7044', '#b89c66', '#e0c994'])),
  colorway('rust', 'Rust', ramp(0, ['#3a1d14', '#5e2f20', '#8c4a32', '#bd7650'])),
  colorway('bone', 'Bone', ramp(0, ['#5c554a', '#8c8374', '#bfb6a3', '#e7e0cf'])),
  colorway('plum', 'Plum', ramp(0, ['#2a1f33', '#443152', '#6a4f80', '#9a82b0'])),
];
