/**
 * data/palettes/index.js
 * Purpose: finds the palette a catalog entry draws with.
 * Inputs:  an entry with an optional `palette` id ('flora'); default 'terrarium'.
 * Outputs: paletteOf(entry) -> palette
 */
import { TERRARIUM_PALETTE } from './terrarium.js';
import { FLORA_PALETTE } from './flora.js';

const PALETTES = { terrarium: TERRARIUM_PALETTE, flora: FLORA_PALETTE };

export const paletteOf = (entry) => PALETTES[entry?.palette] ?? TERRARIUM_PALETTE;
