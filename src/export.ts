import { getCurrentTheme, getCurrentCodeTheme } from './themes';
import type { Theme } from './themes';
import { encText, encAttr } from './render';

const HLJS_GITHUB: Record<string, string> = {
  'hljs-keyword': 'color:#d73a49;font-weight:bold',
  'hljs-built_in': 'color:#005cc5',
  'hljs-type': 'color:#005cc5',
  'hljs-literal': 'color:#005cc5',
  'hljs-number': 'color:#005cc5',
  'hljs-regexp': 'color:#032f62',
  'hljs-string': 'color:#032f62',
  'hljs-symbol': 'color:#005cc5',
  'hljs-class': 'color:#6f42c1',
  'hljs-function': 'color:#6f42c1',
  'hljs-title': 'color:#6f42c1',
  'hljs-title function_': 'color:#6f42c1',
  'hljs-title class_': 'color:#6f42c1',
  'hljs-params': 'color:#24292e',
  'hljs-comment': 'color:#6a737d;font-style:italic',
  'hljs-doctag': 'color:#d73a49',
  'hljs-meta': 'color:#735c0f',
  'hljs-tag': 'color:#22863a',
  'hljs-name': 'color:#22863a;font-weight:bold',
  'hljs-attr': 'color:#005cc5',
  'hljs-attribute': 'color:#005cc5',
  'hljs-variable': 'color:#e36209',
  'hljs-template-variable': 'color:#e36209',
  'hljs-selector-tag': 'color:#22863a',
  'hljs-selector-id': 'color:#6f42c1',
  'hljs-selector-class': 'color:#6f42c1',
  'hljs-addition': 'color:#22863a;background:#f0fff4',
  'hljs-deletion': 'color:#b31d28;background:#ffeef0',
  'hljs-operator': 'color:#d73a49',
  'hljs-punctuation': 'color:#24292e',
  'hljs-property': 'color:#005cc5',
  'hljs-subst': 'color:#24292e',
};

const HLJS_MONOKAI: Record<string, string> = {
  'hljs-keyword': 'color:#f92672;font-weight:bold',
  'hljs-built_in': 'color:#66d9e8',
  'hljs-type': 'color:#66d9e8',
  'hljs-literal': 'color:#ae81ff',
  'hljs-number': 'color:#ae81ff',
  'hljs-regexp': 'color:#e6db74',
  'hljs-string': 'color:#e6db74',
  'hljs-symbol': 'color:#e6db74',
  'hljs-class': 'color:#a6e22e',
  'hljs-function': 'color:#a6e22e',
  'hljs-title': 'color:#a6e22e',
  'hljs-title function_': 'color:#a6e22e',
  'hljs-title class_': 'color:#a6e22e',
  'hljs-params': 'color:#f8f8f2',
  'hljs-comment': 'color:#75715e;font-style:italic',
  'hljs-doctag': 'color:#f92672',
  'hljs-tag': 'color:#f92672',
  'hljs-name': 'color:#a6e22e;font-weight:bold',
  'hljs-attr': 'color:#a6e22e',
  'hljs-attribute': 'color:#a6e22e',
  'hljs-variable': 'color:#fd971f',
  'hljs-template-variable': 'color:#fd971f',
  'hljs-operator': 'color:#f92672',
  'hljs-punctuation': 'color:#f8f8f2',
  'hljs-property': 'color:#a6e22e',
  'hljs-subst': 'color:#f8f8f2',
};

