import { hoverExampleDocument } from './hover-example-document';
import { hoverTargetMarkup, targetTitles, type TargetVariant } from './hover-target-markup';
import cursorSource from './hover-target-cursor.js?raw';
import cardSource from './hover-target-card.js?raw';
import styles from './hover-target.css?raw';

const gsapCursor = `function positionWithGsap(proxy, x, y, duration) {
  gsap.killTweensOf(proxy);
  gsap.to(proxy, { xPercent: x, yPercent: y, x: 0, y: 0, duration: duration / 1000, ease: 'power2.out' });
}`;
const gsapCard = `function revealWithGsap(inks) {
  const tween = gsap.fromTo(inks, { opacity: .25, y: -4 }, {
    opacity: 1, y: 0, duration: .16, ease: 'power2.out', clearProps: 'opacity,transform',
  });
  return { cancel() { tween.kill(); gsap.set(inks, { clearProps: 'opacity,transform' }); } };
}`;

function documentFor(variant: TargetVariant, gsap: boolean) {
  const cursor = variant === 'magnetic-cursor';
  const source = (cursor ? cursorSource : cardSource).replace(/^export function /m, 'function ');
  const binder = cursor ? 'bindMagneticCursor' : 'bindHoverCard';
  const adapter = cursor ? 'positionWithGsap' : 'revealWithGsap';
  const args = gsap ? `, window.gsap ? ${adapter} : undefined` : '';
  const script = `${source}
${gsap ? (cursor ? gsapCursor : gsapCard) : ''}
${binder}(document.querySelector('[data-hover-target]')${args});`;
  return hoverExampleDocument(targetTitles[variant], hoverTargetMarkup(variant), styles, script, gsap);
}

export const hoverTargetExamples = Object.fromEntries(
  (Object.keys(targetTitles) as TargetVariant[]).map((variant) => [
    variant, { native: documentFor(variant, false), gsap: documentFor(variant, true) },
  ]),
);
