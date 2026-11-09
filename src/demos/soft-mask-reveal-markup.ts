import { clipArtwork } from './driven-art';

const artwork = `<svg viewBox="0 0 760 430" aria-hidden="true" focusable="false">${clipArtwork}</svg>`;

export const softMaskRevealStage = `
<div class="soft-mask-reveal" data-soft-mask-reveal data-mask-state="partial">
  <figure>
    <div class="soft-mask-reveal__well">
      <div class="soft-mask-reveal__art soft-mask-reveal__art--hard" data-soft-mask-hard>${artwork}</div>
    </div>
    <figcaption><strong>硬边裁剪</strong><span>边界内完整可见</span></figcaption>
  </figure>
  <figure>
    <div class="soft-mask-reveal__well">
      <div class="soft-mask-reveal__art soft-mask-reveal__art--feather" data-soft-mask-feather>
        <div class="soft-mask-reveal__vertical">${artwork}</div>
      </div>
    </div>
    <figcaption><strong>软边遮罩</strong><span>边缘渐隐，过渡到透明</span></figcaption>
  </figure>
</div>`;
