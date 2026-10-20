/**
 * ui/warningsPanel.js
 * Purpose: the Warnings tab: what is wrong with the selected tank for its animals.
 *          Pick "Animals in this tank" to check each resident, or any species to
 *          see what the tank would need before you add one.
 * Inputs:  { root, bus, getState, registry }
 * Outputs: builds the panel in `root`; returns { destroy }. Reads state only.
 * Notes:   each warning shows what the tank has now versus what the animal wants,
 *          and a tip. Red is bad (the animal is quite unhappy about it), amber is
 *          a warning. The checks are the same ones that decide an animal's mood
 *          (systems/warnings.js). The list rebuilds only when something changes.
 */
import { el } from '../utils/dom.js';
import { getSelectedStation } from '../core/selectors.js';
import { canAddAnimal, moodWord } from '../systems/needs.js';
import { checkTank } from '../systems/warnings.js';

const RESIDENTS = 'residents';

export function createWarningsPanel({ root, bus, getState, registry }) {
  const wrap = el('div', 'warnings-panel');
  const label = el('label', 'note', 'Check this tank for:');
  const select = el('select', 'warn-select');
  select.id = 'warn-species';
  label.htmlFor = select.id;
  select.append(new Option('Animals in this tank', RESIDENTS));
  for (const sp of registry.list('animals')) select.append(new Option(`A new ${sp.name.toLowerCase()}`, sp.id));
  const list = el('div', 'warn-list');
  wrap.append(label, select, list);
  root.append(wrap);

  let lastKey = '';
  const build = (title, mood, result, extra) => {
    const card = el('div', 'warn-card');
    card.append(el('p', 'resident-name', `${title}${mood === null ? '' : `  ${moodWord(mood)}`}`));
    if (extra) card.append(el('p', 'resident-tip', extra));
    if (result.issues.length === 0) card.append(el('p', 'warn-ok', 'The setup looks good.'));
    for (const issue of result.issues) {
      const row = el('div', `warn-issue ${issue.severity}`);
      row.append(el('p', 'warn-head', `${issue.severity === 'bad' ? 'Problem' : 'Warning'}: ${issue.label}`), el('p', 'warn-detail', issue.detail), el('p', 'warn-advice', issue.advice));
      card.append(row);
    }
    return card;
  };

  function refresh() {
    const state = getState();
    const station = getSelectedStation(state);
    const choice = select.value;
    const cards = [];
    if (choice === RESIDENTS) {
      if (station.animals.length === 0) cards.push(el('p', 'empty', 'No animals in this tank yet. Add one on the Animals tab, or pick a species above to see what a tank would need for it.'));
      for (const animal of station.animals) {
        const sp = registry.list('animals').find((s) => s.id === animal.species);
        if (!sp) continue;
        const result = checkTank(station, state, registry, sp, animal);
        cards.push(build(sp.colony ? `${sp.name} colony` : animal.name, result.mood, result));
      }
    } else {
      const sp = registry.list('animals').find((s) => s.id === choice);
      const result = checkTank(station, state, registry, sp);
      const fit = canAddAnimal(station, sp, registry);
      cards.push(build(`A new ${sp.name.toLowerCase()}`, result.mood, result, fit.ok ? null : fit.reason));
    }
    const key = `${station.id}|${choice}|${cards.map((c) => c.textContent).join('~')}`;
    if (key === lastKey) return; // nothing changed: leave the list alone
    lastKey = key;
    list.replaceChildren(...cards);
  }

  select.addEventListener('change', refresh);
  const off = bus.on('state:changed', refresh);
  refresh();
  return { destroy: off };
}