function generateWeChatHTML(): string {
  const t = getCurrentTheme();
  const codeTheme = getCurrentCodeTheme();
  const hljsMap = codeTheme === 'monokai' ? HLJS_MONOKAI : HLJS_GITHUB;
  const codeBg = codeTheme === 'monokai' ? '#272822' : t.codeBg;
  const codeDef = codeTheme === 'monokai' ? '#f8f8f2' : t.codeDef;

  const src = document.getElementById('preview')!;
  const root = src.cloneNode(true) as HTMLElement;

  // Step 1 — Math → image
  root.querySelectorAll('[data-latex]').forEach(el => {
    const latex = el.getAttribute('data-latex')!;
    const isBlock = el.hasAttribute('data-display');
    const url = `https://latex.codecogs.com/svg.image?${encodeURIComponent(latex)}`;
    const img = document.createElement('img');
    img.src = url;
    img.alt = latex;
    img.dataset.mathImg = '1';
    img.setAttribute('style',
      isBlock
        ? 'display:block;margin:16px auto;max-width:100%;'
        : 'vertical-align:middle;height:1.5em;max-height:1.5em;');
    el.replaceWith(img);
  });

  // Step 2 — Mermaid SVG → <img> with data URL
  root.querySelectorAll('.mermaid-rendered').forEach(el => {
    const svg = (el as HTMLElement).querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
      const img = document.createElement('img');
      img.src = dataUrl;
      img.alt = 'Mermaid diagram';
      img.setAttribute('style', 'display:block;max-width:100%;margin:16px auto;');
      el.replaceWith(img);
    }
  });

  // Step 2b — PlantUML: ensure img has inline style
  root.querySelectorAll('.plantuml-rendered').forEach(el => {
    el.removeAttribute('class');
  });

  // Step 2c — Infographic SVG → <img> with data URL
  root.querySelectorAll('.infographic-rendered').forEach(el => {
    const svg = (el as HTMLElement).querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
      const img = document.createElement('img');
      img.src = dataUrl;
      img.alt = 'Infographic';
      img.setAttribute('style', 'display:block;max-width:100%;margin:16px auto;');
      el.replaceWith(img);
    }
  });

  // Step 3 — hljs span classes → inline styles
  root.querySelectorAll('pre code span').forEach(span => {
    const el = span as HTMLElement;
    const classes = Array.from(el.classList);
    let s = '';
    classes.forEach(cls => { if (hljsMap[cls]) s += hljsMap[cls] + ';'; });
    if (s) el.setAttribute('style', s);
    el.removeAttribute('class');
  });

  // Step 4 — inline styles on all elements
  walkAndStyle(root, t, codeBg, codeDef);

  // Step 5 — Wrap
  const ff = '-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif';
  return `<section style="font-family:${ff};font-size:15px;color:${t.text};line-height:1.85;padding:0 2px;max-width:100%;word-break:break-word;">${root.innerHTML}</section>`;
}

function walkAndStyle(root: HTMLElement, t: Theme, codeBg: string, codeDef: string) {
  function getStyle(el: HTMLElement): string | null {
    const tag = el.tagName.toLowerCase();
    const parent = el.parentElement ? el.parentElement.tagName.toLowerCase() : '';

    if (el.dataset && el.dataset.mathImg) return null;

    switch (tag) {
      case 'h1': return `font-size:26px;font-weight:700;color:${t.heading};margin:28px 0 14px;line-height:1.4;padding-bottom:10px;border-bottom:2px solid ${t.primary};`;
      case 'h2': return `font-size:21px;font-weight:700;color:${t.heading};margin:24px 0 10px;line-height:1.4;padding-left:11px;border-left:4px solid ${t.primary};`;
      case 'h3': return `font-size:17px;font-weight:700;color:${t.heading};margin:20px 0 8px;line-height:1.4;`;
      case 'h4': case 'h5': case 'h6': return `font-size:15px;font-weight:700;color:${t.heading};margin:14px 0 6px;`;
      case 'p': return `font-size:15px;color:${t.text};line-height:1.85;margin:12px 0;`;
      case 'a': return `color:${t.primary};text-decoration:none;border-bottom:1px solid ${t.primary};`;
      case 'strong': return `font-weight:700;color:${t.heading};`;
      case 'em': return `font-style:italic;color:${t.textLight};`;
      case 'del': return `text-decoration:line-through;color:${t.textLight};`;
      case 'code':
        if (parent === 'pre') return `background:transparent;color:${codeDef};padding:0;font-family:Consolas,Monaco,"Courier New",monospace;font-size:13px;line-height:1.65;display:block;`;
        return `background:${t.codeBg};color:${t.codeText};padding:2px 6px;border-radius:4px;font-family:Consolas,Monaco,"Courier New",monospace;font-size:13px;`;
      case 'pre': return `background:${codeBg};border-radius:7px;padding:16px 18px;overflow-x:auto;margin:16px 0;border:1px solid ${t.border};`;
      case 'blockquote': return `background:${t.bqBg};border-left:4px solid ${t.primary};margin:16px 0;padding:12px 16px;border-radius:0 6px 6px 0;`;
      case 'ul': return `margin:12px 0;padding-left:22px;`;
      case 'ol': return `margin:12px 0;padding-left:22px;`;
      case 'li': return `font-size:15px;color:${t.text};margin:5px 0;line-height:1.85;`;
      case 'table': return `width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;`;
      case 'th': return `background:${t.tblHead};color:${t.heading};font-weight:700;padding:10px 14px;text-align:left;border:1px solid ${t.tblBorder};`;
      case 'td': return `padding:8px 14px;border:1px solid ${t.tblBorder};color:${t.text};`;
      case 'hr': return `border:none;border-top:2px solid ${t.border};margin:24px 0;`;
      case 'img':
        if (el.dataset && el.dataset.mathImg) return null;
        return `max-width:100%;height:auto;display:block;margin:16px auto;border-radius:6px;`;
      case 'section': return '';
      case 'sup': return '';
      case 'ruby': return '';
      case 'rt': return 'font-size:0.7em;text-align:center;';
      case 'svg': return 'max-width:100%;height:auto;display:block;margin:0 auto;';
      case 'rp': return '';
      case 'ol': case 'ul': case 'thead': case 'tbody': case 'tr': return '';
      default: return null;
    }
  }

  function walk(el: HTMLElement) {
    if (el.nodeType !== Node.ELEMENT_NODE) return;
    if (el.classList && el.classList.contains('code-lang-badge')) {
      el.remove();
      return;
    }
    if (el.classList && el.classList.contains('code-wrap')) {
      const frag = document.createDocumentFragment();
      while (el.firstChild) frag.appendChild(el.firstChild);
      el.replaceWith(frag);
      return;
    }

    const s = getStyle(el);
    if (s !== null && !el.getAttribute('style')) {
      if (s) el.setAttribute('style', s);
    }
    el.removeAttribute('class');
    el.removeAttribute('data-lang');

    Array.from(el.childNodes).forEach(child => walk(child as HTMLElement));
  }

  walk(root);
}

