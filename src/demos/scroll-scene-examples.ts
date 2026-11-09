import { scrollSceneStage } from './scroll-scene-stage';
import { createProgressExamples } from './scroll-progress-examples';
import styles from './scroll-scene.css?raw';
export const scrollSceneExamples = {
  'scroll-3d-scene': createProgressExamples({
    id: 'scroll-3d-scene', title: '滚动切换 3D 场景', stage: scrollSceneStage, initial: 50, styles, script: '',
    setup: "(progress) => root.style.setProperty('--scene-progress', String(progress))",
  }),
};
