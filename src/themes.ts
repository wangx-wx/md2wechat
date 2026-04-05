export interface Theme {
  id: string;
  name: string;
  dot: string;
  primary: string;
  text: string;
  textLight: string;
  heading: string;
  codeBg: string;
  codeText: string;
  codeDef: string;
  bqBg: string;
  tblBorder: string;
  tblHead: string;
  border: string;
}

const THEME_STORAGE = 'md2wechat_theme';
const CUSTOM_THEME_STORAGE = 'md2wechat_custom_theme';
const CODE_THEME_STORAGE = 'md2wechat_code_theme';

export const THEMES: Record<string, Theme> = {
  default: { id: 'default', name: '默认蓝', dot: '#1a6ed8',
    primary: '#1a6ed8', text: '#333', textLight: '#666', heading: '#111',
    codeBg: '#f6f8fa', codeText: '#d63384', codeDef: '#24292e',
    bqBg: '#f0f4ff', tblBorder: '#dfe2e5', tblHead: '#e8f0fe', border: '#e1e4e8' },
  elegant: { id: 'elegant', name: '优雅紫', dot: '#7C3AED',
    primary: '#7C3AED', text: '#374151', textLight: '#9CA3AF', heading: '#111827',
    codeBg: '#faf5ff', codeText: '#7C3AED', codeDef: '#374151',
    bqBg: '#faf5ff', tblBorder: '#E5E7EB', tblHead: '#ede9fe', border: '#E5E7EB' },
  fresh: { id: 'fresh', name: '清新绿', dot: '#059669',
    primary: '#059669', text: '#1F2937', textLight: '#6B7280', heading: '#111827',
    codeBg: '#f0fdf4', codeText: '#059669', codeDef: '#1F2937',
    bqBg: '#f0fdf4', tblBorder: '#A7F3D0', tblHead: '#d1fae5', border: '#D1FAE5' },
  warm: { id: 'warm', name: '暖阳橙', dot: '#D97706',
    primary: '#D97706', text: '#292524', textLight: '#78716C', heading: '#1C1917',
    codeBg: '#fff8ed', codeText: '#B45309', codeDef: '#292524',
    bqBg: '#fffbeb', tblBorder: '#FDE68A', tblHead: '#fef3c7', border: '#FDE68A' },
  ink: { id: 'ink', name: '水墨黑', dot: '#334155',
    primary: '#334155', text: '#1E293B', textLight: '#64748B', heading: '#0F172A',
    codeBg: '#F8FAFC', codeText: '#334155', codeDef: '#1E293B',
    bqBg: '#F8FAFC', tblBorder: '#CBD5E1', tblHead: '#E2E8F0', border: '#E2E8F0' },
  pink: { id: 'pink', name: '少女粉', dot: '#EC4899',
    primary: '#EC4899', text: '#1F2937', textLight: '#9CA3AF', heading: '#111827',
    codeBg: '#fdf2f8', codeText: '#DB2777', codeDef: '#1F2937',
    bqBg: '#fdf2f8', tblBorder: '#FBCFE8', tblHead: '#fce7f3', border: '#FBCFE8' },
  tech: { id: 'tech', name: '科技蓝', dot: '#0EA5E9',
    primary: '#0EA5E9', text: '#1E293B', textLight: '#64748B', heading: '#0F172A',
    codeBg: '#f0f9ff', codeText: '#0369A1', codeDef: '#1E293B',
    bqBg: '#f0f9ff', tblBorder: '#BAE6FD', tblHead: '#E0F2FE', border: '#BAE6FD' },
  minimal: { id: 'minimal', name: '极简白', dot: '#6B7280',
    primary: '#6B7280', text: '#374151', textLight: '#9CA3AF', heading: '#111827',
    codeBg: '#F9FAFB', codeText: '#4B5563', codeDef: '#374151',
    bqBg: '#F9FAFB', tblBorder: '#E5E7EB', tblHead: '#F3F4F6', border: '#E5E7EB' },
};

const CUSTOM_THEME_FIELDS: { key: keyof Theme; label: string }[] = [
  { key: 'primary', label: '主色' },
  { key: 'text', label: '正文颜色' },
  { key: 'heading', label: '标题颜色' },
  { key: 'codeBg', label: '代码背景' },
  { key: 'codeText', label: '代码文字' },
  { key: 'bqBg', label: '引用背景' },
  { key: 'tblBorder', label: '表格边框' },
  { key: 'tblHead', label: '表头背景' },
  { key: 'border', label: '分割线' },
];

let currentTheme = 'default';
let currentCodeTheme = 'github';

export function getCurrentTheme(): Theme {
  return THEMES[currentTheme];
}

export function getCurrentCodeTheme(): string {
  return currentCodeTheme;
}

