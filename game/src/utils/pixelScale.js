/**
 * utils/pixelScale.js
 * Purpose: enlarge pixel art by 4/3 (the game's resolution went from 3 to 4
 *          pixels per inch) without blurring it and without uneven pixels.
 * Inputs:  scaleGrid(grid, tile?) with grid = array of equal-length strings;
 *          '.' is transparent.
 * Outputs: a new grid about 4/3 bigger each way, using only the same colors.
 * How:     every 3 lines of the picture become 4, by repeating one line in
 *          each group of 3. The repeated line is the one that looks most like
 *          its neighbor (a flat area, not a fine detail), and never an empty
 *          line, so 1-pixel details stay 1 pixel and the sprite really grows.
 *          Rows are done, then columns. tile = true treats the picture as
 *          seamlessly repeating, so a tile still repeats cleanly.
 * Notes:   results are cached by grid identity, so scaling is free after the
 *          first time.
 */
export const PIXEL_SCALE = 4 / 3;

const cache = new WeakMap();

const target = (n) => Math.max(1, Math.round(n * PIXEL_SCALE));

/** Which lines to repeat: one per bin, the cheapest to repeat in that bin. */
function pickRepeats(lines, wanted, tile) {
  const n = lines.length;
  const extra = wanted - n;
  const picks = new Set();
  for (let k = 0; k < extra; k++) {
    const lo = Math.floor((k * n) / extra);
    const hi = Math.max(lo + 1, Math.floor(((k + 1) * n) / extra));
    const mid = (lo + hi - 1) / 2;
    let best = lo;
    let bestCost = Infinity;
    for (let i = lo; i < hi; i++) {
      const line = lines[i];
      const next = lines[tile ? (i + 1) % n : Math.min(n - 1, i + 1)];
      let cost = 0;
      for (let c = 0; c < line.length; c++) if (line[c] !== next[c]) cost++;
      if (line.every((ch) => ch === '.')) cost += 1000; // never grow by padding
      cost += Math.abs(i - mid) * 0.01; // spread them out
      if (cost < bestCost) { best = i; bestCost = cost; }
    }
    picks.add(best);
  }
  return picks;
}

function stretch(lines, wanted, tile) {
  const picks = pickRepeats(lines, wanted, tile);
  const out = [];
  lines.forEach((line, i) => { out.push(line); if (picks.has(i)) out.push(line); });
  return out;
}

const transpose = (m) => m[0].map((_, c) => m.map((row) => row[c]));

export function scaleGrid(grid, tile = false) {
  if (!grid) return grid;
  const hit = cache.get(grid);
  if (hit) return hit;
  let rows = grid.map((r) => [...r]);
  rows = stretch(rows, target(rows.length), tile);
  rows = transpose(stretch(transpose(rows), target(rows[0].length), tile));
  const out = rows.map((r) => r.join(''));
  cache.set(grid, out);
  cache.set(out, out); // scaling a scaled grid again is a no-op
  return out;
}

/** A hand-authored pixel length (a thickness, a gap) at the new resolution. */
export const px = (n) => Math.round(n * PIXEL_SCALE);
