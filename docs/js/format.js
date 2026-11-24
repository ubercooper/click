// Timestamp formatting — research.md R8. Stored values are ISO 8601 UTC strings;
// display uses the visitor's locale and time zone.

const timeFmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
const fullFmt = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Today, 3:42 PM" · "Yesterday, 9:10 AM" · "Mar 4, 2026, 9:10 AM" */
export function formatTimestamp(iso, now = new Date()) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (days === 0) return `Today, ${timeFmt.format(date)}`;
  if (days === 1) return `Yesterday, ${timeFmt.format(date)}`;
  return fullFmt.format(date);
}

/** Truncate text to `max` characters, adding an ellipsis. */
export function truncate(text, max = 120) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
