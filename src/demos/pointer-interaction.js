const directionNames = { top: '上', right: '右', bottom: '下', left: '左' };
const offsets = {
  top: 'translate(0%, -100%)',
  right: 'translate(100%, 0%)',
  bottom: 'translate(0%, 100%)',
  left: 'translate(-100%, 0%)',
};
const center = 'translate(0%, 0%)';
const tapSlop = 8;

/** @param {PointerEvent} event @param {Element} card */
function pointerSide(event, card) {
  const { left, top, width, height } = card.getBoundingClientRect();
  const x = (event.clientX - left) / (width / 2) - 1;
  const y = (event.clientY - top) / (height / 2) - 1;

  // Horizontal wins on the diagonals. The exact center counts as right.
  if (Math.abs(x) >= Math.abs(y)) return x < 0 ? 'left' : 'right';
  return y < 0 ? 'top' : 'bottom';
}

/** @param {HTMLElement} panel @param {string} from @param {string} to */
function animateNative(panel, from, to) {
  const motion = panel.animate([{ transform: from }, { transform: to }], {
    duration: 380,
    easing: 'cubic-bezier(.22, 1, .36, 1)',
  });
  return { moving: () => motion.playState === 'running', stop: () => motion.cancel() };
}

/** @param {HTMLElement} root @param {typeof animateNative} [animate] */
export function bindPointerStage(root, animate = animateNative) {
  const card = root.querySelector('[data-pointer-card]');
  const panel = root.querySelector('[data-pointer-panel]');
  const controls = root.querySelector('[data-pointer-controls]');
  const status = root.querySelector('[data-pointer-status]');
  if (!(card instanceof HTMLElement) || !(panel instanceof HTMLElement) || !(controls instanceof HTMLElement) || !status) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const variant = root.dataset.pointerVariant;
  let open = false;
  /** @type {ReturnType<typeof animateNative> | undefined} */
  let motion;
  /** @type {{id: number, x: number, y: number} | undefined} */
  let tap;

  /** @param {boolean} entering @param {keyof typeof offsets} requestedSide */
  const setState = (entering, requestedSide) => {
    const side = variant === 'direction-aware' ? requestedSide
      : variant === 'asymmetric-transition' && !entering ? 'right' : 'left';
    const outside = offsets[side];
    const target = entering ? center : outside;
    const from = motion?.moving() && entering !== open ? getComputedStyle(panel).transform
      : entering ? outside : center;
    motion?.stop();
    motion = undefined;
    open = entering;
    card.dataset.pointerState = entering ? 'open' : 'closed';
    card.dataset.pointerSide = side;
    panel.style.transform = target;
    status.textContent = `${entering ? '从' : '向'}${directionNames[side]}侧${entering ? '进入' : '离开'}`;
    if (!reduced.matches && typeof panel.animate === 'function') motion = animate(panel, from, target);
  };

  card.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') setState(true, pointerSide(event, card));
  });
  card.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse') setState(false, pointerSide(event, card));
    else if (tap?.id === event.pointerId) tap = undefined;
  });
  card.addEventListener('pointerdown', (event) => {
    if ((event.pointerType === 'touch' || event.pointerType === 'pen') && event.isPrimary && event.button === 0) {
      tap = { id: event.pointerId, x: event.clientX, y: event.clientY };
    }
  });
  /** @param {PointerEvent} event */
  function clearMovedTap(event) {
    if (tap?.id === event.pointerId && Math.hypot(event.clientX - tap.x, event.clientY - tap.y) > tapSlop) tap = undefined;
  }
  card.addEventListener('pointermove', clearMovedTap);
  card.addEventListener('pointercancel', (event) => {
    if (tap?.id === event.pointerId) tap = undefined;
  });
  card.addEventListener('pointerup', (event) => {
    clearMovedTap(event);
    if (tap?.id !== event.pointerId) return;
    tap = undefined;
    setState(!open, pointerSide(event, card));
  });
  root.addEventListener('formtempo:guide-reset', () => {
    motion?.stop();
    motion = undefined;
    tap = undefined;
    open = false;
    card.dataset.pointerState = 'closed';
    delete card.dataset.pointerSide;
    status.textContent = '等待操作';
    panel.style.transform = offsets.left;
  });
  controls.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest('button[data-pointer-action]');
    if (!(button instanceof HTMLButtonElement)) return;
    const requestedSide = button.dataset.side;
    const side = requestedSide === 'top' || requestedSide === 'right' || requestedSide === 'bottom'
      ? requestedSide : 'left';
    setState(button.dataset.pointerAction === 'enter', side);
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) motion?.stop();
  });
  controls.hidden = false;
}
