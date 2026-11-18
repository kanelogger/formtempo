import palette from '../styles/palette.css?raw';

export function hoverExampleDocument(title: string, markup: string, styles: string, script: string, gsap: boolean) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} · ${gsap ? 'GSAP' : '原生'}示例</title>
  <script>
    const theme = new URLSearchParams(location.search).get('theme');
    if (theme === 'dark' || (!theme && matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.dataset.theme = 'dark';
    }
  </script>
  <style>
    ${palette}
    *, *::before, *::after { box-sizing: border-box; }
    html { background: var(--bg); color: var(--text); }
    body { max-width: 54rem; margin: 2rem auto; padding-inline: 1rem; font: 1rem/1.55 system-ui, sans-serif; }
    button { font: inherit; }
    ${styles}
  </style>
  ${gsap ? '<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>' : ''}
</head>
<body>
  <main>
    <h1>${title}</h1>
    ${markup}
  </main>
  <script>
${script}
  </script>
</body>
</html>`;
}
