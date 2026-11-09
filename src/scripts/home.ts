import { copyText } from "./clipboard";

const stage = document.querySelector<HTMLElement>("#preview")!;
const stageWindow = stage.querySelector<HTMLElement>(".stage-window")!;
const pin = stage.querySelector<HTMLElement>(".stage-pin")!;
const caption = stage.querySelector<HTMLElement>(".beat-card")!;
const captionTitle = stage.querySelector<HTMLElement>("#beat-title")!;
const captionBody = stage.querySelector<HTMLElement>("#beat-body")!;
const proofMeta = stage.querySelector<HTMLElement>("#proof-meta")!;
const proofLive = stage.querySelector<HTMLElement>("#proof-live")!;
const proofOpen = stage.querySelector<HTMLAnchorElement>("#proof-open")!;
const modeButtons = [...stage.querySelectorAll<HTMLButtonElement>(".mode-switch button")];
const rails = [...stage.querySelectorAll<HTMLElement>(".beat-rail")];
const tablists = [...stage.querySelectorAll<HTMLElement>(".proof-rail")];
const panels = [...stage.querySelectorAll<HTMLElement>(".stage-panel")];
const beatButtons = [...stage.querySelectorAll<HTMLButtonElement>(".beat-tick")];
const demoLength = rails[0].childElementCount;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const shortViewport = matchMedia("(max-height: 540px), (max-width: 760px) and (max-height: 620px)");
const hover = matchMedia("(hover: hover)");
const staticStage = () => reduceMotion.matches || shortViewport.matches;
const clamp = (value: number) => Math.max(0, Math.min(1, value));

function bindTabs(tablist: HTMLElement, onSelect: (tab: HTMLButtonElement) => void) {
  const tabs = [...tablist.querySelectorAll<HTMLButtonElement>("[role=tab]")];
  const panelFor = (tab: HTMLButtonElement) => document.getElementById(tab.getAttribute("aria-controls")!);

  function select(tab: HTMLButtonElement, focus = false) {
    for (const item of tabs) {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = panelFor(item);
      if (panel) panel.hidden = !selected;
    }
    if (focus) tab.focus({ preventScroll: true });
    if (tab.offsetLeft < tablist.scrollLeft) tablist.scrollLeft = tab.offsetLeft;
    if (tab.offsetLeft + tab.offsetWidth > tablist.scrollLeft + tablist.clientWidth) {
      tablist.scrollLeft = tab.offsetLeft + tab.offsetWidth - tablist.clientWidth;
    }
    onSelect(tab);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (event) => {
      const targets: Record<string, number> = {
        ArrowLeft: (index - 1 + tabs.length) % tabs.length,
        ArrowRight: (index + 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };
      const next = targets[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(tabs[next], true);
    });
  });
}

let mode = "demo";
let beat = -1;
let currentDemoProgress: number | undefined;
let scrollFrame = 0;
let codeFrame = 0;

const activeTab = () => stage.querySelector<HTMLButtonElement>(`.proof-rail[data-mode="${mode}"] [aria-selected=true]`)!;
const activePanel = () => document.getElementById(activeTab().getAttribute("aria-controls")!)!;

function updateChrome() {
  const tab = activeTab();
  const title = tab.lastElementChild?.textContent || "";
  proofOpen.href = tab.dataset.href || "";
  proofOpen.firstElementChild!.textContent = mode === "demo" ? "打开案例" : "打开示例";
  proofOpen.setAttribute("aria-label", mode === "demo" ? "在新标签页打开案例" : "在新标签页打开示例");
  proofLive.textContent = mode === "demo" ? "现场演示" : "实现片段";
  proofMeta.textContent = mode === "demo" ? `${title} · 滚动驱动` : `裁剪展开 · ${title}`;
}

function showMode(next: string) {
  if (mode === next) return;
  const previousPanel = activePanel();
  const previousControls = [...tablists, ...rails].filter((control) => control.dataset.mode === mode);
  const focused = document.activeElement;
  mode = next;
  stageWindow.dataset.mode = next;
  for (const button of modeButtons) button.setAttribute("aria-pressed", String(button.dataset.mode === next));
  for (const part of [...rails, ...tablists]) part.hidden = part.dataset.mode !== next;
  const target = activePanel();
  for (const panel of panels) panel.hidden = panel !== target;
  if (previousPanel.contains(focused) || previousControls.some((control) => control.contains(focused))) {
    activeTab().focus({ preventScroll: true });
  }
  updateChrome();
}

