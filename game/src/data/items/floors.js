/**
 * data/items/floors.js
 * Purpose: the floor tile (fixed for now; becomes customizable later).
 * Inputs:  none (pure data)
 * Outputs: FLOOR { id, grid }  (16x8 planks, room palette ramp N: 8-b)
 */
export const FLOOR = {
  id: 'planks',
  grid: [
    '8888888888888888',
    '8aaaa9aaaaaaabaa',
    '8aa9aaaaaa9aaaaa',
    '8aaaaaabaaaa9aaa',
    '8888888888888888',
    'aaaaaa9a8aaaabaa',
    'a9aaaaaa8aaaaaa9',
    'aaaabaaa8a9aaaaa',
  ],
};
