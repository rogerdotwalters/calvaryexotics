/**
 * ui/tabBar.js
 * Purpose: the row/column of category tabs, built from data/tabs.js.
 * Inputs:  { root, tabs, onSelect(id) }
 * Outputs: { setActive(id | null) }
 * Notes:   bottom bar on portrait phones, side bar elsewhere (CSS only).
 */
import { el } from '../utils/dom.js';
import { getSprite } from '../render/spriteCache.js';
import { UI_PALETTE, ACTIVE_SWAPS } from '../data/palettes/ui.js';

export function createTabBar({ root, tabs, onSelect }) {
  const entries = tabs.map((tab) => {
    const button = el('button', 'tab');
    button.type = 'button';
    const holder = el('span', 'tab-icon-wrap');
    button.append(holder, el('span', 'tab-label', tab.name));
    button.addEventListener('click', () => onSelect(tab.id));
    root.append(button);
    return { tab, button, holder };
  });

  function setActive(id) {
    for (const { tab, button, holder } of entries) {
      const on = tab.id === id;
      button.setAttribute('aria-pressed', String(on));
      const icon = getSprite(tab.icon, UI_PALETTE, on ? ACTIVE_SWAPS : {});
      icon.className = 'tab-icon';
      holder.replaceChildren(icon);
    }
  }

  setActive(null);
  return { setActive };
}
