/**
 * entities/animal.js
 * Purpose: builds a new animal (the saved state object) from a species definition.
 * Inputs:  createAnimal({ id, species, variant?, tank, count, registry })
 *          variant is one of species.variants (a starting morph); colonies also
 *          get a population `count`.
 * Outputs: an animal: { id, species, name, morph, count?, stage, age, fx, fy, heading, surface,
 *          mode, target, timer, hidden, spotId, mood, needs, worst, seed }
 * Notes:   position is a fraction of the tank interior. The starting color is
 *          is the species' first color (its standard look); the player recolors it
 *          from the Animals tab.
 */
import { createRng } from '../utils/rng.js';
import { groundFraction } from '../core/geometry.js';
import { morphLabel } from './morph.js';

const hash = (text) => [...text].reduce((h, ch) => (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0, 7);

export function createAnimal({ id, species, variant, tank, count, registry }) {
  const rng = createRng(hash(id));
  const colors = species.genetics.traits.color.alleles;
  const morph = variant ? { ...variant.morph } : { color: colors[0], pattern: 'none' }; // the standard look; recolor it afterwards
  return {
    id,
    species: species.id,
    // Colonies are identified by how they look; individual animals get a number.
    name: species.colony ? morphLabel(species, morph) : `${species.name.split(' ')[0]} ${count + 1}`,
    morph,
    ...(species.colony ? { count: species.colony.start } : {}),
    stage: species.lifecycle.at(-1).id,
    age: 0,
    fx: 0.3 + rng.next() * 0.4,
    fy: Math.max(0.05, groundFraction(tank, registry) - 0.04),
    heading: 'right',
    surface: 'ground',
    settled: false,
    preyId: null,
    restHeading: 'right',
    mode: 'idle',
    target: null,
    timer: 2,
    hidden: null,
    spotId: null,
    mood: 0.8,
    needs: {},
    worst: 'temperature',
    seed: hash(id + 'seed'),
  };
}
