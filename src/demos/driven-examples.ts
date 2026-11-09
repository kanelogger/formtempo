import { clipArtwork } from "./driven-art";

type ExamplePair = { native: string; gsap: string };

const gsapScripts = `<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>`;

const cases = {
  'clip-reveal': {
    title: '裁剪展开',
    initial: 62,
    artwork: `<svg class="art" viewBox="0 0 760 430" aria-hidden="true">${clipArtwork}</svg>`,
    extraCss: `.stage { aspect-ratio: 760 / 430; }
    .art { clip-path: inset(calc((1 - var(--p)) * 50%)); }`,
    gsapTween: `tween.fromTo('.art', { clipPath: 'inset(50%)' }, { clipPath: 'inset(0%)', ease: 'none' });`,
  },
  'layered-parallax': {
    title: '分层视差',
    initial: 36,
    artwork: `<svg class="art" viewBox="0 0 600 300" aria-hidden="true">
        <g class="far">
          <circle cx="430" cy="111" r="93" fill="#ef784d"/>
          <path fill="#628ca8" d="m0 225 189-116 190 104 110-65 196 100v52H0z"/>
        </g>
        <g class="near" fill="#39688b">
          <path d="M31 300v-65a57 57 0 0 1 114 0v65zm210 0V186a84 84 0 0 1 168 0v114zm240 0v-63a72 72 0 0 1 144 0v63z"/>
        </g>
      </svg>`,
    extraCss: `.far, .near { transform-box: view-box; }
    .far { transform: translateX(calc(var(--p) * -13%)); }
    .near { transform: translateX(calc(var(--p) * -31%)); }`,
    gsapTween: `tween.fromTo('.far', { x: 0 }, { x: -78, ease: 'none' }, 0);
    tween.fromTo('.near', { x: 0 }, { x: -186, ease: 'none' }, 0);`,
  },
  'horizontal-gallery': {
    title: '横向画廊',
    initial: 0,
    artwork: `<div class="strip" aria-hidden="true">
        <svg viewBox="0 0 600 300"><path fill="#39688b" d="M0 0h600v300H0z"/><path fill="none" stroke="#e8f3fa" stroke-width="25" d="M196 254V150a104 104 0 0 1 208 0v104"/></svg>
        <svg viewBox="0 0 600 300"><path fill="#fffdf8" d="M0 0h600v300H0z"/><path fill="#ef784d" d="m300 34 138 99-14 113-124-65-124 65-14-113z"/></svg>
        <svg viewBox="0 0 600 300"><path fill="#e8f3fa" d="M0 0h600v300H0z"/><circle cx="300" cy="150" r="96" fill="#39688b"/><ellipse cx="300" cy="150" rx="146" ry="36" transform="rotate(-22 300 150)" fill="none" stroke="#f7c98b" stroke-width="16"/></svg>
      </div>`,
    extraCss: `.strip { display: flex; width: 300%; height: 100%; transform: translateX(calc(var(--p) * (-200% / 3))); }
    .strip svg { display: block; flex: 0 0 calc(100% / 3); min-width: 0; height: 100%; }`,
    gsapTween: `tween.fromTo('.strip', { xPercent: 0 }, { xPercent: -200 / 3, ease: 'none' });`,
  },
};

