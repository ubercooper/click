// Small inline SVG icons (static markup only — never mix with user text).
const svg = (body) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;

export const icons = {
  home: svg('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>'),
  user: svg('<circle cx="12" cy="8.5" r="4"/><path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6"/>'),
  book: svg('<path d="M5 4.5h10.5a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h10.5"/><path d="M9 8.5h6"/>'),
  dice: svg('<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>'),
  check: svg('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  pencil: svg('<path d="M15.5 5.5 18.5 8.5"/><path d="M5 19l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L9 18z"/>'),
  trash: svg('<path d="M4.5 7h15"/><path d="M9.5 7V4.5h5V7"/><path d="M6.5 7l1 13h9l1-13"/>'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  male: svg('<circle cx="10" cy="14" r="5.5"/><path d="M14 10l6-6M15 4h5v5"/>'),
  female: svg('<circle cx="12" cy="9" r="5.5"/><path d="M12 14.5V21M9 18h6"/>'),
  ambiguous: svg('<circle cx="12" cy="10" r="5.5"/><path d="M12 15.5V21"/><path d="M16 6l4-3M17 2.8h3v3"/><path d="M9.5 18.5h5"/>'),
  pen: svg('<path d="M4 20h16"/><path d="M6 16l1-4 9-9 3 3-9 9z"/>'),
};
