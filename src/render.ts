import { Marked } from 'marked';
import hljs from 'highlight.js';
import katex from 'katex';
import mermaid from 'mermaid';
import { Infographic } from '@antv/infographic';

function encText(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function encAttr(s: string): string {
  return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

// PlantUML URL generation using CompressionStream
async function getPlantumlUrl(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();
  const reader = cs.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const totalLen = chunks.reduce((s, c) => s + c.length, 0);
  const compressed = new Uint8Array(totalLen);
  let offset = 0;
  for (const c of chunks) { compressed.set(c, offset); offset += c.length; }

  // Custom base64
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';
  let r = '';
  for (let i = 0; i < compressed.length; i += 3) {
    const b1 = compressed[i] ?? 0;
    const b2 = compressed[i + 1] ?? 0;
    const b3 = compressed[i + 2] ?? 0;
    r += chars[b1 >> 2];
    r += chars[((b1 & 0x3) << 4) | (b2 >> 4)];
    if (i + 1 < compressed.length) r += chars[((b2 & 0xF) << 2) | (b3 >> 6)];
    if (i + 2 < compressed.length) r += chars[b3 & 0x3F];
  }
  return `https://www.plantuml.com/plantuml/svg/${r}`;
}

const marked = new Marked();

// Math block extension — supports $$...$$ and \[...\]
const mathBlockExt = {
  name: 'mathBlock',
  level: 'block' as const,
  start(src: string) {
    const i1 = src.indexOf('$$');
    const i2 = src.indexOf('\\[');
    if (i1 < 0 && i2 < 0) return undefined;
    if (i1 < 0) return i2;
    if (i2 < 0) return i1;
    return Math.min(i1, i2);
  },
  tokenizer(src: string) {
    // Try $$...$$
    let m = /^\$\$([\s\S]+?)\$\$/s.exec(src);
    if (m) return { type: 'mathBlock' as const, raw: m[0], math: m[1].trim() };
    // Try \[...\]
    m = /^\\\[([\s\S]+?)\\\]/s.exec(src);
    if (m) return { type: 'mathBlock' as const, raw: m[0], math: m[1].trim() };
  },
  renderer(token: any) {
    try {
      const html = katex.renderToString(token.math, { displayMode: true, throwOnError: false });
      return `<div class="math-block" data-latex="${encAttr(token.math)}" data-display="1">${html}</div>\n`;
    } catch { return `<div class="math-block" style="color:red">${encText(token.math)}</div>\n`; }
  }
};

// Math inline extension — supports $...$ and \(...\)
const mathInlineExt = {
  name: 'mathInline',
  level: 'inline' as const,
  start(src: string) {
    const i1 = src.indexOf('$');
    const i2 = src.indexOf('\\(');
    if (i1 < 0 && i2 < 0) return undefined;
    if (i1 < 0) return i2;
    if (i2 < 0) return i1;
    return Math.min(i1, i2);
  },
  tokenizer(src: string) {
    // Try $...$ (skip $$)
    if (!src.startsWith('$$')) {
      const m = /^\$([^\$\n]+?)\$/.exec(src);
      if (m) return { type: 'mathInline' as const, raw: m[0], math: m[1].trim() };
    }
    // Try \(...\)
    const m2 = /^\\\(([\s\S]+?)\\\)/s.exec(src);
    if (m2) return { type: 'mathInline' as const, raw: m2[0], math: m2[1].trim() };
  },
  renderer(token: any) {
    try {
      const html = katex.renderToString(token.math, { displayMode: false, throwOnError: false });
      return `<span class="math-inline" data-latex="${encAttr(token.math)}">${html}</span>`;
    } catch { return `<span style="color:red">$${encText(token.math)}$</span>`; }
  }
};

// Ruby annotation extension — [文字]{注音} and [文字]^(注音)
const rubyExt = {
  name: 'ruby',
  level: 'inline' as const,
  start(src: string) {
    const m = src.search(/\[[^\]]+\]\{|\[[^\]]+\]\^\(/);
    return m >= 0 ? m : undefined;
  },
  tokenizer(src: string) {
    // Try [text]{ruby}
    let m = /^\[([^\]]+)\]\{([^}]+)\}/.exec(src);
    if (m) return { type: 'ruby' as const, raw: m[0], base: m[1], rt: m[2] };
    // Try [text]^(ruby)
    m = /^\[([^\]]+)\]\^\(([^)]+)\)/.exec(src);
    if (m) return { type: 'ruby' as const, raw: m[0], base: m[1], rt: m[2] };
  },
  renderer(token: any) {
    return `<ruby>${encText(token.base)}<rp>(</rp><rt>${encText(token.rt)}</rt><rp>)</rp></ruby>`;
  }
};

