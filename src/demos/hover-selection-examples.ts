import { hoverExampleDocument } from './hover-example-document';
import { hoverSelectionMarkup, selectionTitles, type SelectionVariant } from './hover-selection-markup';
import source from './hover-selection-interaction.js?raw';
import styles from './hover-selection.css?raw';

const controller = source.replace('export function bindHoverSelection', 'function bindHoverSelection');
const gsapMotion = `function animateWithGsap(target, property, value, duration) {
  gsap.to(target, { [property]: value, duration: duration / 1000, ease: 'power3.out', overwrite: true });
}`;

function example(variant: SelectionVariant, gsap: boolean) {
  const script = `${controller}
${gsap ? gsapMotion : ''}
bindHoverSelection(document.querySelector('[data-hover-selection]')${gsap ? ', window.gsap ? animateWithGsap : undefined' : ''});`;
  return hoverExampleDocument(selectionTitles[variant], hoverSelectionMarkup(variant), styles, script, gsap);
}

export const hoverSelectionExamples = Object.fromEntries(
  (Object.keys(selectionTitles) as SelectionVariant[]).map((variant) => [
    variant, { native: example(variant, false), gsap: example(variant, true) },
  ]),
);
