import { scrollModelStage } from './scroll-model-stage';
import { createProgressExamples } from './scroll-progress-examples';
import styles from './scroll-model.css?raw';
export const scrollModelExamples = {
  'scroll-3d-model': createProgressExamples({
    id: 'scroll-3d-model', title: '滚动驱动 3D 模型', stage: scrollModelStage, initial: 50, styles, script: '',
    setup: "(progress) => root.style.setProperty('--model-progress', String(progress))",
  }),
};
