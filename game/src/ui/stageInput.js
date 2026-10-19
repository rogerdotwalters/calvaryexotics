/**
 * ui/stageInput.js
 * Purpose: turn pointer and keyboard input on the canvas into intents.
 *          Drag on empty space = look around. Tap = select a table or press
 *          "+". Press on a placed item = select it, drag to move it.
 * Inputs:  { canvas, bus, getState, picker }
 * Outputs: emits 'intent' { action, payload } for view/pan, world/tap,
 *          item/select, item/move and item/nudge (arrow keys).
 * Notes:   positions are converted to the canvas's internal pixels; the picker
 *          (render/hitTest.js) supplies hit testing and soft snapping.
 */
const DRAG_THRESHOLD = 5;
const KEY_STEP = 32;

export function createStageInput({ canvas, bus, getState, picker }) {
  let drag = null;

  const toView = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * canvas.width) / r.width, y: ((e.clientY - r.top) * canvas.height) / r.height };
  };
  const emit = (action, payload) => bus.emit('intent', { action, payload });

  canvas.addEventListener('pointerdown', (e) => {
    canvas.setPointerCapture(e.pointerId);
    const p = toView(e);
    const wx = getState().view.cameraX + p.x;
    const hit = picker.pickItem(wx, p.y);
    if (hit) {
      const at = picker.toFraction(hit.stationIndex, wx, p.y);
      drag = { mode: 'item', hit, grab: { dx: hit.fx - at.fx, dy: hit.fy - at.fy }, startX: p.x, startY: p.y, moved: false, last: null };
      emit('item/select', { id: hit.id });
    } else {
      drag = { mode: 'pan', startX: p.x, lastX: p.x, moved: false };
    }
  });

  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const p = toView(e);
    if (!drag.moved && Math.hypot(p.x - drag.startX, (p.y - (drag.startY ?? p.y))) > DRAG_THRESHOLD) drag.moved = true;
    if (!drag.moved) return;

    if (drag.mode === 'item') {
      const state = getState();
      const placed = state.stations[drag.hit.stationIndex].placedItems.find((i) => i.id === drag.hit.id);
      if (!placed) return;
      const at = picker.toFraction(drag.hit.stationIndex, state.view.cameraX + p.x, p.y);
      const next = picker.snap(drag.hit.stationIndex, placed, at.fx + drag.grab.dx, at.fy + drag.grab.dy);
      if (!drag.last || drag.last.fx !== next.fx || drag.last.fy !== next.fy) {
        drag.last = next;
        emit('item/move', { id: drag.hit.id, fx: next.fx, fy: next.fy });
      }
    } else {
      const dx = Math.round(drag.lastX - p.x);
      if (dx !== 0) {
        emit('view/pan', { dx });
        drag.lastX -= dx; // carry the rounding remainder
      }
    }
  });

  canvas.addEventListener('pointerup', (e) => {
    if (drag && drag.mode === 'pan' && !drag.moved) emit('world/tap', { x: toView(e).x });
    drag = null;
  });
  canvas.addEventListener('pointercancel', () => { drag = null; });

  canvas.addEventListener('keydown', (e) => {
    const arrows = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    const dir = arrows[e.key];
    if (!dir) return;
    const id = getState().selectedItem;
    if (id) { // an item is selected: arrows move it by 1 pixel (4 with Shift)
      e.preventDefault();
      const step = e.shiftKey ? 4 : 1;
      emit('item/nudge', { id, dx: dir[0] * step, dy: dir[1] * step });
    } else if (dir[0]) {
      emit('view/pan', { dx: dir[0] * KEY_STEP });
    }
  });
}
