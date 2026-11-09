import { sectionSnapMarkup } from './section-snap-content';
import styles from './section-snap.css?raw';
import interaction from './section-snap-interaction.js?raw';

const controller = interaction.replace(/^export function bindSectionSnap/m, 'function bindSectionSnap');
const gsapScripts = `<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/ScrollTrigger.min.js"></script>`;

function example(useGsap: boolean) {
  const implementation = useGsap ? 'GSAP' : '原生';
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>分段式滚动 · ${implementation}示例</title>
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
    --text: #222c36;
    --text-2: #434f5d;
    --text-3: #5c6875;
    --line-hi: #b8c4cd;
    --line-strong: #82939f;
    --accent: #b8412c;
    --accent-text: #963324;
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --page: #19222d;
    --surface: #222e3c;
    --surface-2: #2b3c4d;
    --text: #f6f5f1;
    --text-2: #d8dce1;
    --text-3: #b4becc;
    --line-hi: #576575;
    --line-strong: #8396a8;
    --accent: #ff9d7c;
    --accent-text: #ff9d7c;
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--page); color: var(--text); font: 16px/1.5 system-ui, sans-serif; }
  main { max-width: 48rem; margin-inline: auto; padding: clamp(1rem, 4vw, 2rem); }
  h1 { margin: 0 0 1rem; font-size: clamp(1.5rem, 4vw, 2rem); }
  .scroll-context { min-height: 60vh; color: var(--text-2); }
  ${styles}
</style>
</head>
<body>
<main>
  <h1>分段式滚动</h1>
  ${sectionSnapMarkup}
  ${useGsap ? '<p data-snap-fallback role="status" hidden>GSAP 未加载，当前使用原生章节定位。</p>' : ''}
  <p class="scroll-context">滚到画框的首节或末节后，可沿同一方向继续滚动页面。</p>
</main>
${useGsap ? gsapScripts : ''}
<script>
${controller}

const stage = document.querySelector('[data-section-snap]');
${useGsap ? `
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  bindSectionSnap(stage, (viewport, sync, measure) => {
    ScrollTrigger.create({
      scroller: viewport,
      start: 0,
      end: () => viewport.scrollHeight - viewport.clientHeight,
      onUpdate: sync,
      onRefresh: measure,
    });
  });
} else {
  document.querySelector('[data-snap-fallback]').hidden = false;
  bindSectionSnap(stage);
}` : 'bindSectionSnap(stage);'}
</script>
</body>
</html>`;
}

export const sectionSnapExamples = {
  'section-snap': { native: example(false), gsap: example(true) },
};
