/**
 * utils/dom.js
 * Purpose: tiny helper for building DOM nodes (text via textContent only).
 * Inputs:  el(tag, className?, text?)
 * Outputs: an HTMLElement.
 */
export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
