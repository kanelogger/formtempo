import { demoGuides } from "./demos/demo-guide-cases";
import guideStyles from "./demos/demo-guide.css?raw";
import guideScript from "./demos/demo-guide.js?raw";

type ExampleSources = Partial<Record<"gsap" | "native", string>>;

const sources = import.meta.glob<Record<string, Record<string, ExampleSources>>>("./demos/*-examples.ts", { eager: true });
const originals: Record<string, ExampleSources> = Object.assign(
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

export const examples: Record<string, ExampleSources> = Object.fromEntries(
  Object.entries(originals).map(([slug, source]) => {
    const implementations = Object.entries(source);
    if (!implementations.length) throw new Error(`Missing source for ${slug}`);
    return [slug, Object.fromEntries(implementations.map(([kind, html]) => [kind, withGuide(slug, html)]))];
  }),
);
