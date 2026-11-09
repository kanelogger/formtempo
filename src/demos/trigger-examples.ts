import { eventLabels, triggerCases, type TriggerVariant } from './trigger-state';

const gsapVersion = '3.15.0';

const style = `
  html { font: 1rem/1.5 system-ui, sans-serif; background: #fbfaf7; color: #222c36; }
  body { margin: 0; }
  main { max-width: 43rem; margin: 0 auto; padding: 1rem; }
  .prelude { min-height: 22vh; }
  .track { position: relative; padding-bottom: 18rem; }
  .mark { position: absolute; top: var(--top); scroll-margin-top: 0; }
  #origin { top: 0; z-index: 1; }
  #origin:not(:focus) { clip-path: inset(50%); }
  .stage { position: sticky; top: 1rem; padding: 1rem; border: 1px solid #d1c5ac;
    border-radius: .7rem; background: #fff; }
  .window { display: grid; place-items: center; height: 8rem; overflow: hidden;
    border: 1px dashed #876221; background: #f7efd9; }
  #panel { display: grid; place-items: center; width: 80%; height: 5.5rem;
    background: #876221; color: #fffdf8; font-size: 1.25rem; font-weight: 700; }
  [data-engine="native"] #panel { transition: opacity .35s, transform .38s; }
  [data-engine="native"][data-revealed="false"] #panel { opacity: 0; transform: translateY(.75rem); }
  [data-engine="native"][data-syncing] #panel { transition: none; }
  button { font: inherit; padding: .3rem .55rem; margin: .3rem .15rem .2rem 0; border: 1px solid #978451; border-radius: 6px; background: #fff; color: #222c36; }
  :focus-visible { outline: 2px solid #876221; outline-offset: 2px; }
  .outro { min-height: 65vh; }
  @media (prefers-reduced-motion: reduce) {
    [data-engine="native"] #panel { transition: none; }
  }
`;

const sharedScript = `
  const origin = document.querySelector('#origin');
  const start = document.querySelector('#start');
  const end = document.querySelector('#end');
  const panel = document.querySelector('#panel');
  const status = document.querySelector('#status');
  const buttons = document.querySelector('#buttons');
  const reset = document.querySelector('#reset');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let shown = false;
  let played = false;
  let suspended = false;
  let guideSnapshot;

  function startGuideSimulation() {
    guideSnapshot ??= { shown, played, scroll: window.scrollY };
    guideSnapshot.scroll = window.scrollY;
    played = false;
    shown = false;
  }

  function resumePageScroll() {
    if (!guideSnapshot || guideSnapshot.scroll === window.scrollY) return false;
    ({ shown, played } = guideSnapshot);
    guideSnapshot = undefined;
    return true;
  }

  const topOf = (marker) => window.scrollY + marker.getBoundingClientRect().top;
  const regionAt = (scroll) => scroll <= startY ? 0 : scroll >= endY ? 2 : 1;
  const measure = () => {
    startY = topOf(start);
    endY = topOf(end);
  };
  let startY = 0;
  let endY = 0;

  function setInitial(region) {
    guideSnapshot = undefined;
    shown = region === 1 || (region === 2 && variant !== 'bidirectional-reveal');
    played = variant === 'enter-once' && shown;
  }

  function apply(event) {
    if (actions[event] === 'play' && !(variant === 'enter-once' && played)) {
      shown = true;
      played = true;
    }
    if (actions[event] === 'reset') shown = false;
  }

  function publish() {
    document.body.dataset.revealed = String(shown);
    status.textContent = shown ? '已揭示' : '初始状态';
  }

  function moveToOrigin(complete) {
    const destination = Math.max(0, Math.min(Math.floor(topOf(origin)), Math.floor(startY) - 1));
    window.scrollTo({ top: destination, behavior: 'instant' });
    if (window.scrollY <= startY) complete();
    else requestAnimationFrame(complete);
  }

  function focusOrigin() {
    origin.focus({ preventScroll: true });
  }
`;

const nativeScript = `
  let previous;
  let scrollFrame = 0;
  let syncFrame = 0;

  function placeWithoutMotion() {
    document.body.dataset.syncing = '';
    publish();
    requestAnimationFrame(() => delete document.body.dataset.syncing);
  }

  function seed() {
    if (suspended) return;
    measure();
    previous = regionAt(window.scrollY);
    setInitial(previous);
    placeWithoutMotion();
  }

  function scheduleSeed() {
    cancelAnimationFrame(syncFrame);
    cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
    syncFrame = requestAnimationFrame(seed);
  }

  function updateScroll() {
    if (suspended || scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0;
      const current = regionAt(window.scrollY);
      resumePageScroll();
      // Apply both events in order when a fast scroll crosses both boundaries.
      for (let edge = previous; edge < current; edge++) apply(edge);
      for (let edge = previous; edge > current; edge--) apply(4 - edge);
      previous = current;
      publish();
    });
  }

  buttons.addEventListener('click', (event) => {
    const button = event.target.closest('[data-event]');
    if (!button || suspended) return;
    apply(Number(button.dataset.event));
    publish();
  });

  document.body.addEventListener('formtempo:guide-reset', () => {
    startGuideSimulation();
    placeWithoutMotion();
  });

  reset.addEventListener('click', () => {
    if (suspended) return;
    guideSnapshot = undefined;
    suspended = true;
    cancelAnimationFrame(syncFrame);
    cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
    measure();
    moveToOrigin(() => {
      measure();
      previous = regionAt(window.scrollY);
      suspended = false;
      if (previous !== 0) return;
      played = false;
      shown = false;
      placeWithoutMotion();
      focusOrigin();
    });
  });

  seed();
  addEventListener('scroll', updateScroll, { passive: true });
  addEventListener('resize', measure);
  addEventListener('pageshow', scheduleSeed);
  addEventListener('hashchange', scheduleSeed);
`;

