# Data Model: Profile & Log Dashboard

All data lives in the browser's `localStorage` on a single device (see [research.md](./research.md) R4). Keys are versioned with the prefix `click.v1.`.

## Profile

Stored under `click.v1.profile` as a single JSON object, or absent if no profile exists yet.

| Field | Type | Rules |
|---|---|---|
| `gender` | `"male" \| "female" \| "ambiguous"` | Required; exactly one of the three (FR-003) |
| `firstName` | string | Required; 1–40 chars; must come from the name list for `gender` |
| `lastName` | string | Required; 1–40 chars; must come from the last-name list |
| `createdAt` | ISO 8601 string (UTC) | Set on first save; never changes |
| `updatedAt` | ISO 8601 string (UTC) | Set on every save |

**Lifecycle**: `none` → (Save profile) → `saved` → (Save profile again) → `saved` (fields replaced, `updatedAt` bumped).

There is a separate, unsaved **draft** that only exists in memory while the user is on the Profile screen. It holds `gender`, `firstName`, `lastName`, and `previousFullName` (used to avoid back-to-back repeats). The draft is thrown away when the user leaves without saving (FR-005).

## Log Entry

Stored under `click.v1.entries` as a JSON array of objects. Newest-first ordering is applied when reading; storage order doesn't matter.

| Field | Type | Rules |
|---|---|---|
| `id` | string | Required; unique; generated (UUID or fallback) |
| `text` | string | Required; trimmed length 1–1,000 chars (FR-006); stored trimmed |
| `createdAt` | ISO 8601 string (UTC) | Set when first saved; never changes, even on edit (FR-006a) |
| `updatedAt` | ISO 8601 string (UTC) or `null` | `null` until the first edit; set on every edit; shown as "edited" |

**Lifecycle**: `draft` (input box) → (Save entry) → `saved` → (Edit + Save) → `saved` with `updatedAt` → (Delete + confirm) → removed. Cancelling an edit or a delete leaves the entry unchanged.

**Validation errors** (shown through the assistant):
- `EMPTY_TEXT`: text is empty or whitespace only.
- `TOO_LONG`: text is longer than 1,000 characters. The input stops typing beyond the limit; this error guards pasted text.
- `NOT_FOUND`: edit or delete target an id that no longer exists (e.g., it was deleted in another tab).

**Scale**: The list must stay responsive with at least 500 entries (spec Edge Cases), about 0.5–1 MB, well within the localStorage quota.

## Name List (static, read-only)

Bundled module `docs/js/data/names.js`:

| Export | Type | Rules |
|---|---|---|
| `firstNames.male` | string[] | about 60 unique names |
| `firstNames.female` | string[] | about 60 unique names |
| `firstNames.ambiguous` | string[] | about 40 unique names commonly used for any gender |
| `lastNames` | string[] | about 80 unique surnames |

## Assistant Message (static, read-only)

Message catalog `docs/js/data/assistant-messages.js`. Each message is identified by `screen` + `moment`; see [contracts/assistant.md](./contracts/assistant.md).

| Field | Type | Rules |
|---|---|---|
| `screen` | `"dashboard" \| "profile" \| "log" \| "any"` | Required |
| `moment` | `"welcome" \| "help" \| "success" \| "error" \| "empty" \| "storageWarning"` | Required |
| `expression` | `"happy" \| "thinking" \| "cheering"` | Required |
| `text` | string or string[] | One line, or variants picked at random; may contain the `{firstName}` placeholder, which falls back to "friend" |

## Session flags (not persisted)

- `storagePersistent` (boolean): false when the store fell back to in-memory storage; triggers the `storageWarning` message.
- `bubbleDismissed` (per screen visit): hides the speech bubble until the next message is triggered.
