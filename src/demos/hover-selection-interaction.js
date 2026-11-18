function animateSelectionPart(target, property, value, duration) {
  if (property === 'yPercent') {
    property = 'transform';
    value = `translateY(${value}%)`;
  } else if (property === 'rotation') {
    property = 'transform';
    value = `rotate(${value}deg)`;
  }
  const from = getComputedStyle(target)[property];
  target.getAnimations().forEach((animation) => animation.cancel());
  target.style[property] = value;
  if (duration) {
    target.animate([{ [property]: from }, { [property]: value }], {
      duration, easing: 'cubic-bezier(.22, 1, .36, 1)',
    });
  }
}

export function bindHoverSelection(root, animate = animateSelectionPart) {
  const choices = Array.from(root.querySelectorAll('[data-choice]'));
  const frame = root.querySelector('[data-preview-frame]');
  const images = root.querySelectorAll('[data-preview-art]');
  const marker = root.querySelector('[data-shared-marker]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = -1;

  function show(index, immediate = false) {
    if (index === selected && !immediate) return;
    selected = index;
    const duration = immediate || reduced.matches ? 0 : 320;
    choices.forEach((choice, position) => {
      choice.setAttribute('aria-pressed', String(index === position));
    });
    if (frame) {
      frame.setAttribute('aria-label', choices[index].textContent.trim());
      images.forEach((image, position) => animate(image, 'opacity', index === position ? '1' : '0', duration));
    } else if (marker) {
      // The slot is one row tall, so a 100% translation always advances one row.
      animate(marker.parentElement, 'yPercent', index * 100, duration);
      animate(marker, 'rotation', index * 45, duration);
    } else {
      choices.forEach((choice, position) => animate(choice, 'flexGrow', index === position ? '3.5' : '1', duration));
    }
  }

  choices.forEach((choice, index) => {
    choice.disabled = false;
    choice.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'touch') show(index);
    });
    choice.addEventListener('focus', () => show(index));
    choice.addEventListener('click', () => show(index));
  });
  root.addEventListener('formtempo:guide-reset', () => show(0, true));
  reduced.addEventListener('change', () => show(selected, true));
  show(0, true);
}
