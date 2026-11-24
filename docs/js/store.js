// Local "backend" — the ONLY module that touches localStorage (Constitution III).
// Contract: specs/001-profile-log-dashboard/contracts/store-api.md
// Fields:   specs/001-profile-log-dashboard/data-model.md
//
// Every exported call is async, waits a simulated 150–300 ms, and always RESOLVES to
//   { ok: true,  data, persistent } | { ok: false, error: { code, message }, persistent }

import { firstNames, lastNames } from './data/names.js';

export const KEYS = Object.freeze({
  profile: 'click.v1.profile',
  entries: 'click.v1.entries',
});
export const GENDERS = Object.freeze(['male', 'female', 'ambiguous']);
export const MAX_ENTRY_LENGTH = 1000; // data-model.md LogEntry.text
const MAX_NAME_LENGTH = 40; // data-model.md Profile.firstName / Profile.lastName

// ---------------------------------------------------------------------------
// Safe storage with in-memory fallback (research.md R4)
// ---------------------------------------------------------------------------

const memory = new Map();
let persistent = detectStorage();

function detectStorage() {
  try {
    const probe = 'click.v1.__probe__';
    globalThis.localStorage.setItem(probe, '1');
    globalThis.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function readRaw(key) {
  if (persistent) {
    try {
      const raw = globalThis.localStorage.getItem(key);
      if (raw === null) memory.delete(key);
      else memory.set(key, raw);
      return raw;
    } catch {
      persistent = false;
    }
  }
  return memory.has(key) ? memory.get(key) : null;
}

function writeRaw(key, raw) {
  memory.set(key, raw);
  if (!persistent) return;
  try {
    globalThis.localStorage.setItem(key, raw);
  } catch {
    persistent = false; // quota exceeded or storage revoked: keep going in memory
  }
}

/** Move unparseable data aside so the app can carry on with an empty value. */
function quarantine(key, raw) {
  memory.delete(key);
  if (!persistent) return;
  try {
    globalThis.localStorage.setItem(`${key}.corrupt-${Date.now()}`, raw);
  } catch {
    /* no room to keep a copy; drop it */
  }
  try {
    globalThis.localStorage.removeItem(key);
  } catch {
    persistent = false;
  }
}

function safeRead(key) {
  const raw = readRaw(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    quarantine(key, raw);
    return null;
  }
}

function safeWrite(key, value) {
  writeRaw(key, JSON.stringify(value));
}

// ---------------------------------------------------------------------------
// Result helpers
// ---------------------------------------------------------------------------

const delay = () => new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 150));
const ok = (data) => ({ ok: true, data, persistent });
const fail = (code, message) => ({ ok: false, error: { code, message }, persistent });

async function run(fn) {
  await delay();
  try {
    return fn();
  } catch (err) {
    console.error('[store]', err);
    return fail('STORAGE_ERROR', 'Something went wrong while saving or loading.');
  }
}

/** Generates data-model.md LogEntry.id */
export function newId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    /* insecure context — fall through */
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isPersistent() {
  return persistent;
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

const isName = (v) => typeof v === 'string' && v.length >= 1 && v.length <= MAX_NAME_LENGTH;

function isValidProfile(p) {
  return Boolean(p) && GENDERS.includes(p.gender) && isName(p.firstName) && isName(p.lastName);
}

export function getProfile() {
  return run(() => {
    const value = safeRead(KEYS.profile);
    return ok(isValidProfile(value) ? value : null);
  });
}

export function saveProfile({ gender, firstName, lastName } = {}) {
  return run(() => {
    const valid =
      GENDERS.includes(gender) &&
      isName(firstName) &&
      isName(lastName) &&
      firstNames[gender].includes(firstName) &&
      lastNames.includes(lastName);
    if (!valid) return fail('INVALID_PROFILE', 'Pick a gender and generate a name first.');

    const existing = safeRead(KEYS.profile);
    const now = new Date().toISOString();
    const profile = {
      gender,
      firstName,
      lastName,
      createdAt: isValidProfile(existing) && existing.createdAt ? existing.createdAt : now,
      updatedAt: now,
    };
    safeWrite(KEYS.profile, profile);
    return ok(profile);
  });
}

// ---------------------------------------------------------------------------
// Log entries
// ---------------------------------------------------------------------------

const isValidEntry = (e) =>
  Boolean(e) && typeof e.id === 'string' && typeof e.text === 'string' && typeof e.createdAt === 'string';

function readEntries() {
  const value = safeRead(KEYS.entries);
  return Array.isArray(value) ? value.filter(isValidEntry) : [];
}

/** Newest createdAt first; ties keep the later-written entry first. */
function sortNewest(entries) {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      if (a.entry.createdAt !== b.entry.createdAt) return a.entry.createdAt < b.entry.createdAt ? 1 : -1;
      return b.index - a.index;
    })
    .map(({ entry }) => entry);
}

function cleanText(text) {
  const trimmed = typeof text === 'string' ? text.trim() : '';
  if (!trimmed) return { error: fail('EMPTY_TEXT', 'That entry is empty.') };
  if (trimmed.length > MAX_ENTRY_LENGTH) {
    return { error: fail('TOO_LONG', `Entries can be up to ${MAX_ENTRY_LENGTH} characters.`) };
  }
  return { text: trimmed };
}

export function listEntries() {
  return run(() => ok(sortNewest(readEntries())));
}

export function createEntry(text) {
  return run(() => {
    const clean = cleanText(text);
    if (clean.error) return clean.error;
    const entry = { id: newId(), text: clean.text, createdAt: new Date().toISOString(), updatedAt: null };
    const entries = readEntries();
    entries.push(entry);
    safeWrite(KEYS.entries, entries);
    return ok(entry);
  });
}

export function updateEntry(id, text) {
  return run(() => {
    const entries = readEntries();
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) return fail('NOT_FOUND', "That entry doesn't exist anymore.");
    const clean = cleanText(text);
    if (clean.error) return clean.error;
    const updated = { ...entries[index], text: clean.text, updatedAt: new Date().toISOString() };
    entries[index] = updated;
    safeWrite(KEYS.entries, entries);
    return ok(updated);
  });
}

export function deleteEntry(id) {
  return run(() => {
    const entries = readEntries();
    const remaining = entries.filter((e) => e.id !== id);
    if (remaining.length === entries.length) return fail('NOT_FOUND', "That entry doesn't exist anymore.");
    safeWrite(KEYS.entries, remaining);
    return ok({ id });
  });
}

export function getStats() {
  return run(() => {
    const entries = sortNewest(readEntries());
    return ok({ count: entries.length, latest: entries[0] ?? null });
  });
}
