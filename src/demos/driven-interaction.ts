const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export function bindDriven(demo: HTMLElement, draw: (progress: number) => void) {
  if (demo.dataset.drivenVariant === 'clip-reveal' && !CSS.supports('clip-path', 'inset(0%)')) return;

  const track = demo.querySelector<HTMLElement>('[data-driven-track]');
  const sticky = demo.querySelector<HTMLElement>('[data-driven-sticky]');
  const range = demo.querySelector<HTMLInputElement>('input[type="range"]');
  const readout = demo.querySelector<HTMLElement>('[data-driven-progress]');
  const meter = demo.querySelector<HTMLElement>('[data-driven-meter]');
  const controls = demo.querySelector<HTMLElement>('[data-driven-controls]');
  const fallback = demo.querySelector<HTMLElement>('[data-driven-static]');
  const rangeRow = demo.querySelector<HTMLElement>('[data-driven-range]');
  const stepRow = demo.querySelector<HTMLElement>('[data-driven-steps]');
  const scrollToggle = demo.querySelector<HTMLButtonElement>('[data-driven-scroll]');
  const scrollHint = demo.querySelector<HTMLElement>('[data-driven-hint]');
  const modeRow = demo.querySelector<HTMLElement>('[data-driven-modes]');

  if (!track || !sticky || !range || !readout || !controls || !fallback || !rangeRow || !stepRow) return;

  const hasNodes = stepRow.classList.contains('driven-nodes');
  const steps = [...stepRow.querySelectorAll<HTMLButtonElement>('[data-driven-step]')];
  const digits = [...readout.querySelectorAll<HTMLElement>('[data-driven-digit]')];
  let current = range.valueAsNumber / 100;
  let manual = current;
  let start = 0;
  let distance = 1;
  let frame = 0;

  const setProgress = (value: number) => {
    current = value;
    const percent = Math.round(value * 100);

    draw(value);

    if (range.valueAsNumber !== percent) range.value = String(percent);
    if (readout.dataset.value !== String(percent)) {
      readout.dataset.value = String(percent);
      meter?.setAttribute('aria-valuenow', String(percent));
      digits.forEach((strip, index) => {
        const place = 10 ** (2 - index);
        strip.style.transform = `translateY(${-(Math.floor(percent / place) % 10)}em)`;
        if (strip.parentElement && index < 2) strip.parentElement.style.opacity = percent < place ? '0' : '1';
      });
    }
    if (!stepRow.hidden) {
      for (const step of steps) {
        step.setAttribute('aria-pressed', String(Number(step.dataset.drivenStep) === percent));
      }
    }
  };

  const updateFromScroll = () => {
    if (demo.dataset.mode !== 'scroll' || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (demo.dataset.mode === 'scroll') {
        setProgress(Math.max(0, Math.min(1, (window.scrollY - start) / distance)));
      }
    });
  };

  const measure = () => {
    if (demo.dataset.mode !== 'scroll') return;

    const stickyTop = Number.parseFloat(getComputedStyle(sticky).top) || 0;
    start = track.getBoundingClientRect().top + window.scrollY - stickyTop;
    distance = Math.max(1, track.offsetHeight - sticky.offsetHeight);
    updateFromScroll();
  };

  const setMode = (mode: 'manual' | 'scroll', keepStageInView = true) => {
    const returnToStage = keepStageInView && demo.dataset.mode === 'scroll' && mode === 'manual' && window.scrollY > start;
    demo.dataset.mode = mode;
    const scrollMode = mode === 'scroll';

    range.disabled = scrollMode;
    range.hidden = scrollMode;
    if (meter) meter.hidden = !scrollMode;
    scrollToggle?.setAttribute('aria-pressed', String(scrollMode));
    if (scrollHint) scrollHint.hidden = !scrollMode;

    if (scrollMode) {
      measure();
    } else {
      setProgress(manual);
      if (returnToStage) window.scrollTo({ top: start, behavior: 'instant' });
    }
  };

  range.addEventListener('input', () => {
    if (demo.dataset.mode !== 'manual') return;

    manual = range.valueAsNumber / 100;
    setProgress(manual);
  });

  for (const step of steps) {
    step.addEventListener('click', () => {
      manual = Number(step.dataset.drivenStep) / 100;
      setProgress(manual);
    });
  }
  demo.addEventListener('formtempo:guide-reset', () => setMode('manual', false));

  if (scrollToggle) {
    scrollToggle.addEventListener('click', () => {
      setMode(demo.dataset.mode === 'scroll' ? 'manual' : 'scroll');
    });
    window.addEventListener('scroll', updateFromScroll, { passive: true });
    window.addEventListener('pageshow', measure);
    const resize = new ResizeObserver(measure);
    resize.observe(track);
    resize.observe(sticky);
    resize.observe(document.body);
  }

  const syncMotion = () => {
    const reduce = reducedMotion.matches;

    rangeRow.hidden = reduce;
    stepRow.hidden = !reduce && !hasNodes;
    if (modeRow) modeRow.hidden = reduce;

    if (reduce) {
      manual = hasNodes ? Math.round(current * 2) / 2 : Math.round(current);
      setMode('manual');
    }
  };

  setProgress(manual);
  syncMotion();
  reducedMotion.addEventListener('change', syncMotion);
  fallback.hidden = true;
  controls.hidden = false;
}
