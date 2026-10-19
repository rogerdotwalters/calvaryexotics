/**
 * data/tankSizes.js
 * Purpose: terrarium sizes and tank materials.
 * Inputs:  none (pure data)
 * Outputs: TANK_SIZES, TANK_MATERIALS, SURFACES
 * Notes:   size ids are "WxDxH" in inches. The view is a front side-on, so
 *          width and height set the drawn size (4 pixels per inch); depth is
 *          used by the simulation (floor area, volume).
 *          A material's `swaps` recolor the tank palette (glass uses none).
 *          A material also lists what each of the tank's six faces is made of
 *          (`faces`), and SURFACES says how fast each kind of surface lets heat
 *          through (`u`, watts per square meter per degree C). That is what the
 *          tank analysis (systems/thermal.js) reads. Today every side and the
 *          lid are glass, so the tank is fully enclosed. When screen tops and
 *          open sides arrive, point a face at 'screen' and the same analysis
 *          covers them.
 */
const SIZES = [
  { id: '12x12x12', name: '12x12x12', description: 'Compact cube for a small colony.', width: 12, depth: 12, height: 12 },
  { id: '12x12x18', name: '12x12x18', description: 'Small and tall, just right for one.', width: 12, depth: 12, height: 18 },
  { id: '18x18x18', name: '18x18x18', description: 'A cube for frogs and small lizards.', width: 18, depth: 18, height: 18 },
  { id: '18x18x24', name: '18x18x24', description: 'Tall tank with room to climb.', width: 18, depth: 18, height: 24 },
  { id: '24x18x18', name: '24x18x18', description: 'Wide and roomy for ground dwellers.', width: 24, depth: 18, height: 18 },
  { id: '36x18x18', name: '36x18x18', description: 'Long tank with space for a full layout.', width: 36, depth: 18, height: 18 },
  { id: '18x18x36', name: '18x18x36', description: 'Very tall, with a long climb.', width: 18, depth: 18, height: 36 },
  { id: '24x24x48', name: '24x24x48', description: 'A towering rainforest display.', width: 24, depth: 24, height: 48 },
  { id: '30x12x12', name: '30x12x12', description: 'Long and low, a rock-crevice home.', width: 30, depth: 12, height: 12 },
  { id: '24x24x24', name: '24x24x24', description: 'A roomy cube for one or two.', width: 24, depth: 24, height: 24 },
  { id: '36x18x36', name: '36x18x36', description: 'Wide and tall for climbers.', width: 36, depth: 18, height: 36 },
  { id: '48x24x24', name: '48x24x24', description: 'The classic 4 foot long enclosure.', width: 48, depth: 24, height: 24 },
  { id: '48x48x24', name: '48x48x24', description: 'Huge floor space for a big scene.', width: 48, depth: 48, height: 24 },
];

/** The same sizes with their volume (US gallons) in front of the description. */
export const TANK_SIZES = SIZES.map((size) => ({
  ...size,
  description: `${Math.round((size.width * size.depth * size.height) / 231)} gal. ${size.description}`,
}));

/** u: heat passing through a wall, watts per square meter per degree C (air films included). */
export const SURFACES = {
  glass: { name: 'Glass', u: 5.5 },
  screen: { name: 'Screen', u: 22 }, // not used yet
  table: { name: 'Table top', u: 2 },
};

/**
 * Enclosure types. `faces` says what each of the six faces is made of; the
 * tank analysis turns that into heat loss and airflow (`screen` faces let heat and
 * moist air through). Mesh frames are a darker metal, so `swaps` recolor the tank palette.
 */
export const TANK_MATERIALS = [
  {
    id: 'glass', name: 'Glass tank', description: 'Sealed glass. Holds heat and humidity.', swaps: {},
    faces: { front: 'glass', back: 'glass', left: 'glass', right: 'glass', top: 'glass', bottom: 'table' },
  },
  {
    id: 'glass-mesh', name: 'Mesh top', description: 'Glass with a screen lid. A little airflow.', swaps: {},
    faces: { front: 'glass', back: 'glass', left: 'glass', right: 'glass', top: 'screen', bottom: 'table' },
  },
  {
    id: 'mesh-sides', name: 'Mesh sides', description: 'Glass front and back, screen top and sides.', swaps: { 2: '#4c4758', 3: '#6a6478' },
    faces: { front: 'glass', back: 'glass', left: 'screen', right: 'screen', top: 'screen', bottom: 'table' },
  },
  {
    id: 'screen', name: 'Screen cage', description: 'Screen all round. Lots of air, little humidity.', swaps: { 1: '#2b2833', 2: '#4c4758', 3: '#6a6478' },
    faces: { front: 'screen', back: 'screen', left: 'screen', right: 'screen', top: 'screen', bottom: 'table' },
  },
];
