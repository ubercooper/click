# Feature Specification: Profile & Log Dashboard

**Feature Branch**: `001-profile-log-dashboard`

**Created**: 2026-11-23

**Status**: Draft

**Input**: User description: "The site will have a dashboard page. From here you can define your profile where it will allow you to select your gender (male, female, ambiguous) and generate a random name for you. It will then have a 'log page' that will allow you to enter log entries and save them with a timestamp, fetch existing entries, etc. The user experience look and feel should be inspired by Duolingo, with a cartoon animal 'assistant' who will be displayed on these pages to provide help."

## Clarifications

### Session 2026-11-23

- Q: Besides adding and reading log entries, what else should users be able to do with them? → A: Add, view, edit, and delete (with a confirmation before deleting); no search, filtering, or export.
- Q: Should the site have Duolingo-style game features, such as a daily logging streak or points? → A: No. The look is playful, but there are no streaks, points, badges or goals for now.
- Q: What kind of animal should the cartoon assistant be? → A: A fox: clever and upbeat, with an orange color palette.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Set up a profile with a random name (Priority: P1)

A first-time visitor lands on the dashboard, where the cartoon fox assistant greets them and invites them to set up their profile. On the profile page they choose a gender (male, female, or ambiguous) and tap "Generate name". A random first and last name matching that gender appears. They can keep rolling until they like one, then save it. The dashboard then greets them by their new name.

**Why this priority**: The profile is the entry point and gives the experience its personality. Every other page is addressed to this persona.

**Independent Test**: Open the site fresh, go to the profile, pick each gender in turn, generate names, save one, and confirm the dashboard shows the saved name after a page refresh.

**Acceptance Scenarios**:

1. **Given** no profile exists, **When** the visitor opens the dashboard, **Then** the assistant shows a welcome message and a prominent "Set up your profile" button.
2. **Given** the visitor is on the profile page with "female" selected, **When** they tap "Generate name", **Then** a random feminine first name and a last name are displayed.
3. **Given** a name is displayed, **When** they tap "Generate name" again, **Then** a different name is displayed.
4. **Given** a generated name is displayed, **When** they tap "Save profile", **Then** they return to the dashboard, which greets them by first name, and the assistant celebrates.
5. **Given** a saved profile, **When** the visitor reopens the site later on the same device, **Then** the profile is still there.
6. **Given** a saved profile, **When** the visitor changes gender and generates a new name, **Then** the profile is updated only after they save.

---

### User Story 2 - Write and review log entries (Priority: P1)

From the dashboard, the user opens the log page, types an entry, and saves it. The entry is stamped with the date and time it was saved. All saved entries are listed newest first, and the user can come back at any time to read them.

**Why this priority**: Logging is the main recurring activity and the reason to return to the site.

**Independent Test**: Add three entries, refresh the page, and confirm all three appear newest first with correct timestamps.

**Acceptance Scenarios**:

1. **Given** the user is on the log page, **When** they type text and tap "Save entry", **Then** the entry appears at the top of the list with the date and time it was saved, and the input clears.
2. **Given** the input is empty or only spaces, **When** they try to save, **Then** nothing is saved and the assistant gently explains that the entry is empty.
3. **Given** saved entries exist, **When** the user opens or refreshes the log page, **Then** all entries are shown newest first.
4. **Given** no entries exist, **When** the user opens the log page, **Then** the assistant shows an empty-state message encouraging them to write their first entry.
5. **Given** entries exist, **When** the user views the dashboard, **Then** it shows the total entry count and a preview of the most recent entry.
6. **Given** a saved entry, **When** the user chooses "Edit", changes the text, and saves, **Then** the entry shows the new text, keeps its original timestamp, and is marked "edited" with the time of the last edit.
7. **Given** a saved entry, **When** the user chooses "Delete", **Then** a confirmation is shown, and the entry is removed only if they confirm; cancelling leaves it unchanged.

---

### User Story 3 - Helpful cartoon assistant on every page (Priority: P2)

A friendly cartoon fox character appears on the dashboard, the profile page, and the log page. It shows short, cheerful speech-bubble tips that suit the page and the moment (welcome, hints, celebrating a save, gentle nudges on errors). The user can tap the assistant for a help tip about the current page, or dismiss the bubble.

**Why this priority**: The assistant gives the playful, game-like feel inspired by Duolingo, but pages still work without it.

**Independent Test**: Visit each page and confirm the assistant appears with a page-relevant message; tap it for a help tip; save a profile and an entry and confirm it reacts.

**Acceptance Scenarios**:

