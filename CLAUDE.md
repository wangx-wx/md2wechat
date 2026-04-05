# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Markdown 转微信公众号排版工具 — 单页应用，左侧 Markdown 编辑器 + 右侧实时预览，一键复制为微信兼容 HTML。

## Commands

```bash
npm run dev       # 启动开发服务器 (Vite HMR)
npm run build     # TypeScript 类型检查 + 生产构建
npm run preview   # 预览构建产物
```

无测试框架，无 lint 配置。

## Architecture

纯前端 SPA，无服务端。入口 `index.html`，通过 CDN 加载 highlight.js、KaTeX、字体等外部依赖。

### 模块职责 (`src/`)

| 模块 | 职责 |
|------|------|
| `main.ts` | 启动入口，初始化所有模块 |
| `editor.ts` | Markdown 编辑器（textarea），工具栏、快捷键、自动保存、字数统计 |
| `render.ts` | Markdown 解析引擎 — 基于 marked.js，扩展支持数学公式、注音、脚注、任务列表，集成 highlight.js / KaTeX / Mermaid / PlantUML / AntV Infographic |
| `export.ts` | 微信导出 — 将预览 HTML 转为内联样式的微信兼容格式，图表转图片，支持剪贴板复制和 HTML 下载 |
| `themes.ts` | 主题系统 — 8 个内置主题 + 自定义配色，代码高亮主题切换，基于 CSS 变量 |
| `ui.ts` | 通用 UI 组件 — Toast 通知、可拖拽分隔条 |
| `styles.css` | 全局样式，CSS 变量驱动主题 |

### 数据流

编辑器输入 → `render.ts` 解析为 HTML → 预览区展示 → `export.ts` 转换为微信兼容格式 → 复制到剪贴板

### 状态持久化

使用 localStorage 保存草稿内容和主题选择。

## Tech Stack

- **构建**: Vite 8 + TypeScript 6
- **Markdown**: marked.js（含自定义扩展）
- **代码高亮**: highlight.js
- **数学公式**: KaTeX
- **图表**: Mermaid, PlantUML (服务端渲染), @antv/infographic
- **样式**: 原生 CSS，CSS 自定义属性驱动主题

## Key Conventions

- 所有模块通过 ES module 导出/导入，无打包器特殊配置
- 微信兼容性是核心约束：样式必须内联（inline style），不支持外部 CSS/JS
- `export.ts` 中的样式转换逻辑是项目最复杂的部分，修改时需特别注意微信编辑器的兼容性
- CDN 依赖在 `index.html` 中通过 `<script>` / `<link>` 引入，不经过 Vite 打包
