import { scrollProgressMarkup } from './scroll-progress-markup';
import progressStyles from './scroll-progress.css?raw';
import progressScript from './scroll-progress-interaction.js?raw';

type Example = Parameters<typeof scrollProgressMarkup>[0] & {
  title: string;
  styles: string;
  script: string;
  setup: string;
};

const controller = progressScript.replace(/^export function bindScrollProgress/m, 'function bindScrollProgress');
const gsapScripts = `<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>`;

function renderExample(example: Example, useGsap: boolean) {
  const { title, styles, script, setup } = example;
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
    --bg: #fbfaf7; --surface: #fff; --surface-2: #edf3f6; --plate: #f7fafb;
    --text: #222c36; --text-2: #434f5d; --line-hi: #b8c4cd; --line-strong: #82939f;
    --accent: #b8412c; --accent-text: #963324;
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --bg: #19222d; --surface: #222e3c; --surface-2: #2b3c4d; --plate: #233142;
    --text: #f6f5f1; --text-2: #d8dce1; --line-hi: #576575; --line-strong: #8396a8;
    --accent: #ff9d7c; --accent-text: #ffb399;
  }
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.55 system-ui, sans-serif; }
  main { max-width: 54rem; margin-inline: auto; padding: clamp(1rem, 4vw, 2rem); }
  h1 { margin: 0 0 1rem; font-size: clamp(1.5rem, 4vw, 2rem); }
  .example-note, .example-fallback { color: var(--text-2); font-size: .875rem; }
  .scroll-progress[data-mode="scroll"] ~ .example-note { min-height: 100vh; }
  ${progressStyles}
  ${styles}
</style>
</head>
<body>
<main>
  <h1>${title}</h1>
  ${scrollProgressMarkup(example)}
  ${useGsap ? '<p class="example-fallback" data-gsap-fallback role="status" hidden>GSAP 未加载，当前使用原生滚动。</p>' : ''}
  <p class="example-note">拖动进度，或启用页面滚动来回观察。</p>
</main>
${useGsap ? gsapScripts : ''}
<script>
(() => {
  ${controller}
  ${script}
  const root = document.querySelector('[data-scroll-progress]');
  const render = ${setup};
  ${useGsap ? `if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    bindScrollProgress(root, render, (measure, update) => {
      const trigger = ScrollTrigger.create({
        start: () => measure().start,
        end: () => measure().end,
        onUpdate: (self) => update(self.progress),
        onRefresh: (self) => update(self.progress),
      });
      update(trigger.progress);
      return { refresh: () => trigger.refresh(), destroy: () => trigger.kill() };
    });
  } else {
    document.querySelector('[data-gsap-fallback]').hidden = false;
    bindScrollProgress(root, render);
  }` : 'bindScrollProgress(root, render);'}
})();
</script>
</body>
</html>`;
}

export function createProgressExamples(example: Example) {
  return { native: renderExample(example, false), gsap: renderExample(example, true) };
}
