import { hoverGridMarkup } from './hover-grid-markup';
import { hoverExampleDocument } from './hover-example-document';
import styles from './hover-grid.css?raw';
import interaction from './hover-grid-interaction.js?raw';

function example(useGsap: boolean) {
  const controller = interaction.replace('export function bindHoverGrid', 'function bindHoverGrid');
  const script = `${controller}\nbindHoverGrid(document.querySelector('[data-hover-grid]')${useGsap ? ', window.gsap' : ''});`;
  return hoverExampleDocument('悬停阵列轨迹', hoverGridMarkup, styles, script, useGsap);
}

export const hoverGridExamples = { 'hover-grid-trail': { native: example(false), gsap: example(true) } };
