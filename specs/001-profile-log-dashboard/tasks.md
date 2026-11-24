---

description: "Task list for Profile & Log Dashboard"
---

# Tasks: Profile & Log Dashboard

**Input**: Design documents from `/specs/001-profile-log-dashboard/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (store-api.md, routes-and-screens.md, assistant.md), quickstart.md

**Tests**: There are no automated test tasks. The spec doesn't request them, and Constitution II makes them optional. Validation uses the manual scenarios in `quickstart.md`.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All paths are relative to the repo root. The site lives in `docs/` (plan.md → Structure Decision)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the static-site skeleton and design tokens

- [X] T001 Create the directory tree from plan.md (`docs/css/`, `docs/js/data/`, `docs/js/components/`, `docs/js/screens/`, `docs/assets/`) and an empty `docs/.nojekyll`
- [X] T002 [P] Create an original fox-head favicon (orange, simple shapes, no Duolingo owl resemblance) in docs/assets/favicon.svg
- [X] T003 [P] Define design tokens per research.md R7 (fox-orange `#FF8A1F`, friendly green primary, neutrals, error red, radii ≥ 16 px, spacing scale, Nunito → system rounded/sans fallback stack) as CSS custom properties in docs/css/tokens.css
- [X] T004 [P] Write base styles in docs/css/base.css: reset, typography (Nunito 700/800), chunky rounded buttons with a 4 px bottom "press" shadow and active-press effect, cards, visible `:focus-visible` rings, `.visually-hidden`, skeleton shimmer, and a `@media (prefers-reduced-motion: reduce)` rule disabling animations (research.md R6)
- [X] T005 Create the app shell in docs/index.html: a relative-path `<link>` for favicon and the three stylesheets, a Google Fonts Nunito `<link>`, `<header>`/`<nav id="nav">`, `<main id="view" tabindex="-1">`, `<div id="assistant-root">`, and `<script type="module" src="js/app.js">`. All paths must be relative (Constitution V)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Routing, the storage core, the assistant shell, and the app wiring that every story builds on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Implement timestamp formatting per research.md R8 in docs/js/format.js: export `formatTimestamp(iso)` → "Today, 3:42 PM" / "Yesterday, 9:10 AM" / "Mar 4, 2026, 9:10 AM" in the visitor's locale and time zone using `Intl.DateTimeFormat`
- [X] T007 [P] Implement the store core in docs/js/store.js per contracts/store-api.md (Result shape, Invariants) and research.md R4: `safeRead(key)`/`safeWrite(key, value)` wrapped in try/catch with an in-memory fallback map; a module-level `persistent` flag; corrupt JSON moved to `<key>.corrupt-<timestamp>` and treated as empty; a `delay()` helper with a random 150–300 ms wait; `ok(data)`/`fail(code, message)` helpers that always resolve and include `persistent`; and `newId()` using `crypto.randomUUID()` with a fallback (generates data-model.md `LogEntry.id`). Export key constants `click.v1.profile` and `click.v1.entries`
- [X] T008 [P] Implement the hash router in docs/js/router.js per contracts/routes-and-screens.md: route table for `#/dashboard`, `#/profile`, `#/log`; empty or unknown hashes `location.replace` to `#/dashboard`; on `hashchange` call the previous screen's `teardown()`, clear `#view`, `await screen.render(viewEl, ctx)`, focus `#view`, and notify listeners (used by nav and the assistant) of the current screen name
- [X] T009 [P] Implement the nav component in docs/js/components/nav.js: three links (Home → `#/dashboard`, Profile → `#/profile`, Log → `#/log`) with simple inline SVG icons, an `aria-current="page"` highlight on route change, and an exported `setActive(screen)` function
- [X] T010 [P] Create the assistant message catalog skeleton in docs/js/data/assistant-messages.js per data-model.md (`AssistantMessage.screen`, `AssistantMessage.moment`, `AssistantMessage.expression`, `AssistantMessage.text`): export a `messages` array plus a `FOX_NAME = "Fox"` constant, seeded with only the `any`/`storageWarning` entry from contracts/assistant.md
- [X] T011 [P] Implement a minimal assistant shell in docs/js/components/assistant.js per contracts/assistant.md (Interface): `mount(rootEl)`; `say(screen, moment, vars)` with lookup falling back to `any`+moment, random pick when `text` is an array, and `{firstName}` replaced (default "friend"); a speech bubble with a close button; `dismiss()`; text mirrored into an `aria-live="polite"` `role="status"` region; and `react(expression)` as a no-op stub. Use a plain orange circle as a placeholder avatar (the real fox comes in US3)
- [X] T012 [P] Write layout styles in docs/css/screens.css: header and top nav for widths ≥ 640 px, a fixed bottom tab bar under 640 px; `#view` max-width container with padding that clears the tab bar; assistant fixed bottom-right on desktop and above the tab bar on phones; speech bubble with tail; card grid; skeleton card placeholders. Nothing may scroll horizontally at 320 px
- [X] T013 [P] Create stub screens that each export `render(root, ctx)` and `teardown()` and render an `<h1>` title: docs/js/screens/dashboard.js, docs/js/screens/profile.js, docs/js/screens/log.js
- [X] T014 Wire the app in docs/js/app.js: build `ctx = { profile: null, assistant, showStorageWarningOnce(result) }`, mount nav and assistant, start the router. `showStorageWarningOnce` calls `assistant.say('any','storageWarning')` the first time any store result has `persistent: false` (tracked with a session flag). Depends on T007–T013

