export function scrollProgressMarkup({ id, stage, initial }: { id: string; stage: string; initial: number }) {
  const label = `${id}-progress-label`;
  return `<div class="scroll-progress" data-scroll-progress="${id}" data-mode="manual">
  <div class="scroll-progress__panel" data-progress-panel>
    ${stage}
    <div class="scroll-progress__controls" data-progress-controls hidden>
      <div class="scroll-progress__row">
        <span id="${label}">演示进度</span>
        <input type="range" min="0" max="100" value="${initial}" aria-labelledby="${label}"
          aria-valuetext="${initial}%" data-progress-slider>
        <progress max="100" value="${initial}" aria-labelledby="${label}" data-progress-meter hidden></progress>
        <div class="scroll-progress__steps" role="group" aria-labelledby="${label}" data-progress-steps hidden>
          ${[0, 50, 100].map((value) => `<button type="button" data-progress-step="${value}" aria-pressed="${value === initial}">${value}%</button>`).join('\n          ')}
        </div>
        <span class="scroll-progress__value" data-progress-value aria-hidden="true">${initial}%</span>
      </div>
      <div class="scroll-progress__mode" data-progress-mode>
        <button type="button" data-progress-toggle aria-pressed="false">跟随页面滚动</button>
        <p data-progress-hint hidden>向下滚动前进，向上滚动回退。</p>
      </div>
    </div>
  </div>
  <div class="scroll-progress__distance" aria-hidden="true"></div>
</div>`;
}
