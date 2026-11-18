# FormTempo 项目经验

计划或排查相关变更时，先看对应案例。交接时把已复现且可复用的发现合并到已有条目，记录触发条件、原因、处置、适用范围和可回查的证据。

## 独立示例要从构建产物验收

增加案例、修改 slug 或调整示例生成逻辑时，要同时检查详情页和 `examples/<slug>/native.html`、`gsap.html` 两个独立入口。详情页按案例元数据生成，并读取同一 slug 的示例对。若整对示例缺失，构建详情页时就会失败。独立路由遍历示例映射，分别输出两份 HTML。[详情页实现](src/pages/effects/%5Bslug%5D.astro) · [独立路由实现](src/pages/examples/%5Bslug%5D/%5Bimplementation%5D.html.ts)

在项目根运行 `npm run verify`。产物检查逐项对照已发布编号、slug 和两份示例文件。构建阶段找不到示例对时，查示例收集逻辑与 slug。构建成功后报缺失路由时，查本次 `dist/` 中的具体 HTML 文件。再从详情页打开独立示例，验证实际交互。[示例收集与导览注入](src/examples.ts) · [产物检查](scripts/verify-build.mjs)

2026-11-18 在版本 `db83941` 的隔离构建中移走磁吸按钮的 `native.html`，产物检查退出 1，报告 `Missing released example route: magnetic-button/native`。放回同一文件后检查通过，覆盖 22 个案例和 44 份独立示例。在浏览器中从详情进入原生示例，两页分别从“等待确认”开始计数。

指针导览会直接向步骤的目标派发不冒泡的 `pointerenter` 和 `pointerleave`。校验新案例时应读回演示状态，字幕也会在没有触发交互时照常推进。2026-11-18 在悬停阵列的详情、原生与 GSAP 页面重播，均观测到第 10、11、12 号格依次点亮。在隔离产物中移走该案例的 GSAP 示例，检查报告 `Missing released example route: hover-grid-trail/gsap`，恢复后 28 个案例和 56 份示例通过。[导览控制器](src/demos/demo-guide.js) · [逐格事件处理](src/demos/hover-grid-interaction.js)
