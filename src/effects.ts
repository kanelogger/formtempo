export const groups = [
  { id: "pointer", number: "01", title: "指针交互", en: "Pointer", description: "由移入、移出或点按引发变化。" },
  { id: "trigger", number: "02", title: "滚动触发", en: "Scroll trigger", description: "滚过边界时触发一次动作。" },
  { id: "driven", number: "03", title: "滚动驱动", en: "Scroll driven", description: "画面进度随滚动位置前进或回退。" },
  { id: "transition", number: "04", title: "页面转场", en: "View transition", description: "在两个画面之间交代内容如何衔接。" },
] as const;

type Group = (typeof groups)[number]["id"];

type Effect = {
  slug: string;
  group: Group;
  number: string;
  title: string;
  en: string;
  description: string;
  scene: string;
  behavior: string;
  implementation: string;
  compareWith?: string;
};

export const effects: Effect[] = [
  {
    slug: "symmetric-transition", group: "pointer", number: "01",
    title: "对称过渡", en: "Symmetric transition",
    description: "图层沿同一条路径进入和返回。",
    scene: "链接悬停反馈。例如阅读页的目录链接亮起底线，指针离开后底线退回原点。",
    behavior: "进入与离开共用同一对位置，方向相反。移动速度和缓动可以独立选择。",
    implementation: "先固定原点和结束位置，再在两者之间插值。中途改变方向时从当前画面接着动。",
  },
  {
    slug: "asymmetric-transition", group: "pointer", number: "02",
    title: "非对称过渡", en: "Asymmetric transition",
    description: "图层从一侧进入，从另一侧离开。",
    scene: "导航下划线。例如顶部菜单用从左到右的笔势描出链接，移出时继续向右收笔。",
    behavior: "进入和退出各自有一条固定路径，实际指针方位不改变路线。",
    implementation: "给进入和退出分别定义起止状态。连续触发时取消旧动画并从当前变换起步。",
  },
  {
    slug: "direction-aware", group: "pointer", number: "03",
    title: "方向感知", en: "Direction-aware reveal",
    description: "图层跟随指针进出卡片的方位移动。",
    scene: "作品卡片揭示。例如作品集网格让标题或详情图层从指针靠近的一侧出现。",
    behavior: "比较坐标相对卡片中心的归一化偏移。绝对值相等时选水平轴，正中心取右侧。进与出分别判断。",
    implementation: "用固定卡片外框做命中和测量。鼠标进出按 pointerType 分流，触屏和触控笔点按复用同一方向算法。",
  },
  {
    slug: "enter-once", group: "trigger", number: "04",
    title: "单次入场", en: "Enter once",
    description: "首次向下进入时播放，之后保持揭示。",
    scene: "长文小节。例如报道第一次读到图解时让图例显现，读者回看时可直接继续阅读。",
    behavior: "向下穿过起点播放并记录已播放。向上返回或继续向下离开都保留完成状态。",
    implementation: "原生记录一次性状态，GSAP 使用 once: true。复位时回到触发区前并重建触发器。",
  },
  {
    slug: "forward-reversible", group: "trigger", number: "05",
    title: "单向可逆", en: "Forward reversible",
    description: "向下进入时播放，回到起点之前才复位。",
    scene: "产品功能段。例如功能卖点向下首次出现，读者退回前一段再继续时可以重看。",
    behavior: "从下方回到区间仍保持揭示。只有向上穿过起点离开时，才回到起始状态。",
    implementation: "保存上次滚动位置，区分从哪个方向跨越哪条边界。对应 play none none reset。",
  },
  {
    slug: "bidirectional-reveal", group: "trigger", number: "06",
    title: "双向揭示", en: "Bidirectional reveal",
    description: "从两侧进入都播放，离开任一侧就复位。",
    scene: "可往返浏览的作品列表。例如滚动展览里，每次重新经过某一展品都会看到它入场。",
    behavior: "从区间外进入就揭示，从任一边界离开就复位。快速跨过两条边界也落在区间外状态。",
    implementation: "两个进入事件绑定播放，两个离开事件绑定复位。对应 play reset play reset。",
  },
  {
    slug: "clip-reveal", group: "driven", number: "07",
    title: "裁剪展开", en: "Clip reveal",
    description: "图像保持原位，可见区域从中心向四边打开。",
    scene: "产品主图揭示。例如在产品页逐步放开局部细节，最后让读者看到完整轮廓。",
    behavior: "拖动进度或滚动时，可见区域随进度双向变化。中间位置保留同一张图的中心。",
    implementation: "把进度映射为 50% 到 0% 的 inset() 边距。GSAP 使用 clipPath，滚动版本使用 scrub: true。",
  },
  {
    slug: "layered-parallax", group: "driven", number: "08",
    title: "分层视差", en: "Layered parallax",
    description: "前后景以不同距离移动，形成深度差。",
    scene: "分层叙事。例如地点故事用近景地形、中景建筑和远景天空交代空间关系。",
    behavior: "进度由 0 走到 1 时，各图层移动预设距离。反向滚动时各层按原路径返回。",
    implementation: "把同一进度乘上每层位移范围，只更新 transform。固定外框并裁掉画布外的内容。",
  },
  {
    slug: "horizontal-gallery", group: "driven", number: "09",
    title: "横向画廊", en: "Horizontal gallery",
    description: "把纵向滚动进度转换为画廊的横向位移。",
    scene: "系列作品展示。例如同一产品的三代设计依次横向进入画面，方便比较。",
    behavior: "进度为 0 时看到首幅，进度为 1 时到达末幅。滚动和拖动都可以往返。",
    implementation: "用画廊内容宽度减去可见宽度求出位移上限。尺寸变化后更新范围，逐帧只写 transform。",
  },
  {
    slug: "mask-transition", group: "transition", number: "10",
    title: "遮罩式", en: "Mask transition",
    description: "遮罩覆盖舞台时切换内容，再揭开新画面。",
    scene: "章节切换。例如产品故事从设计进入工艺章节时，用一次短暂遮挡划分段落。",
    behavior: "旧画面先被完整覆盖。到达覆盖点时替换内容，再移走遮罩。",
    implementation: "使用固定在舞台内的遮罩。覆盖和离场分别控制 transform，保证切换时没有露底。",
  },
  {
    slug: "overlap-transition", group: "transition", number: "11",
    title: "交叠式", en: "Overlap transition",
    description: "新旧画面短暂共存，再完成交接。",
    scene: "步骤面板切换。例如从配置进入确认步骤时，让前后两步的关系可见。",
    behavior: "两个画面在固定舞台里叠放。旧画面退出的同时，新画面进入。",
    implementation: "用同一时间轴控制两层的位移和透明度，完成后释放旧层的交互状态。",
  },
  {
    slug: "shared-element", group: "transition", number: "12",
    title: "共享元素", en: "Shared element",
    description: "同一个视觉元素连接起两个不同的画面。",
    scene: "从作品卡片进入详情。例如封面图从缩略位置移动到详情主图位置，读者能持续追踪。",
    behavior: "保留一个视觉锚点，让它沿起止位置和尺寸插值，其余内容在同一舞台中切换。",
    implementation: "原生用两次测量和 Web Animations API，GSAP 用 Flip.getState() 与 Flip.from()，启用 scale: true。",
  },
  {
    slug: "magnetic-button", group: "pointer", number: "13",
    title: "磁吸按钮", en: "Magnetic button", compareWith: "direction-aware",
    description: "按钮的视觉层随指针微移，指针离开后回到原位。",
    scene: "主操作按钮。例如作品集的「查看作品」在指针靠近时给出轻微的方向反馈。",
    behavior: "鼠标在固定热区内移动时，按钮视觉层持续跟随坐标，每轴最多偏移 12 px。移出、取消或失焦后回中，触屏点按和键盘操作都能激活按钮。",
    implementation: "以固定热区的中心计算偏移，只对内部视觉层应用 transform。用原位轮廓标出位移基准。",
  },
  {
    slug: "pointer-enter-once", group: "pointer", number: "14",
    title: "移入单次动画", en: "One-shot hover animation", compareWith: "symmetric-transition",
    description: "指针移入时播放一次，移出时动画继续直到结束。",
    scene: "作品卡片的短反馈。例如指针第一次经过卡片时，轮廓亮起一次，随后恢复常态。",
    behavior: "移入即开播。动画播完才接受下一次移入，触屏和键盘可以用「播放一次」触发同一段动画。",
    implementation: "在 pointerenter 或播放按钮的 click 中启动动画。用播放中的状态合并重复触发，等完成后再开放下一次播放。",
  },
  {
    slug: "section-snap", group: "trigger", number: "15",
    title: "分段式滚动", en: "Section snap", compareWith: "horizontal-gallery",
    description: "在三幅作品之间滚动，松手后停靠到其中一节。",
    scene: "分章节浏览作品。例如让读者一次看清一幅作品，再继续滚到下一幅。",
    behavior: "局部纵向滚动在章节边缘停靠，状态栏显示最接近的一节。到达两端后可以继续滚动正文。",
    implementation: "用 CSS Scroll Snap 定义停靠点。原生监听滚动位置，GSAP 用 ScrollTrigger 读取同一容器的进度，两版都按最近停靠点更新章节。",
  },
  {
    slug: "scale-reveal", group: "driven", number: "16",
    title: "缩放显现", en: "Scale reveal", compareWith: "clip-reveal",
    description: "图像从中心放大，同一进度下可与裁剪范围的变化对照。",
    scene: "产品图的整体呈现。例如从小尺寸到原尺寸逐渐带出一幅完整插图。",
    behavior: "两幅图共用同一进度。50% 时裁剪侧显示原尺寸画面的中心，缩放侧显示半尺寸的完整画面。",
    implementation: "把 0 到 1 的进度分别映射到居中 scale 和四边 inset。滑杆与页面滚动各自在选中模式下提供进度。",
  },
  {
    slug: "video-scrub", group: "driven", number: "17",
    title: "滚动控制视频帧", en: "Video scrub", compareWith: "scale-reveal",
    description: "滚动或拖动滑杆，让暂停的视频定位到对应画面。",
    scene: "产品拆解或制作过程。例如读者来回滚动，停在某一步看清细节。",
    behavior: "进度决定视频显示哪一帧。向下滚动看后面的画面，向上滚动可以回看，停下后画面也停在当前位置。",
    implementation: "把进度换算成视频时间，向暂停的视频请求寻帧。一次只处理一个寻帧请求，完成后再定位到最新目标。",
  },
  {
    slug: "soft-mask-reveal", group: "driven", number: "18",
    title: "滚动软边遮罩", en: "Soft mask reveal", compareWith: "clip-reveal",
    description: "同一幅图向四边展开，对照清晰裁剪线和渐隐边缘。",
    scene: "作品或产品图的显现。例如背景需要从画面边缘逐渐透出，衔接上下文。",
    behavior: "两幅图共用进度和展开范围。硬边在裁剪线处截断，软边在同一位置附近逐渐变透明。",
    implementation: "用进度更新四边的裁剪距离。软边在水平与垂直两个方向叠加透明度渐变，使边缘和四角都自然过渡。",
  },
  {
    slug: "scroll-camera", group: "driven", number: "19",
    title: "滚动运镜", en: "Scroll-driven camera", compareWith: "layered-parallax",
    description: "视点横移时，近处门框会遮住或露出远处日轮。",
    scene: "空间叙事。例如让读者从入口一侧移到另一侧，逐渐看清远处的展品。",
    behavior: "近处门框、中景几何体和远处日轮在同一个空间里。视点沿水平方向移动，三者在画面中的相对位置和遮挡随之变化。",
    implementation: "用 CSS 透视投影不同深度的物体，再反向平移整个场景来模拟镜头横移。",
  },
  {
    slug: "hover-reveal", group: "pointer", number: "20",
    title: "悬停揭示", en: "Hover reveal", compareWith: "direction-aware",
    description: "指针移入卡片时，原本隐藏的说明变为可读。",
    scene: "作品网格。例如在封面上按需展示作品的材料与年份。",
    behavior: "鼠标移入显示说明，移出收起；点击或键盘操作可以保持或收起说明。",
    implementation: "保持按钮和说明的语义关系，用状态同步可见性和 aria-expanded；无脚本时直接显示说明。",
  },
  {
    slug: "scroll-3d-model", group: "driven", number: "21",
    title: "滚动驱动 3D 模型", en: "Scroll-driven 3D model", compareWith: "scroll-camera",
    description: "同一个立方体随进度旋转，六个面逐渐向外展开。",
    scene: "产品结构展示。例如读者自行控制进度，观察物体由整体变为分解状态。",
    behavior: "进度从 0 到 1 时立方体旋转并展开；反向操作时各面沿原路径复位。",
    implementation: "将进度映射到模型的旋转角度和各面沿法线的位移。使用 CSS 透视与 preserve-3d，滚动和滑杆共享进度。",
  },
  {
    slug: "scroll-3d-scene", group: "driven", number: "22",
    title: "滚动切换 3D 场景", en: "Scroll-driven 3D scene", compareWith: "scroll-3d-model",
    description: "两个空间沿深度交接，滚动决定场景转换的进度。",
    scene: "章节叙事。例如从日间展厅进入夜间展厅，保留两个空间之间的连续感。",
    behavior: "进度增加时日间场景向后退去，夜间场景向前进入；反向滚动恢复日间场景。",
    implementation: "将进度映射到两个场景的深度、角度和透明度，放在同一透视容器内；滑杆和滚动共用进度。",
  },
];

export const total = String(effects.length).padStart(2, "0");
export const routes = {
  home: "",
  index: "effects/",
  effect: (slug: string) => `effects/${slug}/`,
  example: (slug: string, variant: string) => `examples/${slug}/${variant}.html`,
};

export function withBase(path: string) {
  return `${import.meta.env.BASE_URL.replace(/\/$/, "")}/${path}`;
}
