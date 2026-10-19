/**
 * data/palettes/animals.js
 * Purpose: shared palette for animals. A morph recolors an animal by swapping
 *          the body and pattern ramps (see each species' genetics).
 * Inputs:  none (pure data)
 * Outputs: ANIMAL_PALETTE
 *
 * Slots: 0-3 body (dark -> light) | 4-7 crest and pattern | 8-b cream (belly,
 *        pinstripe) | c pupil | d eye ring | e toe pads | f highlight |
 *        g-j iris (dark -> light) | k mouth and lid line | l nostril
 */
export const ANIMAL_PALETTE = {
  id: 'animals',
  colors: [
    '#4a3524', '#7a5638', '#a87a4c', '#d1a46c', // 0-3 body
    '#5e3a1c', '#8c5a2a', '#b9803a', '#e0aa60', // 4-7 crest and pattern
    '#b9a98b', '#d4c6a8', '#eadfc6', '#f6eedb', // 8-b cream
    '#14110f', '#e6c34a', '#e0a58f', '#ffffff', // c pupil, d eye ring, e toe pads, f highlight
    '#8a4a10', '#c47a1c', '#e8a83a', '#f6d070', // g-j iris
    '#3a2418', '#2a1c14',                       // k mouth line, l nostril
  ],
};