function setDemoProgress(value: number) {
  const range = activePanel().querySelector<HTMLInputElement>('input[type="range"]');
  if (!range || range.valueAsNumber === value) return;
  range.value = String(value);
  range.dispatchEvent(new Event("input", { bubbles: true }));
}

function highlightCode() {
  const panel = activePanel();
  const local = beat - demoLength;
  const lines = [...panel.querySelectorAll<HTMLElement>(".code-block")];
  lines.forEach((block, index) => block.classList.toggle("is-active", index === local));
  const current = lines[local];
  if (!current) return;

  cancelAnimationFrame(codeFrame);
  codeFrame = requestAnimationFrame(() => {
    if (panel.hidden) return;
    const destination = local === 0 ? 0 : current.offsetTop - panel.clientHeight * 0.15;
    panel.scrollTo({ top: destination, behavior: staticStage() ? "instant" : "smooth" });
  });
}

function renderBeat(span: number, progress?: number) {
  const next = Math.min(beatButtons.length - 1, Math.floor(span));
  beatButtons.forEach((button, index) => button.style.setProperty("--fill", `${Math.round(clamp(span - index) * 100)}%`));
  if (next !== beat) {
    beat = next;
    showMode(next < demoLength ? "demo" : "code");
    const active = beatButtons[next];
    beatButtons.forEach((button) => button.setAttribute("aria-pressed", String(button === active)));
    captionTitle.textContent = active.dataset.title || "";
    captionBody.textContent = active.dataset.body || "";
    if (!reduceMotion.matches) {
      caption.classList.remove("is-swapping");
      void caption.offsetWidth;
      caption.classList.add("is-swapping");
    }
    if (mode === "code") highlightCode();
  }
  if (mode === "demo" && progress !== undefined) {
    currentDemoProgress = progress;
    setDemoProgress(progress);
  }
}

function stageProgress() {
  const rect = stage.getBoundingClientRect();
  const viewport = pin.offsetHeight;
  const enter = clamp(1 - rect.top / (viewport * 0.9));
  const travel = Math.max(1, rect.height - viewport);
  const pinned = clamp(-rect.top / travel);
  return { enter, pinned, rect, travel };
}

function applyScroll() {
  if (staticStage()) return;
  const { enter, pinned, rect } = stageProgress();
  stage.style.setProperty("--enter", enter.toFixed(3));
  const span = pinned * beatButtons.length;
  const progress = rect.top <= 0 && span < demoLength ? Math.round(clamp(span / demoLength) * 100) : undefined;
  renderBeat(span, progress);
}

function requestUpdate() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    applyScroll();
  });
}

function goToBeat(index: number) {
  if (staticStage()) {
    const value = index < demoLength ? Math.round(index * 100 / (demoLength - 1)) : undefined;
    renderBeat(index + 0.5, value);
    return;
  }
  const { rect, travel } = stageProgress();
  const destination = index + (index === demoLength - 1 ? 0.95 : index < demoLength ? 0.5 : 0.2);
  window.scrollTo({ top: window.scrollY + rect.top + travel * destination / beatButtons.length, behavior: "smooth" });
}

for (const tablist of tablists) {
  bindTabs(tablist, () => {
    updateChrome();
    if (mode === "code") highlightCode();
    else if (currentDemoProgress !== undefined) setDemoProgress(currentDemoProgress);
  });
}
const sourceTabs = document.querySelector<HTMLElement>(".agent-tabs")!;
bindTabs(sourceTabs, () => {
  document.querySelectorAll<HTMLElement>(".terminal-body .copy-status").forEach((status) => {
    status.textContent = "";
  });
});

