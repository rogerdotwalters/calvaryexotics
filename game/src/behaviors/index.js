/**
 * behaviors/index.js
 * Purpose: the behavior modules, by name. A species lists the names it uses
 *          (species.behaviors); the animal simulation picks among them.
 * Inputs:  none
 * Outputs: BEHAVIORS { idle, climb, crawl, hop, hide, lounge, burrow, hunt }
 * Module:  { name, score(animal, ctx) -> 0.., begin(animal, ctx) -> animal,
 *            step(animal, ctx, dt) -> { animal, done, effects? } }
 */
import { idle } from './idle.js';
import { climb } from './climb.js';
import { crawl } from './crawl.js';
import { hop } from './hop.js';
import { hide } from './hide.js';
import { lounge } from './lounge.js';
import { burrow } from './burrow.js';
import { hunt } from './hunt.js';

export const BEHAVIORS = { idle, climb, crawl, hop, hide, lounge, burrow, hunt };
