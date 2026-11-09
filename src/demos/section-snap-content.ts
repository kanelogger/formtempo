import { galleryArtwork } from './gallery-art';

export const sectionSnapMarkup = `<section class="section-snap" data-section-snap aria-label="分段式滚动演示">
  <p class="section-snap-hint" id="section-snap-hint">在画框内上下滚动，观察作品停靠的位置。</p>
  <div class="section-snap-viewport" id="section-snap-viewport" data-snap-viewport tabindex="0" role="region" aria-label="三节作品展" aria-describedby="section-snap-hint">
    <ol class="section-snap-chapters">
      ${galleryArtwork.map(({ caption, markup }, index) => `<li class="section-snap-chapter" data-snap-chapter data-caption="${caption}">
        <svg viewBox="0 0 760 430" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${markup}</svg>
        <span class="section-snap-label">0${index + 1} · ${caption}</span>
      </li>`).join('\n      ')}
    </ol>
  </div>
  <div class="section-snap-controls" data-snap-controls hidden>
    <p class="section-snap-status" data-snap-status role="status"></p>
    <div class="section-snap-buttons" role="group" aria-label="章节导航">
      <button type="button" data-snap-prev aria-controls="section-snap-viewport">上一节</button>
      <button type="button" data-snap-next aria-controls="section-snap-viewport">下一节</button>
    </div>
  </div>
</section>`;
