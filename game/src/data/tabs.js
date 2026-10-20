/**
 * data/tabs.js
 * Purpose: defines the tab bar and what each drawer contains. Adding a tab or
 *          section is a data change; the UI builds itself from this.
 * Inputs:  none (pure data)
 * Outputs: TABS
 * Tab:     { id, name, icon (8x8 grid, 0 main / 1 accent), scope, sections, footer? }
 *   scope  'room' edits the whole room; 'station' edits the selected table.
 * Section: { title, catalog (registry key), target ('room' | 'table' | 'tank'),
 *            field, action, kind?, empty? }
 *   kind 'place' = tapping adds an item (action gets { catalog, itemId });
 *   otherwise tapping sets target[field] to the item's id.
 *   note? is a short teaching line shown under the title.
 *   kind 'guide' shows a color-coded list of the tank's floor layers instead
 *   of cards: { title, note, layers: [{ field, catalog, label, purpose }] }.
 * Footer:  [{ label, action, needs? }]  needs: 'multiple' = 2+ tables.
 *          { toggle: 'key', label } is an on/off switch for settings[key].
 *          { event: 'name', label } emits a bus event (opens a panel).
 *   kind 'readout' lists numbers instead of cards; `source: 'tank'` lists the
 *   tank's size and heat properties (default: lamp heat and UVB).
 * Panel:   a tab with `panel: 'name'` shows a custom panel (built in main.js)
 *          instead of sections, for things that are not item cards (saving).
 */
const room = (title, catalog, field) => ({ title, catalog, target: 'room', field, action: 'room/set' });
const table = (title, catalog, field) => ({ title, catalog, target: 'table', field, action: 'table/set' });
const tank = (title, catalog, field) => ({ title, catalog, target: 'tank', field, action: 'tank/set' });
const layer = (title, catalog, field, note) => ({ title, catalog, target: 'tank', field, action: 'tank/set', note });
// kind 'place': tapping a card adds a copy to the tank instead of applying a setting.
const place = (title, catalog, empty) => ({ title, catalog, kind: 'place', target: 'tank', field: 'item', action: 'item/place', empty });
const later = (title, catalog, empty) => ({ title, catalog, target: 'tank', field: 'item', action: 'item/place', empty });

