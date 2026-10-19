/**
 * core/layers.js
 * Purpose: draw order of placed items.
 * Inputs:  a tank's placedItems list ({ id, plane, behind, ... })
 * Outputs: layerSequence(list), moveLayer(list, id, 'forward'|'backward'),
 *          canMoveLayer(list, id, dir), isBackPlane(item).
 * Notes:   three groups, back to front:
 *            1. wall items (plane 'back': ledges) hang on the back wall
 *            2. items behind the substrate (behind = true)
 *            3. the substrate, which is layer 0
 *            4. items in front of the substrate
 *          Moving a regular item one step past the substrate switches sides.
 *          Wall items are only ordered among themselves.
 *          The list order is kept as: wall items, behind items, front items.
 */
const SUBSTRATE = '#substrate';

export const isBackPlane = (item) => item.plane === 'back';

export function layerSequence(list) {
  const main = list.filter((p) => !isBackPlane(p));
  return [...main.filter((p) => p.behind).map((p) => p.id), SUBSTRATE, ...main.filter((p) => !p.behind).map((p) => p.id)];
}

export function moveLayer(list, id, dir) {
  const item = list.find((p) => p.id === id);
  if (!item) return list;
  const step = dir === 'forward' ? 1 : -1;
  const walls = list.filter(isBackPlane);
  const main = list.filter((p) => !isBackPlane(p));

  if (isBackPlane(item)) {
    const i = walls.findIndex((p) => p.id === id);
    const j = i + step;
    if (j < 0 || j >= walls.length) return list;
    const next = [...walls];
    [next[i], next[j]] = [next[j], next[i]];
    return [...next, ...main];
  }

  const seq = layerSequence(main);
  const i = seq.indexOf(id);
  const j = i + step;
  if (i < 0 || j < 0 || j >= seq.length) return list;
  [seq[i], seq[j]] = [seq[j], seq[i]];
  const cut = seq.indexOf(SUBSTRATE);
  const byId = new Map(main.map((p) => [p.id, p]));
  const moved = seq
    .filter((entry) => entry !== SUBSTRATE)
    .map((entry) => ({ ...byId.get(entry), behind: seq.indexOf(entry) < cut }));
  return [...walls, ...moved];
}

export const canMoveLayer = (list, id, dir) => moveLayer(list, id, dir) !== list;
