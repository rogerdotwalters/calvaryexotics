/**
 * ui/animalsPanel.js
 * Purpose: the Animals tab: add an animal to the selected tank, see how each
 *          resident is feeling and what it needs, move it to another table, or
 *          remove it (with a confirm step).
 * Inputs:  { root, bus, getState, registry }
 * Outputs: builds controls in `root`; emits 'intent' animal/add, animal/move,
 *          animal/remove. Returns { destroy }.
 * Notes:   no game logic: tips and capacity come from systems/needs.js.
 */
import { el } from '../utils/dom.js';
import { createItemCard } from './itemCard.js';
import { getSelectedIndex, getSelectedStation } from '../core/selectors.js';
import { canAddAnimal, moodWord, needAdvice } from '../systems/needs.js';
import { ANIMAL_PALETTE } from '../data/palettes/animals.js';
import { ANIMAL_SPRITES } from '../data/sprites/animals.js';
import { getSprite } from '../render/spriteCache.js';
import { morphSwaps } from '../render/morph.js';
import { scaleGrid } from '../utils/pixelScale.js';
import { morphLabel } from '../entities/morph.js';

export function createAnimalsPanel({ root, bus, getState, registry }) {
  const wrap = el('div', 'animals-panel');
  const addGrid = el('div', 'cards');
  const addNote = el('p', 'note');
  const list = el('div', 'residents');
  const emit = (action, payload) => bus.emit('intent', { action, payload });

  const species = registry.list('animals');
  // One card per variant (starting morph); species without variants get a single card.
  const options = species.flatMap((sp) => (sp.variants ?? [{ id: undefined, name: sp.name, description: sp.description, morph: {} }]).map((v) => ({ sp, v })));
  const cards = options.map(({ sp, v }) => {
    const card = createItemCard({
      item: { name: v.name, description: v.description },
      paint: (canvas) => {
        const set = ANIMAL_SPRITES[sp.sprite];
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 24, 24);
        if (!set) return;
        const sprite = getSprite(scaleGrid(set.frames.idle[0]), ANIMAL_PALETTE, morphSwaps(sp, v.morph));
        const f = sprite.width > 24 ? Math.ceil(sprite.width / 24) : 1;
        const scale = sprite.width <= 12 ? 2 : 1;
        const w = Math.round((sprite.width / f) * scale);
        const h = Math.round((sprite.height / f) * scale);
        ctx.drawImage(sprite, Math.floor((24 - w) / 2), 22 - h, w, h);
      },
      onPick: () => emit('animal/add', { speciesId: sp.id, variantId: v.id }),
    });
    addGrid.append(card.el);
    return { sp, v, card };
  });

  wrap.append(
    el('h3', null, 'Add an animal'), addGrid, addNote,
    el('h3', null, 'In this tank'), list,
  );
  root.append(wrap);

  let rowsKey = '';
  let rows = [];
  let erasing = null;

  function buildRows(station, state) {
    rows = station.animals.map((animal) => {
      const row = el('div', 'resident');
      const title = el('p', 'resident-name');
      const tip = el('p', 'resident-tip');
      const buttons = el('div', 'resident-buttons');
      const move = el('button', 'opt', 'Move');
      move.type = 'button';
      move.addEventListener('click', () => {
        const s = getState();
        const next = s.stations[(getSelectedIndex(s) + 1) % s.stations.length];
        emit('animal/move', { id: animal.id, toStation: next.id });
      });
      const remove = el('button', 'opt', 'Remove');
      remove.type = 'button';
      remove.addEventListener('click', () => {
        if (erasing !== animal.id) {
          erasing = animal.id;
          remove.textContent = 'Tap again';
          setTimeout(() => { if (erasing === animal.id) { erasing = null; remove.textContent = 'Remove'; } }, 4000);
          return;
        }
        erasing = null;
        emit('animal/remove', { id: animal.id });
      });
      buttons.append(move, remove);
      row.append(title, tip, buttons);
      return { animal, row, title, tip, move };
    });
    list.replaceChildren(...rows.map((r) => r.row));
    if (rows.length === 0) list.append(el('p', 'empty', 'No animals in this tank yet.'));
  }

  function refresh() {
    const state = getState();
    const station = getSelectedStation(state);
    const check = cards.map(({ sp }) => canAddAnimal(station, sp, registry));
    cards.forEach(({ card }, i) => card.setDisabled(!check[i].ok));
    cards.forEach(({ card }) => card.repaint());
    addNote.textContent = check.find((c) => !c.ok)?.reason ?? 'Tap to add one to this tank.';

    const key = `${station.id}:${station.animals.map((a) => a.id).join(',')}`;
    if (key !== rowsKey) { rowsKey = key; buildRows(station, state); }
    rows.forEach((r, i) => {
      const animal = station.animals[i];
      if (!animal) return;
      const sp = registry.list('animals').find((s) => s.id === animal.species);
      const where = animal.hidden ? 'hiding'
        : animal.mode === 'burrow' ? (animal.settled ? 'burrowed' : 'digging')
        : animal.mode === 'hunt' ? 'hunting'
        : animal.mode === 'climb' ? 'climbing'
        : animal.mode === 'lounge' && animal.settled ? 'lounging'
        : animal.mode === 'crawl' ? 'foraging' : 'resting';
      const size = animal.count !== undefined ? `  about ${Math.floor(animal.count)}` : '';
      const label = sp?.colony ? `${morphLabel(sp, animal.morph)} colony` : animal.name;
      r.title.textContent = `${label}${size}  ${moodWord(animal.mood)}, ${where}`;
      r.tip.textContent = animal.mood < 0.8 && sp ? needAdvice(animal.worst, station, sp) : 'Everything looks good.';
      r.move.disabled = state.stations.length < 2;
    });
  }

  const off = bus.on('state:changed', refresh);
  refresh();
  return { destroy: off };
}