export const TABS = [
  {
    id: 'room', name: 'Room', scope: 'room',
    icon: ['...11...', '..1111..', '.111111.', '11111111', '.00..00.', '.00..00.', '.00..00.', '.000000.'],
    sections: [
      room('Wall color', 'wallColors', 'wallColor'),
      room('Wallpaper', 'wallpapers', 'wallpaper'),
      room('Wallpaper color', 'wallpaperColors', 'wallpaperColor'),
      room('Baseboard', 'trims', 'trim'),
      room('Baseboard color', 'trimColors', 'trimColor'),
    ],
    footer: [{ label: 'Room thermostat', event: 'ui:thermostat' }],
  },
  {
    id: 'table', name: 'Table', scope: 'station',
    icon: ['00000000', '00000000', '.0....0.', '.0....0.', '.0....0.', '.0....0.', '.0....0.', '.0....0.'],
    sections: [
      table('Style', 'tables', 'style'),
      table('Color', 'tableColors', 'color'),
      table('Height', 'tableHeights', 'height'),
    ],
    footer: [{ label: 'Remove this table', action: 'station/remove', needs: 'multiple' }],
  },
  {
    id: 'tank', name: 'Tank', scope: 'station',
    icon: ['00000000', '0......0', '0.1....0', '0..1...0', '0......0', '0......0', '0......0', '00000000'],
    sections: [
      { title: 'Size', catalog: 'tankSizes', target: 'tank', field: 'size', action: 'tank/setSize' },
      { title: 'Enclosure', catalog: 'tankMaterials', target: 'tank', field: 'material', action: 'tank/set',
        note: 'Screen lets heat and moist air out. Chameleons need it; frogs need it sealed.' },
      { title: 'Tank properties', kind: 'readout', source: 'tank',
        note: 'Glass holds heat in. A bigger tank has more wall to lose it through, so lamps warm it less. Set the room temperature on the wall thermostat.' },
    ],
  },
  {
    id: 'plants', name: 'Plants', scope: 'station',
    icon: ['..1..1..', '.111111.', '..1111..', '...00...', '...00...', '...00...', '..0000..', '..0000..'],
    sections: [place('Plants', 'plants', 'No plants yet.')],
  },
  {
    id: 'substrate', name: 'Substrate', scope: 'station',
    icon: ['........', '........', '1.1.1.1.', '.1.1.1.1', '00000000', '00000000', '.0.0.0.0', '0.0.0.0.'],
    sections: [
      {
        kind: 'guide', title: 'Floor layers, top to bottom',
        note: 'Build from the bottom up. A fine mesh barrier (the dotted line) keeps soil out of the drainage layer.',
        layers: [
          { field: 'litter', catalog: 'litter', label: 'Leaf litter', purpose: 'Food and cover for the cleanup crew.' },
          { field: 'substrate', catalog: 'substrates', label: 'Substrate', purpose: 'Holds moisture and feeds soil life.' },
          { field: 'charcoal', catalog: 'charcoal', label: 'Charcoal', purpose: 'Filters the water, keeps it fresh.' },
          { field: 'drainage', catalog: 'drainage', label: 'Drainage', purpose: 'Catches extra water.' },
        ],
      },
      layer('1. Drainage layer', 'drainage', 'drainage',
        'A false bottom that catches water draining out of the soil, so roots never sit in a puddle.'),
      layer('2. Charcoal layer', 'charcoal', 'charcoal',
        'A very thin layer that helps filter the water and keeps the enclosure smelling fresh.'),
      layer('3. Base substrate', 'substrates', 'substrate',
        'A bioactive mix of soil, bark, coco and sphagnum fibre feeds the isopods and springtails that clean up waste.'),
      layer('4. Leaf litter', 'litter', 'litter',
        'Gives the cleanup crew food and shelter, holds humidity, and makes hiding spots. Add more as leaves break down.'),
    ],
  },
  {
    id: 'rocks', name: 'Rocks', scope: 'station',
    icon: ['........', '..0000..', '.000000.', '.000000.', '00000000', '00000000', '.000000.', '........'],
    sections: [place('Rocks', 'rocks', 'No rocks yet.')],
  },
  {
    id: 'moss', name: 'Moss', scope: 'station',
    icon: ['........', '...11...', '..1111..', '.111111.', '11111111', '11111111', '.000000.', '........'],
    sections: [place('Moss', 'moss', 'No moss yet.')],
  },
  {
    id: 'decor', name: 'Decor', scope: 'station',
    icon: ['...11...', '...11...', '11111111', '.111111.', '..1111..', '.111111.', '.11..11.', '11....11'],
    sections: [place('Decor', 'decor', 'No decor yet.')],
  },
  {
    id: 'ledges', name: 'Ledges', scope: 'station',
    icon: ['........', '........', '00000000', '11111111', '.0....0.', '........', '00000000', '11111111'],
    sections: [place('Wall ledges', 'ledges', 'No ledges yet.')],
  },
  {
    id: 'background', name: 'Back', scope: 'station',
    icon: ['.....1..', '........', '...0....', '..000...', '.00000.0', '00000000', '00000000', '00000000'],
    sections: [tank('Backgrounds', 'backgrounds', 'background'), tank('Colors', 'backgroundColors', 'backgroundColor')],
  },
  {
    id: 'animals', name: 'Animals', scope: 'station',
    icon: ['.0....0.', '00.00.00', '.0.00.0.', '...00...', '..0000..', '.000000.', '.000000.', '..0..0..'],
    panel: 'animals',
    sections: [],
  },
  {
    id: 'warnings', name: 'Warnings', scope: 'station',
    icon: ['...00...', '..0000..', '..0110..', '.001100.', '.001100.', '.000000.', '.001100.', '00000000'],
    panel: 'warnings',
    sections: [],
  },
  {
    id: 'lighting', name: 'Lights', scope: 'station',
    icon: ['..1111..', '.111111.', '.111111.', '.111111.', '..1111..', '..0000..', '..0000..', '...00...'],
    sections: [
      { title: 'Lamp slot', kind: 'slot', note: 'Up to two lamps sit on top of the tank.' },
      { title: 'Fixture', catalog: 'lights', target: 'lamp', field: 'type', action: 'light/set',
        note: 'Lamps warm the tank and dry the air. Basking lamps do the most.' },
      { title: 'Wattage', kind: 'watts', empty: 'Pick a fixture first.', target: 'lamp', field: 'watts', action: 'light/set',
        note: 'More watts: a longer, wider beam, and more heat and UVB.' },
      { title: 'LED color', catalog: 'lightColors', target: 'lamp', field: 'color', action: 'light/set',
        note: 'Only the LED bar uses this. Other lamps have their own color.' },
      { title: 'Heat and UVB', kind: 'readout',
        note: 'Saved for hot spot checks. Press View (top right) to see temperature, humidity or UVB across the tank.' },
    ],
  },
  {
    id: 'save', name: 'Save', scope: 'room', panel: 'save',
    icon: ['00000000', '0.1111.0', '0.1111.0', '0......0', '0.0000.0', '0.0..0.0', '0.0000.0', '00000000'],
    sections: [],
  },
];
