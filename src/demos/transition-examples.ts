import transitionSource from './transition-interaction.js?raw';
import transitionGuideStyles from './transition-guide.css?raw';
import { transitionGuideTarget } from './transition-guide-markup';

const source = transitionSource.replace(/^export function bindTransitionStage/m, 'function bindTransitionStage');
const gsapDist = 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist';

const coreDriver = `
function animateWithGsap(element, frames, duration) {
  let complete;
  const finished = new Promise((resolve) => { complete = resolve; });
  const tween = gsap.fromTo(element, frames[0], {
    ...frames[1], duration: duration / 1000, ease: 'power3.out',
    onComplete: complete, onInterrupt: complete,
  });
  return { finished, stop() { tween.kill(); complete(); } };
}`;

const flipDriver = `
function flipWithGsap(firstArt, lastArt, present) {
  gsap.registerPlugin(Flip);
  const state = Flip.getState(firstArt);
  present();
  let complete;
  const finished = new Promise((resolve) => { complete = resolve; });
  const tween = Flip.from(state, {
    targets: lastArt, scale: true, duration: 0.56, ease: 'power3.out',
    onComplete: complete, onInterrupt: complete,
  });
  return { finished, stop() { tween.kill(); complete(); } };
}`;

function documentFor(variant: string, title: string, useGsap: boolean) {
  const shared = variant === 'shared-element';
  const sharedArt = `<div data-shared-art data-flip-id="coastal-art">
      <svg viewBox="0 0 220 112" aria-hidden="true" focusable="false">
        <rect width="220" height="112" fill="#e8f3fa" />
        <path d="M0 94l47-52 26 26 30-35 43 50 26-34 48 36v27H0Z" fill="#628ca8" />
        <path d="M0 103l48-52 26 27 31-35 40 49 27-33 48 37" stroke="#39688b" fill="none" />
        <circle cx="176" cy="31" r="9" fill="#ef784d" />
      </svg>
    </div>`;

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} · ${useGsap ? 'GSAP' : '原生'}</title>
  <style>
    html { background: #fbfaf7; }
    body { margin: 2rem auto; padding: 0 1rem; max-width: 38rem; color: #222c36; font: 1rem/1.55 system-ui, sans-serif; }
    [data-transition-viewport] { position: relative; isolation: isolate; overflow: hidden; aspect-ratio: 2 / 1; border-radius: 12px; background: #edf3f6; }
    [data-transition-view] { position: absolute; inset: 0; padding: 5% 7%; background: #edf3f6; }
    [data-transition-view="detail"] { background: #f0ebf5; }
    [data-shared-art] { position: absolute; top: 30%; left: 7%; width: 40%; transform-origin: top left; }
    [data-transition-view="detail"] [data-shared-art] { top: 25%; left: 39%; width: 54%; }
    [data-shared-art] svg { display: block; width: 100%; border-radius: 4px; }
    [data-transition-mask] { position: absolute; z-index: 3; inset: 0; background: #6d5581; pointer-events: none; transform: translateX(-100%); }
    button { min-height: 2.75rem; margin: .15rem; padding: .35rem .65rem; border: 1px solid #9786a8; border-radius: 6px; background: #fff; color: #222c36; font: inherit; }
    button[aria-pressed='true'] { border-color: #6d5581; background: #f0ebf5; }
    button:focus-visible { outline: 2px solid #6d5581; outline-offset: 2px; }
    [data-transition-status] { color: #574268; }
    @media (max-width: 30rem) {
      [data-transition-viewport] { aspect-ratio: 1.62 / 1; }
    }
    ${transitionGuideStyles}
  </style>
  ${useGsap ? `<script src="${gsapDist}/gsap.min.js"></script>` : ''}
  ${useGsap && shared ? `<script src="${gsapDist}/Flip.min.js"></script>` : ''}
</head>
<body>
<main data-transition-variant="${variant}">
  <h1>${title}</h1>
  <div data-transition-viewport data-active-view="index">
    <div data-transition-view="index" data-view-label="作品目录">
      <strong>作品目录</strong>
      ${sharedArt}
      ${transitionGuideTarget}
    </div>
    <div data-transition-view="detail" data-view-label="作品详情" hidden>
      <strong>作品详情</strong>
      ${sharedArt}
    </div>
    <div data-transition-mask hidden></div>
  </div>
  <p data-transition-status role="status">当前画面 · 作品目录</p>
  <div data-transition-controls hidden>
    <button type="button" data-transition-action="index" aria-pressed="true">作品目录</button>
    <button type="button" data-transition-action="detail" aria-pressed="false">作品详情</button>
  </div>
  <noscript><p>起始画面是目录的小图，终止画面是详情的大图。</p></noscript>
</main>
<script>
${source}${useGsap ? `${coreDriver}${shared ? flipDriver : ''}

bindTransitionStage(document.querySelector('main'), window.gsap ? animateWithGsap : undefined${shared ? ', window.gsap && window.Flip ? flipWithGsap : undefined' : ''});` : "\nbindTransitionStage(document.querySelector('main'));"}
</script>
</body>
</html>`;
}

const variants = {
  'mask-transition': '遮罩式转场',
  'overlap-transition': '交叠式转场',
  'shared-element': '共享元素转场',
};

export const transitionExamples: Record<string, { native: string; gsap: string }> = Object.fromEntries(
  Object.entries(variants).map(([variant, title]) => [
    variant,
    { native: documentFor(variant, title, false), gsap: documentFor(variant, title, true) },
  ]),
);
