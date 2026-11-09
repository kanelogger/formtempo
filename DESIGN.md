---
name: FormTempo
description: 可以亲手操作、对照画面并查看实现的网页动效图鉴。
colors:
  primary: "#b8412c"
  primary-hover: "#963324"
  paper: "#fbfaf7"
  surface: "#ffffff"
  mist: "#edf3f6"
  plate: "#f7fafb"
  ink: "#222c36"
  text-secondary: "#434f5d"
  text-muted: "#5c6875"
  demo-sky: "#e8f3fa"
  demo-sun: "#ef784d"
  signal: "#226250"
  pointer: "#275d7f"
  trigger: "#825c20"
  transition: "#6d5581"
  night: "#19222d"
  night-surface: "#222e3c"
  night-mist: "#2b3c4d"
  night-plate: "#233142"
  night-ink: "#f6f5f1"
  night-text-secondary: "#d8dce1"
  night-text-muted: "#b4becc"
  night-primary: "#ff9d7c"
  night-primary-hover: "#ffb399"
  night-on-primary: "#281912"
  night-signal: "#94d5bc"
  night-pointer: "#9dc5e4"
  night-trigger: "#e9bf6a"
  night-transition: "#ceb6e5"
typography:
  display:
    fontFamily: "Noto Serif SC, Songti SC, STSong, Noto Serif CJK SC, SimSun, Georgia, serif"
    fontSize: "4rem"
    fontWeight: 600
    lineHeight: 1.19
    letterSpacing: "-0.025em"
  display-emphasis:
    fontFamily: "Noto Serif SC, Songti SC, STSong, Noto Serif CJK SC, SimSun, Georgia, serif"
    fontWeight: 700
  display-min:
    fontSize: "1.75rem"
  display-compact-max:
    fontSize: "3rem"
  headline:
    fontFamily: "Noto Serif SC, Songti SC, STSong, Noto Serif CJK SC, SimSun, Georgia, serif"
    fontSize: "3.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.012em"
  headline-min:
    fontSize: "2.15rem"
  route-heading:
    fontFamily: "Noto Serif SC, Songti SC, STSong, Noto Serif CJK SC, SimSun, Georgia, serif"
    fontSize: "5rem"
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: "-0.02em"
  route-heading-wide-min:
    fontSize: "2.75rem"
  title:
    fontFamily: "Space Grotesk, Inter, -apple-system, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  body-lead:
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.72
  control:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    letterSpacing: "-0.005em"
  label:
    fontSize: "0.8125rem"
  metadata:
    fontSize: "0.6875rem"
  code:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
  specimen-number:
    fontFamily: "Fraunces, Georgia, serif"
    fontWeight: 400
rounded:
  compact: "6px"
  control: "10px"
  range-panel: "12px"
  panel: "16px"
  catalogue-card: "20px"
  pill: "999px"
spacing:
  card-inset: "0.75rem"
  mobile-grid-gap: "1rem"
  compact-gutter: "1.25rem"
  wide-gutter: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-primary-night:
    backgroundColor: "{colors.night-primary}"
    textColor: "{colors.night-on-primary}"
  button-ghost:
    backgroundColor: "rgba(34,44,54,0.03)"
    textColor: "{colors.ink}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    height: "44px"
  filter-chip:
    backgroundColor: transparent
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.pill}"
    height: "44px"
  filter-chip-current:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
  navigation:
    backgroundColor: "rgba(251,250,247,0.62)"
    textColor: "{colors.text-secondary}"
    height: "64px"
  scene-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.card-inset}"
  comparison-range:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.ink}"
    rounded: "{rounded.range-panel}"
---

# FormTempo 设计系统

## Overview

**Creative North Star: "网页动效图鉴"**

用轻快的刊物感呈现网页动效。晴蓝铺开画面，暖橙标出当前操作与状态变化。纸白、蓝灰与宽松的段落间距给示意图和文字留出各自的位置。

演示框像一页略微抬起的标本纸。标题先交代动作，画面展示变化，说明和代码分别接住观看与动手的需求。浅色和深色主题都保留清楚的画面边界。

**Key Characteristics:**

- 纸白与蓝灰形成阅读层次，晴蓝和暖橙共同构成演示画面的色彩重心。
- 中文大标题用正体衬线，正文和控件用易读的无衬线，代码保留等宽数字。
- 演示面板有轻微悬浮感，正文与静置卡片以底色和细边分层。

## 品牌标志

FormTempo 的标志「翻盖图鉴」是一台掌上动效图鉴。柿橙机身的翻盖向右打开，蓝墨屏幕里的两张错位画面对应动效的两个状态，下方滑键呼应站内可拖动的进度条。

- [晴蓝底 SVG](public/mark.svg) 用于网站导航、页脚、浏览器标签页和 README。站内与 FormTempo 字标组合时，图形为 30 px，深浅色主题共用此版本。
- [透明底 SVG](public/brand/atlas.svg) 用于纸白或晴蓝背景上的大幅品牌画面。两版共用同一图形和 48 × 48 画布，更新图形时同步两份素材。

