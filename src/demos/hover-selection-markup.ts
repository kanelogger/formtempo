import { galleryArtwork } from './gallery-art';

export const selectionTitles = {
  'hover-accordion': '悬停式手风琴',
  'hover-preview': '悬停预览',
  'shared-hover-marker': '共享悬停标记',
} as const;

export type SelectionVariant = keyof typeof selectionTitles;

const artworkDetails = ['日轮与两道拱门', '三块色面折成棱角', '一圈斜轨绕过球面'];
const lineWeights = [
  ['细线', '0.5 mm'],
  ['中线', '1.0 mm'],
  ['粗线', '2.0 mm'],
];

function choice(index: number, content: string) {
  return `<button type="button" data-choice="${index}" aria-pressed="${index === 0}" disabled>${content}</button>`;
}

function accordion() {
  const cards = galleryArtwork.map(({ caption, markup }, index) => choice(index, `
    <svg viewBox="0 0 760 430" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${markup}</svg>
    <span class="hs-card-caption"><strong>${caption}</strong><span>${artworkDetails[index]}</span></span>`));
  return `<div class="hs-accordion" role="group" aria-label="作品卡片">${cards.join('')}</div>`;
}

function preview() {
  const choices = galleryArtwork.map(({ caption }, index) => choice(index, caption));
  const images = galleryArtwork.map(({ markup }, index) =>
    `<g data-preview-art="${index}" opacity="${index === 0 ? 1 : 0}">${markup}</g>`);
  return `<div class="hs-preview">
    <div class="hs-preview-choices" role="group" aria-label="选择预览作品">${choices.join('')}</div>
    <svg data-preview-frame viewBox="0 0 760 430" role="img" aria-label="${galleryArtwork[0].caption}">${images.join('')}</svg>
  </div>`;
}

function marker() {
  const choices = lineWeights.map(([label, weight], index) =>
    choice(index, `<span>${label}</span><small>${weight}</small>`));
  return `<div class="hs-marker-stage"><div class="hs-marker-list" role="group" aria-label="线宽">
    <span class="hs-marker-slot" aria-hidden="true"><i data-shared-marker></i></span>
    ${choices.join('')}
  </div></div>`;
}

export function hoverSelectionMarkup(variant: SelectionVariant) {
  const content = {
    'hover-accordion': accordion,
    'hover-preview': preview,
    'shared-hover-marker': marker,
  }[variant]();
  return `<section class="hover-selection" data-hover-selection="${variant}" aria-label="${selectionTitles[variant]}试玩">
    ${content}
    <p class="hs-hint">移入、点按或用 Tab 键切换选项。</p>
  </section>`;
}