function example(effect: keyof typeof cases, useGsap: boolean) {
  const { title, initial, artwork, extraCss, gsapTween } = cases[effect];
  const setup = useGsap ? `
    if (!window.gsap || !window.ScrollTrigger) {
      document.querySelector('.error').hidden = false;
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const tween = gsap.timeline({ paused: true });
    ${gsapTween}
    let trigger;
    function render(p) {
      tween.progress(p);
      showProgress(p);
    }
    function connectScroll() {
      trigger = ScrollTrigger.create({
        trigger: track,
        start: 'top top',
        end: () => '+=' + (track.offsetHeight - sticky.offsetHeight),
        animation: tween,
        scrub: true,
        onUpdate: self => showProgress(self.progress),
        onRefresh: self => showProgress(self.progress),
      });
      showProgress(trigger.progress);
    }
    function disconnectScroll() {
      trigger?.kill(false, true);
      tween.pause();
    }
  ` : `
    let start = 0, distance = 1, frame = 0;
    function render(p) {
      track.style.setProperty('--p', p);
      showProgress(p);
    }
    function update() {
      if (!track.classList.contains('scroll-mode') || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (track.classList.contains('scroll-mode')) {
          render(Math.max(0, Math.min(1, (scrollY - start) / distance)));
        }
      });
    }
    function connectScroll() {
      start = track.getBoundingClientRect().top + scrollY;
      distance = Math.max(1, track.offsetHeight - sticky.offsetHeight);
      update();
    }
    function disconnectScroll() {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', () => {
      if (track.classList.contains('scroll-mode')) connectScroll();
    });
  `;

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · ${useGsap ? 'GSAP' : '原生'}示例</title>
<script>
  if (new URLSearchParams(location.search).get('theme') === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  }
</script>
<style>
    :root {
      color-scheme: light;
      --page: #fbfaf7;
      --canvas: #edf3f6;
      --paper: #fff;
      --ink: #222c36;
      --line: #82939f;
      --mark: #b8412c;
      --selected: #fbe8e1;
      background: var(--page);
    }
    :root[data-theme="dark"] {
      color-scheme: dark;
      --page: #19222d;
      --canvas: #2b3c4d;
      --paper: #222e3c;
      --ink: #f6f5f1;
      --line: #8396a8;
      --mark: #ff9d7c;
      --selected: #2b3c4d;
    }
    * { box-sizing: border-box; }
    body { max-width: 720px; margin: 0 auto; padding: 24px; color: var(--ink); font: 16px/1.5 system-ui, sans-serif; }
    [hidden] { display: none !important; }
    .sticky { background: var(--page); }
    .stage { position: relative; overflow: hidden; aspect-ratio: 2 / 1; background: var(--canvas); }
    .art { display: block; width: 100%; height: 100%; }
    ${extraCss}
    .scroll-mode .sticky { position: sticky; top: 0; }
    .scroll-mode .distance { height: 90vh; }
    .scroll-mode + p { min-height: 100vh; }
    .controls > div { display: flex; align-items: center; gap: 10px; margin-top: 10px; }
    input { flex: 1; min-width: 0; accent-color: var(--mark); }
    output { min-width: 4ch; text-align: end; }
    button { min-height: 44px; border: 1px solid var(--line); border-radius: 6px; background: var(--paper); color: var(--ink); }
    button[aria-pressed="true"] { border-color: var(--mark); background: var(--selected); }
    :focus-visible { outline: 2px solid var(--mark); outline-offset: 2px; }
</style>
</head>
<body>
<h1>${title}</h1>
<p>拖动进度，或者切换到跟随页面滚动，比较开始与结束状态。</p>
<div class="track" style="--p:${initial / 100}">
    <div class="sticky">
      <div class="stage">${artwork}</div>
      <div class="controls" hidden>
        <div class="range-row">
          <label for="progress">进度</label>
          <input id="progress" type="range" min="0" max="100" value="${initial}">
          <output for="progress">${initial}%</output>
        </div>
        <div class="steps" hidden>
          <button type="button" data-progress="0">起点</button>
          <button type="button" data-progress="1">终点</button>
        </div>
        <button class="scroll" type="button" aria-pressed="false">跟随页面滚动</button>
      </div>
      <p class="error" hidden>演示依赖未加载，请检查网络连接后刷新。</p>
    </div>
    <div class="distance" aria-hidden="true"></div>
</div>
<p>起点为 0%，终点为 100%。向上滚动可以反向观察同一过程。</p>
${useGsap ? gsapScripts : ''}
<script>
  (() => {
    const track = document.querySelector('.track');
    const sticky = document.querySelector('.sticky');
    const range = document.querySelector('#progress');
    const output = document.querySelector('output');
    const toggle = document.querySelector('.scroll');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let manual = Number(range.value) / 100;

    function showProgress(p) {
      range.value = Math.round(p * 100);
      output.value = range.value + '%';
    }
    ${setup}
    function setScroll(active) {
      track.classList.toggle('scroll-mode', active);
      toggle.setAttribute('aria-pressed', active);
      range.disabled = active;

      if (active) connectScroll();
      else {
        disconnectScroll();
        render(manual);
      }
    }
    function syncMotion() {
      document.querySelector('.range-row').hidden = motion.matches;
      document.querySelector('.steps').hidden = !motion.matches;
      toggle.hidden = motion.matches;
      if (motion.matches) {
        manual = manual < 0.5 ? 0 : 1;
        setScroll(false);
      }
    }

    toggle.addEventListener('click', () => setScroll(!track.classList.contains('scroll-mode')));
    track.addEventListener('formtempo:guide-reset', () => setScroll(false));
    range.addEventListener('input', () => {
      manual = Number(range.value) / 100;
      render(manual);
    });
    document.querySelectorAll('[data-progress]').forEach(button => {
      button.addEventListener('click', () => {
        manual = Number(button.dataset.progress);
        render(manual);
      });
    });
    motion.addEventListener('change', syncMotion);
    render(manual);
    syncMotion();
    document.querySelector('.controls').hidden = false;
  })();
</script>
</body>
</html>`;
}

export const drivenExamples: Record<string, ExamplePair> = Object.fromEntries(
  (Object.keys(cases) as (keyof typeof cases)[]).map((slug) => [
    slug,
    { native: example(slug, false), gsap: example(slug, true) },
  ]),
);
