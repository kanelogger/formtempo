export function bindHoverReveal(root, animate) {
  const card = root.querySelector('.hover-reveal__card');
  const info = root.querySelector('.hover-reveal__info');
  const button = root.querySelector('[data-reveal-toggle]');
  let pinned = false;
  let hovered = false;
  function render() {
    const open = pinned || hovered;
    info.setAttribute('aria-hidden', String(!open));
    button.setAttribute('aria-expanded', String(open));
    button.textContent = pinned ? '收起说明' : '保持显示说明';
    if (animate) animate(info, open);
  }
  card.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') { hovered = true; render(); } });
  card.addEventListener('pointerleave', (event) => { if (event.pointerType === 'mouse') { hovered = false; render(); } });
  button.addEventListener('click', () => { pinned = !pinned; render(); });
  root.addEventListener('formtempo:guide-reset', () => {
    pinned = false;
    hovered = false;
    render();
  });
  root.classList.add('is-ready');
  button.hidden = false;
  render();
}