async function copyToWeChat() {
  const html = generateWeChatHTML();

  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([html], { type: 'text/plain' }),
        })
      ]);
      (window as any).showToast('✓ 已复制！直接粘贴到公众号编辑器即可');
      return;
    } catch { /* fall through */ }
  }

  try {
    const tmp = document.createElement('div');
    tmp.contentEditable = 'true';
    tmp.style.cssText = 'position:fixed;left:-99999px;top:0;opacity:0;pointer-events:none;';
    tmp.innerHTML = html;
    document.body.appendChild(tmp);
    tmp.focus();
    const range = document.createRange();
    range.selectNodeContents(tmp);
    const sel = window.getSelection()!;
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();
    document.body.removeChild(tmp);
    (window as any).showToast('✓ 已复制！直接粘贴到公众号编辑器即可');
  } catch {
    (window as any).showToast('⚠ 复制失败，请点击「查看 HTML」手动复制');
  }
}

function downloadHTML() {
  const html = generateWeChatHTML();
  const fullHtml = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>MD2WeChat Export</title></head><body style="max-width:680px;margin:0 auto;padding:20px;">${html}</body></html>`;
  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'md2wechat-export.html';
  a.click();
  URL.revokeObjectURL(url);
  (window as any).showToast('✓ HTML 文件已下载');
}

export function initExport() {
  document.getElementById('copy-btn')!.addEventListener('click', copyToWeChat);

  // Cmd+Shift+C shortcut
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      copyToWeChat();
    }
  });

  // Download button — add next to copy button
  const dlBtn = document.createElement('button');
  dlBtn.className = 'btn-ghost';
  dlBtn.innerHTML = '📥 导出 HTML';
  dlBtn.addEventListener('click', downloadHTML);
  document.querySelector('.toolbar-right')!.insertBefore(dlBtn, document.getElementById('copy-btn')!);
}

export function initSourceModal() {
  const modalBg = document.getElementById('modal-bg')!;
  const modalTitle = document.getElementById('modal-title')!;
  const modalBody = document.getElementById('modal-body')!;
  const modalFoot = document.getElementById('modal-foot')!;

  document.getElementById('source-btn')!.addEventListener('click', () => {
    const html = generateWeChatHTML();
    modalTitle.textContent = '导出 HTML（可直接粘贴到公众号）';
    modalBody.innerHTML = `<textarea id="modal-source" readonly>${encAttr(html)}</textarea>`;
    modalFoot.innerHTML = '';

    const copyRichBtn = document.createElement('button');
    copyRichBtn.className = 'btn-copy';
    copyRichBtn.style.flex = '1';
    copyRichBtn.innerHTML = `<svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/></svg>复制富文本（推荐）`;
    copyRichBtn.addEventListener('click', () => {
      copyToWeChat();
      modalBg.classList.remove('open');
    });

    const copySrcBtn = document.createElement('button');
    copySrcBtn.className = 'btn-ghost';
    copySrcBtn.style.flex = '1';
    copySrcBtn.textContent = '复制 HTML 源码';
    copySrcBtn.addEventListener('click', () => {
      const src = document.getElementById('modal-source') as HTMLTextAreaElement;
      src.select();
      navigator.clipboard.writeText(src.value)
        .then(() => (window as any).showToast('✓ HTML 源码已复制'))
        .catch(() => { document.execCommand('copy'); (window as any).showToast('✓ HTML 源码已复制'); });
    });

    modalFoot.appendChild(copyRichBtn);
    modalFoot.appendChild(copySrcBtn);
    modalBg.classList.add('open');
  });

  document.getElementById('modal-close')!.addEventListener('click', () => {
    modalBg.classList.remove('open');
  });
  modalBg.addEventListener('click', (e) => {
    if (e.target === modalBg) modalBg.classList.remove('open');
  });
}
