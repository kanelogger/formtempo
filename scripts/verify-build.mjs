import { readFile, readdir } from "node:fs/promises";
import { posix } from "node:path";
import { Script } from "node:vm";
import { gzipSync } from "node:zlib";
import { effects, groups, routes } from "../src/effects.ts";
import { demoGuides } from "../src/demos/demo-guide-cases.ts";

const output = new URL("../dist/", import.meta.url);
const base = "/formtempo/";
const origin = "https://kanelogger.github.io";
const budget = 20 * 1024;
const errors = [];

function requireThat(condition, message) {
  if (!condition) errors.push(message);
}

async function walk(directory = "") {
  const entries = await readdir(new URL(directory, output), { withFileTypes: true });
  const groups = await Promise.all(entries.map((entry) => {
    const path = posix.join(directory, entry.name);
    if (entry.isDirectory()) return walk(path + "/");
    if (!entry.isFile()) {
      errors.push(`Unexpected output entry: ${path}`);
      return [];
    }
    return [path];
  }));
  return groups.flat();
}

function attributes(markup) {
  const attrs = new Map();
  for (const [, name, double, single, bare] of markup.matchAll(/([^\s=/>]+)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attrs.set(name.toLowerCase(), (double ?? single ?? bare ?? "").replaceAll("&amp;", "&"));
  }
  return attrs;
}

function tags(html) {
  // Built pages include escaped source examples and raw inline scripts. Ignore script and style bodies.
  return Array.from(
    html.replace(/(<(?:script|style)\b[^>]*>)[\s\S]*?<\/(?:script|style)>/gi, "$1")
      .matchAll(/<([a-z][\w:-]*)\b((?:[^"'<>]|"[^"]*"|'[^']*')*)>/gi),
    ([, tag, markup]) => [tag.toLowerCase(), attributes(markup)],
  );
}

function scripts(html) {
  return Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi), ([, markup, body]) => ({
    attrs: attributes(markup),
    body,
  }));
}

function cssUrls(css) {
  return Array.from(css.matchAll(/\burl\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"]+))\s*\)/gi),
    ([, double, single, bare]) => (double ?? single ?? bare).trim(),
  );
}

const files = new Set(await walk());
const text = new Map(await Promise.all(
  [...files].filter((file) => /\.(?:html|m?js|css|svg|json|xml|txt|map|webmanifest)$/i.test(file))
    .map(async (file) => [file, await readFile(new URL(file, output), "utf8")]),
));

const slugs = effects.map(({ slug }) => slug);
const details = new Set(slugs.map((slug) => routes.effect(slug) + "index.html"));
const examples = new Set(slugs.flatMap((slug) => ["native", "gsap"].map((kind) => routes.example(slug, kind))));
requireThat(slugs.length === 22 && details.size === 22 && examples.size === 44,
  "The atlas must contain 22 unique cases and 44 examples.");
const numbers = new Set(effects.map(({ number }) => number));
const expectedNumbers = Array.from({ length: 22 }, (_, index) => String(index + 1).padStart(2, "0"));
requireThat(expectedNumbers.every((number) => numbers.has(number)), "The atlas must use case numbers 01–22.");

const releasedSlugs = [
  "symmetric-transition", "asymmetric-transition", "direction-aware",
  "enter-once", "forward-reversible", "bidirectional-reveal",
  "clip-reveal", "layered-parallax", "horizontal-gallery",
  "mask-transition", "overlap-transition", "shared-element",
  "magnetic-button", "pointer-enter-once", "section-snap", "scale-reveal",
  "video-scrub", "soft-mask-reveal", "scroll-camera",
  "hover-reveal", "scroll-3d-model", "scroll-3d-scene",
];
requireThat(Object.keys(demoGuides).length === slugs.length &&
  slugs.every((slug) => demoGuides[slug]?.steps.length), "Each effect must define a demo guide.");
for (const [index, slug] of releasedSlugs.entries()) {
  const number = String(index + 1).padStart(2, "0");
  requireThat(effects.some((effect) => effect.slug === slug && effect.number === number),
    `Case ${number} must keep its released slug: ${slug}`);
  requireThat(files.has(`effects/${slug}/index.html`), `Missing released detail route: ${slug}`);
  const guide = demoGuides[slug];
  const guideRoot = tags(text.get(`effects/${slug}/index.html`) ?? "").filter(([, attrs]) => attrs.has("data-demo-guide"));
  requireThat(guideRoot.length === 1, `Expected one demo guide on the detail page for ${slug}.`);
  for (const kind of ["native", "gsap"]) {
    const file = `examples/${slug}/${kind}.html`;
    requireThat(files.has(file), `Missing released example route: ${slug}/${kind}`);
    const hasGuide = scripts(text.get(file) ?? "").some(({ body }) =>
      body.includes(`bindDemoGuide(document.body, ${JSON.stringify(guide)});`));
    requireThat(hasGuide, `Missing inline demo guide in ${file}.`);
  }
}

const catalog = tags(text.get("effects/index.html") ?? "");
for (const { id } of groups) {
  const anchors = catalog.filter(([, attrs]) => attrs.get("id") === id);
  requireThat(anchors.length === 1 && anchors[0][1].get("data-type") === id,
    `The catalog must have one anchor for the ${id} category.`);
}

for (const { slug, number, compareWith } of effects) {
  if (Number(number) <= 12 && !compareWith) continue;
  const page = text.get(routes.effect(slug) + "index.html") ?? "";
  const comparisons = tags(page).filter(([tag, attrs]) => tag === "a" && attrs.has("data-comparison"));
  requireThat(compareWith && slugs.includes(compareWith) && comparisons.length === 1 &&
    comparisons[0][1].get("href") === base + routes.effect(compareWith),
    `Missing comparison link in ${slug}.`);
}

for (const file of ["index.html", "effects/index.html", ...details, ...examples]) {
  requireThat(files.has(file), `Missing built page: ${file}`);
}
for (const file of files) {
  requireThat(!file.split("/").some((segment) => segment === ".DS_Store" || segment === "PLAN.md" || segment.startsWith("private-")), `Private file in dist: ${file}`);
  if (/^effects\/[^/]+\/index\.html$/.test(file)) requireThat(details.has(file), `Unexpected effect: ${file}`);
  if (file.startsWith("examples/")) requireThat(examples.has(file), `Unexpected example: ${file}`);
}
for (const [file, source] of text) {
  requireThat(!/\/Users\/|(?:private-doc|private-example)\//.test(source), `Private source reference in dist: ${file}`);
}

function findLocal(reference, from, required = false) {
  let url;
  try {
    url = new URL(reference, origin + base + from.replace(/(^|\/)index\.html$/, "$1"));
  } catch {
    requireThat(false, `Invalid URL in ${from}: ${reference}`);
    return;
  }
  if (url.origin !== origin) {
    requireThat(!required, `Homepage JavaScript must be local: ${reference}`);
    return;
  }
  if (!url.pathname.startsWith(base)) {
    requireThat(false, `Missing ${base} base in ${from}: ${reference}`);
    return;
  }
  let path;
  try {
    path = decodeURIComponent(url.pathname.slice(base.length));
  } catch {
    requireThat(false, `Invalid URL encoding in ${from}: ${reference}`);
    return;
  }
  const candidates = path.endsWith("/") || !path
    ? [path + "index.html"]
    : [path, posix.join(path, "index.html")];
  const file = candidates.find((candidate) => files.has(candidate));
  requireThat(file, `Broken reference in ${from}: ${reference}`);
  if (!file) return;

  if (url.hash && /\.(?:html|svg)$/.test(file)) {
    const fragment = decodeURIComponent(url.hash.slice(1));
    requireThat(tags(text.get(file) ?? "").some(([, attrs]) => attrs.get("id") === fragment),
      `Broken fragment in ${from}: ${reference}`);
  }
  return file;
}

for (const [file, source] of text) {
  if (file.endsWith(".html") || file.endsWith(".svg")) {
    for (const [, attrs] of tags(source)) {
      for (const attr of ["href", "src", "poster", "data-video-src", "data-source-url"]) {
        const value = attrs.get(attr);
        if (value) findLocal(value, file);
      }
    }
  }
  if (file.endsWith(".css") || file.endsWith(".html")) {
    const styles = file.endsWith(".css")
      ? [source]
      : Array.from(source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi), ([, css]) => css);
    for (const css of styles) {
      for (const reference of cssUrls(css)) {
        if (!reference.startsWith("#")) findLocal(reference, file);
      }
    }
  }
}

for (const file of examples) {
  if (!text.has(file)) continue;
  const inline = scripts(text.get(file)).filter(({ attrs, body }) => !attrs.has("src") && body.trim());
  requireThat(inline.length > 0, `Missing inline implementation in ${file}`);
  for (const { body } of inline) {
    try {
      new Script(body, { filename: file });
    } catch (error) {
      errors.push(error.message + " in " + file);
    }
  }
}

const videoDetail = routes.effect("video-scrub") + "index.html";
const videoPage = text.get(videoDetail) ?? "";
const videoElement = tags(videoPage).find(([tag, attrs]) => tag === "video" && attrs.has("data-video-player"))?.[1];
const videoReference = videoElement?.get("data-video-src");
const videoFile = videoReference && findLocal(videoReference, videoDetail);
requireThat(videoFile?.endsWith(".mp4") && !videoElement.has("src"), "The detail must load its local MP4 on demand.");
requireThat(!videoPage.includes("data:video/mp4;base64,"), "The detail must defer loading the embedded example videos.");
if (videoFile) {
  const videoBytes = await readFile(new URL(videoFile, output));
  requireThat(videoBytes.length <= 128 * 1024 && videoBytes.toString("ascii", 4, 8) === "ftyp",
    "The original MP4 must fit within 128 KiB.");
  for (const kind of ["native", "gsap"]) {
    const path = routes.example("video-scrub", kind);
    const source = text.get(path) ?? "";
    const embedded = [...source.matchAll(/data:video\/mp4;base64,([A-Za-z0-9+/=]+)/g)];
    requireThat(embedded.length === 1 && Buffer.from(embedded[0][1], "base64").equals(videoBytes),
      `The ${kind} video example must embed the original MP4.`);
  }
}

const counted = new Set();
let gzipBytes = 0;

function countModule(source, file) {
  gzipBytes += gzipSync(source).length;
  // Astro/Vite emits URL specifiers for bundled dependencies. Include literal dynamic imports conservatively.
  const imports = /\b(?:import\s*\(\s*|(?:import|export)\s*(?:[^"'\x60;()]*?\bfrom\s*)?)["']([^"']+)["']/g;
  for (const [, reference] of source.matchAll(imports)) {
    if (/^(?:\.|\/|https?:)/.test(reference)) countAsset(reference, file);
  }
}

function countAsset(reference, from) {
  const file = findLocal(reference, from, true);
  if (!file || counted.has(file)) return;
  counted.add(file);
  requireThat(/\.m?js$/.test(file), `Expected JavaScript module: ${file}`);
  if (text.has(file)) countModule(text.get(file), file);
}

const home = text.get("index.html") ?? "";
for (const { attrs, body } of scripts(home)) {
  const type = attrs.get("type");
  if (type && !["module", "text/javascript", "application/javascript"].includes(type)) continue;
  const src = attrs.get("src");
  if (src) countAsset(src, "index.html");
  else if (body.trim()) countModule(body, "index.html");
}
for (const [tag, attrs] of tags(home)) {
  if (tag === "link" && attrs.get("rel") === "modulepreload" && attrs.has("href")) {
    countAsset(attrs.get("href"), "index.html");
  }
}
requireThat(gzipBytes > 0, "The homepage must include the working clip-reveal script.");
requireThat(gzipBytes <= budget, `Homepage JavaScript: ${gzipBytes} B gzip exceeds ${budget} B.`);
requireThat(!/<video\b|\.mp4|data:video\//i.test(home) && [...counted].every((file) => !/\.mp4|data:video\//i.test(text.get(file) ?? "")),
  "The homepage must not load the video case media.");

if (errors.length) {
  throw new Error("Build verification failed:\n" + errors.map((error) => "  - " + error).join("\n"));
}

console.log(`Verified homepage, directory, ${details.size} cases and ${examples.size} examples.`);
console.log(`Homepage JavaScript: ${gzipBytes} B gzip / ${budget} B budget.`);
