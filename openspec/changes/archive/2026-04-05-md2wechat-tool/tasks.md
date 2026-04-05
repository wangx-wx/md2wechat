## 1. 项目初始化

- [x] 1.1 初始化 Vite + TypeScript 项目（package.json、vite.config.ts、tsconfig.json）
- [x] 1.2 安装依赖（marked、highlight.js、katex 及类型声明）
- [x] 1.3 创建 index.html 入口和 src/main.ts

## 2. 样式与布局

- [x] 2.1 从 md2wechat.html 迁移所有 CSS 到 src/styles.css
- [x] 2.2 实现 index.html 中的布局结构（toolbar、编辑器、预览分栏）

## 3. Markdown 解析

- [x] 3.1 实现 src/render.ts — marked 配置、代码高亮、数学公式扩展（从 md2wechat.html 迁移）
- [x] 3.2 添加脚注解析扩展
- [x] 3.3 添加任务列表解析扩展

## 4. 编辑器

- [x] 4.1 实现 src/editor.ts — textarea 绑定、实时渲染、字符统计、Tab 缩进
- [x] 4.2 实现工具栏按钮（标题、加粗、斜体、链接、代码块、图片）— 图片按钮弹出输入框填写 URL
- [x] 4.3 实现快捷键（Cmd+B/I/Shift+C 等）
- [x] 4.4 实现自动保存和草稿恢复

## 5. 主题系统

- [x] 5.1 实现 src/themes.ts — 从 5 个主题扩展到 8 个预设主题
- [x] 5.2 实现主题切换逻辑（CSS 变量驱动）
- [x] 5.3 实现代码高亮浅色/深色切换
- [x] 5.4 实现自定义主题编辑面板
- [x] 5.5 实现主题偏好持久化

## 6. 微信导出

- [x] 6.1 实现 src/export.ts — 内联样式引擎（从 md2wechat.html 迁移 walkAndStyle 逻辑）
- [x] 6.2 实现复制富文本到剪贴板
- [x] 6.3 实现查看 HTML 源码弹窗
- [x] 6.4 实现导出 HTML 文件下载
- [x] 6.5 实现分栏拖拽 resizer
- [x] 6.6 实现 Toast 提示组件

## 7. 图表支持

- [x] 7.1 实现 Mermaid 流程图支持（客户端渲染、异步渲染、导出 SVG→img）
- [x] 7.2 实现 PlantUML 图表支持（服务端渲染、deflate-raw 压缩编码、导出处理）
- [x] 7.3 实现 AntV Infographic 信息图支持（客户端渲染、导出 SVG→img）

## 8. 收尾

- [x] 8.1 编写包含所有语法的示例 Markdown
- [x] 8.2 验证 npm run build 产物可正常部署
- [x] 8.3 编写 README.md
