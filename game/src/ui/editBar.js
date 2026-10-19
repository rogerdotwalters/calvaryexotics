/**
 * ui/editBar.js
 * Purpose: a small drawer for the selected item. One compact row has the
 *          everyday controls (smaller, larger, rotate, flip) plus More and
 *          Done; More opens a second row with layer order, delete and precise
 *          nudging. It stays until you press Done, so you can edit, then hide
 *          everything and look at the tank.
 * Inputs:  { root, bus, getState, registry }
 * Outputs: shows itself while an item is selected; emits 'item/*' intents.
 * Notes:   reads state only. Nudge buttons repeat while held. Buttons disable at
 *          the scale and layer limits. The layer buttons can send an item behind
 *          the substrate (layer 0) and wall items only reorder among themselves.
 */
import { el } from '../utils/dom.js';
import { MAX_ITEM_SCALE } from '../data/world.js';
import { getSelectedItem } from '../core/selectors.js';
import { canMoveLayer } from '../core/layers.js';

const TURN = 15;
const HOLD_DELAY = 350;
const HOLD_REPEAT = 70;

const MAIN = [
  { label: '-', title: 'Smaller', action: 'item/scale', payload: { delta: -1 }, off: (p) => p.item.scale <= 1 },
  { label: '+', title: 'Larger', action: 'item/scale', payload: { delta: 1 }, off: (p) => p.item.scale >= MAX_ITEM_SCALE },
  { label: 'Rot L', title: 'Rotate left', action: 'item/rotate', payload: { delta: -TURN } },
  { label: 'Rot R', title: 'Rotate right', action: 'item/rotate', payload: { delta: TURN } },
  { label: 'Flip', title: 'Flip', action: 'item/flip' },
  { label: 'More', title: 'More controls', more: true },
  { label: 'Done', title: 'Finish editing', action: 'item/select', payload: { id: null }, done: true },
];

const MORE = [
  { label: 'Fwd', title: 'Bring forward (in front of the substrate)', action: 'item/layer', payload: { dir: 'forward' }, off: (p) => !canMoveLayer(p.station.placedItems, p.item.id, 'forward') },
  { label: 'Back', title: 'Send backward (behind the substrate)', action: 'item/layer', payload: { dir: 'backward' }, off: (p) => !canMoveLayer(p.station.placedItems, p.item.id, 'backward') },
  { label: 'Delete', title: 'Remove from tank', action: 'item/remove' },
  { label: 'Left', title: 'Move left', action: 'item/nudge', payload: { dx: -1 }, repeat: true },
  { label: 'Up', title: 'Move up', action: 'item/nudge', payload: { dy: -1 }, repeat: true },
  { label: 'Down', title: 'Move down', action: 'item/nudge', payload: { dy: 1 }, repeat: true },
  { label: 'Right', title: 'Move right', action: 'item/nudge', payload: { dx: 1 }, repeat: true },
];

export function createEditBar({ root, bus, getState, registry }) {
  const name = el('p', 'edit-name');
  const mainRow = el('div', 'edit-row');
  const moreRow = el('div', 'edit-row edit-more');
  moreRow.hidden = true;
  root.append(name, mainRow, moreRow);

  const fire = (def) => {
    const id = getState().selectedItem;
    if (id) bus.emit('intent', { action: def.action, payload: { ...def.payload, id: def.done ? null : id } });
  };

  let moreButton = null;
  function setMore(open) {
    moreRow.hidden = !open;
    if (moreButton) moreButton.setAttribute('aria-pressed', String(open));
  }

  const make = (def, row) => {
    const button = el('button', def.done ? 'opt edit-btn edit-done' : 'opt edit-btn', def.label);
    button.type = 'button';
    button.title = def.title;
    button.setAttribute('aria-label', def.title);

    if (def.more) {
      moreButton = button;
      button.addEventListener('click', () => setMore(moreRow.hidden));
    } else if (def.repeat) {
      let delay = null;
      let repeat = null;
      const stop = () => { clearTimeout(delay); clearInterval(repeat); delay = repeat = null; };
      button.addEventListener('pointerdown', () => {
        fire(def);
        delay = setTimeout(() => { repeat = setInterval(() => fire(def), HOLD_REPEAT); }, HOLD_DELAY);
      });
      for (const type of ['pointerup', 'pointerleave', 'pointercancel']) button.addEventListener(type, stop);
      button.addEventListener('click', (e) => { if (e.detail === 0) fire(def); }); // keyboard
    } else {
      button.addEventListener('click', () => fire(def));
    }
    row.append(button);
    return { button, def };
  };

  const buttons = [...MAIN.map((d) => make(d, mainRow)), ...MORE.map((d) => make(d, moreRow))];

  function refresh() {
    const picked = getSelectedItem(getState());
    root.hidden = !picked;
    if (!picked) { setMore(false); return; }
    const entry = registry.list(picked.item.catalog)?.find((e) => e.id === picked.item.itemId);
    const side = picked.item.plane === 'back' ? ', on back wall' : picked.item.behind ? ', behind soil' : '';
    name.textContent = `${entry?.name ?? 'Item'}  x${picked.item.scale}  ${picked.item.rotation ?? 0} deg${side}`;
    for (const { button, def } of buttons) button.disabled = Boolean(def.off?.(picked));
  }

  bus.on('state:changed', (event) => { if (event.action !== 'sim/tick') refresh(); });
  refresh();
}