const gsapScript = `
  gsap.registerPlugin(ScrollTrigger);

  const tween = gsap.fromTo(panel, { opacity: 0, y: 12 }, {
    opacity: 1,
    y: 0,
    duration: .38,
    ease: 'power2.out',
    paused: true,
  });
  let trigger;
  let syncing = false;
  let syncFrame = 0;

  function onBoundary(event) {
    if (syncing || suspended) return;
    const resuming = resumePageScroll();
    const wasShown = shown;
    apply(event);
    if (reducedMotion.matches) tween.progress(shown ? 1 : 0).pause();
    else if (resuming) {
      tween.progress(wasShown ? 1 : 0).pause();
      if (shown && !wasShown) tween.play();
      else if (!shown) tween.progress(0).pause();
    }
    publish();
  }

  function attachTrigger() {
    // A restored position inside or after the interval has already consumed
    // the one-shot. A reset creates a new trigger from before the interval.
    if (variant === 'enter-once' && played) return;
    trigger = ScrollTrigger.create({
      trigger: start,
      start: () => topOf(start),
      end: () => topOf(end),
      animation: tween,
      toggleActions: actions.join(' '),
      once: variant === 'enter-once',
      onEnter: () => onBoundary(0),
      onLeave: () => onBoundary(1),
      onEnterBack: () => onBoundary(2),
      onLeaveBack: () => onBoundary(3),
    });
  }

  function stopTrigger() {
    // once:true can also remove the trigger, so always create a fresh instance.
    trigger?.kill(false, true);
    trigger = undefined;
  }

  function seed() {
    if (suspended) return;
    syncing = true;
    stopTrigger();
    measure();
    setInitial(regionAt(window.scrollY));
    attachTrigger();
    tween.progress(shown ? 1 : 0).pause();
    publish();
    syncing = false;
  }

  function scheduleSeed() {
    cancelAnimationFrame(syncFrame);
    syncFrame = requestAnimationFrame(seed);
  }

  buttons.addEventListener('click', (event) => {
    const button = event.target.closest('[data-event]');
    if (!button || suspended) return;
    const previous = shown;
    apply(Number(button.dataset.event));
    if (reducedMotion.matches || !shown) tween.progress(shown ? 1 : 0).pause();
    else if (!previous) tween.play();
    publish();
  });

  document.body.addEventListener('formtempo:guide-reset', () => {
    startGuideSimulation();
    tween.progress(0).pause();
    publish();
  });

  reset.addEventListener('click', () => {
    if (suspended) return;
    guideSnapshot = undefined;
    suspended = true;
    cancelAnimationFrame(syncFrame);
    stopTrigger();
    measure();
    moveToOrigin(() => {
      measure();
      if (regionAt(window.scrollY) !== 0) {
        suspended = false;
        seed();
        return;
      }
      played = false;
      shown = false;
      syncing = true;
      attachTrigger();
      tween.progress(0).pause();
      publish();
      focusOrigin();
      syncing = false;
      suspended = false;
    });
  });

  seed();
  addEventListener('scrollend', () => {
    if (resumePageScroll()) {
      tween.progress(shown ? 1 : 0).pause();
      publish();
    }
  });
  addEventListener('pageshow', scheduleSeed);
  addEventListener('hashchange', scheduleSeed);
  reducedMotion.addEventListener('change', () => tween.progress(shown ? 1 : 0).pause());
`;

function example(variant: TriggerVariant, engine: 'native' | 'gsap'): string {
  const { name, actions } = triggerCases[variant];
  const libraries = engine === 'gsap'
    ? `<script src="https://cdn.jsdelivr.net/npm/gsap@${gsapVersion}/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@${gsapVersion}/dist/ScrollTrigger.min.js"></script>`
    : '';
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${name} · FormTempo</title>
<style>${style}</style>
</head>
<body data-engine="${engine}">
<main>
  <div class="prelude">
    <h1>${name}</h1>
    <p>向下滚动越过两个边界，然后向上回滚。也可以直接试按四个事件。</p>
    <a href="#inside">定位区间内</a> · <a href="#after">定位终点后</a>
  </div>
  <div class="track">
    <span class="mark" id="origin" tabindex="-1">触发起点</span>
    <i class="mark" id="start" style="--top: 4rem" aria-hidden="true"></i>
    <i class="mark" id="inside" style="--top: 9rem" aria-hidden="true"></i>
    <i class="mark" id="end" style="--top: 14rem" aria-hidden="true"></i>
    <i class="mark" id="after" style="--top: 17rem" aria-hidden="true"></i>
    <section class="stage" aria-label="演示">
      <div class="window"><div id="panel">揭示内容</div></div>
      <div id="buttons">${eventLabels.map((label, index) => `<button type="button" data-event="${index}">${label}</button>`).join('')}</div>
      <button type="button" id="reset">回到触发起点</button>
      <span id="status" aria-live="polite">揭示状态</span>
    </section>
  </div>
  <p class="outro">终点之后。向上滚动可比较返回时的行为。</p>
</main>
${libraries}
<script>
  const variant = ${JSON.stringify(variant)};
  const actions = ${JSON.stringify(actions)};
${sharedScript}
${engine === 'native' ? nativeScript : gsapScript}
</script>
</body>
</html>
`;
}

export const triggerExamples: Record<string, { native: string; gsap: string }> = Object.fromEntries(
  (Object.keys(triggerCases) as TriggerVariant[]).map((variant) => [
    variant,
    { native: example(variant, 'native'), gsap: example(variant, 'gsap') },
  ]),
);
