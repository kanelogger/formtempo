import pointerSource from './pointer-interaction.js?raw';

const source = pointerSource.replace(/^export function bindPointerStage/m, 'function bindPointerStage');
const gsapUrl = 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js';
const directions = [['top', '上'], ['right', '右'], ['bottom', '下'], ['left', '左']] as const;

function buttons(action: 'enter' | 'leave') {
  const entering = action === 'enter';
  return directions.map(([side, name]) =>
    `<button type="button" data-pointer-action="${action}" data-side="${side}">${entering ? '从' : '向'}${name}侧${entering ? '进入' : '离开'}</button>`,
  ).join('\n    ');
}

function documentFor(variant: string, title: string, useGsap: boolean) {
  const controls = variant === 'direction-aware'
    ? `${buttons('enter')}\n    ${buttons('leave')}`
    : '<button type="button" data-pointer-action="enter">进入</button>\n    <button type="button" data-pointer-action="leave">离开</button>';

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} · ${useGsap ? 'GSAP' : '原生'}</title>
  <style>
    html { background: #fbfaf7; }
    body { margin: 2rem auto; padding: 0 1rem; max-width: 38rem; color: #222c36; font: 1rem/1.55 system-ui, sans-serif; }
    [data-pointer-card] { position: relative; display: grid; place-items: center; overflow: hidden; min-height: 12rem; border-radius: 12px; background: #e8f3fa; touch-action: auto; }
    [data-pointer-panel] { position: absolute; inset: 0; display: grid; place-items: center; transform: translate(-100%, 0%); background: #275d7f; color: #fffdf8; pointer-events: none; }
    button { min-height: 2.75rem; margin: .15rem; padding: .35rem .65rem; border: 1px solid #82939f; border-radius: 6px; background: #fff; color: #222c36; font: inherit; }
    button:focus-visible { outline: 2px solid #275d7f; outline-offset: 2px; }
  </style>
  ${useGsap ? `<script src="${gsapUrl}"></script>` : ''}
</head>
<body>
<main data-pointer-variant="${variant}">
  <h1>${title}</h1>
  <p>移入或移出卡片，也可以用触屏、触控笔点按或用下方按钮操作。</p>
  <div data-pointer-card data-pointer-state="closed" aria-hidden="true">
    原画面
    <div data-pointer-panel>揭示层</div>
  </div>
  <p data-pointer-status role="status">等待操作</p>
  <div data-pointer-controls hidden>
    ${controls}
  </div>
  <noscript><p>起始时可见原画面，进入后蓝色揭示层覆盖卡片。</p></noscript>
</main>
<script>
${source}${useGsap ? `
function animateWithGsap(panel, from, to) {
  const tween = gsap.fromTo(panel, { transform: from }, {
    transform: to,
    duration: 0.38,
    ease: 'power3.out',
  });
  return { moving: () => tween.isActive(), stop: () => tween.kill() };
}

bindPointerStage(document.querySelector('main'), window.gsap ? animateWithGsap : undefined);` : "\nbindPointerStage(document.querySelector('main'));"}
</script>
</body>
</html>`;
}

const variants = {
  'symmetric-transition': '对称过渡',
  'asymmetric-transition': '非对称过渡',
  'direction-aware': '方向感知',
};

export const pointerExamples: Record<string, { native: string; gsap: string }> = Object.fromEntries(
  Object.entries(variants).map(([variant, title]) => [
    variant,
    { native: documentFor(variant, title, false), gsap: documentFor(variant, title, true) },
  ]),
);