在 16 px 标签页尺寸下，优先保留竖向机身和侧盖的轮廓。屏内双帧和滑键在导航尺寸下更清楚。

## Colors

### Primary

柿橙用于主按钮、焦点轮廓、标题强调和演示进度。悬停时主按钮加深。深色主题使用浅杏橙搭配深褐文字。

### Secondary

晴蓝是裁剪演示中天空的底色，暖橙日轮建立观察中心。对照图与现场演示使用同一幅插图，裁剪帧通过裁剪范围区分状态。

### Tertiary

指针、滚动触发和页面转场分别使用海蓝、赭金与灰紫，滚动驱动使用主色。分类同时显示文字。验证通过使用松绿和文字状态。

### Neutral

纸白用于页面，纯白用于面板，雾蓝灰用于进度区和衬垫。正文用蓝墨，解释与元信息逐层降低对比。深色主题用夜蓝背景及两级蓝灰面板维持相同层次。全站主题与图鉴的预览主题可分别切换。

## Typography

### Hierarchy

- **首页大标题**用 Noto Serif SC 正体，常规字重 600，柿橙强调 700。字号随文字栏宽度缩放，双栏上限 4rem，单栏上限 3rem，下限 1.75rem。行高 1.19，字距 `-.025em`。
- **区块标题**沿用同一衬线字族，字号为 `clamp(2.15rem, 4.25vw, 3.75rem)`。行高 1.2，字距 `-.012em`。
- **图鉴与案例首题**使用正体 600，桌面字号为 `clamp(2.75rem, 6vw, 5rem)`。行高 1.16，字距 `-.02em`。手机字号分别收至 3rem 和 3.2rem 上限。
- **界面小标题**沿用 Space Grotesk 和中文系统黑体，适用于演示标题、案例卡片和验证步骤。
- **正文**以 Inter 和中文系统黑体排版，主要阅读段落从 16px 起步。首页介绍最多约 32 个全角字宽，行高 1.75。区块和案例说明多用 560px 上限，行高约 1.7–1.72。
- **代码与读数**使用 JetBrains Mono，进度数字使用等宽数码。Fraunces 斜体用于图鉴统计和编号的排版点缀。

站内加载的 Noto Serif SC 文件是当前标题字集的自托管子集，覆盖正体 600–700，采用 `font-display: swap`。超出当前字集的标题字符会走宋体回退。字体授权见 `public/licenses/noto-serif-sc-OFL.txt`。

## Layout

主内容容器最大宽度 1240px，桌面横向留白 32px，640px 以下收为 20px。导航桌面高 64px，960px 以下分成双行，总高 104px。

首页首屏左侧排列标题、简介和主要入口，右侧放可操作的裁剪画面与原生示例链接。880px 及以下按同样的阅读顺序堆叠。入场时裁剪从中心展开一次，聚焦或操作滑杆即可接管。减少动态效果时直接显示可操作的初始帧。

现场演示最大宽度 1120px，宽屏以画布配说明栏，760px 以下改为上下布局。类型索引和发布验证的并栏在 900px 以下堆叠。裁剪对照保持双列，520px 以下将滑杆标题移到控件上方。窄屏与减少动态效果模式有可直接操作的静态演示布局。

## Elevation & Depth

演示通过底色和边框建立第一层深度。首屏裁剪区用浅色参照显示完整画面，叠上原色裁剪帧。类型预览和验证回执的弥散阴影给面板轻微悬浮感。图鉴卡片在悬停或键盘焦点进入时抬起 4px，并用所属分类色形成柔和阴影。

## Shapes

普通按钮圆角 10px，进度面板 12px，首页演示和使用场景卡片 16px，案例详情演示框 18px，图鉴卡片 20px。筛选项和切换控件采用胶囊形。图像开窗沿用图框的轮廓。

## Components

- **按钮**用柿橙指示主操作，次操作使用浅色底和细边。键盘焦点用 2px 强调色轮廓。
- **导航**用半透明底色和胶囊分组，当前项加深文字和底色。滚动后导航底色略加实。
- **筛选项**文字说明类别，当前项使用主题主色填充。图鉴内的预览主题通过独立按钮切换。
- **使用场景卡片**把短说明放在示意图旁，底部的动作名引向案例详情。
- **裁剪滑杆**在两帧下方独立成行，以柿橙标明已走过的进度，保留键盘焦点与数值读数。
- **现场演示**将选项卡、画面与状态说明置于一张面板中。时间线、进度与代码章节可手动操作，降低动态效果时保留相应控件。

## Do's and Don'ts

- Do 在主要标题与主操作使用柿橙，把晴蓝放在演示画面和蓝灰衬垫中。
- Do 在浅色和深色下保留文字状态、焦点轮廓和进度数值。
- Do 在新的说明面板中用无衬线排正文，用等宽字体排代码。
- Don't 把强调色铺满阅读背景。
- Don't 只用颜色区分动效类别或操作状态。
- Don't 用大面积厚重阴影包围常态卡片。
