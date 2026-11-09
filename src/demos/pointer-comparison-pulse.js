const pulseDuration = 520;
const pulseScale = 1.05;

/** @param {HTMLElement} outline @param {() => void} finish */
function pulseNative(outline, finish) {
  if (typeof outline.animate !== 'function') return;
  const animation = outline.animate(
    [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: `scale(${pulseScale})` }],
    { duration: pulseDuration, easing: 'cubic-bezier(.22, 1, .36, 1)' },
  );
  animation.onfinish = finish;
  return () => animation.cancel();
}

/** @param {HTMLElement} root @param {typeof pulseNative} [animate] */
export function bindEnterPulse(root, animate = pulseNative) {
  const stage = root.querySelector('[data-pulse-stage]');
  const outline = root.querySelector('[data-pulse-outline]');
  const playButton = root.querySelector('[data-pulse-play]');
  const status = root.querySelector('[data-pc-status]');
  if (!(stage instanceof HTMLElement) || !(outline instanceof HTMLElement) ||
      !(playButton instanceof HTMLButtonElement) || !status) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let plays = 0;
  /** @type {ReturnType<typeof pulseNative>} */
  let cancel;

  const finish = (staticFrame = false) => {
    cancel = undefined;
    root.dataset.pulseState = staticFrame ? 'static' : 'done';
    status.textContent = `${staticFrame ? '已显示轮廓' : '播放完成'} · 第 ${plays} 次`;
  };

  function play() {
    if (cancel) return;
    plays += 1;
    if (!reduced.matches) cancel = animate(outline, () => finish());
    if (!cancel) {
      finish(true);
      return;
    }
    root.dataset.pulseState = 'playing';
    status.textContent = '播放中';
  }

  stage.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') play();
  });
  playButton.addEventListener('click', play);
  reduced.addEventListener('change', () => {
    if (reduced.matches && cancel) {
      cancel();
      finish(true);
    } else if (!reduced.matches && root.dataset.pulseState === 'static') {
      root.dataset.pulseState = 'done';
    }
  });
  playButton.hidden = false;
}