**Checkpoint**: All three routes load, the nav switches screens, deep links and refresh work, and the placeholder assistant can speak

---

## Phase 3: User Story 1 - Set up a profile with a random name (Priority: P1) 🎯 MVP

**Goal**: A visitor picks Male/Female/Ambiguous, generates random names until they like one, saves it, and the dashboard greets them by name, with the profile kept across visits

**Independent Test**: quickstart.md scenarios 1–5: clear data, set up a profile for each gender, save, refresh, restart the browser, and confirm the greeting persists and the names match the gender

### Implementation for User Story 1

- [X] T015 [P] [US1] Create the bundled name lists in docs/js/data/names.js per data-model.md (`NameList.firstNames.male`, `NameList.firstNames.female`, `NameList.firstNames.ambiguous`, `NameList.lastNames`): about 60 / 60 / 40 / 80 unique entries drawn from a mix of cultures (research.md R5)
- [X] T016 [P] [US1] Implement `generateName(gender, previousFullName)` in docs/js/names.js per contracts/store-api.md (Name generator): pick a uniform random first name from the gender's list (data-model.md `Profile.gender`) and a random last name, rerolling until `"First Last"` ≠ `previousFullName`
- [X] T017 [US1] Add `getProfile()` and `saveProfile({gender, firstName, lastName})` to docs/js/store.js per contracts/store-api.md (Profile). Validate data-model.md `Profile.gender`, `Profile.firstName`, and `Profile.lastName`, returning `INVALID_PROFILE` on failure. Set data-model.md `Profile.createdAt` on first save only and `Profile.updatedAt` on every save. Corrupt data resolves to `data: null`
- [X] T018 [P] [US1] Add the profile catalog entries (profile/welcome, profile/success, profile/error) and the no-profile and with-profile variants of dashboard/welcome to docs/js/data/assistant-messages.js per contracts/assistant.md
- [X] T019 [US1] Build the Profile screen in docs/js/screens/profile.js per contracts/routes-and-screens.md (Profile):
  - Gender picker: radio group of three large toggle cards with arrow-key navigation, preselected from `ctx.profile`.
  - "Generate name": disabled until a gender is picked; shows the name in a big card with a pop animation; keeps an in-memory draft per data-model.md (Profile → draft), and changing gender clears the generated name.
  - "Save profile": disabled until a name exists; calls `saveProfile`, updates `ctx.profile`, calls `assistant.say('profile','success',{firstName})`, then navigates to `#/dashboard`.
  - On an attempt with no gender, show `profile/error`. On `teardown()`, throw the draft away (FR-005). Show `profile/welcome` on render, and pass store results to `ctx.showStorageWarningOnce`
- [X] T020 [P] [US1] Add Profile screen styles (gender toggle cards with selected state, name card with pop keyframes, button row) to docs/css/screens.css
- [X] T021 [US1] Build the Dashboard profile states in docs/js/screens/dashboard.js per contracts/routes-and-screens.md (Dashboard): skeleton while loading; with no profile, a large "Set up your profile" button → `#/profile`; with a profile, an "Hi, {firstName}!" heading, a profile card (full name, gender) and an "Edit profile" button. Call `assistant.say('dashboard','welcome',{firstName})` on render
- [X] T022 [US1] Load the saved profile at startup in docs/js/app.js (`await store.getProfile()` → `ctx.profile`, before the first route renders) so every screen and the assistant can use `{firstName}`

**Checkpoint**: The MVP works on its own; quickstart scenarios 1–5 pass

---

## Phase 4: User Story 2 - Write and review log entries (Priority: P1)

**Goal**: Users create, view (newest first), edit, and delete timestamped log entries that persist on the device, and the dashboard summarizes them

**Independent Test**: quickstart.md scenarios 6–12: add three entries, refresh, edit one, delete one (cancel first), and check the empty state and the dashboard summary

