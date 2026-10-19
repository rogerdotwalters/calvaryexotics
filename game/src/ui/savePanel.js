/**
 * ui/savePanel.js
 * Purpose: the Save tab: autosave status, download / copy a save, load from a
 *          file or pasted text, and start over (with a confirm step).
 * Inputs:  { root, bus, getState, autosave, serialize, parseSave, saveTextFile }
 * Outputs: builds controls in `root`; emits 'intent' game/load and game/reset.
 *          returns { destroy }.
 * Notes:   no game logic. Loading goes through parseSave (migrate + sanitize)
 *          first, so a bad file shows a message and changes nothing.
 */
import { el } from '../utils/dom.js';

const clock = (at) => new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export function createSavePanel({ root, bus, getState, autosave, serialize, parseSave, saveTextFile }) {
  const wrap = el('div', 'save-panel');
  const status = el('p', 'save-status');
  const message = el('p', 'save-message');
  message.setAttribute('role', 'status');

  const button = (label, onClick) => {
    const b = el('button', 'opt', label);
    b.type = 'button';
    b.addEventListener('click', onClick);
    return b;
  };
  const say = (text) => { message.textContent = text; };

  function showStatus(info = autosave.status()) {
    if (!info) status.textContent = 'Autosave is on. Changes save a moment after you make them.';
    else if (info.status === 'saved') status.textContent = `Autosaved at ${clock(info.at)}.`;
    else if (info.status === 'error') status.textContent = 'Autosave failed. Download a save to keep your room.';
    else status.textContent = 'Autosave is not available here. Download a save to keep your room.';
  }

  function applyText(text) {
    const result = parseSave(text);
    if (!result.ok) return say(result.error);
    bus.emit('intent', { action: 'game/load', payload: { state: result.state } });
    const tables = result.state.stations.length;
    const items = result.state.stations.reduce((n, s) => n + s.placedItems.length, 0);
    say(`Loaded ${tables} ${tables === 1 ? 'table' : 'tables'} and ${items} ${items === 1 ? 'item' : 'items'}.`);
  }

  const paste = el('textarea', 'save-text');
  paste.rows = 4;
  paste.placeholder = 'Paste a save here';
  paste.setAttribute('aria-label', 'Paste a save');

  const file = el('input');
  file.type = 'file';
  file.accept = '.json,application/json';
  file.hidden = true;
  file.addEventListener('change', async () => {
    const chosen = file.files?.[0];
    if (chosen) applyText(await chosen.text());
    file.value = '';
  });

  let erasing = null;
  const erase = button('Start over', () => {
    if (!erasing) {
      erase.textContent = 'Tap again to erase';
      erasing = setTimeout(() => { erasing = null; erase.textContent = 'Start over'; }, 4000);
      return;
    }
    clearTimeout(erasing);
    erasing = null;
    erase.textContent = 'Start over';
    bus.emit('intent', { action: 'game/reset', payload: {} });
    say('Started a new room.');
  });

  wrap.append(
    status,
    el('h3', null, 'Keep a copy'),
    el('p', 'note', 'Download your room as a file you can load on any device.'),
    button('Download save', async () => {
      try {
        const result = await saveTextFile('vivarium-save.json', serialize(getState()));
        say(result === 'declined' ? 'Download cancelled.' : 'Save file ready. Check your downloads.');
      } catch {
        say('Could not download. Use Copy save instead.');
      }
    }),
    button('Copy save', async () => {
      const text = serialize(getState());
      try {
        await navigator.clipboard.writeText(text);
        say('Copied. Paste it somewhere safe.');
      } catch {
        paste.value = text;
        paste.select();
        say('Copy the text in the box below.');
      }
    }),
    el('h3', null, 'Load a save'),
    el('p', 'note', 'Loading replaces the room you have now.'),
    button('Load from file', () => file.click()),
    file,
    paste,
    button('Load pasted save', () => (paste.value.trim() ? applyText(paste.value) : say('Paste a save first.'))),
    el('h3', null, 'Start over'),
    el('p', 'note', 'Erases your room and begins again.'),
    erase,
    message,
  );
  root.append(wrap);
  showStatus();

  const off = bus.on('save:status', showStatus);
  return { destroy: () => { off(); if (erasing) clearTimeout(erasing); } };
}
