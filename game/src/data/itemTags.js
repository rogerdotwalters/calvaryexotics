/**
 * data/itemTags.js
 * Purpose: what each placed item is good for, so species needs can be checked
 *          without engine code knowing about specific items.
 * Inputs:  none (pure data)
 * Outputs: ITEM_TAGS { [itemId]: [tag] }, tagsOf(catalog, itemId), TAGS
 * Tags:    climb  something an arboreal animal can climb or perch on
 *          hide   a hiding spot
 *          cover  foliage that gives cover
 *          perch  a flat ledge to rest on
 *          bask   a spot under heat (used with the heat gradient)
 */
export const TAGS = ['climb', 'hide', 'cover', 'perch'];

export const ITEM_TAGS = {
  // plants
  'fern': ['cover'], 'snake-plant': ['cover'], 'neoregelia': ['cover'], 'guzmania': ['cover'], 'aechmea': ['cover'],
  'vriesea': ['cover'], 'cryptanthus': ['cover'],
  'golden-pothos': ['cover', 'climb'], 'marble-queen': ['cover', 'climb'], 'neon-pothos': ['cover', 'climb'],
  'jade-pothos': ['cover', 'climb'], 'satin-pothos': ['cover', 'climb'],
  // moss
  'mossy-log': ['climb', 'hide'], 'mossy-rock': ['perch'], 'mossy-boulder': ['perch'],
  // rocks and decor
  'boulder': ['perch'], 'flat-stone': ['perch'],
  'driftwood': ['climb', 'perch'], 'climbing-branch': ['climb'], 'driftwood-branch': ['climb'], 'driftwood-root': ['climb', 'hide'],
  'cork-hide': ['hide'], 'coconut-hide': ['hide'],
  // wall ledges
  'stone-ledge': ['perch', 'climb'], 'slate-ledge': ['perch', 'climb'], 'rock-ledge': ['perch', 'climb'],
  'cork-ledge': ['perch', 'climb'], 'driftwood-ledge': ['perch', 'climb'],
};

export const tagsOf = (itemId) => ITEM_TAGS[itemId] ?? [];