// Footnote extension
const footnoteExt = {
  name: 'footnote',
  level: 'inline' as const,
  start(src: string) { const i = src.indexOf('[^'); return i >= 0 ? i : undefined; },
  tokenizer(src: string) {
    const ref = /^\[\^(\d+)\]/.exec(src);
    if (ref) return { type: 'footnote' as const, raw: ref[0], id: ref[1] };
  },
  renderer(token: any) {
    return `<sup><a href="#fn-${token.id}" id="fnref-${token.id}">[${token.id}]</a></sup>`;
  }
};

// Task list extension
const taskListExt = {
  name: 'taskList',
  level: 'block' as const,
  start(src: string) {
    const i = src.search(/^- \[[ x]\]/);
    return i >= 0 ? i : undefined;
  },
  tokenizer(src: string) {
    const lines = src.split('\n');
    const taskLines: string[] = [];
    let i = 0;
    while (i < lines.length) {
      const m = /^- \[([ x])\] (.+)/.exec(lines[i]);
      if (m) {
        taskLines.push(lines[i]);
        i++;
      } else {
        break;
      }
    }
    if (taskLines.length === 0) return;
    const raw = taskLines.join('\n') + '\n';
    const items = taskLines.map(l => {
      const m = /^- \[([ x])\] (.+)/.exec(l)!;
      return { checked: m[1] === 'x', text: m[2] };
    });
    return { type: 'taskList' as const, raw, items };
  },
  renderer(token: any) {
    const items = token.items.map((item: any) => {
      const checked = item.checked ? 'checked' : '';
      const text = marked.parseInline(item.text);
      return `<li class="task-list-item"><input type="checkbox" ${checked} disabled />${text}</li>`;
    }).join('\n');
    return `<ul>${items}</ul>\n`;
  }
};

// Footnote definitions — post-process to append footnotes
const footnoteDefExt = {
  name: 'footnoteDef',
  level: 'block' as const,
  start(src: string) { const i = src.search(/^\[\^\d+\]:/); return i >= 0 ? i : undefined; },
  tokenizer(src: string) {
    const m = /^\[\^(\d+)\]:\s*(.+?)(?:\n|$)/.exec(src);
    if (m) return { type: 'footnoteDef' as const, raw: m[0], id: m[1], text: m[2] };
  },
  renderer() {
    return ''; // Will be collected and rendered separately
  }
};

// Store footnote definitions for post-processing
let footnotes: { id: string; text: string }[] = [];

// Mermaid counter for unique IDs
let mermaidIdx = 0;
// PlantUML counter for unique IDs
let plantumlIdx = 0;
// Infographic counter for unique IDs
let infographicIdx = 0;

// Initialize mermaid
mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });

