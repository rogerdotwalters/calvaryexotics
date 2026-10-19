/**
 * data/items/wallpapers.js
 * Purpose: wallpaper patterns as small tiles drawn over the wall color.
 * Inputs:  none (pure data)
 * Outputs: WALLPAPERS [{ id, name, description, grid }]
 * Notes:   '.' is transparent. Digits are room palette slots: 1-3 primary
 *          ramp, 4-7 secondary ramp (see palettes/room.js).
 *          grid: null means plain painted wall.
 */
export const WALLPAPERS = [
  { id: 'plain', name: 'Plain', description: 'Just paint.', grid: null },
  { id: 'stripes', name: 'Stripes', description: 'Soft vertical stripes.', grid: Array(8).fill('222.1...') },
  {
    id: 'dots', name: 'Polka dots', description: 'Half-drop dots.',
    grid: ['........', '.22.....', '.22.....', '........', '........', '.....22.', '.....22.', '........'],
  },
  {
    id: 'checks', name: 'Checks', description: 'Small checkerboard.',
    grid: ['2222....', '2222....', '2222....', '2222....', '....2222', '....2222', '....2222', '....2222'],
  },
  {
    id: 'diamonds', name: 'Diamonds', description: 'Lattice with a bright center.',
    grid: ['...22...', '..2..2..', '.2....2.', '2..55..2', '2..55..2', '.2....2.', '..2..2..', '...22...'],
  },
  {
    id: 'sprig', name: 'Leaf sprigs', description: 'Tiny sprigs, two to a tile.',
    grid: ['...6....', '..565...', '...5....', '...2....', '......6.', '.....565', '......5.', '......2.'],
  },
];
