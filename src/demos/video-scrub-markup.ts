import start from './video-scrub-start.webp?inline';
import middle from './video-scrub-middle.webp?inline';
import end from './video-scrub-end.webp?inline';

const keyframes = [
  { image: start, label: '起点 · 0%', alt: '日轮在画面左侧' },
  { image: middle, label: '中段 · 50%', alt: '日轮在画面中央上方' },
  { image: end, label: '终点 · 100%', alt: '日轮在画面右侧' },
];

export function videoScrubStage(videoUrl?: string) {
  return `
    <div class="video-scrub" data-video-scrub>
      <figure class="video-scrub__main">
        <div class="video-scrub__screen">
          <video data-video-player${videoUrl ? ` data-video-src="${videoUrl}"` : ''} width="480" height="270"
            muted playsinline preload="auto" disablepictureinpicture aria-hidden="true"></video>
          <img class="video-scrub__poster" src="${start}" width="480" height="270" alt="">
        </div>
        <figcaption class="video-scrub__caption">
          <span>日轮掠过山脊</span>
          <span class="video-scrub__frame" data-video-frame>01 / 72 帧</span>
        </figcaption>
        <p class="video-scrub__status" data-video-status role="status" hidden></p>
      </figure>
      <ol class="video-scrub__keyframes" data-video-keyframes aria-label="视频关键帧">
        ${keyframes.map(({ image, label, alt }) => `
          <li>
            <img src="${image}" width="480" height="270" alt="${alt}">
            <span>${label}</span>
          </li>`).join('')}
      </ol>
    </div>`;
}
