# Contract: Routes & Screens (UI)

Hash routes (Constitution Principle V). All links and asset paths are relative so the site works under `/<repo-name>/`.

| Route | Screen | Nav label | Notes |
|---|---|---|---|
| `#/dashboard` | Dashboard | Home | Default; empty or unknown hash redirects here |
| `#/profile` | Profile | Profile | |
| `#/log` | Log | Log | |

A persistent navigation bar (top bar on desktop, bottom tab bar on phone widths under 640 px) shows the three items, with the current route highlighted and `aria-current="page"` set. The fox assistant is placed in the same position on every screen (bottom-right on desktop, above the tab bar on phone).

## Dashboard (`#/dashboard`)

| State | Shows |
|---|---|
| Loading | Skeleton cards |
| No profile | Fox welcome ("Hi friend! …"); large "Set up your profile" button → `#/profile` |
| Profile saved | "Hi, {firstName}!" heading; profile card (full name, gender); log card (entry count + preview of latest entry truncated to 120 chars, or "No entries yet"); buttons "Write a log entry" → `#/log`, "Edit profile" → `#/profile` |

## Profile (`#/profile`)

| Element | Behavior |
|---|---|
| Gender picker | Three large toggle cards: Male / Female / Ambiguous (radio group, keyboard arrow navigation). Defaults to the saved gender, or none selected |
| "Generate name" | Disabled until a gender is chosen; shows a new random name in a big name card with a pop animation; changing gender clears the generated name |
| "Save profile" | Disabled until a name is generated; on success the fox cheers and the user is sent to `#/dashboard` |
| Leave without saving | Draft is discarded; saved profile unchanged |

## Log (`#/log`)

| Element | Behavior |
|---|---|
| Composer | Multi-line text box with a live "n / 1000" counter, `maxlength=1000`; "Save entry" button; Ctrl/⌘+Enter also saves |
| Entry list | Newest first; each card shows text (line breaks kept), timestamp, "edited {time}" when `updatedAt` is set, and Edit / Delete buttons |
| Edit | Turns the card into an inline editor with Save / Cancel; Esc cancels |
| Delete | Opens a confirmation `<dialog>` ("Delete this entry? This can't be undone.") with Cancel (focused by default) and Delete |
| Empty state | Illustration area plus a fox `empty` message |
| Loading | Skeleton cards while `listEntries()` is pending |

## Global

- Storage warning: if any store call returns `persistent: false`, the fox shows `storageWarning` once per session.
- All interactive elements can be reached and used with the keyboard and have visible focus styles.
- The layout works from 320 px wide up to desktop with no horizontal scrolling.
