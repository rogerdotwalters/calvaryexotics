/**
 * ui/shell.js
 * Purpose: connects the tab bar and the drawer. Tapping a tab opens its
 *          drawer; tapping the active tab (or Close) closes it. Tapping an item
 *          in the tank closes the drawer so you can see what you are editing.
 * Inputs:  { app, tabBarRoot, drawerRoot, tabs, bus, getState, registry, paint, panels }
 * Outputs: { setActive(id | null), setBadge(id, count, bad) }
 */
import { createTabBar } from './tabBar.js';
import { createDrawer } from './drawer.js';

export function createShell({ app, tabBarRoot, drawerRoot, tabs, bus, getState, registry, paint, panels }) {
  const drawer = createDrawer({ root: drawerRoot, bus, getState, registry, paint, panels });
  let active = null;

  function setActive(id) {
    active = id;
    bar.setActive(id);
    drawerRoot.hidden = id === null;
    app.classList.toggle('drawer-closed', id === null);
    if (id === null) drawer.close();
    else drawer.open(tabs.find((t) => t.id === id));
  }

  const bar = createTabBar({
    root: tabBarRoot,
    tabs,
    onSelect: (id) => setActive(active === id ? null : id),
  });

  bus.on('state:changed', (event) => {
    if (event.action === 'sim/tick') return; // the clock ticks often; cards don't change
    // Tapping an item in the tank to edit it clears the drawer away for a clear view.
    if (event.action === 'item/select' && getState().selectedItem && active !== null) setActive(null);
    else drawer.refresh();
  });
  bus.on('ui:closeDrawer', () => setActive(null));
  return { setActive, setBadge: bar.setBadge };
}
