import { demoGuides } from "./demos/demo-guide-cases";
import guideStyles from "./demos/demo-guide.css?raw";
import guideScript from "./demos/demo-guide.js?raw";

type ExamplePair = { native: string; gsap: string };

const sources = import.meta.glob<Record<string, Record<string, ExamplePair>>>("./demos/*-examples.ts", { eager: true });
const originals: Record<string, ExamplePair> = Object.assign(
  {},
  ...Object.values(sources).flatMap((module) => Object.values(module)),
);

const controller = guideScript.replace(/^export function bindDemoGuide/m, "function bindDemoGuide");
function withGuide(slug: string, html: string) {
  const guide = demoGuides[slug];
  if (!guide) throw new Error(`Missing demo guide for ${slug}`);
  return html
    .replace("</head>", () => `<style>${guideStyles}</style>\n</head>`)
    .replace("</body>", () => `<script>
(() => {
${controller}
bindDemoGuide(document.body, ${JSON.stringify(guide)});
})();
</script>
</body>`);
}

export const examples: Record<string, ExamplePair> = Object.fromEntries(
  Object.entries(originals).map(([slug, { native, gsap }]) => [
    slug,
    { native: withGuide(slug, native), gsap: withGuide(slug, gsap) },
  ]),
);
