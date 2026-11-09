type Point = readonly [number, number];
type Step = {
  text: string;
  target: string;
  action: 'enter' | 'leave' | 'move' | 'click' | 'progress';
  point?: Point;
  value?: number;
  duration?: number;
  hold?: number;
};

export type DemoGuide = {
  view: string;
  steps: Step[];
  dock?: string;
  reset?: string;
  release?: string;
  ready?: string;
  pageScrollInput?: boolean;
  reducedSteps?: Step[];
};

const card = '[data-pointer-card]';
const hover = '.hover-reveal__card';
const magnetic = '[data-magnetic-hit]';
const pulse = '[data-pulse-stage]';
const transitionView = '[data-transition-viewport]';
const transitionTarget = '[data-transition-guide-target]';
const slider = 'input[type="range"]';

const pointer = (target: string, action: 'enter' | 'leave' | 'move', text: string, point: Point, hold?: number): Step =>
  ({ target, action, text, point, hold });

const click = (target: string, text: string, hold?: number): Step => ({ target, action: 'click', text, hold });

const pointerPath = (exit: Point, exitText: string): DemoGuide => ({
  view: card,
  reset: '[data-pointer-variant]',
  steps: [
    pointer(card, 'enter', '指针从左侧进入，揭示层随之滑入。', [.08, .5]),
    pointer(card, 'leave', exitText, exit),
  ],
});

function trigger(enterText: string, leaveText: string, returnText: string, exitText: string): DemoGuide {
  return {
    view: '.trigger-composition, .stage .window',
    dock: '.trigger-stage, .track .stage',
    reset: '[data-trigger-variant], body[data-engine]',
    pageScrollInput: true,
    steps: [enterText, leaveText, returnText, exitText].map((text, index) =>
      click(`[data-trigger-event="${index}"], [data-event="${index}"]`, text, 470)),
  };
}

function progress(
  view: string,
  dock: string,
  reset: string,
  captions: [string, string, string, string],
  ready?: string,
): DemoGuide {
  return {
    view, dock, reset, ready,
    steps: [0, 50, 100, 50].map((value, index) => ({
      text: captions[index], target: slider, action: 'progress', value,
      duration: index === 0 ? 0 : 600, hold: index === 1 ? 600 : 360,
    })),
  };
}

function driven(captions: [string, string, string, string]) {
  const guide = progress('.driven-stage, .track .stage', '.driven-sticky, .track .sticky', '[data-driven], .track', captions);
  return { ...guide, reducedSteps: [guide.steps[0], guide.steps[2]] };
}

function scrollProgress(view: string, captions: [string, string, string, string], ready?: string) {
  return progress(view, '[data-progress-panel]', '[data-scroll-progress]', captions, ready);
}

function transition(text: string): DemoGuide {
  return {
    view: transitionView, reset: '[data-transition-variant]',
    steps: [click(transitionTarget, text, 700)],
  };
}

