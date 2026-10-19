/**
 * ui/chrome.js
 * Purpose: the controls that float over the game screen: a "Hide UI" button that
 *          clears everything away so you can look at your tanks, and the sizes
 *          of the bottom bars so drawers stack neatly above them.
 * Inputs:  { app, toggle, tabBar, editBar, topBar, drawer, canvas, bus }
 * Outputs: toggles the class 'ui-hidden' on #app; sets --tabbar-h, --edit-h and
 *          --topbar-h on #app (heights in px of the tab bar, the edit drawer and
 *          the top bar, so the legend and drawers sit neatly beside them).
 *          Also reports how much of the left edge the drawer or a side tab bar
 *          covers (intent view/inset, in game pixels) so the selected table is
 *          centered in the part of the screen you can still see.
 * Notes:   no game logic. ResizeObserver keeps the sizes current.
 */
export function createChrome({ app, toggle, tabBar, editBar, topBar, drawer, canvas, bus }) {
  function setHidden(hidden) {
    app.classList.toggle('ui-hidden', hidden);
    toggle.setAttribute('aria-pressed', String(hidden));
    toggle.textContent = hidden ? 'Show UI' : 'Hide UI';
    measure();
  }
  toggle.addEventListener('click', () => setHidden(!app.classList.contains('ui-hidden')));

  function measure() {
    app.style.setProperty('--tabbar-h', `${tabBar.offsetHeight}px`);
    app.style.setProperty('--edit-h', editBar.hidden ? '0px' : `${editBar.offsetHeight}px`);
    if (topBar) app.style.setProperty('--topbar-h', `${topBar.offsetHeight}px`);
    reportInset();
  }

  // Tall panels hugging the left edge (the drawer, a side tab bar) hide part of the screen.
  function reportInset() {
    const shown = canvas.getBoundingClientRect();
    if (!shown.width) return;
    let covered = 0;
    if (!app.classList.contains('ui-hidden')) {
      for (const panel of [drawer, tabBar]) {
        const tall = panel.offsetHeight > shown.height * 0.4 && panel.offsetWidth < shown.width * 0.9;
        if (!panel.hidden && tall) covered = Math.max(covered, panel.offsetLeft + panel.offsetWidth - shown.left);
      }
    }
    bus.emit('intent', { action: 'view/inset', payload: { inset: (Math.max(0, covered) * canvas.width) / shown.width } });
  }
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(measure);
    observer.observe(tabBar);
    observer.observe(editBar);
    observer.observe(drawer);
    if (topBar) observer.observe(topBar);
  }
  new MutationObserver(measure).observe(editBar, { attributes: true, attributeFilter: ['hidden'] });
  new MutationObserver(measure).observe(drawer, { attributes: true, attributeFilter: ['hidden'] });
  bus.on('state:changed', (event) => { if (event.action === 'view/resize') measure(); });
  window.addEventListener('resize', measure);
  measure();
  return { setHidden, measure };
}
