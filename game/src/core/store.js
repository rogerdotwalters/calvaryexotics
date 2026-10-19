/**
 * core/store.js
 * Purpose: the single source of truth. State changes only via named actions.
 * Inputs:  { initialState, actions, bus }
 *          actions: { [name]: (state, payload) => partialStatePatch }
 * Outputs: { getState, dispatch, replace, serialize }
 * Events:  emits 'state:changed' { action, changed: [top-level keys] }
 * Notes:   state is treated as immutable. Actions return a patch of top-level
 *          keys; the store merges it. Saving = serialize().
 */
export function createStore({ initialState, actions, bus }) {
  let state = initialState;

  function dispatch(name, payload) {
    const action = actions[name];
    if (!action) throw new Error(`Unknown action: ${name}`);
    const patch = action(state, payload);
    const changed = Object.keys(patch ?? {});
    if (changed.length === 0) return;
    state = { ...state, ...patch };
    bus.emit('state:changed', { action: name, changed });
  }

  /** Swap the whole state (used by load/import). */
  function replace(next, reason = 'state/replace') {
    state = next;
    bus.emit('state:changed', { action: reason, changed: Object.keys(next) });
  }

  return {
    getState: () => state,
    dispatch,
    replace,
    serialize: () => JSON.stringify(state),
  };
}
