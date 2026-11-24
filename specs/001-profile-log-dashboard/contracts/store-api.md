# Contract: Store API (local "backend")

Module: `docs/js/store.js`. It is the only code that touches `localStorage` (Constitution Principle III). Every function is async and resolves after a simulated delay of 150–300 ms. Fields are defined in [data-model.md](../data-model.md).

## Result shape

Every call resolves (it never rejects) to one of:

```text
{ ok: true,  data: <payload>, persistent: boolean }
{ ok: false, error: { code: <ErrorCode>, message: <string> }, persistent: boolean }
```

`persistent` is `false` when storage is unavailable and an in-memory fallback is being used.

Error codes: `EMPTY_TEXT`, `TOO_LONG`, `NOT_FOUND`, `INVALID_PROFILE`, `STORAGE_ERROR`.

## Profile

| Function | Input | Success `data` | Errors |
|---|---|---|---|
| `getProfile()` | none | `Profile` or `null` | `STORAGE_ERROR` (corrupt data is reset; `data: null`) |
| `saveProfile({ gender, firstName, lastName })` | draft fields | saved `Profile` (with `createdAt`, `updatedAt`) | `INVALID_PROFILE` (bad gender or empty name), `STORAGE_ERROR` |

## Log entries

| Function | Input | Success `data` | Errors |
|---|---|---|---|
| `listEntries()` | none | `LogEntry[]`, newest `createdAt` first | `STORAGE_ERROR` |
| `createEntry(text)` | string | new `LogEntry` (`updatedAt: null`) | `EMPTY_TEXT`, `TOO_LONG`, `STORAGE_ERROR` |
| `updateEntry(id, text)` | id, string | updated `LogEntry` (`createdAt` unchanged, `updatedAt` = now) | `NOT_FOUND`, `EMPTY_TEXT`, `TOO_LONG`, `STORAGE_ERROR` |
| `deleteEntry(id)` | id | `{ id }` | `NOT_FOUND`, `STORAGE_ERROR` |
| `getStats()` | none | `{ count, latest: LogEntry \| null }` | `STORAGE_ERROR` |

## Name generator

Module `docs/js/names.js` (synchronous, pure):

| Function | Input | Output |
|---|---|---|
| `generateName(gender, previousFullName?)` | `"male" \| "female" \| "ambiguous"`, optional string | `{ firstName, lastName }`, never equal to `previousFullName` |

## Invariants

- Text is trimmed before validation and storage.
- `createdAt` never changes after creation.
- Calls never throw to callers; all failures come back as `{ ok: false }`.
- Writes are read-modify-write of the whole key, so the latest write wins if two tabs are open (acceptable for a prototype).
