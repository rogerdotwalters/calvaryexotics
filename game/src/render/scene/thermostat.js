/**
 * render/scene/thermostat.js
 * Purpose: draw the wall thermostat (a round, Nest-style dial) with the room
 *          temperature on its face. Tapping it opens the thermostat panel.
 * Inputs:  ctx, state, { layout }
 * Outputs: pixels on ctx (layer 'thermostat').
 * Notes:   the ring is blue when the room is cool, green when comfortable and
 *          orange when warm. Digits come from a tiny 3x5 pixel font.
 */
import { px } from '../../utils/pixelScale.js';

const DIGITS = {
  0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'],
  2: ['111', '001', '111', '100', '111'], 3: ['111', '001', '111', '001', '111'],
  4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'],
  6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '001', '001', '001'],
  8: ['111', '101', '111', '101', '111'], 9: ['111', '101', '111', '001', '111'],
};
const BEZEL = '#4a5058';
const BEZEL_LIT = '#7b838c';
const FACE = '#14181c';
const DIGIT = '#e8f4ff';
const SCALE = 2;

const ringColor = (temp) => (temp < 68 ? '#6aa8ff' : temp <= 80 ? '#58c878' : '#ff9a3c');

function disc(ctx, cx, cy, r, color) {
  ctx.fillStyle = color;
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.floor(Math.sqrt(r * r - dy * dy));
    ctx.fillRect(cx - half, cy + dy, half * 2 + 1, 1);
  }
}

function digits(ctx, text, cx, cy) {
  const glyphW = 3 * SCALE;
  const gap = SCALE;
  const total = text.length * glyphW + (text.length - 1) * gap;
  let x = cx - Math.floor(total / 2);
  const y = cy - Math.floor((5 * SCALE) / 2);
  ctx.fillStyle = DIGIT;
  for (const ch of text) {
    DIGITS[ch].forEach((line, row) => {
      for (let col = 0; col < 3; col++) if (line[col] === '1') ctx.fillRect(x + col * SCALE, y + row * SCALE, SCALE, SCALE);
    });
    x += glyphW + gap;
  }
}

export function drawThermostat(ctx, state, { layout }) {
  const t = layout.thermostat;
  const r = Math.floor(t.size / 2);
  const cx = t.x + r;
  const cy = t.y + r;
  const temp = state.room.ambient;

  const plate = r + px(3); // square wall plate with a hard shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
  ctx.fillRect(cx - plate + 2, cy - plate + 2, plate * 2, plate * 2);
  ctx.fillStyle = '#e9e6dc';
  ctx.fillRect(cx - plate, cy - plate, plate * 2, plate * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.fillRect(cx - plate, cy + plate - 1, plate * 2, 1);
  ctx.fillRect(cx + plate - 1, cy - plate, 1, plate * 2);

  disc(ctx, cx, cy, r, BEZEL);
  disc(ctx, cx - 1, cy - 1, r - 1, BEZEL_LIT);
  disc(ctx, cx, cy, r - 1, BEZEL);
  disc(ctx, cx, cy, r - 2, ringColor(temp));
  disc(ctx, cx, cy, r - 4, FACE);
  digits(ctx, String(Math.round(temp)), cx, cy);
}