export const demoGuides: Readonly<Record<string, DemoGuide>> = {
  'symmetric-transition': pointerPath([-.05, .5], '指针移出，揭示层沿原路退回左侧。'),
  'asymmetric-transition': pointerPath([1.05, .5], '指针移出，揭示层继续向右离开。'),
  'direction-aware': {
    view: card, reset: '[data-pointer-variant]',
    steps: [
      pointer(card, 'enter', '从左边进入，揭示层从左边滑入。', [.08, .5]),
      pointer(card, 'leave', '从下边离开，揭示层向下退出。', [.5, 1.05]),
      pointer(card, 'enter', '换到右边进入，揭示方向也随之改变。', [.92, .5]),
      pointer(card, 'leave', '从上边离开，揭示层向上退出。', [.5, -.05]),
    ],
  },
  'magnetic-button': {
    view: magnetic, release: magnetic,
    reducedSteps: [click(magnetic, '减少动态效果时，按钮保持原位，仍可点按确认。')],
    steps: [
      pointer(magnetic, 'move', '指针靠左时，按钮视觉层向左偏移。', [.12, .45], 360),
      pointer(magnetic, 'move', '移向右下角，按钮跟着偏移。', [.88, .8], 360),
      pointer(magnetic, 'leave', '离开热区，按钮回到虚线标出的原位。', [1.15, .85]),
    ],
  },
  'pointer-enter-once': {
    view: pulse,
    steps: [
      pointer(pulse, 'enter', '指针移入卡片，轮廓开始播放。', [.25, .45], 40),
      pointer(pulse, 'leave', '指针已离开，轮廓仍会播完。', [-.05, .45], 710),
    ],
  },
  'hover-reveal': {
    view: hover, reset: '[data-hover-reveal]', release: hover,
    steps: [
      pointer(hover, 'enter', '指针移入，作品说明出现。', [.45, .65], 600),
      pointer(hover, 'leave', '指针移出，说明收起。也可用按钮保持显示。', [.45, -.06]),
    ],
  },
  'enter-once': trigger(
    '向下进入区间，首次揭示。',
    '从下方离开，内容仍然可见。',
    '向上回到区间，保留已揭示状态。',
    '退回起点前，单次入场仍然保持完成。',
  ),
  'forward-reversible': trigger(
    '向下穿过起点，内容揭示。',
    '越过终点，保留揭示状态。',
    '从下方回到区间，内容仍然可见。',
    '向上退回起点前，内容复位。',
  ),
  'bidirectional-reveal': trigger(
    '向下进入区间，内容揭示。',
    '从下方离开区间，内容复位。',
    '从下方返回区间，内容再次揭示。',
    '从上方离开区间，内容再次复位。',
  ),
  'section-snap': {
    view: '[data-snap-viewport]', reset: '[data-section-snap]',
    steps: [
      click('[data-snap-next]', '向下浏览，画面停靠在第二节。', 650),
      click('[data-snap-next]', '继续向下，停靠在第三节。', 650),
      click('[data-snap-prev]', '反向浏览，回到上一节的停靠点。', 650),
    ],
  },
  'clip-reveal': driven([
    '从裁剪起点开始，画面中心闭合。', '开到一半，图像原位保留，四周裁剪线向外移动。',
    '进度到达终点，露出完整画面。', '进度回退，裁剪线沿原路收拢。',
  ]),
  'layered-parallax': driven([
    '记住前景和远景的起始位置。', '进度推进，观察前后图层的位移差。',
    '到达终点，各层走过的距离不同。', '进度回退，各层沿原路径返回。',
  ]),
  'horizontal-gallery': driven([
    '从首幅作品开始。', '进度向前，画廊横向移动到中间作品。',
    '进度到达终点，看到最后一幅。', '反向操作，回到中间作品。',
  ]),
  'scale-reveal': progress('.scale-reveal__pair', '[data-scale-panel]', '[data-scale-reveal]', [
    '从中心开始比较裁剪与缩放。', '到达一半时，左侧只露出原图中心，右侧显示缩小的完整画面。',
    '到达终点，两侧都是完整图像。', '退回一半，再看两种变化的差别。',
  ]),
  'video-scrub': scrollProgress('.video-scrub__screen', [
    '将暂停的视频定位到第一帧。', '进度走到一半，停住观察这一帧。',
    '进度到达终点，画面停在最后一帧。', '进度回退，视频回到中间帧。',
  ], '[data-video-state="ready"]'),
  'soft-mask-reveal': scrollProgress('[data-soft-mask-reveal]', [
    '从关闭的可见区域开始。', '同样的进度下，比较清晰的裁剪线和渐隐的软边。',
    '展开到终点，两边都显示完整画面。', '回到一半，再看边缘和四角的差别。',
  ]),
  'scroll-camera': scrollProgress('[data-camera-stage]', [
    '在起始视点观察门柱与远处日轮。', '镜头横移，门柱与日轮的相对位置发生变化。',
    '移动到另一侧，观察新的遮挡关系。', '反向移动，遮挡也随视点返回。',
  ]),
  'scroll-3d-model': scrollProgress('.scroll-model__canvas', [
    '从六个面合拢的立方体开始。', '进度推进，立方体旋转，各面向外移开。',
    '进度到达终点，六个面完全展开。', '进度回退，各面随旋转向中心收拢。',
  ]),
  'scroll-3d-scene': scrollProgress('.scroll-scene__canvas', [
    '从日间展厅开始。', '日间展厅后退，夜间展厅向前进入。',
    '夜间展厅到达前景。', '进度回退，日间展厅重新进入画面。',
  ]),
  'mask-transition': transition('点按作品，遮罩完全覆盖目录后才换成详情。'),
  'overlap-transition': transition('点按作品，观察目录和详情短暂交叠。'),
  'shared-element': transition('点按作品，追踪同一张图从目录卡片移动到详情。'),
};