modeButtons.forEach((button) => button.addEventListener("click", () => goToBeat(button.dataset.mode === "demo" ? 0 : demoLength)));
beatButtons.forEach((button, index) => button.addEventListener("click", () => goToBeat(index)));
for (const panel of panels.filter((item) => item.dataset.mode === "demo")) {
  panel.addEventListener("input", (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    currentDemoProgress = event.target.valueAsNumber;
  });
}
stage.dataset.ready = "";
window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("resize", requestUpdate);
window.addEventListener("pageshow", requestUpdate);
reduceMotion.addEventListener("change", requestUpdate);
shortViewport.addEventListener("change", requestUpdate);
if (staticStage()) renderBeat(0.5);
else applyScroll();

const heroClip = document.querySelector<HTMLElement>(".hero-clip")!;
const heroRange = heroClip.querySelector<HTMLInputElement>("input")!;
const heroValue = heroClip.querySelector<HTMLOutputElement>("output")!;
const canClip = CSS.supports("clip-path", "inset(0%)");
let heroFrame = 0;

function updateHeroClip() {
  const progress = `${heroRange.value}%`;
  heroClip.style.setProperty("--hero-clip-progress", progress);
  heroValue.value = progress;
  heroRange.setAttribute("aria-valuetext", progress);
}

heroRange.addEventListener("focus", () => cancelAnimationFrame(heroFrame));
heroRange.addEventListener("pointerdown", () => cancelAnimationFrame(heroFrame));
heroRange.addEventListener("input", () => {
  cancelAnimationFrame(heroFrame);
  updateHeroClip();
});
updateHeroClip();
heroRange.disabled = !canClip;

if (canClip && !reduceMotion.matches && !document.hidden && window.scrollY === 0 && heroClip.getBoundingClientRect().top < innerHeight) {
  const initial = heroRange.valueAsNumber;
  const end = 76;
  const start = performance.now();
  function reveal(now: number) {
    if (reduceMotion.matches || document.hidden) return;
    const progress = clamp((now - start) / 680);
    heroRange.valueAsNumber = Math.round(initial + (end - initial) * (1 - (1 - progress) ** 4));
    updateHeroClip();
    if (progress < 1) heroFrame = requestAnimationFrame(reveal);
  }
  heroFrame = requestAnimationFrame(reveal);
}

const typeItems = [...document.querySelectorAll<HTMLElement>("#types .type-item")];
const typeArt = [...document.querySelectorAll<HTMLElement>("#types .type-art")];
const typeCurrent = document.querySelector<HTMLAnchorElement>("#types .type-current")!;
const typeCurrentTitle = typeCurrent.querySelector<HTMLElement>("[data-type-current-title]")!;
const typeCurrentScene = typeCurrent.querySelector<HTMLElement>("[data-type-current-scene]")!;

function selectType(target: HTMLElement, fromPointer = false) {
  const expanded = typeItems.find((item) => item.classList.contains("is-active"));
  if (expanded === target) return;
  const focused = document.activeElement;
  const focusInDetail = expanded?.querySelector(".type-detail")?.contains(focused);
  if (fromPointer && (focusInDetail || typeCurrent.contains(focused))) return;
  if (focusInDetail) target.querySelector("button")!.focus({ preventScroll: true });

  for (const item of typeItems) {
    const active = item === target;
    item.classList.toggle("is-active", active);
    item.querySelector("button")!.setAttribute("aria-expanded", String(active));
    item.querySelector<HTMLElement>(".type-detail")!.inert = !active;
  }
  for (const art of typeArt) {
    const active = art.dataset.art === target.dataset.type;
    art.classList.toggle("is-active", active);
    art.setAttribute("aria-hidden", String(!active));
  }

  typeCurrent.href = target.querySelector<HTMLAnchorElement>(".type-link")!.href;
  typeCurrentTitle.textContent = target.querySelector(".type-title")!.textContent;
  typeCurrentScene.textContent = target.querySelector(".type-uses li")!.textContent;
}

for (const item of typeItems) {
  const button = item.querySelector("button")!;
  button.addEventListener("click", () => selectType(item));
  // A row moving under a stationary mouse must not select another case.
  button.addEventListener("pointermove", (event) => {
    if (event.pointerType === "mouse" && hover.matches) selectType(item, true);
  });
}

const compareStage = document.querySelector<HTMLElement>("#compare-stage")!;
const compareRange = document.querySelector<HTMLInputElement>("#compare-range")!;
const compareValue = document.querySelector<HTMLOutputElement>("#compare-value")!;

