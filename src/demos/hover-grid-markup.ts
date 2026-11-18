const columns = 9;
const rows = 4;

const cells = Array.from({ length: rows * columns }, (_, index) => {
  const column = index % columns;
  const row = Math.floor(index / columns);
  return `<button type="button" class="hover-grid__cell" data-cell="${index}"
    tabindex="${index === 0 ? 0 : -1}" aria-label="第 ${row + 1} 行，第 ${column + 1} 列"
    style="--column:${column}; --row:${row}; --offset:${(row % 2) / 2}; --tone:${(column + 2 * row) % 5}">
    <span class="hover-grid__tile" aria-hidden="true">
      <span class="hover-grid__front"><i></i></span><span class="hover-grid__back"></span>
    </span>
  </button>`;
}).join('\n');

export const hoverGridMarkup = `<section class="hover-grid" data-hover-grid data-mode="trail">
  <div class="hover-grid__tools" role="group" aria-label="阵列反馈">
    <button type="button" data-grid-mode="trail" aria-pressed="true">渐熄</button>
    <button type="button" data-grid-mode="ink" aria-pressed="false">留痕</button>
    <button type="button" data-grid-mode="flip" aria-pressed="false">翻转</button>
  </div>
  <div class="hover-grid__frame">
    <div class="hover-grid__board" data-grid-board data-columns="${columns}" style="--columns:${columns}; --rows:${rows}"
      role="group" aria-label="悬停阵列" aria-describedby="grid-instructions">${cells}</div>
  </div>
  <div class="hover-grid__readout">
    <output data-grid-status aria-live="off">划过格子观察轨迹</output>
    <button type="button" data-grid-clear hidden>清除留痕</button>
  </div>
  <p id="grid-instructions">用鼠标或手指划过阵列，也可按 Tab 进入，再用方向键移动。</p>
</section>`;
