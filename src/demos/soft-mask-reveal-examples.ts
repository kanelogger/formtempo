import { createProgressExamples } from './scroll-progress-examples';
import { softMaskRevealStage } from './soft-mask-reveal-markup';
import styles from './soft-mask-reveal.css?raw';
import interaction from './soft-mask-reveal-interaction.js?raw';

const id = 'soft-mask-reveal';

export const softMaskRevealExamples = {
  [id]: createProgressExamples({
    id,
    title: '滚动软边遮罩',
    stage: softMaskRevealStage,
    initial: 50,
    styles,
    script: interaction.replace(/^export function createSoftMaskRenderer/m, 'function createSoftMaskRenderer'),
    setup: 'createSoftMaskRenderer(root)',
  }),
};
