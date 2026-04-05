## Why

当前 `md2wechat.html` 是一个可用的单文件工具，但功能还不够丰富、主题较少。需要在此基础上完善，做一个更好用的 Markdown 转微信公众号排版工具。

## What Changes

- 将单文件 HTML 重构为 Vite + TypeScript 项目，代码更易维护
- 完善编辑器：工具栏快捷按钮、快捷键、自动保存
- 丰富主题：从 5 个扩展到 8+ 个，支持自定义配色
- 完善导出：确保微信兼容性，支持复制富文本和导出 HTML 文件
- 增强解析：支持脚注、任务列表，LaTeX 数学公式用 KaTeX 完美展示
- 图表支持：Mermaid 流程图、PlantUML UML 图表、AntV Infographic 信息图

## Capabilities

### New Capabilities

- `md2wechat-app`: 完整的 MD 转微信工具 — 编辑器 + 解析 + 主题 + 导出

### Modified Capabilities

无

## Impact

- 现有 `md2wechat.html` 将被替代
- 引入 Vite 构建工具和 TypeScript
- npm 管理依赖：marked、highlight.js、KaTeX、Mermaid、AntV Infographic
