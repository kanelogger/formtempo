import { galleryArtwork } from './gallery-art';

export const targetTitles = {
  'magnetic-cursor': '悬停磁力吸附',
  'hover-card': '悬停卡片',
} as const;

export type TargetVariant = keyof typeof targetTitles;

const cursor = `
  <div class="ht-field" data-cursor-field>
    <span class="ht-target" data-cursor-target aria-hidden="true"></span>
    <span class="ht-proxy" data-cursor-proxy aria-hidden="true"><i></i></span>
  </div>
  <div class="ht-actions">
    <p>将指针移入圆靶，或点按按钮体验吸附与释放。</p>
    <button class="ht-control" type="button" data-cursor-toggle hidden>吸附光标</button>
  </div>
  <p class="ht-status" data-target-status role="status">等待移入</p>`;

const card = `
  <div class="ht-card-stage" data-card-stage>
    <figure class="ht-print">
      <svg viewBox="0 0 760 430" role="img" aria-label="深蓝和暖橙组成的球体，外侧环绕一圈纸白色轨道">${galleryArtwork[2].markup}</svg>
      <figcaption>切面</figcaption>
    </figure>
    <div class="ht-card-column">
      <div class="ht-anchor" data-card-anchor>
        <button class="ht-control ht-trigger" type="button" data-card-trigger aria-controls="ht-inks" aria-expanded="true" hidden>
          印刷用色 <span aria-hidden="true"></span>
        </button>
        <div class="ht-panel" id="ht-inks" data-card-panel>
          <dl class="ht-inks">
            <div><dt>深蓝</dt><dd><i style="background:#39688b"></i>#39688B</dd></div>
            <div><dt>暖橙</dt><dd><i style="background:#ef784d"></i>#EF784D</dd></div>
            <div><dt>纸白</dt><dd><i style="background:#fffdf8"></i>#FFFDF8</dd></div>
          </dl>
        </div>
      </div>
    </div>
  </div>
  <p class="ht-hint">移入、聚焦或点按「印刷用色」查看色样。按 Esc 收起。</p>`;

export function hoverTargetMarkup(variant: TargetVariant) {
  return `<section class="hover-target" data-hover-target="${variant}" aria-label="${targetTitles[variant]}试玩">
${variant === 'magnetic-cursor' ? cursor : card}
</section>`;
}
