/**
 * core/eventBus.js
 * Purpose: tiny pub/sub so systems, renderer and UI never import each other.
 * Inputs:  on(type, fn) / off(type, fn) / emit(type, payload)
 * Outputs: on() returns an unsubscribe function.
 */
export function createEventBus() {
  const handlers = new Map();

  function off(type, fn) {
    handlers.get(type)?.delete(fn);
  }

  function on(type, fn) {
    if (!handlers.has(type)) handlers.set(type, new Set());
    handlers.get(type).add(fn);
    return () => off(type, fn);
  }

  function emit(type, payload) {
    for (const fn of [...(handlers.get(type) ?? [])]) fn(payload);
  }

  return { on, off, emit };
}
