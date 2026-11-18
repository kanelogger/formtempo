/** @param {HTMLElement} root @param {typeof import('gsap').gsap} [gsap] */
export function bindHoverGrid(root, gsap) {
  const board = root.querySelector('[data-grid-board]');
  const cells = [...board.querySelectorAll('[data-cell]')];
  const modes = [...root.querySelectorAll('[data-grid-mode]')];
  const clear = root.querySelector('[data-grid-clear]');
  const status = root.querySelector('[data-grid-status]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const columns = Number(board.dataset.columns);
  let mode = 'trail';
  let active = null;
  let guideCell = null;
  let touchId = null;
  let tabCell = cells[0];
  root.dataset.engine = gsap ? 'gsap' : 'native';

  function light(cell, on) {
    cell.toggleAttribute('data-lit', on);
    if (gsap) {
      gsap.to(cell.querySelector('.hover-grid__front i'), {
        opacity: on ? 1 : 0, duration: on || reduced.matches ? 0 : .8,
        ease: 'power1.out', overwrite: true,
      });
    }
  }

  function leave(cell) {
    if (!cell || active !== cell) return;
    if (mode === 'trail') light(cell, false);
    active = null;
  }

  function enter(cell, repeat = false) {
    if (!cell || (cell === active && !repeat)) return;
    leave(active);
    active = cell;
    if (mode === 'flip') {
      const back = cell.toggleAttribute('data-back');
      cell.setAttribute('aria-pressed', String(back));
      if (gsap) {
        gsap.to(cell.querySelector('.hover-grid__tile'), {
          rotationY: back ? 180 : 0, duration: reduced.matches ? 0 : .46,
          ease: 'power3.out', overwrite: true,
        });
      }
      status.textContent = cell.getAttribute('aria-label') + (back ? ' · 背面' : ' · 正面');
    } else {
      light(cell, true);
      status.textContent = mode === 'ink'
        ? '已留下 ' + board.querySelectorAll('[data-lit]').length + ' 格'
        : '经过' + cell.getAttribute('aria-label');
    }
  }

  function reset(nextMode) {
    if (touchId !== null && board.hasPointerCapture(touchId)) board.releasePointerCapture(touchId);
    touchId = null;
    active = null;
    guideCell = null;
    mode = nextMode;
    root.dataset.mode = mode;
    for (const button of modes) button.setAttribute('aria-pressed', String(button.dataset.gridMode === mode));
    for (const cell of cells) {
      cell.removeAttribute('data-lit');
      cell.removeAttribute('data-back');
      if (mode === 'flip') cell.setAttribute('aria-pressed', 'false');
      else cell.removeAttribute('aria-pressed');
    }
    if (gsap) {
      const lights = board.querySelectorAll('.hover-grid__front i');
      const tiles = board.querySelectorAll('.hover-grid__tile');
      gsap.killTweensOf([...lights, ...tiles]);
      gsap.set(lights, { opacity: 0 });
      gsap.set(tiles, { rotationY: 0 });
    } else {
      for (const animation of board.getAnimations({ subtree: true })) animation.cancel();
    }
    clear.hidden = mode !== 'ink';
    status.textContent = { trail: '划过格子观察轨迹', ink: '已留下 0 格', flip: '划过卡片翻到另一面' }[mode];
  }

  for (const button of modes) {
    button.addEventListener('click', () => {
      if (button.dataset.gridMode !== mode) reset(button.dataset.gridMode);
    });
  }
  clear.addEventListener('click', () => reset('ink'));
  root.addEventListener('formtempo:guide-reset', () => reset('trail'));
  root.addEventListener('formtempo:guide-cancel', () => {
    if (active === guideCell) leave(active);
    guideCell = null;
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches && gsap) {
      const surfaces = board.querySelectorAll('.hover-grid__front i, .hover-grid__tile');
      for (const tween of gsap.getTweensOf(surfaces)) tween.progress(1);
    }
  });

  for (const cell of cells) {
    cell.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      guideCell = event.isTrusted ? null : cell;
      enter(cell);
    });
    cell.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse') leave(cell);
    });
    cell.addEventListener('focus', () => {
      tabCell.tabIndex = -1;
      tabCell = cell;
      cell.tabIndex = 0;
      if (cell.matches(':focus-visible')) enter(cell);
    });
    cell.addEventListener('blur', () => leave(cell));
    cell.addEventListener('click', (event) => {
      if (event.detail === 0) enter(cell, true);
    });
  }
  board.addEventListener('keydown', (event) => {
    const cell = event.target.closest('[data-cell]');
    if (!cell) return;
    const index = Number(cell.dataset.cell);
    const column = index % columns;
    const nextIndex = {
      ArrowLeft: column > 0 ? index - 1 : index,
      ArrowRight: column < columns - 1 ? index + 1 : index,
      ArrowUp: index - columns, ArrowDown: index + columns,
      Home: 0, End: cells.length - 1,
    }[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    cells[nextIndex]?.focus();
  });

  function touchCell(event) {
    const hit = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-cell]');
    if (hit && board.contains(hit)) enter(hit);
    else leave(active);
  }
  board.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' || touchId !== null) return;
    touchId = event.pointerId;
    board.setPointerCapture(touchId);
    touchCell(event);
  });
  board.addEventListener('pointermove', (event) => {
    if (event.pointerId === touchId) touchCell(event);
    else if (event.pointerType === 'mouse' && event.isTrusted) {
      guideCell = null;
      enter(event.target.closest('[data-cell]'));
    }
  });
  function endTouch(event) {
    if (event.pointerId !== touchId) return;
    touchId = null;
    leave(active);
  }
  for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) board.addEventListener(name, endTouch);
  reset('trail');
}
