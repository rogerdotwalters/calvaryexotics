/**
 * render/fx.js
 * Purpose: short pixel effects for care actions: mist droplets, falling food,
 *          cleaning sparkles and falling leaves.
 * Inputs:  drawFx(ctx, effects, layout, state, cameraX, now)
 *          effects: [{ kind, stationId, t0 }] from 'fx' events
 * Outputs: draws 1-3px particles on the screen canvas; FX_LIFE ms each.
 * Notes:   particle positions come from the elapsed time and a seeded hash,
 *          so there is nothing to simulate or store.
 */
export const FX_LIFE = 1800;

const rnd = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const KINDS = {
  mist(ctx, i, ground, t) {
    ctx.fillStyle = '#e8fbff';
    for (let k = 0; k < 28; k++) {
      const y = i.y + (t * (0.6 + 0.7 * rnd(k * 3 + 2)) + rnd(k * 3 + 3) * 0.25) * i.h;
      if (y < ground) ctx.fillRect(Math.round(i.x + rnd(k * 3 + 1) * i.w), Math.round(y), 1, 2);
    }
  },
  feed(ctx, i, ground, t) {
    ctx.fillStyle = '#d9a441';
    for (let k = 0; k < 7; k++) {
      const y = Math.min(ground - 2, i.y + 4 + t * 70 * (0.7 + 0.5 * rnd(k + 9)));
      ctx.fillRect(Math.round(i.x + i.w * (0.3 + 0.4 * rnd(k + 1))), Math.round(y), 2, 2);
    }
  },
  clean(ctx, i, ground, t) {
    ctx.fillStyle = '#ffffff';
    for (let k = 0; k < 9; k++) {
      if ((t * 3 + rnd(k + 5) * 3) % 3 > 1) continue; // blink
      const x = Math.round(i.x + 4 + rnd(k + 1) * (i.w - 8));
      const y = Math.round(i.y + 4 + rnd(k + 20) * (ground - i.y - 8));
      ctx.fillRect(x, y - 1, 1, 3);
      ctx.fillRect(x - 1, y, 3, 1);
    }
  },
  litter(ctx, i, ground, t) {
    for (let k = 0; k < 8; k++) {
      ctx.fillStyle = k % 2 ? '#a8472a' : '#86603f';
      const y = Math.min(ground - 1, i.y + 2 + t * 80 * (0.7 + 0.5 * rnd(k + 7)));
      const x = i.x + i.w * (0.1 + 0.8 * rnd(k + 1)) + Math.sin(t * 8 + k) * 3;
      ctx.fillRect(Math.round(x), Math.round(y), 2, 1);
    }
  },
};

export function drawFx(ctx, effects, layout, cameraX, now) {
  for (const fx of effects) {
    const index = layout.stations.findIndex((s) => s.id === fx.stationId);
    const draw = KINDS[fx.kind];
    if (index < 0 || !draw) continue;
    const st = layout.stations[index];
    const r = st.tank.interior;
    ctx.save();
    ctx.translate(-cameraX, 0);
    ctx.beginPath();
    ctx.rect(r.x, r.y, r.w, r.h);
    ctx.clip();
    draw(ctx, r, r.y + st.ground, (now - fx.t0) / FX_LIFE);
    ctx.restore();
  }
}
