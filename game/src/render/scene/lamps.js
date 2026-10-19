/**
 * render/scene/lamps.js
 * Purpose: draw the lamp fixtures sitting on top of each tank (up to two),
 *          and tell the lighting layer where each lens is.
 * Inputs:  ctx, state, { registry, layout }
 * Outputs: drawLamps() for layer 'lamps'; lampPlacements(...) -> lamp x/y/kind.
 * Notes:   a bigger wattage draws a slightly bigger fixture. Lenses glow only
 *          while the lamp is on (see systems/daylight.js lightIsOn).
 */
import { lightHex } from '../../data/items/lighting.js';
import { lampPositions } from '../../systems/gradient.js';
import { lightIsOn } from '../../systems/daylight.js';
import { px } from '../../utils/pixelScale.js';

const BODY = '#2a2d33';
const EDGE = '#5c606a';
const OFF = '#4a4f5a';

/** Where each lamp of a station is: center x, lid y, fixture, watts, size tier, on. */
export function lampPlacements(station, st, state, registry) {
  const positions = lampPositions(station.lighting.lamps);
  return station.lighting.lamps.flatMap((lamp, i) => {
    if (positions[i] === null) return [];
    const fixture = registry.get('lights', lamp.type);
    const tier = fixture.watts.length > 1 ? fixture.watts.indexOf(lamp.watts) / (fixture.watts.length - 1) : 0;
    return [{
      lamp, fixture, tier,
      x: Math.round(st.tank.interior.x + positions[i] * st.tank.interior.w),
      maxHalf: Math.floor(st.tank.w / 2) - 1, // a lamp never overhangs a narrow tank
      y: st.tank.y,
      on: lightIsOn(fixture, state),
      hex: lightHex(fixture, lamp.color),
    }];
  });
}

const rect = (ctx, color, x, y, w, h) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
const u = px; // every size below is written at the old resolution and scaled

const SHAPES = {
  led(ctx, { x, y, tier, on, hex, maxHalf }) {
    const half = Math.min(maxHalf, u(11) + Math.round(tier * u(3)));
    rect(ctx, BODY, x - half, y - u(4), half * 2, u(4));
    rect(ctx, EDGE, x - half, y - u(4), half * 2, 1);
    rect(ctx, on && hex ? hex : OFF, x - half + u(2), y - u(1), half * 2 - u(4), u(1));
    rect(ctx, EDGE, x - half, y - u(1), u(2), u(1));
    rect(ctx, EDGE, x + half - u(2), y - u(1), u(2), u(1));
  },
  uvb(ctx, { x, y, tier, on, hex, maxHalf }) {
    const half = Math.min(maxHalf, u(13) + Math.round(tier * u(3)));
    rect(ctx, BODY, x - half, y - u(6), half * 2, u(5));
    rect(ctx, EDGE, x - half, y - u(6), half * 2, 1);
    rect(ctx, EDGE, x - half, y - u(6), 1, u(5));
    rect(ctx, EDGE, x + half - 1, y - u(6), 1, u(5));
    rect(ctx, on && hex ? hex : OFF, x - half + u(2), y - u(2), half * 2 - u(4), u(2));
    rect(ctx, BODY, x - half + 1, y - u(1), u(2), u(1));
    rect(ctx, BODY, x + half - u(3), y - u(1), u(2), u(1));
  },
  heat(ctx, { x, y, tier, on, hex, fixture }) {
    if (fixture.id === 'ceramic') {
      const w = u(10);
      rect(ctx, '#8a8f98', x - w / 2, y - u(9), w, u(9));
      for (let k = 1; k < u(9); k += 2) rect(ctx, '#5c606a', x - w / 2, y - u(9) + k, w, 1);
      rect(ctx, EDGE, x - w / 2, y - u(9), w, 1);
      rect(ctx, on ? '#d4543a' : OFF, x - w / 2 + 1, y - u(1), w - 2, u(1));
      return;
    }
    const t = Math.round(tier * u(2));
    const dome = [[u(4) + t, -u(11)], [u(8) + t, -u(10)], [u(12) + t, -u(9)], [u(14) + t, -u(8)], [u(14) + t, -u(7)], [u(14) + t, -u(6)]];
    rect(ctx, EDGE, x - 1, y - u(14), 2, u(3)); // clamp
    for (const [w, dy] of dome) rect(ctx, BODY, x - Math.floor(w / 2), y + dy, w, 1 + (dy % 2 === 0 ? 1 : 0));
    rect(ctx, EDGE, x - Math.floor((u(4) + t) / 2), y - u(11), u(4) + t, 1);
    rect(ctx, on && hex ? hex : OFF, x - u(3) - Math.round(t / 2), y - u(5), u(6) + t, u(3)); // bulb
    rect(ctx, BODY, x - u(2), y - u(2), u(4), u(2));
  },
};
SHAPES.moon = (ctx, p) => {
  rect(ctx, BODY, p.x - u(5), p.y - u(4), u(10), u(3));
  rect(ctx, EDGE, p.x - u(5), p.y - u(4), u(10), 1);
  rect(ctx, p.on && p.hex ? p.hex : OFF, p.x - u(4), p.y - u(1), u(8), u(1));
};

export function drawLamps(ctx, state, { registry, layout }) {
  layout.stations.forEach((st, i) => {
    for (const p of lampPlacements(state.stations[i], st, state, registry)) {
      const kind = p.fixture.id === 'moon' ? 'moon' : p.fixture.kind;
      SHAPES[kind]?.(ctx, p);
    }
  });
}
