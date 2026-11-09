/** @param {HTMLElement} root */
export function createSoftMaskRenderer(root) {
  const stage = root.querySelector('[data-soft-mask-reveal]');

  return (progress) => {
    stage.style.setProperty('--soft-mask-progress', String(progress));
    const state = progress === 0 ? 'empty' : progress === 1 ? 'full' : 'partial';
    if (stage.dataset.maskState !== state) stage.dataset.maskState = state;
  };
}
