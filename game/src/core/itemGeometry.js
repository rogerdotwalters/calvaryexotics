/**
 * core/itemGeometry.js
 * Purpose: where a placed item sits, and soft snapping while dragging.
 * Inputs:  tank interior rect, placed item, catalog entry
 * Outputs: itemRect() -> { x, y, w, h } in world pixels;
 *          snapPosition() -> { fx, fy } nudged onto the ground / lid when close;
 *          rotatedBounds() / containsPoint() for rotated items.
 * Notes:   fx/fy are fractions of the interior. Wall ('free') items are anchored
 *          by their bottom edge and never snap. Ground items are anchored by
 *          their bottom edge (sunk 2px into the substrate); 'top' items hang
 *          from their top edge.
 */
import { px } from '../utils/pixelScale.js';

export const SNAP = px(6);
const EMBED = px(2);

export function itemRect(interior, placed, entry) {
  const w = entry.grid[0].length * placed.scale;
  const h = entry.grid.length * placed.scale;
  const ax = interior.x + Math.round(placed.fx * interior.w);
  const ay = interior.y + Math.round(placed.fy * interior.h);
  return {
    x: ax - Math.floor(w / 2),
    y: entry.anchor === 'top' ? ay : ay - h + EMBED,
    w,
    h,
  };
}

export function snapPosition(interior, ground, entry, fx, fy) {
  const py = fy * interior.h;
  if (entry.anchor === 'free') return { fx, fy }; // wall items go exactly where you put them
  if (entry.anchor === 'top') return { fx, fy: py <= SNAP ? 0 : fy };
  return { fx, fy: Math.abs(py - ground) <= SNAP ? ground / interior.h : fy };
}

const rad = (deg) => ((deg ?? 0) * Math.PI) / 180;

/** Box around a rotated item (used for the selection outline). */
export function rotatedBounds(rect, rotation) {
  const c = Math.abs(Math.cos(rad(rotation)));
  const s = Math.abs(Math.sin(rad(rotation)));
  const w = rect.w * c + rect.h * s;
  const h = rect.w * s + rect.h * c;
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  return { x: Math.round(cx - w / 2), y: Math.round(cy - h / 2), w: Math.round(w), h: Math.round(h) };
}

/** Is a world point inside the (possibly rotated) item? */
export function containsPoint(rect, rotation, px, py) {
  const dx = px - (rect.x + rect.w / 2);
  const dy = py - (rect.y + rect.h / 2);
  const a = -rad(rotation);
  const x = dx * Math.cos(a) - dy * Math.sin(a);
  const y = dx * Math.sin(a) + dy * Math.cos(a);
  return Math.abs(x) <= rect.w / 2 && Math.abs(y) <= rect.h / 2;
}
