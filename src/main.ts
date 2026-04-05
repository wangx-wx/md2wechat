import './styles.css';
import { initEditor } from './editor';
import { initThemes, initCodeTheme } from './themes';
import { initExport, initSourceModal } from './export';
import { initResizer, showToast } from './ui';

// Make showToast available globally for modal buttons
(window as any).showToast = showToast;

initThemes();
initCodeTheme();
initEditor();
initExport();
initSourceModal();
initResizer();
