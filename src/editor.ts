import { render, renderDiagrams } from './render';

const STORAGE_KEY = 'md2wechat_draft';
let saveTimer: ReturnType<typeof setTimeout> | null = null;

const TOOLBAR_BUTTONS = [
  { label: 'H1', prefix: '# ', suffix: '', placeholder: '标题一' },
  { label: 'H2', prefix: '## ', suffix: '', placeholder: '标题二' },
  { label: 'H3', prefix: '### ', suffix: '', placeholder: '标题三' },
  { sep: true },
  { label: 'B', prefix: '**', suffix: '**', placeholder: '粗体', title: '加粗 (Cmd+B)' },
  { label: 'I', prefix: '*', suffix: '*', placeholder: '斜体', title: '斜体 (Cmd+I)' },
  { label: '~~', prefix: '~~', suffix: '~~', placeholder: '删除线' },
  { sep: true },
  { label: 'Link', prefix: '[', suffix: '](url)', placeholder: '链接文本', title: '插入链接' },
  { label: 'Img', prefix: '![alt](', suffix: ')', placeholder: '图片URL', title: '插入图片', isImage: true },
  { label: 'Code', prefix: '`', suffix: '`', placeholder: '代码' },
  { label: 'Block', prefix: '```\n', suffix: '\n```', placeholder: '代码块' },
  { sep: true },
  { label: 'Quote', prefix: '> ', suffix: '', placeholder: '引用' },
  { label: 'UL', prefix: '- ', suffix: '', placeholder: '列表项' },
  { label: 'OL', prefix: '1. ', suffix: '', placeholder: '列表项' },
  { label: 'Table', action: 'table' },
  { label: 'HR', action: 'hr' },
];

function buildToolbar() {
  const toolbar = document.getElementById('editor-toolbar')!;
  TOOLBAR_BUTTONS.forEach(btn => {
    if ('sep' in btn) {
      const sep = document.createElement('div');
      sep.className = 'et-sep';
      toolbar.appendChild(sep);
      return;
    }
    const el = document.createElement('button');
    el.className = 'et-btn';
    el.textContent = btn.label;
    if (btn.title) el.title = btn.title;
    el.addEventListener('click', () => {
      if (btn.action === 'table') {
        insertText('\n| 列1 | 列2 | 列3 |\n|------|------|------|\n| 内容 | 内容 | 内容 |\n');
      } else if (btn.action === 'hr') {
        insertText('\n---\n');
      } else if (btn.isImage) {
        insertImage();
      } else {
        wrapSelection(btn.prefix!, btn.suffix!, btn.placeholder!);
      }
    });
    toolbar.appendChild(el);
  });
}

function getEditor(): HTMLTextAreaElement {
  return document.getElementById('editor') as HTMLTextAreaElement;
}

function wrapSelection(prefix: string, suffix: string, placeholder: string) {
  const editor = getEditor();
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.substring(start, end);
  const text = selected || placeholder;
  const replacement = prefix + text + suffix;
  editor.value = editor.value.substring(0, start) + replacement + editor.value.substring(end);
  editor.selectionStart = start + prefix.length;
  editor.selectionEnd = start + prefix.length + text.length;
  editor.focus();
  triggerRender();
}

function insertText(text: string) {
  const editor = getEditor();
  const start = editor.selectionStart;
  editor.value = editor.value.substring(0, start) + text + editor.value.substring(editor.selectionEnd);
  editor.selectionStart = editor.selectionEnd = start + text.length;
  editor.focus();
  triggerRender();
}

function insertImage() {
  const editor = getEditor();
  const start = editor.selectionStart;
  const selected = editor.value.substring(start, editor.selectionEnd);
  if (selected && selected.startsWith('http')) {
    editor.value = editor.value.substring(0, start) + `![image](${selected})` + editor.value.substring(editor.selectionEnd);
  } else {
    const url = prompt('请输入图片 URL:');
    if (url) {
      const alt = selected || 'image';
      editor.value = editor.value.substring(0, start) + `![${alt}](${url})` + editor.value.substring(editor.selectionEnd);
    }
  }
  editor.focus();
  triggerRender();
}

function triggerRender() {
  const editor = getEditor();
  const preview = document.getElementById('preview')!;
  preview.innerHTML = render(editor.value);
  renderDiagrams(preview);
  document.getElementById('char-count')!.textContent = `${editor.value.length} 字符`;
  autoSave();
}

function autoSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const editor = getEditor();
    localStorage.setItem(STORAGE_KEY, editor.value);
  }, 2000);
}

function restoreDraft() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    getEditor().value = saved;
    triggerRender();
    return true;
  }
  return false;
}

function setupShortcuts() {
  const editor = getEditor();

  editor.addEventListener('keydown', (e) => {
    // Tab → 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = editor.selectionStart;
      editor.value = editor.value.slice(0, s) + '  ' + editor.value.slice(editor.selectionEnd);
      editor.selectionStart = editor.selectionEnd = s + 2;
      triggerRender();
      return;
    }

    const mod = e.metaKey || e.ctrlKey;

    // Cmd+B → bold
    if (mod && e.key === 'b') {
      e.preventDefault();
      wrapSelection('**', '**', '粗体');
      return;
    }
    // Cmd+I → italic
    if (mod && e.key === 'i') {
      e.preventDefault();
      wrapSelection('*', '*', '斜体');
      return;
    }
    // Cmd+K → link
    if (mod && e.key === 'k') {
      e.preventDefault();
      wrapSelection('[', '](url)', '链接文本');
      return;
    }
  });
}

export function initEditor() {
  buildToolbar();

  const editor = getEditor();

  // Restore draft or use sample
  if (!restoreDraft()) {
    const SAMPLE = `# Markdown 转微信公众号

欢迎使用 **MD2WeChat**！在左侧编辑，右侧实时预览，一键复制到公众号编辑器。

## 功能特性

- **代码高亮** — 支持 Python、Go、JavaScript 等 100+ 语言
- **数学公式** — 完整支持 LaTeX 行内与块级公式
- **Mermaid 流程图** — 支持流程图、序列图等
- **PlantUML 流程图** — 支持 UML 各类图表
- **Infographic 信息图** — AntV 声明式信息图
- **表格样式** — 自动美化，多主题配色
- **一键导出** — 带内联样式，直接粘贴到公众号编辑器
- **脚注支持** — 专业文档必备[^1]
- **任务列表** — 支持 GFM 任务列表

## 代码高亮

\`\`\`python
def quicksort(arr: list) -> list:
    """快速排序"""
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left   = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right  = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
\`\`\`

## 数学公式

欧拉公式 $e^{i\\pi} + 1 = 0$ 被誉为最美等式。

$$
\\int_{-\\infty}^{+\\infty} e^{-x^2}\\, dx = \\sqrt{\\pi}
$$

## Mermaid 流程图

\`\`\`mermaid
graph LR
    A[编写 Markdown] --> B{实时预览}
    B --> C[选择主题]
    C --> D[复制到公众号]
    D --> E((发布 ✅))
\`\`\`

## PlantUML 图表

\`\`\`plantuml
@startuml
skinparam monochrome true
skinparam defaultFontName "PingFang SC"
skinparam defaultFontSize 14

actor 用户
participant "MD2WeChat" as app
participant "渲染引擎" as engine

用户 -> app : 输入 Markdown
app -> engine : 解析内容
engine --> app : 返回 HTML
app --> 用户 : 实时预览
@enduml
\`\`\`

## Infographic 信息图

\`\`\`infographic
infographic list-row-simple-horizontal-arrow
data
  lists
    - label Markdown
      desc 编写文章
    - label MD2WeChat
      desc 实时渲染
    - label 公众号
      desc 一键发布
\`\`\`

## 任务列表

- [x] 代码高亮
- [x] 数学公式
- [x] Mermaid 流程图
- [ ] 脚注支持
- [ ] 自定义主题

## 数据表格

| 特性 | MD2WeChat | 微信编辑器 |
|------|:---------:|:---------:|
| 代码高亮 | ✅ | ❌ |
| 数学公式 | ✅ | ❌ |
| Mermaid | ✅ | ❌ |
| 自定义主题 | ✅ | 有限 |

## 引用

> 任何傻瓜都能写出计算机能理解的代码。
> 优秀的程序员写出的代码，是人类能够理解的。
>
> — Martin Fowler

---

*切换上方主题，点击「复制到公众号」即可使用。*

[^1]: 这是脚注的示例内容。
`;
    editor.value = SAMPLE;
    triggerRender();
  }

  editor.addEventListener('input', triggerRender);
  setupShortcuts();
}

export { getEditor, triggerRender };
