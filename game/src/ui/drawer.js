/**
 * ui/drawer.js
 * Purpose: the scrollable drawer for the active tab: sections of item cards,
 *          a layer guide, lamp slot / wattage cards, a readout, and footer
 *          buttons or switches. Tabs with a `panel` show a custom panel.
 * Inputs:  { root, bus, getState, registry, paint, panels }
 *          panels: { name: (container) => ({ destroy }) } for tabs with `panel`.
 * Outputs: { open(tab), close(), refresh() }
 * Notes:   built from a tab definition in data/tabs.js. Reads state to show
 *          what is selected and emits 'intent' events; it never changes state.
 *          Section kinds: (cards) | 'place' | 'guide' | 'slot' | 'watts' | 'readout'.
 *          A readout shows the lamp heat and UVB by default, or the tank's size and
 *          heat properties with `source: 'tank'`. A footer button with `event` opens
 *          something else (it emits that event on the bus).
 */
import { el } from '../utils/dom.js';
import { createItemCard } from './itemCard.js';
import { getSelectedIndex, getSelectedStation } from '../core/selectors.js';
import { beamReach, describeGradient } from '../systems/gradient.js';
import { describeTank } from '../systems/thermal.js';

const lampOf = (station) => station.lighting.lamps[station.lighting.slot];

const targetOf = (state, target) => {
  if (target === 'room') return state.room;
  const station = getSelectedStation(state);
  return target === 'lamp' ? lampOf(station) : station[target];
};

const contextText = (tab, state) =>
  tab.scope === 'room' ? 'Whole room' : `Table ${getSelectedIndex(state) + 1} of ${state.stations.length}`;

export function createDrawer({ root, bus, getState, registry, paint, panels = {} }) {
  let tab = null;
  let sections = [];
  let footer = [];
  let context = null;
  let panel = null;

  const emit = (action, payload) => bus.emit('intent', { action, payload });

  /** Cards for sections whose items depend on the state (lamp slots, wattages). */
  function dynamicItems(section, state) {
    const station = getSelectedStation(state);
    if (section.kind === 'slot') {
      return station.lighting.lamps.map((lamp, i) => ({
        id: i, name: `Lamp ${i + 1}`, catalog: 'lampSlots',
        description: registry.get('lights', lamp.type).name,
        fixture: registry.get('lights', lamp.type),
      }));
    }
    const lamp = lampOf(station);
    const fixture = registry.get('lights', lamp.type);
    return fixture.watts.map((w) => ({
      id: w, name: `${w}W`, catalog: 'watts', w, max: Math.max(...fixture.watts),
      description: `Reaches ${Math.round(beamReach(fixture, w))} in`,
    }));
  }

  function fillGrid(section, items) {
    section.cards = [];
    section.grid.replaceChildren();
    for (const item of items) {
      const catalog = item.catalog ?? section.catalog;
      const card = createItemCard({
        item,
        paint: (canvas) => paint(canvas, catalog, item, getState()),
        onPick: () => {
          if (section.kind === 'slot') emit('light/slot', { slot: item.id });
          else if (section.kind === 'place') emit(section.action, { catalog: section.catalog, itemId: item.id });
          else emit(section.action, { [section.field]: item.id });
        },
      });
      section.cards.push({ card, item });
      section.grid.append(card.el);
    }
  }

  function open(next) {
    panel?.destroy?.();
    panel = null;
    tab = next;
    sections = [];
    footer = [];
    root.replaceChildren();
    root.scrollTop = 0;

    context = el('p', 'ctx');
    const close = el('button', 'drawer-close', 'Close');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close drawer');
    close.addEventListener('click', () => bus.emit('ui:closeDrawer'));
    const head = el('div', 'drawer-head');
    head.append(el('h2', null, tab.name), close);
    root.append(head, context);
    if (tab.panel) {
      context.textContent = '';
      panel = panels[tab.panel]?.(root) ?? null;
      return;
    }

    for (const def of tab.sections) {
      const section = { ...def, grid: null, cards: [], rows: [], key: '' };
      const wrap = el('section');
      wrap.append(el('h3', null, def.title));
      if (def.note) wrap.append(el('p', 'note', def.note));

      if (def.kind === 'guide') {
        for (const layer of def.layers) {
          const chip = el('span', 'guide-chip');
          const name = el('span', 'guide-name');
          const text = el('span', 'guide-text');
          text.append(name, el('span', 'guide-purpose', layer.purpose));
          const row = el('div', 'guide-row');
          row.append(chip, text);
          section.rows.push({ chip, name, layer });
          wrap.append(row);
        }
      } else if (def.kind === 'readout') {
        section.box = el('div', 'readout');
        wrap.append(section.box);
      } else {
        section.grid = el('div', 'cards');
        section.empty = el('p', 'empty', def.empty ?? 'Nothing here yet.');
        section.empty.hidden = true;
        wrap.append(section.empty, section.grid);
        if (!def.kind || def.kind === 'place') {
          const items = registry.list(def.catalog);
          section.empty.hidden = items.length > 0;
          fillGrid(section, items);
        }
      }
      sections.push(section);
      root.append(wrap);
    }

    for (const act of tab.footer ?? []) {
      const button = el('button', 'opt', act.label);
      button.type = 'button';
      button.addEventListener('click', () => {
        if (act.toggle) emit('settings/toggle', { key: act.toggle });
        else if (act.event) bus.emit(act.event);
        else emit(act.action, {});
      });
      footer.push({ button, act });
      root.append(button);
    }
    refresh();
  }

  function refresh() {
    if (!tab || tab.panel) return;
    const state = getState();
    const station = getSelectedStation(state);
    context.textContent = contextText(tab, state);

    for (const section of sections) {
      if (section.kind === 'guide') {
        for (const { chip, name, layer } of section.rows) {
          const entry = registry.get(layer.catalog, station.tank[layer.field]);
          chip.style.background = entry.grid ? entry.swatch : 'transparent';
          name.textContent = `${layer.label}: ${entry.grid ? entry.name : 'None'}`;
        }
      } else if (section.kind === 'readout') {
        const lines = section.source === 'tank'
          ? describeTank(station, state, registry)
          : describeGradient(station, station.tank.environment, registry);
        section.box.replaceChildren(...lines.map(([label, value]) => {
          const row = el('p', 'readout-row');
          row.append(el('span', 'readout-label', label), el('span', null, value));
          return row;
        }));
      } else if (section.kind === 'slot' || section.kind === 'watts') {
        const items = dynamicItems(section, state);
        const key = JSON.stringify(items.map((i) => [i.id, i.name, i.description]));
        if (key !== section.key) { // the cards themselves changed: rebuild them
          section.key = key;
          section.empty.hidden = items.length > 0;
          fillGrid(section, items);
        }
        for (const { card, item } of section.cards) {
          const selected = section.kind === 'slot'
            ? station.lighting.slot === item.id
            : lampOf(station).watts === item.id;
          card.setSelected(selected);
          card.repaint();
        }
      } else {
        for (const { card, item } of section.cards) {
          card.setSelected(section.kind !== 'place' && targetOf(state, section.target)[section.field] === item.id);
          card.repaint();
        }
      }
    }

    for (const { button, act } of footer) {
      if (act.toggle) button.textContent = `${act.label}: ${state.settings[act.toggle] ? 'On' : 'Off'}`;
      button.disabled = act.needs === 'multiple' && state.stations.length < 2;
    }
  }

  function close() {
    panel?.destroy?.();
    panel = null;
    tab = null;
    root.replaceChildren();
  }

  return { open, close, refresh };
}
