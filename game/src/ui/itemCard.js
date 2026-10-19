/**
 * ui/itemCard.js
 * Purpose: one tappable card: pixel icon, name, short description.
 * Inputs:  { item, paint(canvas), onPick }
 * Outputs: { el, setSelected(bool), setDisabled(bool), repaint() }
 * Notes:   no game logic; the click handler is supplied by the drawer.
 */
import { el } from '../utils/dom.js';

export function createItemCard({ item, paint, onPick }) {
  const root = el('button', 'card');
  root.type = 'button';
  const icon = el('canvas', 'card-icon');
  icon.width = 24;
  icon.height = 24;
  root.append(icon, el('span', 'card-name', item.name));
  if (item.description) root.append(el('span', 'card-desc', item.description));
  root.addEventListener('click', onPick);

  return {
    el: root,
    setSelected: (on) => root.setAttribute('aria-pressed', String(on)),
    setDisabled: (off) => { root.disabled = off; },
    repaint: () => paint(icon),
  };
}
