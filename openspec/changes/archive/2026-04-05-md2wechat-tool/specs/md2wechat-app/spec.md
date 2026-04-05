## ADDED Requirements

### Requirement: Markdown 编辑器
系统 SHALL 提供左右分栏的 Markdown 编辑器，左侧编辑、右侧实时预览。

#### Scenario: 实时预览
- **WHEN** 用户在编辑器中输入 Markdown
- **THEN** 右侧实时渲染排版效果

#### Scenario: 工具栏快捷操作
- **WHEN** 用户点击工具栏按钮（标题、加粗、斜体、链接、代码块等）
- **THEN** 在光标位置插入对应的 Markdown 语法

#### Scenario: 快捷键
- **WHEN** 用户按下 Cmd/Ctrl+B、Cmd/Ctrl+I、Cmd/Ctrl+Shift+C 等
- **THEN** 执行对应的格式化或复制操作

#### Scenario: 插入图片
- **WHEN** 用户点击工具栏图片按钮
- **THEN** 弹出输入框让用户填写图片 URL，插入 `![alt](url)` 语法

#### Scenario: 自动保存
- **WHEN** 用户停止输入 2 秒后
- **THEN** 内容自动保存到 localStorage，重新打开时恢复

### Requirement: Markdown 解析
系统 SHALL 支持完整的 GFM 语法 + LaTeX 数学公式 + 脚注 + 任务列表。

#### Scenario: GFM 基础语法
- **WHEN** 输入标题、列表、表格、代码块、引用等
- **THEN** 全部正确渲染

#### Scenario: LaTeX 数学公式
- **WHEN** 输入 `$inline$` 或 `$$block$$` 格式
- **THEN** 使用 KaTeX 渲染数学公式

#### Scenario: 代码高亮
- **WHEN** 输入带语言标识的代码块
- **THEN** highlight.js 进行语法高亮，显示语言标签

#### Scenario: 脚注
- **WHEN** 输入 `[^1]` 和 `[^1]: 说明`
- **THEN** 渲染为上标编号和文末脚注列表

#### Scenario: 任务列表
- **WHEN** 输入 `- [ ]` 和 `- [x]`
- **THEN** 渲染为带复选框的列表

#### Scenario: Mermaid 图表
- **WHEN** 输入 ` ```mermaid ` 代码块
- **THEN** 使用 Mermaid 客户端渲染为 SVG 流程图/序列图等

#### Scenario: PlantUML 图表
- **WHEN** 输入 ` ```plantuml ` 代码块
- **THEN** 通过 PlantUML 服务器渲染为 UML 图表

#### Scenario: Infographic 信息图
- **WHEN** 输入 ` ```infographic ` 代码块
- **THEN** 使用 AntV Infographic 渲染为声明式信息图

### Requirement: 主题系统
系统 SHALL 提供至少 8 个预设主题，支持自定义配色和代码高亮浅/深色切换。

#### Scenario: 切换预设主题
- **WHEN** 用户点击主题按钮
- **THEN** 预览区立即切换配色方案

#### Scenario: 自定义配色
- **WHEN** 用户修改主题颜色参数
- **THEN** 实时预览效果，可保存到 localStorage

#### Scenario: 代码高亮主题
- **WHEN** 用户切换代码配色按钮
- **THEN** 代码块在浅色/深色之间切换

### Requirement: 微信公众号导出
系统 SHALL 生成微信兼容的全内联样式 HTML，支持复制富文本和下载 HTML 文件。

#### Scenario: 复制到公众号
- **WHEN** 用户点击「复制到公众号」
- **THEN** 全内联样式 HTML 复制到剪贴板，粘贴到微信编辑器排版完整保留

#### Scenario: 代码高亮内联化
- **WHEN** 导出含代码块的内容
- **THEN** highlight.js 的 class 替换为 inline color style

#### Scenario: 数学公式图片化
- **WHEN** 导出含数学公式的内容
- **THEN** KaTeX 渲染结果转为外部 SVG 图片链接

#### Scenario: 图表导出
- **WHEN** 导出含 Mermaid 或 Infographic 图表的内容
- **THEN** SVG 渲染结果转为 data URL `<img>` 标签，确保微信兼容
- **WHEN** 导出含 PlantUML 图表的内容
- **THEN** 保持已有的 `<img>` 引用不变

#### Scenario: 下载 HTML 文件
- **WHEN** 用户点击导出按钮
- **THEN** 下载一个独立的 HTML 文件

### Requirement: 项目结构
系统 SHALL 使用 Vite + TypeScript 构建，代码按功能分为少量清晰的模块。

#### Scenario: 开发启动
- **WHEN** 执行 npm install && npm run dev
- **THEN** 开发服务器启动，应用可访问

#### Scenario: 生产构建
- **WHEN** 执行 npm run build
- **THEN** 生成可部署的静态文件
