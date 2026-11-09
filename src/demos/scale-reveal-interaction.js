/**
 * @param {HTMLElement} root
 * @param {(crop: HTMLElement, zoom: HTMLElement) => { progress(value: number): unknown }} [createTimeline]
 */
export function bindScaleReveal(root, createTimeline) {
  const panel = root.querySelector('[data-scale-panel]');
  const controls = root.querySelector('[data-scale-controls]');
  const slider = root.querySelector('[data-scale-slider]');
  const meter = root.querySelector('[data-scale-meter]');
  const steps = root.querySelector('[data-scale-steps]');
  const stepButtons = [...steps.querySelectorAll('button')];
  const value = root.querySelector('[data-scale-value]');
  const mode = root.querySelector('[data-scale-mode]');
  const toggle = root.querySelector('[data-scale-toggle]');
  const hint = root.querySelector('[data-scale-hint]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timeline = createTimeline?.(root.querySelector('[data-scale-crop]'), root.querySelector('[data-scale-zoom]'));
  let progress = slider.valueAsNumber / 100;
  let scrollMode = false;
  let start = 0;
  let distance = 1;
  let frame = 0;

  function render(next) {
    progress = next;
    if (timeline) timeline.progress(next);
    else root.style.setProperty('--scale-progress', String(next));

    const percent = Math.round(next * 100);
    const label = `${percent}%`;
    slider.value = String(percent);
    slider.setAttribute('aria-valuetext', label);
    meter.value = percent;
    value.textContent = label;
    if (motion.matches) {
      for (const button of stepButtons) {
        button.setAttribute('aria-pressed', String(Number(button.dataset.scaleStep) === percent));
      }
    }
  }

  function updateFromScroll() {
    if (!scrollMode || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (scrollMode) render(Math.max(0, Math.min(1, (window.scrollY - start) / distance)));
    });
  }

  function measure() {
    if (!scrollMode) return;
    const top = Number.parseFloat(getComputedStyle(panel).top) || 0;
    start = root.getBoundingClientRect().top + window.scrollY - top;
    distance = Math.max(1, root.offsetHeight - panel.offsetHeight);
    updateFromScroll();
  }

  function setMode(active, keepPanelInView = false) {
    const returnToPanel = keepPanelInView && scrollMode && !active && window.scrollY > start;
    scrollMode = active;
    root.dataset.mode = active ? 'scroll' : 'manual';
    slider.hidden = active || motion.matches;
    meter.hidden = !active;
    steps.hidden = !motion.matches;
    mode.hidden = motion.matches;
    toggle.setAttribute('aria-pressed', String(active));
    hint.hidden = !active;

    if (active) {
      measure();
    } else {
      const stepsPerRange = motion.matches ? 2 : 100;
      render(Math.round(progress * stepsPerRange) / stepsPerRange);
      if (returnToPanel) window.scrollTo({ top: Math.max(0, start), behavior: 'instant' });
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
    if (!scrollMode && !motion.matches) render(slider.valueAsNumber / 100);
  });
  for (const button of stepButtons) {
    button.addEventListener('click', () => render(Number(button.dataset.scaleStep) / 100));
  }
  toggle.addEventListener('click', () => setMode(!scrollMode, true));
  root.addEventListener('formtempo:guide-reset', () => setMode(false));
  window.addEventListener('scroll', updateFromScroll, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('pageshow', measure);
  const resize = new ResizeObserver(measure);
  resize.observe(root);
  resize.observe(panel);
  resize.observe(document.body);
  motion.addEventListener('change', syncMotion);

  syncMotion();
  root.querySelector('[data-scale-static]').hidden = true;
  controls.hidden = false;
}
