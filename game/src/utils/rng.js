/**
 * utils/rng.js
 * Purpose: small seeded random numbers, so animal behavior is repeatable and
 *          needs nothing but a saved seed.
 * Inputs:  createRng(seed)
 * Outputs: { next() -> [0,1), range(a, b), pick(list), seed() -> the next seed }
 */
export function createRng(seed) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (a, b) => a + next() * (b - a),
    pick: (list) => list[Math.floor(next() * list.length)],
    seed: () => s,
  };
}
