# Quickstart & Validation: Profile & Log Dashboard

## Run locally (under a sub-path, the way GitHub Pages serves it)

```bash
# from the repo root
mkdir -p /tmp/pages && ln -sfn "$PWD/docs" /tmp/pages/click
python3 -m http.server 8000 --directory /tmp/pages
# open http://localhost:8000/click/
```

Before each scenario, clear site data (DevTools → Application → Storage → Clear site data) unless the scenario says otherwise.

## Validation scenarios

| # | Covers | Steps | Expected |
|---|---|---|---|
| 1 | US1, SC-001 | Open `/click/` | Lands on `#/dashboard`; the fox says the no-profile welcome; "Set up your profile" is visible |
| 2 | US1, SC-004 | Profile → pick Female → Generate 10 times | Every first name is from the female list; no name repeats back to back |
| 3 | US1 | Repeat for Male and Ambiguous | Names match the chosen gender |
| 4 | US1, FR-005 | Generate a name, go to Log without saving, come back | The previous profile (or none) is unchanged |
| 5 | US1, SC-003 | Generate → Save profile → refresh → restart browser | The fox cheers; the dashboard greets you by first name; the profile survives both |
| 6 | US2 | Log → save "first", "second", "third" | Shown newest first with "Today, h:mm" stamps; the input clears; the fox cheers |
| 7 | US2 | Try to save an empty or whitespace-only entry | Not saved; fox shows the `EMPTY_TEXT` message |
| 8 | US2, FR-006a | Edit "second" → change text → Save | Text updated; original time kept; "edited …" shown |
| 9 | US2, FR-006b | Delete → Cancel; then Delete → Delete | Cancel keeps the entry; confirming removes it |
| 10 | US2, SC-003 | Refresh, then restart the browser | All entries kept with the same order and timestamps |
| 11 | US2 | Visit the dashboard | Entry count and a preview of the latest entry are correct |
| 12 | US2 | Clear data → open Log | Empty state with the fox's `empty` message |
| 13 | US3, SC-005 | Visit each screen, tap the fox, dismiss the bubble | A page-specific welcome and help appear; dismissing hides the bubble only |
| 14 | Edge | Paste 1,200 characters into the composer | Capped at 1,000; the counter shows 1000/1000 |
| 15 | Edge | Seed 500 entries via the console (`for` loop of `createEntry`) and open Log | Scrolling and typing stay smooth |
| 16 | Edge | Open in a private window with storage blocked, or set `localStorage.setItem` to throw | The app still works; the fox shows the storage warning once |
| 17 | Edge | Put invalid JSON in `click.v1.entries`, then reload Log | The empty state shows and the app doesn't crash |
| 18 | FR-001, V | Open `#/log` directly, refresh, and try an unknown `#/nope` | Deep link works; the unknown route redirects to the dashboard |
| 19 | FR-011, SC-006 | Phone width (375 px) and keyboard-only pass on every screen | No horizontal scrolling; bottom tab bar; everything reachable; visible focus; the fox's message is announced by a screen reader |
| 20 | R6 | Turn on the OS "reduce motion" setting | The fox doesn't animate |

## Deploy

Push to `main`, with GitHub Pages set to deploy from `main` / `/docs`. Re-run scenarios 1, 5, 6 and 18 on the live URL.
