/** @param {typeof import('gsap').gsap} gsap @param {HTMLElement} panel @param {string} from @param {string} to */
export function animatePointer(gsap, panel, from, to) {
  const settle = () => { panel.style.transform = to; };
  const tween = gsap.fromTo(panel, { transform: from }, {
    transform: to, duration: .38, ease: 'power3.out', onComplete: settle,
  });
  return {
    moving: () => tween.isActive(),
    stop() {
      tween.kill();
      settle();
    },
  };
}
