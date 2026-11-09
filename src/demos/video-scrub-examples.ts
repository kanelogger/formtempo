import { createProgressExamples } from './scroll-progress-examples';
import videoData from './video-scrub-sun.mp4?inline';
import { videoScrubStage } from './video-scrub-markup';
import styles from './video-scrub.css?raw';
import interaction from './video-scrub-interaction.js?raw';

export const videoScrubExamples = {
  'video-scrub': createProgressExamples({
    id: 'video-scrub',
    title: '滚动控制视频帧',
    stage: videoScrubStage(),
    initial: 0,
    styles,
    script: interaction.replace(/^export function createVideoScrubber/m, 'function createVideoScrubber'),
    setup: `createVideoScrubber(root, ${JSON.stringify(videoData)})`,
  }),
};
