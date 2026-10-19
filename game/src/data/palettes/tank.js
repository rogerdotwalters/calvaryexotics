/**
 * data/palettes/tank.js
 * Purpose: shared palette for the tank (frame, glass, mesh lid) and lighting
 *          tints later on.
 * Inputs:  none (pure data)
 * Outputs: TANK_PALETTE
 *
 * Slots: 0-3 frame dark -> light | 4-7 glass light -> dark | 8-9 glints
 *        a-b mesh dark/light     | c-f reserved for lighting tints
 */
export const TANK_PALETTE = {
  id: 'tank',
  colors: [
    '#1b1822', '#37323f', '#5a5466', '#8a849a', // 0-3 frame
    '#d6ece9', '#bcdbd9', '#9cc3c4', '#78a3a9', // 4-7 glass
    '#ffffff', '#eef9f7',                       // 8-9 glints
    '#2b2833', '#4c4758',                       // a-b mesh
    '#f2c14e', '#d9674a', '#4d7a5a', '#243b2f', // c-f reserved
  ],
};
