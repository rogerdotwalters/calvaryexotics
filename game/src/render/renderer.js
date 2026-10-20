/**
 * render/renderer.js
 * Purpose: layered Canvas 2D compositor for the whole (scrollable) room.
 *          Each layer draws into its own world-sized offscreen canvas and only
 *          redraws when its signature (the slice of state it depends on)
 *          changes; compositing copies the visible window (camera).
 * Inputs:  { canvas, bus, getState, registry }
 * Outputs: { render, invalidate }. render() is cheap when nothing changed.
 * Notes:   read-only on state. Back-to-front: room, wall thermostat, table, tank back,
 *          background, wall items, items behind the substrate, substrate,
 *           items, tank front, lamps, night, light shadows, light, data view,
 *          overlay. Light layers use "multiply" and "screen" blending.
 *          With a live data view on and settings.mapOpacity below 1, the map is drawn
 *          see-through and the wall items and items are drawn again over it, so
 *          you can still see and move them.
 */
import { getLayout } from './layout.js';
import { VIEW_H, VIEW_W } from '../data/world.js';
import { makeCanvas } from './spriteCache.js';
import { drawRoom } from './scene/room.js';
import { drawThermostat } from './scene/thermostat.js';
import { drawTables } from './scene/table.js';
import { drawTankBack, drawTankFront } from './scene/tank.js';
import { drawBackgrounds, drawSubstrates, drawItems, drawItemsBehind, drawWallItems } from './scene/contents.js';
import { drawNight, drawLightAdd, drawLightShade } from './scene/lighting.js';
import { drawDataView } from './scene/dataView.js';
import { isLiveView } from '../data/dataViews.js';
import { drawLamps } from './scene/lamps.js';
import { drawFx, FX_LIFE } from './fx.js';
import { drawAnimals } from './scene/animals.js';
import { nightLevel } from '../systems/daylight.js';
import { drawOverlay } from './scene/overlay.js';

// Where a tank sits depends only on its size and its table's height.
const place = (st) => [st.table.height, st.tank.size];

const lightSig = (s) => s.stations.map((st) => [
  place(st), st.lighting.lamps, st.tank.gradient?.on, st.placedItems,
  [st.tank.drainage, st.tank.charcoal, st.tank.substrate, st.tank.litter],
]);

const MAP_ITEM_ALPHA = 0.7; // how solid the items drawn over it are
const ABOVE_MAP = ['wallItems', 'items'];

const LAYERS = [
  { name: 'room', sig: (s) => [s.room, s.stations.length, s.view.w, s.view.h], draw: drawRoom },
  { name: 'thermostat', sig: (s) => [s.room.ambient, s.stations.length, s.view.w, s.view.h], draw: drawThermostat },
  { name: 'table', sig: (s) => s.stations.map((st) => [st.table, st.tank.size]), draw: drawTables },
  { name: 'tankBack', sig: (s) => s.stations.map((st) => [place(st), st.tank.material]), draw: drawTankBack },
  { name: 'background', sig: (s) => s.stations.map((st) => [place(st), st.tank.background, st.tank.backgroundColor]), draw: drawBackgrounds },
  { name: 'wallItems', sig: (s) => s.stations.map((st) => [place(st), st.placedItems.filter((p) => p.plane === 'back')]), draw: drawWallItems },
  { name: 'itemsBehind', sig: (s) => s.stations.map((st) => [place(st), st.placedItems.filter((p) => p.plane !== 'back' && p.behind)]), draw: drawItemsBehind },
  { name: 'substrate', sig: (s) => s.stations.map((st) => [place(st), st.tank.drainage, st.tank.charcoal, st.tank.substrate, st.tank.litter]), draw: drawSubstrates },
  { name: 'items', sig: (s) => s.stations.map((st) => [place(st), st.placedItems.filter((p) => p.plane !== 'back' && !p.behind)]), draw: drawItems },
  { name: 'tankFront', sig: (s) => s.stations.map((st) => [place(st), st.tank.material]), draw: drawTankFront },
  {
    name: 'lamps',
    sig: (s) => s.stations.map((st) => [place(st), st.lighting.lamps, st.tank.gradient?.on]),
    draw: drawLamps,
  },
  { name: 'night', sig: (s) => [nightLevel(s), s.stations.length, s.view.w, s.view.h], draw: drawNight },
  // Lighting: shadows darken ("multiply"), lit pixels brighten ("screen"). Both
  // depend on what is in the tank because objects block the light.
  { name: 'lightShade', blend: 'multiply', throttle: 90, sig: lightSig, draw: drawLightShade },
  { name: 'lightAdd', blend: 'screen', throttle: 90, sig: lightSig, draw: drawLightAdd },
  {
    // The data view covers the tank interiors with one set of data. It follows the
    // environment, so it refreshes with it (a few times a second) while it is on.
    name: 'dataView',
    sig: (s) => (!isLiveView(s.settings.dataView) ? ['off'] : [
      s.settings.dataView,
      s.stations.map((st) => [
        place(st), st.lighting.lamps, st.tank.gradient?.on, st.placedItems,
        [st.tank.drainage, st.tank.charcoal, st.tank.substrate, st.tank.litter, st.tank.material],
        Math.round(st.tank.environment.temperature * 2), Math.round(st.tank.environment.humidity * 2),
      ]),
    ]),
    draw: drawDataView,
  },
  {
    name: 'overlay',
    sig: (s) => [s.selectedStation, s.selectedItem, s.stations.map((st) => [st.id, st.table, st.tank.size, st.placedItems])],
    draw: drawOverlay,
  },
];

