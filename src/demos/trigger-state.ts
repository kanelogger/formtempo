export type TriggerVariant = 'enter-once' | 'forward-reversible' | 'bidirectional-reveal';
export type TriggerPosition = 'before' | 'inside' | 'after';

export const positions: readonly TriggerPosition[] = ['before', 'inside', 'after'];
export const eventLabels = ['向下进入', '向下离开', '向上回进', '向上离开'] as const;
export const positionLabels = { before: '起点前', inside: '区间内', after: '终点后' } as const;
export const triggerCases = {
  'enter-once': { name: '单次入场', actions: ['play', 'none', 'none', 'none'] },
  'forward-reversible': { name: '单向可逆', actions: ['play', 'none', 'none', 'reset'] },
  'bidirectional-reveal': { name: '双向揭示', actions: ['play', 'reset', 'play', 'reset'] },
} as const satisfies Record<TriggerVariant, { name: string; actions: readonly string[] }>;

export function regionAt(scroll: number, start: number, end: number): TriggerPosition {
  if (scroll <= start) return 'before';
  return scroll >= end ? 'after' : 'inside';
}

export function revealAtLoad(variant: TriggerVariant, region: TriggerPosition): boolean {
  return region === 'inside' || (region === 'after' && variant !== 'bidirectional-reveal');
}

export function crossedBoundaries(from: TriggerPosition, to: TriggerPosition): number[] {
  const previous = positions.indexOf(from);
  const current = positions.indexOf(to);
  const events: number[] = [];

  if (previous < current) {
    for (let edge = previous; edge < current; edge++) events.push(edge);
  } else {
    for (let edge = previous; edge > current; edge--) events.push(4 - edge);
  }

  return events;
}
