/**
 * render/scene/dataView.js
 * Purpose: the data view. Instead of the tank's contents, the inside of each
 *          tank shows one set of data as a color map: temperature (with the
 *          hot spot and cool end marked), humidity zones, or UVB. The ledges,
 *          plants and animals are covered up, so only the data is left.
 * Inputs:  ctx, state, { layout, registry }
 * Outputs: opaque pixels over each tank interior (layer 'dataView'); nothing
 *          when state.settings.dataView is 'off'.
 * Notes:   values come from the saved heat gradient and the environment
 *          (systems/gradient.js), blended smoothly between cells and then
 *          stepped into color bands. Colors and legend: data/dataViews.js.
 */
import { DATA_VIEWS, colorFor } from '../../data/dataViews.js';
import { cellTemperature, coolSpot, hotSpot } from '../../systems/gradient.js';
import { humidityField } from '../../systems/humidity.js';
import { px } from '../../utils/pixelScale.js';

/** A function (col, row) -> value for the chosen view, plus the grid size. */
export function fieldFor(viewId, station, registry) {
  const g = station.tank.gradient;
  const env = station.tank.environment;
  if (!g?.cols) return null;
  if (viewId === 'temperature') return { cols: g.cols, rows: g.rows, at: (c, r) => cellTemperature(env, g, c, r) };
  if (viewId === 'uvb') return { cols: g.cols, rows: g.rows, at: (c, r) => g.uvb[r * g.cols + c] };
  const h = humidityField(station, registry);
  return { cols: h.cols, rows: h.rows, at: (c, r) => h.values[r * h.cols + c] };
}

function marker(ctx, x, y, color, r) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h); // keep the cross inside the glass
  ctx.clip();
  ctx.fillStyle = '#000000';
  ctx.fillRect(x - px(5), y - 1, px(11), 3);
  ctx.fillRect(x - 1, y - px(5), 3, px(11));
  ctx.fillStyle = color;
  ctx.fillRect(x - px(4), y, px(9), 1);
  ctx.fillRect(x, y - px(4), 1, px(9));
  ctx.restore();
}

export function drawDataView(ctx, state, { layout, registry }) {
  const view = DATA_VIEWS[state.settings.dataView];
  if (!view) return;
  layout.stations.forEach((st, i) => {
    const station = state.stations[i];
    const r = st.tank.interior;
    const field = fieldFor(view.id, station, registry);
    const image = ctx.createImageData(r.w, r.h);
    for (let y = 0; y < r.h; y++) {
      for (let x = 0; x < r.w; x++) {
        let value = view.min;
        if (field) { // blend between the centers of the four nearest cells
          const cell = st.tank.interior.w / field.cols;
          const fx = Math.min(field.cols - 1, Math.max(0, (x + 0.5) / cell - 0.5));
          const fy = Math.min(field.rows - 1, Math.max(0, (y + 0.5) / cell - 0.5));
          const c0 = Math.floor(fx);
          const r0 = Math.floor(fy);
          const c1 = Math.min(field.cols - 1, c0 + 1);
          const r1 = Math.min(field.rows - 1, r0 + 1);
          const tx = fx - c0;
          const ty = fy - r0;
          value = (field.at(c0, r0) * (1 - tx) + field.at(c1, r0) * tx) * (1 - ty) + (field.at(c0, r1) * (1 - tx) + field.at(c1, r1) * tx) * ty;
        }
        const [rr, gg, bb] = colorFor(view, value);
        const k = (y * r.w + x) * 4;
        image.data[k] = rr; image.data[k + 1] = gg; image.data[k + 2] = bb; image.data[k + 3] = 255;
      }
    }
    ctx.putImageData(image, r.x, r.y);

    const g = station.tank.gradient;
    if (view.id === 'temperature' && g?.cols && g.maxHeat > 0) { // the hot spot and the cool end
      const env = station.tank.environment;
      const hs = hotSpot(env, g);
      const cs = coolSpot(env, g);
      const cell = r.w / g.cols;
      marker(ctx, Math.round(r.x + (hs.col + 0.5) * cell), Math.round(r.y + (hs.row + 0.5) * cell), '#ffffff', r);
      marker(ctx, Math.round(r.x + (cs.col + 0.5) * cell), Math.round(r.y + (cs.row + 0.5) * cell), '#9fd0ff', r);
    }
  });
}