### Implementation for User Story 2

- [X] T023 [US2] Add `listEntries()` and `createEntry(text)` to docs/js/store.js per contracts/store-api.md (Log entries, Invariants): trim and validate data-model.md `LogEntry.text`, returning `EMPTY_TEXT` / `TOO_LONG`; generate data-model.md `LogEntry.id` via `newId()`; set data-model.md `LogEntry.createdAt` to now and `LogEntry.updatedAt` to `null`; list sorted by `createdAt`, newest first
- [X] T024 [US2] Add `updateEntry(id, text)`, `deleteEntry(id)`, and `getStats()` to docs/js/store.js per contracts/store-api.md. Updates apply the same validation to data-model.md `LogEntry.text`, leave `LogEntry.createdAt` unchanged, and set `LogEntry.updatedAt` to now. Return `NOT_FOUND` for a missing id. `getStats` returns `{count, latest}`. Depends on T023
- [X] T025 [P] [US2] Implement a reusable confirm dialog in docs/js/components/confirm-dialog.js: `confirm({title, body, confirmLabel})` → Promise<boolean>, using a native `<dialog>` with Cancel focused by default and Esc resolving `false` (research.md R9)
- [X] T026 [P] [US2] Add the log catalog entries (log/welcome, log/empty, log/success, and log/error with `EMPTY_TEXT`, `TOO_LONG`, `NOT_FOUND` variants) to docs/js/data/assistant-messages.js per contracts/assistant.md. Support an optional `code` key so `say('log','error',{code})` picks the variant
- [X] T027 [US2] Build the Log screen's composer and list in docs/js/screens/log.js per contracts/routes-and-screens.md (Log):
  - Composer: a textarea with `maxlength` matching data-model.md `LogEntry.text`, a live "n / 1000" counter, a "Save entry" button, and Ctrl/⌘+Enter to save.
  - On save, call `createEntry`, prepend the card, clear the input, and `say('log','success')`; on an error, `say('log','error',{code})`.
  - List: skeleton while `listEntries()` is pending. Each card shows the text with line breaks kept (rendered with `textContent`, never `innerHTML`), `formatTimestamp(createdAt)`, and "edited {time}" when `updatedAt` is set. Build the cards with a DocumentFragment.
  - Empty state: `say('log','empty')`. Show `log/welcome` on render, and pass store results to `ctx.showStorageWarningOnce`
- [X] T028 [US2] Add inline editing to docs/js/screens/log.js: an Edit button swaps the card into a textarea with Save/Cancel (Esc cancels). Save calls `updateEntry` and re-renders the card with the "edited" label. Errors go through `say('log','error',{code})`; on `NOT_FOUND`, remove the card. Depends on T027
- [X] T029 [US2] Add deletion to docs/js/screens/log.js: the Delete button calls `confirm-dialog` ("Delete this entry? This can't be undone."); on true, call `deleteEntry`, remove the card, and show the empty state if none are left. Cancel leaves the entry unchanged. Depends on T025, T027
- [X] T030 [P] [US2] Add Log screen styles (composer card, counter that turns warning-colored at 950+, entry cards, edit mode, edited label, dialog styling with backdrop) to docs/css/screens.css
- [X] T031 [US2] Add the log summary card to docs/js/screens/dashboard.js: `getStats()` → entry count, a preview of the latest entry's text truncated to 120 characters with its timestamp (or "No entries yet"), and a "Write a log entry" button → `#/log`. Show it whether or not a profile exists

**Checkpoint**: User Stories 1 and 2 both work on their own; quickstart scenarios 6–12 pass

---

## Phase 5: User Story 3 - Helpful cartoon assistant on every page (Priority: P2)

**Goal**: Replace the placeholder with the original cartoon fox, which has expressions, tap-for-help, dismissing, and celebratory reactions on every screen

**Independent Test**: quickstart.md scenarios 13 and 20: visit each screen, tap the fox for help, dismiss the bubble, save a profile and an entry to see it cheer, and turn on reduced motion

### Implementation for User Story 3

