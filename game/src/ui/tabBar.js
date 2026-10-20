/**
 * ui/tabBar.js
 * Purpose: the row/column of category tabs, built from data/tabs.js.
 * Inputs:  { root, tabs, onSelect(id) }
 * Outputs: { setActive(id | null), setBadge(id, count, bad) }  (a small count on a tab, red when bad)
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
    const badge = el('span', 'tab-badge');
    badge.hidden = true;
    button.append(badge);
    root.append(button);
    return { tab, button, holder, badge };
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

  function setBadge(id, count, bad = false) {
    const entry = entries.find((e) => e.tab.id === id);
    if (!entry) return;
    entry.badge.hidden = count <= 0;
    entry.badge.textContent = String(count);
    entry.badge.dataset.severity = bad ? 'bad' : 'warn';
  }

  setActive(null);
  return { setActive, setBadge };
}
