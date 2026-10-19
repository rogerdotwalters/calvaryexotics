/**
 * render/dither.js
 * Purpose: hard-edged checkerboard fills, used instead of smooth gradients
 *          (shadows now, lighting glow later).
 * Inputs:  ctx, rect, css color, optional phase (0 or 1) to flip the checker
 * Outputs: draws 1px squares on every other pixel.
 */
export function ditherRect(ctx, x, y, w, h, color, phase = 0) {
  ctx.fillStyle = color;
  for (let j = 0; j < h; j++) {
    for (let i = (j + phase) & 1; i < w; i += 2) ctx.fillRect(x + i, y + j, 1, 1);
  }
}