- [X] T032 [US3] Draw the original fox as inline SVG in docs/js/components/assistant.js per research.md R6: orange head and body, white muzzle and chest, pointed ears, and a fluffy tail. Eye and mouth `<g>` groups for the `happy`, `thinking`, and `cheering` expressions (data-model.md `AssistantMessage.expression`) are toggled by a `data-expression` attribute. It must not resemble Duolingo's owl (spec Assumptions)
- [X] T033 [US3] Implement `react(expression)` and expression switching inside `say()` in docs/js/components/assistant.js. Add the keyframes to docs/css/screens.css: idle gentle bob, `cheering` bounce plus a tail wag, `thinking` head tilt. All animations are disabled under `prefers-reduced-motion`. Depends on T032
- [X] T034 [US3] Make the fox a `<button aria-label="Ask Fox for help">` in docs/js/components/assistant.js that calls `say(currentScreen, 'help')` using the router's current screen. Dismissing hides only the bubble (the fox stays). The bubble reappears on the next `say()`. Depends on T032
- [X] T035 [P] [US3] Complete the catalog in docs/js/data/assistant-messages.js with every screen/moment pair in contracts/assistant.md (Required catalog entries) that's still missing (dashboard/help, profile/help, log/help, and the cheering expression on success entries), adding 2–3 text variants for welcome and success
- [X] T036 [US3] Wire celebratory reactions: call `ctx.assistant.react('cheering')` right after a successful save in docs/js/screens/profile.js and after a successful create or edit in docs/js/screens/log.js, and check that each screen's `render` triggers its `welcome` message

**Checkpoint**: All user stories work on their own; quickstart scenarios 13 and 20 pass

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsiveness, performance, docs, and the final validation

- [X] T037 [P] Responsive pass at 320, 375, 768, and 1280 px across all screens in docs/css/screens.css: no horizontal scrolling, tap targets ≥ 44 px, the assistant never covers the composer or Save buttons (SC-006)
- [X] T038 [P] Accessibility pass across docs/js/screens/*.js and docs/js/components/*.js: visible focus, keyboard-only flows (gender radio arrows, Ctrl/⌘+Enter, Esc to cancel edit and dialog), labelled controls, `aria-live` announcements, and focus moved to `#view` on route change (FR-011)
- [X] T039 Performance check: seed 500 entries from the console (quickstart scenario 15) and confirm Log stays smooth. If needed, render cards in batches in docs/js/screens/log.js
- [X] T040 [P] Add a README.md at the repo root covering the project purpose, the local run command from quickstart.md, and GitHub Pages setup (Settings → Pages → Deploy from branch `main` / `/docs`)
- [X] T041 Run every scenario in specs/001-profile-log-dashboard/quickstart.md (1–20) under the `/click/` sub-path and fix any failures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none; T002–T004 run in parallel, then T005
- **Foundational (Phase 2)**: depends on Setup; T006–T013 run in parallel, then T014. Blocks all stories
- **US1 (Phase 3)**: depends on Foundational
- **US2 (Phase 4)**: depends on Foundational; does not need US1 (the dashboard log card works without a profile)
- **US3 (Phase 5)**: depends on Foundational. T036 touches the profile and log screens, so finish it after US1 and US2, or apply only the parts for the screens that exist
- **Polish (Phase 6)**: after the desired stories are done

### Within Each Story

- Data/store tasks come before screen tasks (T017 → T019, T023 → T024 → T027 → T028/T029)
- Shared files: `store.js`, `dashboard.js`, `assistant-messages.js`, and `screens.css` are edited by more than one story. When working on stories in parallel, sequence edits to the same file (or merge carefully)

### Parallel Opportunities

- Setup: T002, T003, T004
- Foundational: T006–T013 (eight independent files)
- US1: T015, T016, T018, and T020 together; then T017 → T019 → T021 → T022
- US2: T025, T026, and T030 together alongside T023 → T024
- US3: T035 alongside T032 → T033/T034
- Polish: T037, T038, T040

---

## Parallel Example: User Story 1

```bash
Task: "Create bundled name lists in docs/js/data/names.js"
Task: "Implement generateName in docs/js/names.js"
Task: "Add profile catalog entries in docs/js/data/assistant-messages.js"
Task: "Add Profile screen styles in docs/css/screens.css"
```

## Parallel Example: User Story 2

```bash
Task: "Implement confirm dialog in docs/js/components/confirm-dialog.js"
Task: "Add log catalog entries in docs/js/data/assistant-messages.js"
Task: "Add Log screen styles in docs/css/screens.css"
# meanwhile, sequentially: T023 → T024 in docs/js/store.js
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 Setup → Phase 2 Foundational
2. Phase 3 (US1) → **stop and validate** with quickstart scenarios 1–5 → demo

### Incremental Delivery

1. Setup + Foundational → shell with navigation
2. + US1 → profile and random name (MVP demo)
3. + US2 → full log with create, view, edit, and delete
4. + US3 → the fox assistant brings it to life
5. Polish → run all quickstart scenarios → push to `main` → verify the live Pages URL (quickstart "Deploy")

---

## Notes

- [P] = different files, no dependency on unfinished tasks
- Render user-entered text with `textContent` only, never `innerHTML`
- Commit after each task or logical group; stop at any checkpoint to validate a story on its own
