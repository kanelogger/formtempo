function positionCursor(proxy, x, y, duration) {
  proxy.style.transition = duration ? `transform ${duration}ms ease-out` : 'none';
  proxy.style.transform = `translate(${x}%, ${y}%)`;
}

export function bindMagneticCursor(root, position = positionCursor) {
  const field = root.querySelector('[data-cursor-field]');
  const target = root.querySelector('[data-cursor-target]');
  const proxy = root.querySelector('[data-cursor-proxy]');
  const toggle = root.querySelector('[data-cursor-toggle]');
  const status = root.querySelector('[data-target-status]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const labels = { idle: '等待移入', free: '自由移动', locked: '已吸附到圆心' };

  function show(state, x, y, ease = false) {
    const previous = root.dataset.state;
    if (state !== previous) {
      root.dataset.state = state;
      status.textContent = labels[state];
      toggle.textContent = state === 'locked' ? '释放光标' : '吸附光标';
    }
    if (state === 'locked' && previous === state) return;
    position(proxy, x, y, ease && !reduced.matches ? 160 : 0);
  }

  function reset() {
    delete root.dataset.input;
    show('idle', 22, 64);
  }

  function track(event) {
    const bounds = field.getBoundingClientRect();
    const circle = target.getBoundingClientRect();
    const centerX = circle.left + circle.width / 2;
    const centerY = circle.top + circle.height / 2;
    const locked = Math.hypot(event.clientX - centerX, event.clientY - centerY) <= circle.width / 2;
    const x = locked ? centerX : event.clientX;
    const y = locked ? centerY : event.clientY;
    root.dataset.input = event.pointerType;
    show(locked ? 'locked' : 'free', 100 * (x - bounds.left) / bounds.width,
      100 * (y - bounds.top) / bounds.height, locked);
  }

  function moveMouse(event) {
    if (event.pointerType === 'mouse') track(event);
  }
  field.addEventListener('pointerenter', moveMouse);
  field.addEventListener('pointermove', moveMouse);
  field.addEventListener('pointerdown', track);
  field.addEventListener('pointerleave', (event) => {
    // Keep the result of a touchscreen tap readable after lifting the finger.
    if (event.pointerType === 'mouse') reset();
  });
  field.addEventListener('pointercancel', reset);
  toggle.addEventListener('click', () => {
    delete root.dataset.input;
    if (root.dataset.state === 'locked') show('free', 22, 64, true);
    else show('locked', 100 * target.offsetLeft / field.clientWidth,
      100 * target.offsetTop / field.clientHeight, true);
  });
  window.addEventListener('blur', reset);
  reduced.addEventListener('change', reset);
  root.addEventListener('formtempo:guide-reset', reset);
  root.addEventListener('formtempo:guide-cancel', reset);
  toggle.hidden = false;
  reset();
}
