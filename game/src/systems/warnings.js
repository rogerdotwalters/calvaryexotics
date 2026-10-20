/**
 * systems/warnings.js
 * Purpose: finds what is wrong with a tank for an animal: the needs it does
 *          not meet, how bad each is, what the tank has now versus what the
 *          animal wants, and what to do about it. No rendering, no DOM.
 * Inputs:  checkTank(station, state, registry, species, animal?)
 *          animal is a resident; without it the check is for a new animal of
 *          that species placed at the middle of the floor.
 * Outputs: { mood, issues: [{ key, label, severity ('bad' | 'warn'), score, detail, advice }] },
 *          worst first. warningCount(state, registry) -> { total, bad } for the
 *          animals in the selected tank (the Warnings tab badge).
 * Notes:   scores come from the same rules that decide an animal's mood
 *          (systems/needs.js), so a warning always means the animal is less
 *          happy for it. A need scoring under 0.4 is bad, under 0.8 a warning.
 */
import { evaluateNeeds, needAdvice } from './needs.js';
import { needsContext } from './animals.js';
import { getSelectedStation } from '../core/selectors.js';

const BAD = 0.4;
const WARN = 0.8;

export const NEED_LABELS = {
  temperature: 'Temperature', basking: 'Basking spot', humidity: 'Humidity', uvb: 'UVB', hides: 'Hides',
  climbing: 'Climbing', foliage: 'Plants', food: 'Food', water: 'Water', cleanliness: 'Cleanliness',
  space: 'Tank height', length: 'Tank length', openSpace: 'Floor space', substrate: 'Substrate', airflow: 'Airflow',
};

const span = ([lo, hi]) => `${lo}-${hi}`;
const count = (ctx, ...tags) => ctx.items.filter((i) => tags.some((t) => i.tags.includes(t))).length;

/** "What the tank has now, and what the animal wants", in one line. */
function detail(key, station, species, ctx) {
  const n = species.needs;
  const env = ctx.env;
  const shift = ctx.night ? (n.nightDrop ?? 8) : 0;
  switch (key) {
    case 'temperature': return `Air ${Math.round(env.temperature)}F, wants ${span(n.temperature.range.map((v) => v - shift))}F${ctx.night ? ' at night' : ''}`;
    case 'basking': return `Hot spot ${Math.round(ctx.hotTemp)}F, wants ${span(n.basking.range)}F`;
    case 'humidity': return `${Math.round(env.humidity)}%, wants ${span(n.humidity.range)}%`;
    case 'uvb': return `Peak ${ctx.maxUvb.toFixed(1)} UVI, wants ${span(n.uvb.range)}`;
    case 'hides': return `${count(ctx, 'hide')} hides, wants ${n.hides}`;
    case 'climbing': return `${count(ctx, 'climb', 'perch')} to climb, wants ${n.climbing}`;
    case 'foliage': return `${count(ctx, 'cover')} plants, wants ${n.foliage}`;
    case 'food': return `Food ${Math.round(env.food)}%`;
    case 'water': return `Water ${Math.round(env.water)}%`;
    case 'cleanliness': return `Clean ${Math.round(env.cleanliness)}%`;
    case 'space': return `${ctx.tankHeightIn} in tall, wants ${n.minHeightIn}`;
    case 'length': return `${ctx.lengthIn} in long, wants ${n.minLengthIn}`;
    case 'openSpace': return `${Math.round(ctx.openFrac * 100)}% of the floor is open, wants ${n.openSpace.min !== undefined ? `at least ${Math.round(n.openSpace.min * 100)}` : `at most ${Math.round(n.openSpace.max * 100)}`}%`;
    case 'substrate': return `${station.tank.substrate} substrate, wants ${n.substrate.join(' or ')}`;
    case 'airflow': return `${Math.round(ctx.airflow * 100)}% screen, wants ${n.airflow.min !== undefined ? `at least ${Math.round(n.airflow.min * 100)}` : `at most ${Math.round(n.airflow.max * 100)}`}%`;
    default: return '';
  }
}

export function checkTank(station, state, registry, species, animal) {
  const ctx = needsContext(station, state, registry, species);
  const at = animal
    ? { x: animal.fx * ctx.w, y: animal.fy * ctx.h, hidden: animal.hidden }
    : { x: ctx.w / 2, y: ctx.groundY - 2, hidden: null };
  const { scores, mood } = evaluateNeeds(at, ctx);
  const issues = Object.entries(scores)
    .filter(([, score]) => score < WARN)
    .map(([key, score]) => ({
      key, score,
      label: NEED_LABELS[key] ?? key,
      severity: score < BAD ? 'bad' : 'warn',
      detail: detail(key, station, species, ctx),
      advice: needAdvice(key, station, species),
    }))
    .sort((a, b) => a.score - b.score);
  return { mood, issues };
}

/** How many warnings the animals in the selected tank have, and how many are bad. */
export function warningCount(state, registry) {
  const station = getSelectedStation(state);
  let total = 0;
  let bad = 0;
  for (const animal of station.animals) {
    const species = registry.list('animals').find((s) => s.id === animal.species);
    if (!species) continue;
    for (const issue of checkTank(station, state, registry, species, animal).issues) {
      total += 1;
      if (issue.severity === 'bad') bad += 1;
    }
  }
  return { total, bad };
}
