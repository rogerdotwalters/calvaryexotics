/**
 * entities/morph.js
 * Purpose: a plain-language label for a morph, from its traits (for example
 *          "Black striped"). Colonies are identified this way instead of by
 *          real-world morph names.
 * Inputs:  morphLabel(species, morph) with morph = { color, pattern, ... }
 * Outputs: a capitalized string; the pattern is left out when it is "none".
 * Notes:   uses each trait's optional `labels` map (genetics.traits.*.labels),
 *          falling back to the allele name.
 */
export function morphLabel(species, morph) {
  const traits = species.genetics?.traits ?? {};
  const word = (trait) => {
    const value = morph?.[trait];
    if (!value || value === 'none') return '';
    return traits[trait]?.labels?.[value] ?? value;
  };
  const text = [word('color'), word('pattern')].filter(Boolean).join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}
