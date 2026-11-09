/**
 * @param {Element} root
 * @param {(viewport: Element, sync: () => void, measure: () => void) => void} [connectScrollTrigger]
 */
export function bindSectionSnap(root, connectScrollTrigger) {
  const viewport = root.querySelector('[data-snap-viewport]');
  const chapters = [...root.querySelectorAll('[data-snap-chapter]')];
  const status = root.querySelector('[data-snap-status]');
  const controls = root.querySelector('[data-snap-controls]');
  const previous = root.querySelector('[data-snap-prev]');
  const next = root.querySelector('[data-snap-next]');
  if (!viewport || !chapters.length || !status || !controls || !previous || !next) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let stops = [];
  let active = -1;

  function syncChapter() {
    const top = viewport.scrollTop;
    const closest = stops.reduce((nearest, stop, index) => (
      Math.abs(stop - top) < Math.abs(stops[nearest] - top) ? index : nearest
    ), 0);
    if (closest === active) return;

    chapters[active]?.removeAttribute('aria-current');
    active = closest;
    chapters[active].setAttribute('aria-current', 'step');
    status.textContent = `第 ${active + 1} / ${chapters.length} 节 · ${chapters[active].dataset.caption}`;
    previous.setAttribute('aria-disabled', String(active === 0));
    next.setAttribute('aria-disabled', String(active === chapters.length - 1));
  }

  function measure() {
    stops = chapters.map((chapter) => chapter.offsetTop);
    syncChapter();
  }

  function goTo(offset) {
    const top = stops[active + offset];
    if (top === undefined) return;
    viewport.scrollTo({ top, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }

  previous.addEventListener('click', () => goTo(-1));
  next.addEventListener('click', () => goTo(1));
  root.addEventListener('formtempo:guide-reset', () => {
    viewport.scrollTo({ top: stops[0], behavior: 'instant' });
    syncChapter();
  });
  root.addEventListener('formtempo:guide-cancel', () => {
    viewport.scrollTo({ top: viewport.scrollTop, behavior: 'instant' });
  });
  window.addEventListener('pageshow', measure);
  const resize = new ResizeObserver(measure);
  resize.observe(viewport);
  measure();
  controls.hidden = false;

  if (connectScrollTrigger) {
    connectScrollTrigger(viewport, syncChapter, measure);
  } else {
    let frame = 0;
    viewport.addEventListener('scroll', () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        syncChapter();
      });
    }, { passive: true });
  }
}
