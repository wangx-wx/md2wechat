let toastTimer: ReturnType<typeof setTimeout>;

export function showToast(msg: string) {
  const el = document.getElementById('toast')!;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

export function initResizer() {
  const rz = document.getElementById('resizer')!;
  const ep = document.getElementById('editor-pane')!;
  let dragging = false, startX = 0, startW = 0;

  rz.addEventListener('mousedown', (e) => {
    dragging = true;
    startX = e.clientX;
    startW = ep.getBoundingClientRect().width;
    rz.classList.add('dragging');
    document.body.style.cssText += ';cursor:col-resize;user-select:none;';
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const ws = document.querySelector('.workspace')!.getBoundingClientRect().width;
    const nw = Math.max(240, Math.min(startW + e.clientX - startX, ws - 280));
    ep.style.flex = 'none';
    ep.style.width = nw + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    rz.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  });
}
