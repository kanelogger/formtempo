import { pointerComparisonMarkup, pointerComparisonTitles } from './pointer-comparison-markup';
import magneticSource from './pointer-comparison-interaction.js?raw';
import pulseSource from './pointer-comparison-pulse.js?raw';
import styles from './pointer-comparison.css?raw';

const gsapUrl = 'https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js';
const gsapMagnetic = `
function positionWithGsap(visual, x, y, returning) {
  gsap.killTweensOf(visual);
  if (returning) gsap.to(visual, { x, y, duration: returnDuration / 1000, ease: 'expo.out' });
  else gsap.set(visual, { x, y });
}
`;
const gsapPulse = `
function pulseWithGsap(outline, finish) {
  const tween = gsap.fromTo(outline, { opacity: 1, scale: 1 }, {
    opacity: 0, scale: pulseScale, duration: pulseDuration / 1000,
    ease: 'expo.out', clearProps: 'opacity,transform', onComplete: finish,
  });
  return () => {
    tween.kill();
    gsap.set(outline, { clearProps: 'opacity,transform' });
  };
}
`;

type Variant = keyof typeof pointerComparisonTitles;

function documentFor(variant: Variant, useGsap: boolean) {
  const title = pointerComparisonTitles[variant];
  const magnetic = variant === 'magnetic-button';
  const source = (magnetic ? magneticSource : pulseSource).replace(/^export function /m, 'function ');
  const bind = magnetic ? 'bindMagneticButton' : 'bindEnterPulse';
  const adapter = magnetic ? 'positionWithGsap' : 'pulseWithGsap';
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} · ${useGsap ? 'GSAP' : '原生'}示例</title>
  <script>
    const theme = new URLSearchParams(location.search).get('theme');
    if (theme === 'dark' || (!theme && matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.dataset.theme = 'dark';
    }
  </script>
  <style>
    :root {
      color-scheme: light;
      --bg: #fbfaf7; --surface: #fff; --surface-2: #edf3f6;
      --text: #222c36; --text-2: #434f5d; --line-strong: #82939f;
      --family-pointer: #275d7f; --accent: #b8412c;
      --btn-bg: #b8412c; --btn-fg: #fff; --btn-hover: #963324;
    }
    :root[data-theme="dark"] {
      color-scheme: dark;
      --bg: #19222d; --surface: #222e3c; --surface-2: #2b3c4d;
      --text: #f6f5f1; --text-2: #d8dce1; --line-strong: #8396a8;
      --family-pointer: #9dc5e4; --accent: #ff9d7c;
      --btn-bg: #ff9d7c; --btn-fg: #281912; --btn-hover: #ffb399;
    }
    html { background: var(--bg); }
    body { max-width: 54rem; margin: 2rem auto; padding-inline: 1rem; color: var(--text); font: 1rem/1.55 system-ui, sans-serif; }
    *, *::before, *::after { box-sizing: border-box; }
    ${styles}
  </style>
  ${useGsap ? `<script src="${gsapUrl}"></script>` : ''}
</head>
<body>
  <main>
    <h1>${title}</h1>
    ${pointerComparisonMarkup(variant)}
  </main>
  <script>
${source}
${useGsap ? (magnetic ? gsapMagnetic : gsapPulse) : ''}
const demo = document.querySelector('[data-pointer-comparison]');
${bind}(demo${useGsap ? `, window.gsap ? ${adapter} : undefined` : ''});
  </script>
</body>
</html>`;
}

export const pointerComparisonExamples = Object.fromEntries(
  (Object.keys(pointerComparisonTitles) as Variant[]).map((variant) => [
    variant,
    { native: documentFor(variant, false), gsap: documentFor(variant, true) },
  ]),
);
