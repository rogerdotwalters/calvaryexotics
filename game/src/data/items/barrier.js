/**
 * data/items/barrier.js
 * Purpose: the thin mesh that keeps substrate out of the drainage layer.
 *          Drawn automatically between drainage and the layers above it.
 * Inputs:  none (pure data)
 * Outputs: BARRIER [{ id, name, height, grid }]
 */
export const BARRIER = [
  { id: 'mesh', name: 'Substrate barrier', description: 'Fine mesh.', height: 1, grid: ['dcdc'] },
];
