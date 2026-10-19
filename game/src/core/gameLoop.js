/**
 * core/gameLoop.js
 * Purpose: one requestAnimationFrame loop that calls update(dt) then render().
 * Inputs:  { update(dtSeconds), render() }
 * Outputs: { start, stop }
 * Notes:   dt is clamped to 0.1s so a background tab can't cause a huge jump.
 */
export function createGameLoop({ update, render }) {
  let handle = 0;
  let last = 0;

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    update(dt);
    render();
    handle = requestAnimationFrame(frame);
  }

  return {
    start() {
      if (handle) return;
      last = performance.now();
      handle = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(handle);
      handle = 0;
    },
  };
}
