// Shared by the atlas and the standalone GSAP source.
export function createSnapDriver(gsap, ScrollTrigger, viewport, sync, measure) {
  const last = viewport.querySelectorAll('[data-snap-chapter]').length - 1;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  gsap.registerPlugin(ScrollTrigger);
  let trigger;
  function connect() {
    trigger?.kill();
    gsap.killTweensOf(viewport, 'scrollTop');
    // Let the browser place reduced-motion gestures without an animated snap.
    viewport.style.scrollSnapType = motion.matches ? 'y mandatory' : 'none';
    trigger = ScrollTrigger.create({
      scroller: viewport,
      start: 0,
      end: () => viewport.scrollHeight - viewport.clientHeight,
      snap: motion.matches ? false : { snapTo: 1 / last, inertia: false, duration: .28, ease: 'power2.out' },
      onUpdate: sync,
      onRefresh: measure,
    });
  }
  connect();
  motion.addEventListener('change', connect);
  const stop = () => {
    gsap.killTweensOf(viewport, 'scrollTop');
    trigger.getTween(true)?.kill();
  };
  viewport.addEventListener('wheel', stop, { passive: true });
  viewport.addEventListener('pointerdown', stop);
  viewport.addEventListener('keydown', stop);
  return {
    stop,
    goTo(top) {
      stop();
      gsap.to(viewport, { scrollTop: top, duration: motion.matches ? 0 : .36, ease: 'power2.out', onUpdate: sync });
    },
  };
}
