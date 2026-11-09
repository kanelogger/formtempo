import { scrollCameraStage } from './scroll-camera-stage';
import { createProgressExamples } from './scroll-progress-examples';
import styles from './scroll-camera.css?raw';

export const scrollCameraExamples = {
  'scroll-camera': createProgressExamples({
    id: 'scroll-camera',
    title: '滚动运镜',
    stage: scrollCameraStage,
    initial: 50,
    styles,
    script: '',
    setup: "(progress) => root.style.setProperty('--camera-progress', String(progress))",
  }),
};
