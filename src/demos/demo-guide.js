/** @param {number} duration @param {AbortSignal} signal @param {(progress: number) => void} [render] */
function guideBeat(duration, signal, render) {
  if (signal.aborted) return Promise.resolve();
  if (duration === 0) {
    render?.(1);
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let timer = 0;
    let frame = 0;
    const done = () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      signal.removeEventListener('abort', done);
      resolve(undefined);
    };
    signal.addEventListener('abort', done, { once: true });
    if (!render) {
      timer = window.setTimeout(done, duration);
      return;
    }

    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      render(progress);
      if (progress === 1) done();
      else if (!signal.aborted) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  });
}

/** @param {HTMLElement} root @param {import('./demo-guide-cases').DemoGuide} guide */
export function bindDemoGuide(root, guide) {
  const view = root.querySelector(guide.view);
  if (!view || root.dataset.guideState || guide.steps.some(({ target }) => !root.querySelector(target))) return;

  const dock = guide.dock ? root.querySelector(guide.dock) : null;
  const bar = document.createElement('div');
  bar.className = 'demo-guide';
  bar.innerHTML = '<p data-guide-caption></p><button type="button" data-guide-replay>重播导览</button>';
  const caption = bar.querySelector('[data-guide-caption]');
  const replay = bar.querySelector('button');
  const heading = root === document.body ? root.querySelector('h1') : null;
  if (dock) dock.prepend(bar);
  else if (heading) heading.after(bar);
  else root.prepend(bar);

  const cursor = document.createElement('div');
  cursor.className = 'demo-guide-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.hidden = true;
  cursor.innerHTML = '<svg viewBox="0 0 20 24" focusable="false"><path d="M2 2v17l4.8-4.5L10 21l3.2-1.6-3.2-6.2 6.6-.7L2 2Z" fill="#222c36" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
  document.body.append(cursor);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const threshold = .5;
  const idleCaption = '导览在画面进入视口后播放一次。';
  const reducedCaption = '可重播关键状态，或直接操作。';
  const reset = guide.reset ? (root.matches(guide.reset) ? root : root.querySelector(guide.reset)) : null;
  const releaseTarget = guide.release ? root.querySelector(guide.release) : null;
  let autoPending = !reduced.matches;
  let inView = false;
  let playbackScroll = window.scrollY;
  /** @type {AbortController | undefined} */
  let run;
  /** @type {[number, number] | undefined} */
  let cursorPosition;

  root.dataset.guideState = 'idle';
  caption.textContent = reduced.matches ? reducedCaption : idleCaption;

  function hideCursor() {
    cursor.hidden = true;
    delete cursor.dataset.press;
    cursorPosition = undefined;
  }

  /** @param {PointerEvent} [pointer] */
  function stop(pointer) {
    autoPending = false;
    if (!run) return;
    run.abort();
    run = undefined;
    hideCursor();
    if (releaseTarget) {
      // A real pointer inside the target keeps its hover when the guide yields.
      if (pointer) sendPointer(releaseTarget, 'pointerenter', [pointer.clientX, pointer.clientY]);
      else sendPointer(releaseTarget, 'pointerleave', [0, 0]);
    }
    reset?.dispatchEvent(new Event('formtempo:guide-cancel'));
    root.dataset.guideState = 'interrupted';
    caption.textContent = '导览已停止，可以继续手动操作。';
  }

  /** @param {[number, number]} position */
  function moveCursor(position) {
    cursor.hidden = false;
    cursor.style.transform = `translate3d(${position[0]}px, ${position[1]}px, 0)`;
    cursorPosition = position;
  }

  /** @param {Element} target @param {readonly [number, number]} point */
  function location(target, [x, y]) {
    const rect = target.getBoundingClientRect();
    return /** @type {[number, number]} */ ([rect.left + rect.width * x, rect.top + rect.height * y]);
  }

  /** @param {Element} target @param {string} type @param {readonly [number, number]} position */
  function sendPointer(target, type, [clientX, clientY]) {
    target.dispatchEvent(new PointerEvent(type, { pointerType: 'mouse', clientX, clientY }));
  }

  /** @param {HTMLInputElement} slider @param {number} value */
  function setProgress(slider, value) {
    const next = Math.round(value);
    if (slider.valueAsNumber === next) return;
    slider.value = String(next);
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /** @param {number} value */
  function showReducedProgress(value) {
    const options = Array.from(root.querySelectorAll('button[data-driven-step], button[data-scale-step], button[data-progress-step], button[data-progress]'));
    const percent = (button) => button.hasAttribute('data-progress')
      ? Number(button.getAttribute('data-progress')) * 100
      : Number(button.getAttribute('data-driven-step') ?? button.getAttribute('data-scale-step') ?? button.getAttribute('data-progress-step'));
    options.sort((a, b) => Math.abs(percent(a) - value) - Math.abs(percent(b) - value));
    if (options[0] instanceof HTMLButtonElement) options[0].click();
  }

  /** @param {import('./demo-guide-cases').DemoGuide['steps'][number]} step @param {AbortSignal} signal */
  async function playStep(step, signal) {
    const target = root.querySelector(step.target);
    if (!target) return;
    caption.textContent = step.text;
    const { action, value = 0, point = [.5, .5] } = step;

    if (action === 'progress' && target instanceof HTMLInputElement) {
      if (reduced.matches) {
        showReducedProgress(value);
      } else {
        const from = target.valueAsNumber;
        await guideBeat(step.duration ?? 0, signal, (progress) => {
          const current = from + (value - from) * progress;
          setProgress(target, current);
          moveCursor(location(target, [.04 + .92 * current / 100, .65]));
        });
      }
    } else {
      if (!reduced.matches) {
        const to = location(target, point);
        const [x, y] = point;
        const entry = x < .25 ? [-.08, y] : x > .75 ? [1.08, y] : [x, y < .5 ? -.08 : 1.08];
        const from = action === 'enter' ? location(target, /** @type {[number, number]} */ (entry))
          : cursorPosition ?? [to[0] + 26, to[1] + 19];
        const duration = action === 'leave' ? 200 : 340;
        await guideBeat(duration, signal, (progress) => {
          const t = 1 - (1 - progress) ** 3;
          const end = location(target, point);
          const position = /** @type {[number, number]} */ ([
            from[0] + (end[0] - from[0]) * t,
            from[1] + (end[1] - from[1]) * t,
          ]);
          moveCursor(position);
          if (action === 'move') sendPointer(target, 'pointermove', position);
        });
      }
      if (signal.aborted) return;

      if (action === 'click' && target instanceof HTMLElement) {
        if (!reduced.matches) {
          cursor.dataset.press = '';
          await guideBeat(125, signal);
          if (signal.aborted) return;
        }
        target.click();
        delete cursor.dataset.press;
      } else if (action === 'enter' || action === 'leave') {
        sendPointer(target, `pointer${action}`, location(target, point));
      }
    }

    await guideBeat(reduced.matches ? 600 : step.hold ?? 500, signal);
  }

  function bringViewIntoFrame() {
    const rect = view.getBoundingClientRect();
    const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
    if (visibleHeight < rect.height * threshold) view.scrollIntoView({ block: 'center', behavior: 'instant' });
  }

  async function start(replaying = false) {
    stop();
    const controller = new AbortController();
    const { signal } = controller;
    run = controller;
    root.dataset.guideState = 'playing';

    if (guide.ready) {
      caption.textContent = '正在等待视频就绪…';
      const deadline = performance.now() + 4000;
      while (!signal.aborted && !root.querySelector(guide.ready) && performance.now() < deadline &&
        !root.querySelector('[data-video-state="error"]')) {
        await guideBeat(90, signal);
      }
      if (signal.aborted) return;
      if (!root.querySelector(guide.ready)) {
        run = undefined;
        root.dataset.guideState = 'unavailable';
        caption.textContent = '视频暂未就绪，可以查看关键帧或重播。';
        return;
      }
    }

    reset?.dispatchEvent(new Event('formtempo:guide-reset'));
    if (replaying) bringViewIntoFrame();
    playbackScroll = window.scrollY;
    const steps = (reduced.matches && guide.reducedSteps) || guide.steps;
    for (const step of steps) {
      if (signal.aborted) return;
      await playStep(step, signal);
    }
    if (signal.aborted) return;

    run = undefined;
    hideCursor();
    root.dataset.guideState = 'complete';
    caption.textContent = '导览结束，可以继续手动操作。';
  }

  function tryAutoplay() {
    if (autoPending && inView && !document.hidden) void start();
  }

  if (typeof IntersectionObserver === 'function') {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= threshold;
      if (!entry.isIntersecting && run) stop();
      tryAutoplay();
    }, { threshold: [0, threshold] });
    observer.observe(view);
  }

  replay.addEventListener('click', () => {
    bringViewIntoFrame();
    void start(true);
  });

  const takeOver = (event) => {
    if (!event.isTrusted || replay.contains(event.target)) return;
    if (!run) {
      if (event.type === 'wheel' || !(event.target instanceof Element)) return;
      if (!event.target.closest('button, input') && !view.contains(event.target)) return;
    }
    const pointer = event instanceof PointerEvent && event.pointerType === 'mouse' && releaseTarget?.contains(event.target)
      ? event : undefined;
    stop(pointer);
  };
  for (const event of ['pointerdown', 'keydown', 'focusin', 'input', 'click', 'wheel']) {
    root.addEventListener(event, takeOver, { capture: true, passive: true });
  }
  if (guide.steps.some(({ action }) => action === 'enter' || action === 'move')) {
    view.addEventListener('pointermove', takeOver, { capture: true, passive: true });
  }
  if (guide.pageScrollInput) {
    window.addEventListener('scroll', () => {
      if (run && window.scrollY !== playbackScroll) stop();
    }, { passive: true });
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && run) stop();
    else tryAutoplay();
  });
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    const wasIdle = root.dataset.guideState === 'idle';
    stop();
    if (wasIdle) caption.textContent = reducedCaption;
  });
}
