## Context

基于现有的 `md2wechat.html`（~950 行单文件），重构为 Vite + TypeScript 项目。保留已有的核心逻辑，改善代码组织。

## Goals / Non-Goals

**Goals:**

- 可维护的项目结构
- 更丰富的主题和更好的编辑体验
- 可靠的微信公众号导出

**Non-Goals:**

- 不做后端服务、用户系统
- 不做图片图床上传（用户自行处理图片）
- 不做移动端适配（桌面端工具）

## Decisions

### D1: Vite + 原生 TypeScript

轻量，打包体积小，适合工具型应用。不引入框架。

### D2: 项目结构（简洁）

```
md2wechat/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.ts           # 入口
│   ├── render.ts         # Markdown 解析 & 渲染
│   ├── themes.ts         # 主题定义 & 切换
│   ├── export.ts         # 微信导出（内联样式引擎）
│   ├── editor.ts         # 编辑器控制（工具栏、快捷键、自动保存）
│   └── styles.css        # 全部样式
└── public/
```

6 个源文件，清晰直接。

### D3: 继续使用 marked + highlight.js + KaTeX

已在用，成熟稳定。

### D4: 图表渲染策略

- **Mermaid**：客户端渲染，`mermaid.render()` 输出 SVG。导出时 SVG→data URL `<img>`。
- **PlantUML**：服务端渲染，通过 `CompressionStream('deflate-raw')` + 自定义 base64 编码生成 URL，由 plantuml.com 返回 SVG/PNG。
- **Infographic**：基于 `@antv/infographic`，`new Infographic({ container }).render(syntax)` 客户端渲染。导出时 SVG→data URL `<img>`。

所有图表统一采用占位 div + 异步渲染模式（`renderDiagrams()`），在 marked 同步渲染完成后批量处理。

## Risks / Trade-offs

- **微信编辑器兼容性** → 全内联样式方案已验证可行
- **数学公式在微信中的显示** → 转为 codecogs SVG 图片（现有方案），或用户自行截图
