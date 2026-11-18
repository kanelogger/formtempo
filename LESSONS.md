# FormTempo 项目经验

计划或排查相关变更时，先看对应案例。交接时把已复现且可复用的发现合并到已有条目，记录触发条件、原因、处置、适用范围和可回查的证据。

## 独立示例要从构建产物验收

详情页按案例元数据生成，现场交互使用本地 GSAP。源码清单决定可展开的版本和 `examples/<slug>/<implementation>.html` 的静态路由。新增案例可只提供一份源码，已发布的示例 URL 要继续可达。[详情页实现](src/pages/effects/%5Bslug%5D.astro) · [独立路由实现](src/pages/examples/%5Bslug%5D/%5Bimplementation%5D.html.ts)

在项目根运行 `npm run verify`。检查实际输出中的已发布编号与 URL、源码折叠项与示例文件是否对应。浏览器中从目录进入详情，操作画面并读回状态；展开源码与对应 HTML 对照。视频源码包含内嵌 MP4，详情页在展开时单独读取。[示例收集与导览注入](src/examples.ts) · [产物检查](scripts/verify-build.mjs)

2026-11-18 在版本 `db83941` 的隔离构建中移走磁吸按钮的 `native.html`，产物检查退出 1，报告 `Missing released example route: magnetic-button/native`。放回同一文件后检查通过，覆盖 22 个案例和 44 份独立示例。在浏览器中从详情进入原生示例，两页分别从“等待确认”开始计数。

指针导览会直接向步骤的目标派发不冒泡的 `pointerenter` 和 `pointerleave`。校验新案例时应读回演示状态，字幕也会在没有触发交互时照常推进。2026-11-18 在悬停阵列的详情、原生与 GSAP 页面重播，均观测到第 10、11、12 号格依次点亮。在隔离产物中移走该案例的 GSAP 示例，检查报告 `Missing released example route: hover-grid-trail/gsap`，恢复后 28 个案例和 56 份示例通过。[导览控制器](src/demos/demo-guide.js) · [逐格事件处理](src/demos/hover-grid-interaction.js)

切换系统的「减少动态效果」也要在过渡途中测试。指针揭示层的 GSAP tween 被打断时，单独调用 `kill()` 会把画面留在中间帧，即使交互状态已经是打开或关闭。详情与独立 GSAP 源码共用的适配器现在会写回目标变换。回归时分别在进入和离开途中切换偏好，读取面板的实际位移。[指针 GSAP 适配器](src/demos/pointer-gsap.js)
