import { clipArtwork } from './driven-art';

const artwork = `<svg viewBox="0 0 760 430" aria-hidden="true" focusable="false">${clipArtwork}</svg>`;

export const scaleRevealMarkup = `
<div class="scale-reveal" data-scale-reveal data-mode="manual">
  <div class="scale-reveal__panel" data-scale-panel>
    <div class="scale-reveal__pair">
      <figure>
        <div class="scale-reveal__well">
          <div class="scale-reveal__art scale-reveal__art--crop" data-scale-crop>${artwork}</div>
        </div>
        <figcaption><strong>裁剪展开</strong><span>原尺寸，打开可见区域</span></figcaption>
      </figure>
      <figure>
        <div class="scale-reveal__well">
          <div class="scale-reveal__art scale-reveal__art--zoom" data-scale-zoom>${artwork}</div>
        </div>
        <figcaption><strong>缩放显现</strong><span>完整构图，从中心放大</span></figcaption>
      </figure>
    </div>
    <div class="scale-reveal__controls" data-scale-controls hidden>
      <div class="scale-reveal__progress">
        <span id="scale-reveal-progress-label">演示进度</span>
        <input type="range" min="0" max="100" value="50" aria-labelledby="scale-reveal-progress-label"
          aria-valuetext="50%" data-scale-slider />
        <progress max="100" value="50" aria-labelledby="scale-reveal-progress-label" data-scale-meter hidden></progress>
        <div class="scale-reveal__steps" role="group" aria-labelledby="scale-reveal-progress-label" data-scale-steps hidden>
          <button type="button" data-scale-step="0" aria-pressed="false">0%</button>
          <button type="button" data-scale-step="50" aria-pressed="true">50%</button>
          <button type="button" data-scale-step="100" aria-pressed="false">100%</button>
        </div>
        <span class="scale-reveal__value" data-scale-value aria-hidden="true">50%</span>
      </div>
      <div class="scale-reveal__mode" data-scale-mode>
        <button type="button" aria-pressed="false" data-scale-toggle>跟随页面滚动</button>
        <p data-scale-hint hidden>向下滚动前进，向上滚动回退。</p>
      </div>
    </div>
    <p class="scale-reveal__static" data-scale-static>50% 示意。裁剪只露出中央，缩放则保留完整构图。</p>
    <p class="scale-reveal__static" data-scale-error hidden>GSAP 未加载，请联网后刷新以操作示例。</p>
  </div>
  <div class="scale-reveal__distance" aria-hidden="true"></div>
</div>`;