function updateComparison() {
  const progress = `${compareRange.value}%`;
  compareStage.style.setProperty("--compare-progress", progress);
  compareValue.value = progress;
  compareRange.setAttribute("aria-valuetext", progress);
}

compareRange.addEventListener("input", updateComparison);
updateComparison();
compareRange.disabled = false;

const receipts = document.querySelector<HTMLElement>(".receipts")!;
if ("IntersectionObserver" in window && !reduceMotion.matches && receipts.getBoundingClientRect().top >= innerHeight) {
  const counters = [...receipts.querySelectorAll("b")].map((number) => ({ number, target: Number(number.textContent) }));
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some(({ isIntersecting }) => isIntersecting)) return;
    observer.disconnect();
    if (reduceMotion.matches) return;
    const start = performance.now();
    const frame = (now: number) => {
      const progress = reduceMotion.matches ? 1 : clamp((now - start) / 1100);
      const ease = 1 - (1 - progress) ** 3;
      for (const { number, target } of counters) number.textContent = String(Math.round(target * ease));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, { threshold: 0.3 });
  observer.observe(receipts);
}

const ctaPrompt = document.querySelector<HTMLElement>("#cta-prompt")!;
if ("IntersectionObserver" in window && ctaPrompt.dataset.prompts) {
  const prompts: string[] = JSON.parse(ctaPrompt.dataset.prompts);
  let index = 0;
  let timeout = 0;
  function typeNext() {
    index = (index + 1) % prompts.length;
    const next = prompts[index];
    let cursor = 0;
    function type() {
      if (reduceMotion.matches) {
        ctaPrompt.textContent = next;
        return;
      }
      ctaPrompt.textContent = next.slice(0, ++cursor);
      timeout = window.setTimeout(cursor === next.length ? typeNext : type, cursor === next.length ? 2600 : 58);
    }
    type();
  }
  const observer = new IntersectionObserver(([entry]) => {
    window.clearTimeout(timeout);
    ctaPrompt.textContent = prompts[index];
    if (entry.isIntersecting && !reduceMotion.matches) timeout = window.setTimeout(typeNext, 2600);
  });
  observer.observe(ctaPrompt);
}

for (const button of document.querySelectorAll<HTMLButtonElement>(".cmd-copy")) {
  let attempt = 0;
  const status = document.getElementById(button.getAttribute("aria-describedby")!);
  button.addEventListener("click", async () => {
    if (!status) return;
    const current = ++attempt;
    const source = button.dataset.copyFrom ? document.getElementById(button.dataset.copyFrom) : undefined;
    const text = source instanceof HTMLTemplateElement
      ? source.content.textContent || ""
      : new URL(button.dataset.copyUrl || "", location.href).href;
    status.textContent = "";
    const copied = await copyText(text, () => current === attempt);
    if (current !== attempt) return;
    status.textContent = copied ? "已复制。" : "复制失败，可以打开独立示例。";
  });
}

const demoOpen = document.querySelector<HTMLAnchorElement>("#demo-open")!;
const demoDialog = document.querySelector<HTMLDialogElement>("#demo-dialog")!;
const demoClose = document.querySelector<HTMLButtonElement>("#demo-close")!;
const demoFrame = demoDialog.querySelector<HTMLIFrameElement>("iframe")!;
demoOpen.addEventListener("click", (event) => {
  if (typeof demoDialog.showModal !== "function" || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const exampleUrl = new URL(demoOpen.href);
  if (document.documentElement.dataset.theme === "dark") exampleUrl.searchParams.set("theme", "dark");
  demoDialog.showModal();
  demoFrame.src = exampleUrl.href;
  document.documentElement.classList.add("demo-lock");
});
demoClose.addEventListener("click", () => demoDialog.close());
demoDialog.addEventListener("click", (event) => {
  if (event.target === demoDialog) demoDialog.close();
});
demoFrame.addEventListener("load", () => {
  if (!demoDialog.open) return;
  demoFrame.contentDocument?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") demoDialog.close();
  });
});
demoDialog.addEventListener("close", () => {
  demoFrame.removeAttribute("src");
  document.documentElement.classList.remove("demo-lock");
  demoOpen.focus({ preventScroll: true });
});
