/** @typedef {() => { start: number, end: number }} MeasureTrack */
/** @typedef {(progress: number) => void} RenderProgress */

/** @param {MeasureTrack} measure @param {RenderProgress} render */
function connectPageScroll(measure, render) {
  let { start, end } = measure();
  let frame = 0;

  function update() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      render((window.scrollY - start) / (end - start));
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
  return {
    refresh() {
      ({ start, end } = measure());
      update();
    },
    destroy() {
      window.removeEventListener('scroll', update);
      cancelAnimationFrame(frame);
    },
  };
}

/** @param {HTMLElement} root @param {RenderProgress} render @param {typeof connectPageScroll} [connectScroll] */
export function bindScrollProgress(root, render, connectScroll = connectPageScroll) {
  const panel = root.querySelector('[data-progress-panel]');
  const controls = root.querySelector('[data-progress-controls]');
  const slider = root.querySelector('[data-progress-slider]');
  const meter = root.querySelector('[data-progress-meter]');
  const value = root.querySelector('[data-progress-value]');
  const steps = root.querySelector('[data-progress-steps]');
  const stepButtons = [...steps.querySelectorAll('button')];
  const mode = root.querySelector('[data-progress-mode]');
  const toggle = root.querySelector('[data-progress-toggle]');
  const hint = root.querySelector('[data-progress-hint]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let progress = slider.valueAsNumber / 100;
  let driver;

  function measureTrack() {
    const stickyTop = Number.parseFloat(getComputedStyle(panel).top) || 0;
    const start = root.getBoundingClientRect().top + window.scrollY - stickyTop;
    const distance = Math.max(1, root.offsetHeight - panel.offsetHeight);
    return { start, end: start + distance };
  }

  /** @param {number} next */
  function applyProgress(next) {
    progress = Math.max(0, Math.min(1, next));
    render(progress);
    const percent = Math.round(progress * 100);
    const label = `${percent}%`;
    slider.value = String(percent);
    slider.setAttribute('aria-valuetext', label);
    meter.value = percent;
    value.textContent = label;
    if (motion.matches) {
      for (const button of stepButtons) {
        button.setAttribute('aria-pressed', String(Number(button.dataset.progressStep) === percent));
      }
    }
  }

  function refresh() { driver?.refresh(); }
  const resize = new ResizeObserver(refresh);

  /** @param {boolean} scroll @param {boolean} [keepPanelInView] */
  function setMode(scroll, keepPanelInView = false) {
    const start = driver && keepPanelInView ? measureTrack().start : undefined;
    driver?.destroy();
    driver = undefined;
    resize.disconnect();
    root.dataset.mode = scroll ? 'scroll' : 'manual';
    slider.hidden = scroll || motion.matches;
    meter.hidden = !scroll;
    steps.hidden = !motion.matches;
    mode.hidden = motion.matches;
    hint.hidden = !scroll;
    toggle.setAttribute('aria-pressed', String(scroll));
    toggle.textContent = scroll ? '切回滑杆' : '跟随页面滚动';

    if (scroll) {
      driver = connectScroll(measureTrack, applyProgress);
      resize.observe(panel);
      resize.observe(root);
      resize.observe(document.body);
    } else {
      const increments = motion.matches ? 2 : 100;
      applyProgress(Math.round(progress * increments) / increments);
      if (start !== undefined && window.scrollY > start) {
        window.scrollTo({ top: Math.max(0, start), behavior: 'instant' });
      }
    }
  }

  function syncMotion() {
    const hadFocus = controls.contains(document.activeElement);
    setMode(false, hadFocus);
    if (hadFocus) {
      const control = motion.matches ? steps.querySelector('[aria-pressed="true"]') : slider;
      control?.focus({ preventScroll: true });
    }
  }

  slider.addEventListener('input', () => {
    if (!driver && !motion.matches) applyProgress(slider.valueAsNumber / 100);
  });
  for (const button of stepButtons) {
    button.addEventListener('click', () => applyProgress(Number(button.dataset.progressStep) / 100));
  }
  toggle.addEventListener('click', () => setMode(!driver, true));
  root.addEventListener('formtempo:guide-reset', () => setMode(false));
  window.addEventListener('resize', refresh);
  window.addEventListener('pageshow', refresh);
  motion.addEventListener('change', syncMotion);
  controls.hidden = false;
  syncMotion();
}
