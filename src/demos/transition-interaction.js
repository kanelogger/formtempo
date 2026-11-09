/** @typedef {{ finished: Promise<void>, stop: () => void }} TransitionMotion */
/** @typedef {{ next: HTMLElement, guided: boolean, motions: TransitionMotion[], styles: Map<HTMLElement, string | null> }} TransitionRun */

/** @param {HTMLElement} element @param {Keyframe[]} frames @param {number} duration @returns {TransitionMotion} */
function animateNative(element, frames, duration) {
  const motion = element.animate(frames, {
    duration,
    easing: 'cubic-bezier(.22, 1, .36, 1)',
    fill: 'both',
  });
  return { finished: motion.finished.then(() => {}, () => {}), stop: () => motion.cancel() };
}

/** @param {HTMLElement} firstArt @param {HTMLElement} lastArt @param {() => void} present */
function flipNative(firstArt, lastArt, present) {
  const first = firstArt.getBoundingClientRect();
  present();
  const last = lastArt.getBoundingClientRect();
  if (!first.width || !first.height || !last.width || !last.height) return;

  // Measure each endpoint once. Transform the new artwork back to its old pose.
  return animateNative(lastArt, [{
    transform: `translate(${first.left - last.left}px, ${first.top - last.top}px) scale(${first.width / last.width}, ${first.height / last.height})`,
  }, { transform: 'none' }], 560);
}

/** @param {HTMLElement} root @param {typeof animateNative} [animate] @param {typeof flipNative} [flip] */
export function bindTransitionStage(root, animate = animateNative, flip = flipNative) {
  const viewport = root.querySelector('[data-transition-viewport]');
  const controls = root.querySelector('[data-transition-controls]');
  const status = root.querySelector('[data-transition-status]');
  const mask = root.querySelector('[data-transition-mask]');
  const views = Array.from(root.querySelectorAll('[data-transition-view]')).filter((view) => view instanceof HTMLElement);
  if (!(viewport instanceof HTMLElement) || !(controls instanceof HTMLElement) || !(mask instanceof HTMLElement) || !status || views.length !== 2) return;
  const buttons = Array.from(controls.querySelectorAll('button[data-transition-action]'));
  const guideTarget = viewport.querySelector('button[data-transition-guide-target]');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const variant = root.dataset.transitionVariant;
  let active = views[0];
  /** @type {TransitionRun | undefined} */
  let pending;

  /** @param {HTMLElement} view */
  const present = (view) => {
    for (const candidate of views) {
      candidate.hidden = candidate !== view;
      if (guideTarget) candidate.setAttribute('aria-hidden', String(candidate.hidden));
    }
  };

  /** @param {HTMLElement} view */
  const commit = (view) => {
    present(view);
    active = view;
    mask.hidden = true;
    viewport.dataset.activeView = view.dataset.transitionView;
    guideTarget?.removeAttribute('disabled');
    for (const button of buttons) {
      button.removeAttribute('aria-disabled');
      button.setAttribute('aria-pressed', String(button.getAttribute('data-transition-action') === view.dataset.transitionView));
    }
    status.textContent = `当前画面 · ${view.dataset.viewLabel}`;
  };

  /** @param {TransitionRun} run @param {HTMLElement} [destination] */
  const finish = (run, destination = run.next) => {
    if (pending !== run) return;
    pending = undefined;
    for (const motion of run.motions) motion.stop();
    for (const [element, style] of run.styles) {
      if (style === null) element.removeAttribute('style');
      else element.setAttribute('style', style);
    }
    commit(destination);
  };

  /** @param {TransitionRun} run @param {HTMLElement} element @param {Keyframe[]} frames @param {number} duration */
  const move = (run, element, frames, duration) => {
    const motion = animate(element, frames, duration);
    run.motions.push(motion);
    return motion.finished;
  };

  /** @param {TransitionRun} run @param {HTMLElement | null} firstArt @param {HTMLElement | null} lastArt */
  const play = async (run, firstArt, lastArt) => {
    const { next } = run;
    const direction = next.dataset.transitionView === 'detail' ? 1 : -1;
    if (variant === 'mask-transition') {
      mask.hidden = false;
      await move(run, mask, [{ transform: `translateX(${-100 * direction}%)` }, { transform: 'translateX(0%)' }], 225);
      if (pending !== run) return;
      present(next);
      await move(run, mask, [{ transform: 'translateX(0%)' }, { transform: `translateX(${100 * direction}%)` }], 275);
    } else if (variant === 'overlap-transition') {
      next.hidden = false;
      next.style.zIndex = '2';
      active.style.zIndex = '1';
      await Promise.all([
        move(run, active, [{ transform: 'translateX(0%)', opacity: 1 }, { transform: `translateX(${-16 * direction}%)`, opacity: .28 }], 470),
        move(run, next, [{ transform: `translateX(${27 * direction}%)`, opacity: 0 }, { transform: 'translateX(0%)', opacity: 1 }], 470),
      ]);
    } else if (firstArt && lastArt) {
      const motion = flip(firstArt, lastArt, () => present(next));
      if (motion) {
        run.motions.push(motion);
        await motion.finished;
      }
    }
  };

  /** @param {HTMLElement} next @param {boolean} [guided] */
  const switchTo = (next, guided = false) => {
    if (pending) {
      if (pending.guided) finish(pending, next);
      return;
    }
    if (next === active) return;
    if (reduced.matches || typeof viewport.animate !== 'function') {
      commit(next);
      return;
    }
    const firstArt = active.querySelector('[data-shared-art]');
    const lastArt = next.querySelector('[data-shared-art]');
    const styledElements = [active, next, mask, firstArt, lastArt].filter((element) => element instanceof HTMLElement);
    const run = { next, guided, motions: [], styles: new Map(styledElements.map((element) => [element, element.getAttribute('style')])) };
    pending = run;
    guideTarget?.setAttribute('disabled', '');
    if (!guided) {
      for (const control of buttons) control.setAttribute('aria-disabled', 'true');
    }
    status.textContent = `切换至${next.dataset.viewLabel}`;
    const before = firstArt instanceof HTMLElement ? firstArt : null;
    const after = lastArt instanceof HTMLElement ? lastArt : null;
    play(run, before, after).then(() => finish(run), () => finish(run));
  };

  root.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button[data-transition-action]');
    if (!button) return;
    const destination = button.getAttribute('data-transition-action');
    const next = views.find((view) => view.dataset.transitionView === destination);
    if (!next) return;
    if (button === guideTarget && button === document.activeElement) {
      const detailControl = controls.querySelector('button[data-transition-action="detail"]');
      if (detailControl instanceof HTMLButtonElement) detailControl.focus({ preventScroll: true });
    }
    switchTo(next, !event.isTrusted && button === guideTarget && Boolean(root.closest('[data-guide-state="playing"]')));
  });

  if (guideTarget instanceof HTMLButtonElement) {
    guideTarget.hidden = false;
    root.addEventListener('formtempo:guide-reset', () => {
      if (pending) finish(pending, views[0]);
      else commit(views[0]);
    });
    root.addEventListener('formtempo:guide-cancel', () => {
      if (pending?.guided) finish(pending);
    });
  }

  window.addEventListener('resize', () => { if (pending) finish(pending); }, { passive: true });
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    if (pending) finish(pending);
  });
  commit(active);
  controls.hidden = false;
}
