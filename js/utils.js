export const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function url(value, optional = false) {
  if (!value && optional) return '';
  const u = new URL(value);
  if (!['https:', 'http:'].includes(u.protocol) || u.username || u.password) throw Error('Use a complete https:// or http:// URL without embedded credentials.');
  return u.href;
}
export function safeUrl(v) { try { return url(v); } catch { return ''; } }
export const color = v => /^#[0-9a-f]{6}$/i.test(v || '') ? v : '#701B32';
export const id = () => crypto.randomUUID();
export function relative(date) { const mins = Math.max(0, Math.floor((Date.now()-new Date(date))/60000)); return mins < 1 ? 'Just now' : mins < 60 ? `${mins} minutes ago` : mins < 1440 ? `${Math.floor(mins/60)} hours ago` : mins < 2880 ? 'Yesterday' : `${Math.floor(mins/1440)} days ago`; }
const paths = { home:'m3 10 9-7 9 7v10H3z M9 20v-7h6v7',websites:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',categories:'M3 6h7l2 3h9v11H3z M3 6V3h7l2 3',favorites:'m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3-5.7-3-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z',recent:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v6l4 2',notes:'M5 3h14v18H5z M8 7h8 M8 11h8 M8 15h5',resources:'m10 14 4-4 M8 16l-1 1a4 4 0 0 1-5-5l4-4a4 4 0 0 1 5 0 M13 16a4 4 0 0 0 5 0l4-4a4 4 0 0 0-5-5l-1 1',settings:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z',external:'M14 3h7v7 M21 3 11 13 M10 5H4v15h15v-6',search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M15 15l6 6',plus:'M12 5v14 M5 12h14',close:'m6 6 12 12 M18 6 6 18',menu:'M4 6h16 M4 12h16 M4 18h16',logout:'M9 3H3v18h6 M10 12h11 M17 8l4 4-4 4',book:'M12 5C8 2 3 3 3 3v16s5-1 9 2c4-3 9-2 9-2V3s-5-1-9 2v16',check:'M6 4h12v17H6z M9 3h6v3H9z m0 10 2 2 4-5',people:'M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M2 21v-4a6 6 0 0 1 12 0v4 M17 4a3 3 0 0 1 0 6 M18 14a4 4 0 0 1 4 4v3',leaf:'M4 20C2 8 10 4 21 3c-1 13-5 20-17 17 M4 20 16 8',gem:'m12 2 9 8-9 12-9-12z M3 10h18 M12 2 8 10l4 12 4-12z',heart:'M12 21 3 12C-3 3 8-1 12 6c4-7 15-3 9 6z',more:'M5 12h.01 M12 12h.01 M19 12h.01',arrow:'M4 12h16 M15 7l5 5-5 5',up:'m6 14 6-6 6 6',down:'m6 10 6 6 6-6',edit:'m4 16 12-12 4 4L8 20H4z M14 6l4 4',trash:'M3 6h18 M9 6V3h6v3 M6 6l1 15h10l1-15',pin:'m8 3 8 0-1 7 4 4H5l4-4z M12 14v8'};
export const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.websites}"/></svg>`;