// Configure marked
marked.use({
  extensions: [mathBlockExt, mathInlineExt, rubyExt, footnoteExt, taskListExt, footnoteDefExt],
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      if (lang === 'mermaid') {
        const id = `mermaid-${mermaidIdx++}`;
        return `<div class="mermaid-src" id="${id}" data-mermaid="${encAttr(text.trim())}">${encText(text.trim())}</div>\n`;
      }
      if (lang === 'plantuml') {
        const id = `plantuml-${plantumlIdx++}`;
        return `<div class="plantuml-src" id="${id}" data-plantuml="${encAttr(text.trim())}"><em>PlantUML 加载中...</em></div>\n`;
      }
      if (lang === 'infographic') {
        const id = `infographic-${infographicIdx++}`;
        return `<div class="infographic-src" id="${id}" data-infographic="${encAttr(text.trim())}"><em>信息图加载中...</em></div>\n`;
      }
      const safeLang = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const hl = hljs.highlight(text.trim(), { language: safeLang }).value;
      const badge = lang ? `<span class="code-lang-badge">${encText(lang)}</span>` : '';
      return `<div class="code-wrap"><pre data-lang="${encAttr(lang || '')}"><code class="hljs">${hl}</code></pre>${badge}</div>\n`;
    }
  },
  gfm: true,
  breaks: true,
});

export function render(md: string): string {
  footnotes = [];
  mermaidIdx = 0;
  plantumlIdx = 0;
  infographicIdx = 0;

  // Extract footnote definitions before parsing
  const defs: { id: string; text: string }[] = [];
  const cleanedMd = md.replace(/^\[\^(\d+)\]:\s*(.+?)$/gm, (_match, id: string, text: string) => {
    defs.push({ id, text });
    return '';
  });

  let html = marked.parse(cleanedMd) as string;

  // Append footnotes section if there are definitions
  if (defs.length > 0) {
    const fnHtml = defs.map(d => {
      const parsed = marked.parseInline(d.text) as string;
      return `<li id="fn-${d.id}">${parsed} <a href="#fnref-${d.id}">↩</a></li>`;
    }).join('\n');
    html += `<section class="footnotes"><hr><ol>${fnHtml}</ol></section>`;
  }

  return html;
}

// Render all diagram placeholders in the DOM — call after setting innerHTML
export async function renderDiagrams(container: HTMLElement): Promise<void> {
  // Mermaid
  const mermaidEls = container.querySelectorAll('.mermaid-src');
  for (const el of mermaidEls) {
    const src = (el as HTMLElement).getAttribute('data-mermaid')!;
    const id = el.id;
    try {
      const { svg } = await mermaid.render(`${id}-svg`, src);
      (el as HTMLElement).innerHTML = svg;
      (el as HTMLElement).classList.remove('mermaid-src');
      (el as HTMLElement).classList.add('mermaid-rendered');
    } catch (e) {
      (el as HTMLElement).innerHTML = `<pre style="color:red;border:1px dashed red;padding:8px;">Mermaid render error: ${encText(String(e))}</pre>`;
    }
  }

  // PlantUML
  const plantumlEls = container.querySelectorAll('.plantuml-src');
  for (const el of plantumlEls) {
    const src = (el as HTMLElement).getAttribute('data-plantuml')!;
    try {
      const url = await getPlantumlUrl(src);
      (el as HTMLElement).innerHTML = `<img src="${url}" alt="PlantUML diagram" style="display:block;max-width:100%;margin:0 auto;" onerror="this.outerHTML='<pre style=\\'color:red;border:1px dashed red;padding:8px;\\'>PlantUML render failed</pre>'" />`;
      (el as HTMLElement).classList.remove('plantuml-src');
      (el as HTMLElement).classList.add('plantuml-rendered');
    } catch (e) {
      (el as HTMLElement).innerHTML = `<pre style="color:red;border:1px dashed red;padding:8px;">PlantUML encode error: ${encText(String(e))}</pre>`;
    }
  }

  // Infographic (AntV)
  const infoEls = container.querySelectorAll('.infographic-src');
  for (const el of infoEls) {
    const src = (el as HTMLElement).getAttribute('data-infographic')!;
    try {
      const infographic = new Infographic({
        container: el as HTMLElement,
        width: '100%',
        editable: false,
      });
      infographic.render(src);
      (el as HTMLElement).classList.remove('infographic-src');
      (el as HTMLElement).classList.add('infographic-rendered');
    } catch (e) {
      (el as HTMLElement).innerHTML = `<pre style="color:red;border:1px dashed red;padding:8px;">Infographic render error: ${encText(String(e))}</pre>`;
    }
  }
}

export { encText, encAttr };
