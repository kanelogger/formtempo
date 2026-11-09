import { orbitArtwork } from './pointer-art';

export const pointerComparisonTitles = {
  'magnetic-button': '磁吸按钮',
  'pointer-enter-once': '移入单次动画',
} as const;

const magneticMarkup = `
  <div class="pc-frame pc-magnetic-frame">
    <div class="pc-axis" aria-hidden="true"></div>
    <button class="pc-magnetic-hit" type="button" data-magnetic-hit hidden>
      <span class="pc-magnetic-origin" aria-hidden="true"></span>
      <span class="pc-magnetic-visual" data-magnetic-visual>点按确认</span>
    </button>
    <noscript><span class="pc-magnetic-visual">按钮原位</span></noscript>
    <p class="pc-legend">虚线标记按钮原位</p>
  </div>
  <div class="pc-instructions">
    <p>移动鼠标观察按钮偏移。点按按钮，或用键盘确认。</p>
    <p class="pc-status" data-pc-status role="status">等待确认</p>
  </div>`;

const pulseMarkup = `
  <div class="pc-frame">
    <div class="pc-pulse-stage" data-pulse-stage>
      <div class="pc-orbit">
        ${orbitArtwork()}
        <div class="pc-orbit-label"><strong>轨道研究</strong><small>ORBIT STUDY</small></div>
        <span class="pc-orbit-index" aria-hidden="true">A–01</span>
      </div>
      <div class="pc-pulse-outline" data-pulse-outline aria-hidden="true"></div>
    </div>
  </div>
  <div class="pc-instructions">
    <p>移入作品卡片开始播放，移出后轮廓仍会播完。</p>
    <p class="pc-status" data-pc-status role="status">等待播放</p>
  </div>
  <button class="pc-play" type="button" data-pulse-play hidden>播放一次</button>
  <noscript><p>移入时轮廓亮起并扩散一次。</p></noscript>`;

export function pointerComparisonMarkup(variant: keyof typeof pointerComparisonTitles) {
  return `<section class="pointer-comparison" data-pointer-comparison="${variant}" aria-label="${pointerComparisonTitles[variant]}试玩">
  ${variant === 'magnetic-button' ? magneticMarkup : pulseMarkup}
</section>`;
}
