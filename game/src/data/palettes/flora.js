/**
 * data/palettes/flora.js
 * Purpose: the plant palette: greens plus the colors of bracts, blooms and
 *          variegated leaves. Plants set `palette: 'flora'` to use it.
 * Inputs:  none (pure data)
 * Outputs: FLORA_PALETTE
 *
 * Sprite grids use base-32 digits, one 4-color ramp (dark -> light) per group:
 *   0-3 green   4-7 teal   8-b lime   c-f gold
 *   g-j cream   k-n red    o-r pink   s-v silver
 */
export const FLORA_PALETTE = {
  id: 'flora',
  colors: [
    '#1f3a2a', '#2f5d3f', '#4f8a52', '#86b86a', // 0-3 green
    '#1e4a46', '#2f6f65', '#4f9a86', '#8fc9ad', // 4-7 teal
    '#4a6b1e', '#7a9e2a', '#b3d03e', '#e1f27a', // 8-b lime
    '#8a6a14', '#c79a1e', '#eec23c', '#fbe68a', // c-f gold
    '#9aa08a', '#c9cfb4', '#eaeed6', '#fbfcf0', // g-j cream
    '#7a1f1f', '#b83a2a', '#e0603a', '#f59a6a', // k-n red
    '#7a2a52', '#b04a7e', '#dd7aa8', '#f6b8d2', // o-r pink
    '#4a5a58', '#7a8c88', '#aebcb8', '#dde6e2', // s-v silver
  ],
};