function applyTheme(id: string, theme?: Theme) {
  const t = theme || THEMES[id];
  if (!t) return;
  currentTheme = id;
  const r = document.documentElement;
  r.style.setProperty('--t-primary', t.primary);
  r.style.setProperty('--t-text', t.text);
  r.style.setProperty('--t-text-light', t.textLight);
  r.style.setProperty('--t-heading', t.heading);
  r.style.setProperty('--t-code-bg', currentCodeTheme === 'monokai' ? '#272822' : t.codeBg);
  r.style.setProperty('--t-code-text', t.codeText);
  r.style.setProperty('--t-code-def', currentCodeTheme === 'monokai' ? '#f8f8f2' : t.codeDef);
  r.style.setProperty('--t-bq-bg', t.bqBg);
  r.style.setProperty('--t-tbl-border', t.tblBorder);
  r.style.setProperty('--t-tbl-head-bg', t.tblHead);
  r.style.setProperty('--t-border', t.border);
  document.querySelectorAll('.t-pill').forEach(p => p.classList.toggle('on', (p as HTMLElement).dataset.id === id));
}

function buildPills() {
  const c = document.getElementById('theme-pills')!;
  Object.values(THEMES).forEach(t => {
    const b = document.createElement('button');
    b.className = 't-pill';
    b.dataset.id = t.id;
    b.innerHTML = `<span class="dot" style="background:${t.dot}"></span>${t.name}`;
    b.onclick = () => {
      applyTheme(t.id);
      localStorage.setItem(THEME_STORAGE, t.id);
      closeCustomPanel();
    };
    c.appendChild(b);
  });
}

export function initThemes() {
  buildPills();

  // Restore saved theme
  const saved = localStorage.getItem(THEME_STORAGE);
  if (saved && THEMES[saved]) {
    currentTheme = saved;
  }
  applyTheme(currentTheme);

  // Custom theme panel
  initCustomThemePanel();
}

export function initCodeTheme() {
  const btn = document.getElementById('code-theme-btn')!;
  const savedCode = localStorage.getItem(CODE_THEME_STORAGE);
  if (savedCode) {
    currentCodeTheme = savedCode;
    updateCodeThemeUI(btn);
  }

  btn.addEventListener('click', () => {
    currentCodeTheme = currentCodeTheme === 'github' ? 'monokai' : 'github';
    updateCodeThemeUI(btn);
    applyTheme(currentTheme);
    localStorage.setItem(CODE_THEME_STORAGE, currentCodeTheme);
  });
}

function updateCodeThemeUI(btn: HTMLElement) {
  if (currentCodeTheme === 'monokai') {
    btn.textContent = '🌙 深色代码';
    document.getElementById('hljs-css')!.setAttribute('href',
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/monokai.min.css');
  } else {
    btn.textContent = '💡 浅色代码';
    document.getElementById('hljs-css')!.setAttribute('href',
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css');
  }
}

function initCustomThemePanel() {
  const panel = document.getElementById('custom-theme-panel')!;
  const fieldsContainer = document.getElementById('ctp-fields')!;

  document.getElementById('custom-theme-btn')!.addEventListener('click', () => {
    panel.classList.toggle('open');
  });
  document.getElementById('ctp-close')!.addEventListener('click', closeCustomPanel);

  // Load saved custom theme values
  const savedCustom = localStorage.getItem(CUSTOM_THEME_STORAGE);
  let customValues: Partial<Theme> = {};
  if (savedCustom) {
    try { customValues = JSON.parse(savedCustom); } catch {}
  }

  // Build color fields
  CUSTOM_THEME_FIELDS.forEach(({ key, label }) => {
    const baseTheme = THEMES[currentTheme] || THEMES.default;
    const value = customValues[key] || baseTheme[key];
    const field = document.createElement('div');
    field.className = 'ctp-field';
    field.innerHTML = `<label>${label}</label><input type="color" data-key="${key}" value="${value}">`;
    fieldsContainer.appendChild(field);

    const input = field.querySelector('input')!;
    input.addEventListener('input', () => {
      // Live preview
      const overrides: Record<string, string> = {};
      fieldsContainer.querySelectorAll('input[type="color"]').forEach((inp: any) => {
        overrides[inp.dataset.key!] = inp.value;
      });
      const t = { ...THEMES[currentTheme] || THEMES.default, ...overrides };
      applyTheme(currentTheme, t);
    });
  });

  // Save button
  document.getElementById('ctp-save')!.addEventListener('click', () => {
    const overrides: Record<string, string> = {};
    fieldsContainer.querySelectorAll('input[type="color"]').forEach((inp: any) => {
      overrides[inp.dataset.key!] = inp.value;
    });
    localStorage.setItem(CUSTOM_THEME_STORAGE, JSON.stringify(overrides));
    closeCustomPanel();
    (window as any).showToast('✓ 自定义主题已保存');
  });

  // Reset button
  document.getElementById('ctp-reset')!.addEventListener('click', () => {
    const baseTheme = THEMES[currentTheme] || THEMES.default;
    fieldsContainer.querySelectorAll('input[type="color"]').forEach((inp: any) => {
      const key = inp.dataset.key! as keyof Theme;
      inp.value = baseTheme[key];
    });
    applyTheme(currentTheme);
    localStorage.removeItem(CUSTOM_THEME_STORAGE);
    (window as any).showToast('✓ 已重置为默认');
  });
}

function closeCustomPanel() {
  document.getElementById('custom-theme-panel')!.classList.remove('open');
}
