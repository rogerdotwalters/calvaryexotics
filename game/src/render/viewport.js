/**
 * render/viewport.js
 * Purpose: fit the game to the whole screen. The canvas fills its container;
 *          its size in internal pixels follows the container so the tanks are
 *          as large as the screen allows, scaled by a whole number of DEVICE
 *          pixels so the pixel art stays crisp.
 * Inputs:  watchFit({ canvas, container, bus })
 * Outputs: sets the canvas CSS size and emits 'intent' view/resize { w, h }
 *          (the view size in internal pixels) and view/focus (center the
 *          selected table) whenever the container changes size.
 * Notes:   the scale is the largest whole number that keeps the view at least
 *          REF_W internal pixels wide (about 200-230 on a phone held upright,
 *          so even a 48-inch tank fits across) and at least REF_H tall (so the
 *          tallest tank, 192 pixels, and its lamps always fit).
 */
const REF_W = 200;
const REF_H = 262; // tall enough for the tallest tank, its lamps and the floor
const REF_H_PORTRAIT = 318; // upright screens also keep room for the care bar at the top

export function chooseScale(devW, devH) {
  const needed = devH > devW * 1.15 ? REF_H_PORTRAIT : REF_H;
  return Math.max(1, Math.min(12, Math.floor(devW / REF_W), Math.floor(devH / needed)));
}

export function watchFit({ canvas, container, bus }) {
  let last = '';
  function fit() {
    const dpr = window.devicePixelRatio || 1;
    const devW = Math.floor(container.clientWidth * dpr);
    const devH = Math.floor(container.clientHeight * dpr);
    if (devW < 50 || devH < 50) return;
    const scale = chooseScale(devW, devH);
    const w = Math.floor(devW / scale);
    const h = Math.floor(devH / scale);
    canvas.style.width = `${(w * scale) / dpr}px`;
    canvas.style.height = `${(h * scale) / dpr}px`;
    const key = `${w}x${h}`;
    if (key === last) return;
    last = key;
    bus.emit('intent', { action: 'view/resize', payload: { w, h } });
    bus.emit('intent', { action: 'view/focus', payload: {} });
  }
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fit).observe(container);
  window.addEventListener('resize', fit);
  fit();
  return { fit };
}
