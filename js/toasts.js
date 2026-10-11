/* Teacher Desk lightweight toast notifications: no third-party runtime required. */
(() => {
  'use strict';
  const ICONS = {
    success: '<path d="M20 6 9 17l-5-5"/>',
    error: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>',
    warning: '<path d="M10.3 3.9 2.3 18a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3l-8-14.1a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>'
  };
  const CLOSE_ICON = '<path d="M18 6 6 18M6 6l12 12"/>';
  const dismissers = new WeakMap();
  const svg = paths => `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

  function kindFor(message) {
    if (/\b(error|failed|failure|could not|couldn't|can't|cannot|unable|invalid|incorrect|denied|forbidden|unauthorized|problem|something went wrong|try again|not found)\b/i.test(message)) return 'error';
    if (/\b(warning|unavailable|offline|keep at least|not connected|browser storage)\b/i.test(message)) return 'warning';
    if (/\b(check your email|reset email requested|confirm your account|requested|information)\b/i.test(message)) return 'info';
    return 'success';
  }

  function notify(message, options = {}) {
    const region = document.getElementById('toast');
    if (!region) return;
    const text = String(message == null ? '' : message).trim();
    if (!text) return;
    if (typeof options === 'string') options = {type: options};
    const type = ['success', 'error', 'warning', 'info'].includes(options.type) ? options.type : kindFor(text);
    const title = String(options.title || text.replace(/[.!]+$/, '')).trim();
    const description = options.description || (/^signed out\.?$/i.test(text) ? 'Your workspace is secure until you sign in again.' : '');

    // A repeated event should not produce identical overlapping notices.
    const duplicate = [...region.children].find(node => node.dataset.message === text && !node.classList.contains('td-toast-out'));
    if (duplicate) return;

    const duration = Math.max(2500, Math.min(12000,
      Number.isFinite(Number(options.duration)) ? Number(options.duration) : type === 'error' ? 7000 : 4500));
    while (region.childElementCount >= 3) {
      const oldest = region.firstElementChild;
      dismissers.get(oldest)?.(true);
      if (oldest.isConnected) oldest.remove();
    }

    const item = document.createElement('div');
    item.className = `td-toast td-toast-${type}`;
    item.dataset.message = text;
    item.setAttribute('role', type === 'error' ? 'alert' : 'status');
    item.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    item.setAttribute('aria-atomic', 'true');
    item.style.setProperty('--td-toast-duration', `${duration}ms`);

    const symbol = document.createElement('span');
    symbol.className = 'td-toast-symbol';
    symbol.innerHTML = svg(ICONS[type]);
    const content = document.createElement('span');
    content.className = 'td-toast-content';
    const heading = document.createElement('strong');
    heading.className = 'td-toast-title';
    heading.textContent = title;
    content.append(heading);
    if (description) {
      const detail = document.createElement('span');
      detail.className = 'td-toast-description';
      detail.textContent = String(description);
      content.append(detail);
    }
    const close = document.createElement('button');
    close.className = 'td-toast-close';
    close.type = 'button';
    close.setAttribute('aria-label', `Dismiss notification: ${title}`);
    close.innerHTML = svg(CLOSE_ICON);
    const progress = document.createElement('span');
    progress.className = 'td-toast-progress';
    progress.setAttribute('aria-hidden', 'true');
    item.append(symbol, content, close, progress);

    let timeLeft = duration;
    let runningSince = 0;
    let timer = null;
    let settled = false;
    function dismiss(immediate = false) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { item.remove(); return; }
      item.classList.add('td-toast-out');
      setTimeout(() => item.remove(), 220);
    }
    function pause() {
      if (!timer) return;
      timeLeft = Math.max(0, timeLeft - (Date.now() - runningSince));
      clearTimeout(timer);
      timer = null;
      item.classList.add('td-toast-paused');
    }
    function resume() {
      if (settled || timer || item.matches(':hover') || item.contains(document.activeElement)) return;
      item.classList.remove('td-toast-paused');
      runningSince = Date.now();
      timer = setTimeout(dismiss, Math.max(0, timeLeft));
    }
    close.addEventListener('click', () => dismiss());
    item.addEventListener('mouseenter', pause);
    item.addEventListener('mouseleave', resume);
    item.addEventListener('focusin', pause);
    item.addEventListener('focusout', () => setTimeout(resume, 0));
    dismissers.set(item, dismiss);
    region.append(item);
    resume();
    return item;
  }
  window.TeacherDeskNotify = notify;
})();
