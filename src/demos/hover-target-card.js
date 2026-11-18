function revealInks(inks) {
  return inks.animate([
    { opacity: .25, transform: 'translateY(-4px)' },
    { opacity: 1, transform: 'translateY(0)' },
  ], { duration: 160, easing: 'ease-out' });
}

export function bindHoverCard(root, reveal = revealInks) {
  const anchor = root.querySelector('[data-card-anchor]');
  const button = root.querySelector('[data-card-trigger]');
  const panel = root.querySelector('[data-card-panel]');
  const inks = panel.firstElementChild;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let animation;
  let keyboardFocused = false;
  let pointerPress = false;

  function display(open) {
    if (open === !panel.hidden) return;
    animation?.cancel();
    animation = undefined;
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open && !reduced.matches) animation = reveal(inks);
  }
  function dismiss() {
    keyboardFocused = false;
    display(false);
  }

  // The panel's top padding belongs to the same hit area as the button.
  anchor.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') display(true);
  });
  anchor.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse' && !keyboardFocused) display(false);
  });
  document.addEventListener('pointerdown', (event) => {
    pointerPress = anchor.contains(event.target);
    keyboardFocused = false;
    if (!pointerPress) display(false);
  });
  document.addEventListener('pointerup', () => { pointerPress = false; });
  document.addEventListener('pointercancel', () => { pointerPress = false; });
  button.addEventListener('focus', () => {
    if (!pointerPress && button.matches(':focus-visible')) {
      keyboardFocused = true;
      display(true);
    }
  });
  anchor.addEventListener('focusout', (event) => {
    if (!pointerPress && !anchor.contains(event.relatedTarget)) dismiss();
  });
  button.addEventListener('click', () => display(panel.hidden));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') dismiss();
  });
  window.addEventListener('blur', dismiss);
  reduced.addEventListener('change', () => { animation?.cancel(); });
  root.addEventListener('formtempo:guide-reset', dismiss);
  button.hidden = false;
  display(false);
}
