import { hoverRevealMarkup } from './hover-reveal-markup';
import styles from './hover-reveal.css?raw';
import interaction from './hover-reveal-interaction.js?raw';
const script = interaction.replace('export function bindHoverReveal', 'function bindHoverReveal');
function documentFor(gsap: boolean) {
  return `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>悬停揭示 · ${gsap ? 'GSAP' : '原生'}示例</title>
<style>* { box-sizing: border-box; } body { max-width: 54rem; margin: 2rem auto; padding: 0 1rem; background: #fbfaf7; color: #222c36; font: 16px/1.55 system-ui, sans-serif; } ${styles}</style>
${gsap ? '<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>' : ''}</head>
<body><main><h1>悬停揭示</h1>${hoverRevealMarkup}</main>
<script>${script}
${gsap ? `const animate = window.gsap ? (info, open) => {
  gsap.killTweensOf(info);
  gsap.to(info, { autoAlpha: open ? 1 : 0, duration: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : .3, overwrite: true });
} : undefined;
bindHoverReveal(document.querySelector('[data-hover-reveal]'), animate);` : "bindHoverReveal(document.querySelector('[data-hover-reveal]'));"}
</script></body></html>`;
}
export const hoverRevealExamples = { 'hover-reveal': { native: documentFor(false), gsap: documentFor(true) } };
