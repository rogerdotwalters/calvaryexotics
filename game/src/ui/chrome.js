/**
 * ui/chrome.js
 * Purpose: the controls that float over the game screen: a "Hide UI" button that
 *          clears everything away so you can look at your tanks, and the sizes
 *          of the bottom bars so drawers stack neatly above them.
 * Inputs:  { app, toggle, tabBar, editBar, topBar }
 * Outputs: toggles the class 'ui-hidden' on #app; sets --tabbar-h, --edit-h and
 *          --topbar-h on #app (heights in px of the tab bar, the edit drawer and
 *          the top bar, so the legend and drawers sit neatly beside them).
 * Notes:   no game logic. ResizeObserver keeps the sizes current.
 */
export function createChrome({ app, toggle, tabBar, editBar, topBar }) {
  function setHidden(hidden) {
    app.classList.toggle('ui-hidden', hidden);
    toggle.setAttribute('aria-pressed', String(hidden));
    toggle.textContent = hidden ? 'Show UI' : 'Hide UI';
  }
  toggle.addEventListener('click', () => setHidden(!app.classList.contains('ui-hidden')));

  function measure() {
    app.style.setProperty('--tabbar-h', `${tabBar.offsetHeight}px`);
    app.style.setProperty('--edit-h', editBar.hidden ? '0px' : `${editBar.offsetHeight}px`);
    if (topBar) app.style.setProperty('--topbar-h', `${topBar.offsetHeight}px`);
  }
  if (typeof ResizeObserver !== 'undefined') {
    const observer = new ResizeObserver(measure);
    observer.observe(tabBar);
    observer.observe(editBar);
    if (topBar) observer.observe(topBar);
  }
  new MutationObserver(measure).observe(editBar, { attributes: true, attributeFilter: ['hidden'] });
  window.addEventListener('resize', measure);
  measure();
  return { setHidden, measure };
}
