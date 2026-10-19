/**
 * data/species/index.js
 * Purpose: the list of species. Adding a species = add its file and list it here.
 * Inputs:  none (pure data)
 * Outputs: SPECIES []
 */
import { CRESTED_GECKO } from './crestedGecko.js';
import { ISOPODS } from './isopods.js';
import {
  VIPER_GECKO, BEARDED_DRAGON, VEILED_CHAMELEON, GIANT_DAY_GECKO, GOLD_DUST_DAY_GECKO, GREEN_ANOLE, BOX_TURTLE,
} from './reptiles.js';
import { DART_FROG, PACMAN_FROG } from './amphibians.js';

export const SPECIES = [
  CRESTED_GECKO, VIPER_GECKO, BEARDED_DRAGON, VEILED_CHAMELEON, GIANT_DAY_GECKO, GOLD_DUST_DAY_GECKO,
  GREEN_ANOLE, DART_FROG, PACMAN_FROG, BOX_TURTLE, ISOPODS,
];
