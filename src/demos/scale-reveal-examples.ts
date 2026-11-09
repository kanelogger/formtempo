import { scaleRevealMarkup } from './scale-reveal-markup';
import styles from './scale-reveal.css?raw';
import interaction from './scale-reveal-interaction.js?raw';

const source = interaction.replace(/^export function bindScaleReveal/m, 'function bindScaleReveal');

function example(useGsap: boolean) {
  const gsapSource = useGsap ? `
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>` : '';
  const setup = useGsap ? `
    if (!window.gsap) {
      root.querySelector('[data-scale-error]').hidden = false;
      return;
    }
    bindScaleReveal(root, (crop, zoom) => gsap.timeline({ paused: true })
      .fromTo(crop, { clipPath: 'inset(50%)' }, { clipPath: 'inset(0%)', ease: 'none' }, 0)
      .fromTo(zoom, { scale: 0 }, { scale: 1, ease: 'none' }, 0));` : `
    bindScaleReveal(root);`;

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>缩放显现 · ${useGsap ? 'GSAP' : '原生'}示例</title>
<script>
  if (new URLSearchParams(location.search).get('theme') === 'dark') {
    document.documentElement.dataset.theme = 'dark';
  }
</script>
<style>
  :root {
    color-scheme: light;
    --page: #fbfaf7;
    --surface: #fff;
    --surface-2: #edf3f6;
    --plate: #f7fafb;
    --text: #222c36;
    --text-2: #434f5d;
    --line-hi: #82939f;
    --accent: #b8412c;
    --accent-text: #963324;
    background: var(--page);
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --page: #19222d;
    --surface: #222e3c;
    --surface-2: #2b3c4d;
    --plate: #233142;
    --text: #f6f5f1;
    --text-2: #d8dce1;
    --line-hi: #8396a8;
    --accent: #ff9d7c;
    --accent-text: #ffb399;
  }
  *, *::before, *::after { box-sizing: border-box; }
  body { max-width: 54rem; margin: 0 auto; padding: clamp(1rem, 4vw, 2rem); color: var(--text); font: 1rem/1.6 system-ui, sans-serif; }
  h1 { margin-block: 0 .4rem; font-size: 1.75rem; }
  p { margin: 0 0 1rem; }
  button, input { font: inherit; }
  [hidden] { display: none !important; }
  .scale-reveal__mode p { margin: 0; }
  .scale-reveal[data-mode="scroll"] + p { min-height: 100vh; padding-block-start: 1rem; }
  ${styles}
</style>
</head>
<body>
<h1>缩放显现</h1>
<p>拖动同一条进度，观察裁剪与缩放怎样处理同一幅插图。</p>
${scaleRevealMarkup}
<p>裁剪改变可见区域，缩放改变整幅图的大小。</p>
${gsapSource}
<script>
  (() => {
    ${source}
    const root = document.querySelector('[data-scale-reveal]');
    ${setup}
  })();
</script>
</body>
</html>`;
}

export const scaleRevealExamples = {
  'scale-reveal': { native: example(false), gsap: example(true) },
};
