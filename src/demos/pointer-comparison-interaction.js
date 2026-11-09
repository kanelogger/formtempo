const maximumOffset = 12;
const returnDuration = 240;

/** @param {HTMLElement} visual @param {number} x @param {number} y @param {boolean} returning */
function positionNative(visual, x, y, returning) {
  visual.style.transitionDuration = returning ? `${returnDuration}ms` : '0ms';
  visual.style.transform = `translate(${x}px, ${y}px)`;
}

/** @param {HTMLElement} root @param {typeof positionNative} [position] */
export function bindMagneticButton(root, position = positionNative) {
  const button = root.querySelector('[data-magnetic-hit]');
  const visual = root.querySelector('[data-magnetic-visual]');
  const status = root.querySelector('[data-pc-status]');
  if (!(button instanceof HTMLButtonElement) || !(visual instanceof HTMLElement) || !status) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let confirmations = 0;
  let frame = 0;
  let clientX = 0;
  let clientY = 0;

  /** @param {number} fraction */
  const offset = (fraction) => maximumOffset * Math.max(-1, Math.min(1, fraction));

  /** @param {PointerEvent} event */
  const follow = (event) => {
    if (event.pointerType !== 'mouse' || reduced.matches) return;
    clientX = event.clientX;
    clientY = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const { left, top, width, height } = button.getBoundingClientRect();
      const x = offset((2 * (clientX - left)) / width - 1);
      const y = offset((2 * (clientY - top)) / height - 1);
      position(visual, x, y, false);
    });
  };
  const returnHome = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    position(visual, 0, 0, !reduced.matches);
  };

  button.addEventListener('pointerenter', follow);
  button.addEventListener('pointermove', follow);
  button.addEventListener('pointerleave', returnHome);
  button.addEventListener('pointercancel', returnHome);
  button.addEventListener('blur', returnHome);
  window.addEventListener('blur', returnHome);
  reduced.addEventListener('change', returnHome);
  button.addEventListener('click', () => {
    confirmations += 1;
    status.textContent = `已确认 · 第 ${confirmations} 次`;
  });
  button.hidden = false;
}
