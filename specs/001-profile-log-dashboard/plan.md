# Implementation Plan: Profile & Log Dashboard

**Branch**: `001-profile-log-dashboard` | **Date**: 2026-11-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-profile-log-dashboard/spec.md`

## Summary

A three-screen static prototype: **Dashboard**, **Profile** (pick Male/Female/Ambiguous and generate a random first + last name from a bundled list), and **Log** (create, view, edit, and delete timestamped entries). An original cartoon fox assistant gives page-specific help and reacts to actions, in a bright, rounded look inspired by Duolingo. It is built with plain HTML, CSS, and ES modules with no build step, uses hash routing, and keeps data in `localStorage` behind a small async "store API" that simulates a backend. It is deployed to GitHub Pages from `/docs`.

## Technical Context

**Language/Version**: HTML5, CSS (custom properties, grid/flex), JavaScript ES2020 modules

**Primary Dependencies**: None at runtime except Google Fonts (Nunito); no JS libraries

**Storage**: Browser `localStorage` (keys `click.v1.profile`, `click.v1.entries`) with an in-memory fallback

**Testing**: Manual validation scenarios in [quickstart.md](./quickstart.md); no automated suite (Constitution II)

**Target Platform**: Current evergreen browsers (Chrome, Edge, Firefox, Safari) on desktop and mobile; GitHub Pages hosting

**Project Type**: Static single-page web prototype

**Performance Goals**: Screen switches feel instant (under 100 ms excluding the simulated 150–300 ms store delay); log list stays smooth with 500 entries

**Constraints**: Static files only; no build; relative paths only (sub-path hosting); works offline after first load except the web font; usable from 320 px wide

**Scale/Scope**: 3 screens, 1 user per device, up to about 500 entries (about 1 MB)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|---|---|---|
| I. Static-Only, GitHub Pages Hosted | Only HTML/CSS/JS/SVG in `docs/`; no server code or functions | ✅ Pass |
| II. Prototype Over Production | Manual quickstart validation only; every screen and state is reachable by clicks | ✅ Pass |
| III. Mock Data, No Backend | Names come from a bundled JS module; all reads and writes go through the async `store` API backed by `localStorage`; simulated delays and errors; no secrets | ✅ Pass |
| IV. Zero-Build by Default | Plain ES modules; the only external resource is Google Fonts (CSS, allowed); no JS libraries | ✅ Pass |
| V. Navigable & Shareable | Hash routes `#/dashboard`, `#/profile`, `#/log`; relative paths; responsive down to 320 px | ✅ Pass |
| Workflow: keep features small (3–5 screens) | 3 screens | ✅ Pass |

**Post-design re-check (after Phase 1)**: ✅ All pass. The design adds no libraries, build tools, or server pieces. The one external resource (Google Fonts) is justified in [research.md](./research.md) R7 and falls back to system fonts.

## Project Structure

### Documentation (this feature)

```text
specs/001-profile-log-dashboard/
├── plan.md                      # This file
├── research.md                  # Phase 0: decisions R1–R10
├── data-model.md                # Phase 1: Profile, LogEntry, Name List, Assistant Message
├── quickstart.md                # Phase 1: run + 20 validation scenarios
├── contracts/
│   ├── store-api.md             # async localStorage "API"
│   ├── routes-and-screens.md    # routes, screen states, behaviors
│   └── assistant.md             # fox component interface + message catalog
├── checklists/requirements.md
└── tasks.md                     # Phase 2 (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
docs/                            # GitHub Pages source (main → /docs)
├── index.html                   # app shell: nav, <main id="view">, assistant mount, <dialog>
├── .nojekyll                    # serve files as-is
├── css/
│   ├── tokens.css               # colors, radii, spacing, font (custom properties)
│   ├── base.css                 # reset, typography, buttons, cards, focus, reduced-motion
│   └── screens.css              # dashboard / profile / log layouts, nav, responsive rules
├── js/
│   ├── app.js                   # entry: init store, assistant, router
│   ├── router.js                # hash routing → screen render/teardown
│   ├── store.js                 # async localStorage API (contracts/store-api.md)
│   ├── names.js                 # generateName()
│   ├── format.js                # timestamp formatting (Intl)
│   ├── data/
│   │   ├── names.js             # bundled name lists
│   │   └── assistant-messages.js
│   ├── components/
│   │   ├── assistant.js         # fox SVG + speech bubble (contracts/assistant.md)
│   │   ├── nav.js
│   │   └── confirm-dialog.js
│   └── screens/
│       ├── dashboard.js
│       ├── profile.js
│       └── log.js
└── assets/
    └── favicon.svg              # fox head
```

**Structure Decision**: A single static site in `docs/`, so Pages can serve it straight from `main` with no build. Spec-kit files (`.specify/`, `specs/`) stay out of the published site. Screens are ES modules that each export `render(root, ctx)` and an optional `teardown()`. Shared state (profile, storage-persistent flag) lives in a tiny context object passed in by `app.js`.

## Complexity Tracking

No constitution violations; nothing to justify.