export function createRenderer({ canvas, bus, getState, registry }) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const layers = LAYERS.map((def) => {
    const layerCanvas = makeCanvas(VIEW_W, VIEW_H);
    const layerCtx = layerCanvas.getContext('2d', { willReadFrequently: true }); // lighting reads these pixels back
    layerCtx.imageSmoothingEnabled = false;
    return { ...def, canvas: layerCanvas, ctx: layerCtx, lastSig: null, lastDraw: 0 };
  });
  let changed = true;
  let lastCamera = -1;
  let wasAnimating = false;
  let lastAnimal = 0;
  const effects = [];

  bus.on('state:changed', () => { changed = true; });
  bus.on('fx', ({ kind, stationId }) => effects.push({ kind, stationId, t0: performance.now() }));

  function render() {
    const now = performance.now();
    while (effects.length && now - effects[0].t0 > FX_LIFE) effects.shift();
    const state = getState();
    // Animals animate at about 12 frames a second; care effects run every frame.
    const animalFrame = state.stations.some((st) => st.animals.length > 0) && now - lastAnimal >= 80;
    const animating = effects.length > 0 || animalFrame;
    if (!changed && !animating && !wasAnimating) return;
    if (animalFrame) lastAnimal = now;

    const layout = getLayout(state, registry);
    const { w: viewW, h: viewH } = layout.view;
    let redrew = false;

    // The screen can change size (rotating the phone, resizing the window).
    if (canvas.width !== viewW || canvas.height !== viewH) {
      canvas.width = viewW;
      canvas.height = viewH;
      ctx.imageSmoothingEnabled = false;
      changed = true;
      lastCamera = -1;
    }

    if (changed) {
      changed = false;
      const byName = Object.fromEntries(layers.map((l) => [l.name, l.canvas]));
      const lightKey = JSON.stringify([state.view.w, state.view.h, lightSig(state)]);
      for (const layer of layers) {
        let dirty = false;
        if (layer.canvas.width !== layout.world.w || layer.canvas.height !== layout.world.h) {
          layer.canvas.width = layout.world.w; // also clears the canvas
          layer.canvas.height = layout.world.h;
          layer.ctx.imageSmoothingEnabled = false;
          dirty = true;
        }
        const sig = JSON.stringify([state.view.w, state.view.h, state.stations.map((st) => st.tank.size), layer.sig(state)]);
        if (sig !== layer.lastSig) dirty = true;
        if (!dirty) continue;
        // Shadows are the costly part, so while an item is being dragged they update
        // about 10 times a second and catch up the moment it stops.
        if (layer.throttle && layer.lastSig !== null && sig !== layer.lastSig && now - layer.lastDraw < layer.throttle) {
          changed = true; // look again next frame
          continue;
        }
        layer.lastSig = sig;
        layer.lastDraw = now;
        layer.ctx.clearRect(0, 0, layout.world.w, layout.world.h);
        layer.draw(layer.ctx, state, { registry, layout, layers: byName, lightKey });
        redrew = true;
      }
    }

    const sx = Math.min(Math.max(0, state.view.cameraX), Math.max(0, layout.world.w - viewW));
    if (redrew || sx !== lastCamera || animating || wasAnimating) {
      lastCamera = sx;
      ctx.clearRect(0, 0, viewW, viewH);
      const seeThrough = isLiveView(state.settings.dataView) && state.settings.mapOpacity < 1;
      for (const layer of layers) {
        ctx.globalCompositeOperation = layer.blend ?? 'source-over';
        ctx.globalAlpha = seeThrough && layer.name === 'dataView' ? state.settings.mapOpacity : 1;
        ctx.drawImage(layer.canvas, sx, 0, viewW, viewH, 0, 0, viewW, viewH);
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        if (layer.name === 'items') drawAnimals(ctx, state, layout, registry, sx, now); // inside the tank, in front of plants
        if (seeThrough && layer.name === 'dataView') { // bring the movable items back above the map
          ctx.globalAlpha = MAP_ITEM_ALPHA;
          for (const name of ABOVE_MAP) ctx.drawImage(layers.find((l) => l.name === name).canvas, sx, 0, viewW, viewH, 0, 0, viewW, viewH);
          ctx.globalAlpha = 1;
        }
      }
      if (effects.length > 0) drawFx(ctx, effects, layout, sx, now);
    }
    wasAnimating = animating;
  }

  function invalidate() {
    for (const layer of layers) layer.lastSig = null;
    changed = true;
  }

  return { render, invalidate };
}
