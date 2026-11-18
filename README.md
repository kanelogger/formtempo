# FormTempo

<img src="public/mark.svg" alt="FormTempo 翻盖图鉴标志" width="72" height="72" />

FormTempo 是一册可操作的网页动效图鉴。每个案例直接展示名称和可操作的 GSAP 动效。画面下方可以展开完整 HTML 源码；有原生和 GSAP 两种写法时分别列出。

[浏览图鉴](https://kanelogger.github.io/formtempo/) · [品牌标志与素材](DESIGN.md#品牌标志)

## 本地运行

使用 Node.js 24 与 npm。

```sh
npm ci
npm run dev
```

开发地址为 [localhost:4321/formtempo/](http://localhost:4321/formtempo/)。运行 `npm run verify` 执行类型检查、生产构建和产物验证。构建输出为 `dist/`，可用 `npm run preview` 本地预览。

## 新增案例

1. 在 `src/effects.ts` 加入案例元数据，填写效果、使用场景、行为定义和实现要点。
2. 在 `src/demos/` 的对应分类中实现使用本地 GSAP 的详情页演示，并登记已有的 HTML 源码。至少提供一份；有两种写法时应呈现同一种行为。详情页按实际版本列出源码，独立 HTML 路由按同一清单构建。
3. 补充目录示意和产物检查，运行 `npm run verify`，再测试鼠标、触屏、键盘和减少动态效果。

Agent 协作步骤和交接约定见[开发工作流](AGENTS.md#开发工作流)。

`main` 通过检查后由 GitHub Actions 将静态产物发布到 GitHub Pages。
