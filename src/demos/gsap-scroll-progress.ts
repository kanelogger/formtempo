import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { bindScrollProgress } from './scroll-progress-interaction.js';

gsap.registerPlugin(ScrollTrigger);

export function bindGsapProgress(root: HTMLElement, render: (progress: number) => void) {
  bindScrollProgress(root, render, (measure, update) => {
    const trigger = ScrollTrigger.create({
      start: () => measure().start,
      end: () => measure().end,
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => update(self.progress),
    });
    update(trigger.progress);
    return { refresh: () => trigger.refresh(), destroy: () => trigger.kill() };
  });
}

export function bindProgressProperty(root: HTMLElement, property: string) {
  const setProgress = gsap.quickSetter(root, property);
  bindGsapProgress(root, (progress) => setProgress(progress));
}