1. **Given** any page, **When** it loads, **Then** the assistant is visible with a short message relevant to that page.
2. **Given** the assistant is visible, **When** the user taps it, **Then** it shows a help tip explaining what can be done on the current page.
3. **Given** a speech bubble is showing, **When** the user dismisses it, **Then** the bubble hides and the assistant stays visible.
4. **Given** the user saves a profile or log entry, **When** the save succeeds, **Then** the assistant shows a celebratory reaction (expression change and message).

---

### Edge Cases

- Visitor opens the log page before creating a profile: logging still works; the assistant suggests setting up a profile, addressing them generically ("friend").
- Very long entry: entries are capped at 1,000 characters with a visible character counter.
- Many entries: the list stays readable and responsive with at least 500 entries.
- Stored data is missing, corrupted, or storage is unavailable (e.g., private browsing): the site still loads, shows the empty state, and the assistant explains that entries may not be kept.
- Gender "ambiguous" selected: names are drawn from names commonly used for any gender.
- Repeated "Generate name": the same name is not shown twice in a row.
- Timestamps display in the visitor's local time zone and format.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide three screens: Dashboard, Profile, and Log. Each is reachable from a persistent navigation bar and has its own shareable link.
- **FR-002**: Dashboard MUST show a greeting by profile first name (or a set-up prompt if no profile), the number of log entries, a preview of the most recent entry, and shortcuts to Profile and Log.
- **FR-003**: Profile MUST let the user select a gender from exactly: Male, Female, Ambiguous.
- **FR-004**: Profile MUST generate a random first name matching the selected gender plus a random last name, drawn from a sample name list bundled with the site, and allow unlimited rerolls.
- **FR-005**: Profile changes (gender, name) MUST only take effect when the user saves; leaving without saving keeps the previous profile.
- **FR-006**: Log MUST let the user write a text entry (1–1,000 characters) and save it with an automatic timestamp of when it was saved.
- **FR-006a**: Log MUST let the user edit an existing entry's text (same 1–1,000 character rule); the original timestamp is kept and an "edited" time is recorded and shown.
- **FR-006b**: Log MUST let the user delete an entry after an explicit confirmation step.
- **FR-007**: Log MUST list all saved entries newest first, showing text and a human-friendly timestamp (e.g., "Today, 3:42 PM", or a date for older entries).
- **FR-008**: Profile and log entries MUST persist on the user's device across page refreshes and browser restarts, with no account or sign-in.
- **FR-009**: A cartoon fox assistant MUST appear on all three screens, with page-specific messages for: first visit, help-on-tap, successful save, validation error, and empty state.
- **FR-010**: Visual style MUST be bright, friendly, and game-like (bold colors, rounded shapes, large tappable buttons, playful feedback on actions), inspired by Duolingo but using an original character and branding. The playfulness is visual only: no streaks, points, badges, or goals.
- **FR-011**: All screens MUST be usable at desktop and phone widths and operable by keyboard; the assistant's messages MUST be readable by screen readers.

### Key Entities

- **Profile**: The user's persona: gender (Male / Female / Ambiguous), first name, last name, date created/updated. One per device.
- **Log Entry**: A note written by the user: unique id, text (1–1,000 characters), timestamp of when it was first saved, and an optional last-edited timestamp. Entries can be created, edited, and deleted.
- **Name List**: Bundled sample first names tagged by gender (male, female, ambiguous) and a list of last names.
- **Assistant Message**: A short line of text tied to a screen and a moment (welcome, help, success, error, empty), with an assistant expression (e.g., happy, thinking, cheering).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can create a profile with a generated name in under 30 seconds.
- **SC-002**: A user can write and save a log entry in under 15 seconds from the dashboard.
- **SC-003**: 100% of saved entries and the profile remain present after refresh and browser restart on the same device.
- **SC-004**: In 50 name generations per gender, 100% of first names match the selected gender, and no name repeats back to back.
- **SC-005**: The assistant appears with a relevant message on 100% of screens and reacts to 100% of successful saves.
- **SC-006**: Every screen is reachable by clicks and usable at phone width with no horizontal scrolling.
- **SC-007**: In informal demo testing, at least 4 of 5 reviewers describe the experience as "fun" or "friendly".

## Assumptions

- Single user per device; no accounts, sign-in, or syncing between devices.
- Names are first + last only (no middle names) from a curated sample list bundled with the site; no external name service is used.
- The assistant is an original cartoon fox with an orange-led palette and at least three expressions (happy, thinking, cheering). Its name will be chosen during design. Duolingo's owl, name, and branding are not used.
- Data is stored only on the user's device; clearing browser data removes it.
- English-language only for this version.
- Searching, filtering, and exporting log entries are out of scope for this version.
- Game features (streaks, points, badges, daily goals) are out of scope for this version and may be added in a later feature.
