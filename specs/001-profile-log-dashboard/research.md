# Research: Profile & Log Dashboard

All Technical Context items were resolvable from the constitution and spec; no open unknowns remain. Each decision below records the choice, why, and what was rejected.

## R1. Stack

- **Decision**: Plain HTML5 + CSS + ES2020 modules, no build step, no framework.
- **Rationale**: Constitution Principle IV (zero-build by default). Three screens with simple state do not justify a framework.
- **Alternatives considered**: Preact/htm from CDN (a nice templating layer, but an extra dependency for little gain); Vite + React (needs a build step, which the constitution only allows with justification).

## R2. Site root and deployment

- **Decision**: The site lives in `docs/` and GitHub Pages is configured to serve `/docs` from `main`.
- **Rationale**: Keeps `.specify/`, `specs/`, and `.claude/` out of the published site while needing no build or Actions workflow. Supported natively by Pages (Constitution Technical Constraints).
- **Alternatives considered**: Serving the repo root (publishes spec-kit internals); a GitHub Actions Pages workflow (more moving parts, not needed without a build).

## R3. Routing

- **Decision**: Hash router with routes `#/dashboard` (default), `#/profile`, `#/log`. Unknown hashes redirect to `#/dashboard`.
- **Rationale**: Constitution Principle V; survives refresh on Pages with no 404 handling; each screen gets its own link (FR-001).
- **Alternatives considered**: History API routing (needs a 404.html redirect hack on Pages).

## R4. Persistence and the "API" layer

- **Decision**: A single `store` module exposes async, Promise-returning functions (`getProfile`, `saveProfile`, `listEntries`, `createEntry`, `updateEntry`, `deleteEntry`) backed by `localStorage`, with a short simulated delay (150–300 ms) so loading states are demonstrable. Data is kept under versioned keys (`click.v1.profile`, `click.v1.entries`).
- **Rationale**: Constitution Principle III requires that "API calls to update and fetch user entered data" use local storage, and that loading/error states be simulated client-side. An async interface means swapping in a real backend later only touches one module.
- **Alternatives considered**: IndexedDB (more capable but more code; 500 entries × 1,000 chars ≈ 0.5–1 MB fits comfortably within the ~5 MB localStorage quota); synchronous direct `localStorage` access from views (harder to simulate loading/error states, couples views to storage).
- **Failure handling**: All storage access is wrapped in try/catch. If `localStorage` is unavailable or throws (private mode, quota), the store falls back to an in-memory copy and reports `persistent: false` so the assistant can warn that data may not be kept. Corrupted JSON is moved aside under `click.v1.entries.corrupt-<timestamp>` and treated as empty.

## R5. Random name generation

- **Decision**: Bundled ES module `docs/js/data/names.js` with roughly 60 male, 60 female, and 40 ambiguous first names, plus about 80 last names, drawn from a mix of cultures. Generation picks uniformly at random and rerolls if the full name equals the previous one.
- **Rationale**: Constitution Principle III (mock data only); meets SC-004 (gender match, no back-to-back repeat). A JS module avoids a separate fetch.
- **Alternatives considered**: A JSON file loaded with `fetch` (one more async failure path); external name APIs (forbidden by the constitution).

## R6. Fox assistant artwork and behavior

- **Decision**: An original fox drawn as an inline SVG component with three expressions (happy, thinking, cheering), made by swapping eye and mouth groups plus a CSS bounce/wiggle animation. Messages come from a per-screen message catalog (see `contracts/assistant.md`) and show in a speech bubble with `role="status"` / `aria-live="polite"`. The fox's name is a placeholder ("Fox") until the design team names it; it is a single constant.
- **Rationale**: Inline SVG is crisp at any size, themeable with CSS variables, and needs no asset pipeline. It is an original character, not Duolingo's owl (spec Assumptions). A live region meets FR-011.
- **Alternatives considered**: PNG/GIF sprites (need design assets up front and don't scale well); Lottie animations (a library dependency plus animation files).
- **Motion**: Animations are disabled under `prefers-reduced-motion: reduce`.

## R7. Visual style

- **Decision**: CSS custom properties for a bright palette led by fox-orange (`#FF8A1F`) with a friendly green for primary actions, rounded corners (16 px or more), chunky buttons with a 4 px bottom "press" shadow, and Google Fonts **Nunito** (700/800 weights).
- **Rationale**: Captures the bold, rounded, game-like feel of Duolingo (FR-010) without copying its brand assets. Nunito is a free rounded typeface; Google Fonts is the one external dependency.
- **Alternatives considered**: A system font stack only (works, but loses the playful rounded feel); self-hosting the font files (more repo weight; possible later for offline demos). The site falls back to the system rounded/sans font if Google Fonts is unreachable.

## R8. Timestamps

- **Decision**: Store ISO 8601 UTC strings; display with `Intl.DateTimeFormat` in the visitor's locale and time zone as "Today, 3:42 PM", "Yesterday, 9:10 AM", or "Mar 4, 2026, 9:10 AM".
- **Rationale**: Matches the spec edge case (local time zone and format) with no library.
- **Alternatives considered**: dayjs or date-fns from a CDN (an unnecessary dependency).

## R9. IDs, confirmations, and dialogs

- **Decision**: Entry IDs come from `crypto.randomUUID()`, falling back to `Date.now().toString(36) + random` when unavailable. Delete confirmation uses the native `<dialog>` element with focus trapping handled by the browser.
- **Rationale**: Both are built into evergreen browsers; `<dialog>` is keyboard- and screen-reader-friendly (FR-011).
- **Alternatives considered**: `window.confirm()` (works but breaks the playful look); a custom modal (reimplements accessibility the browser provides for free).

## R10. Testing

- **Decision**: No automated test suite. Validation is done with the manual scenarios in `quickstart.md`, run against a local static server under a sub-path.
- **Rationale**: Constitution Principle II says automated tests are optional and must not block delivery.
- **Alternatives considered**: Playwright smoke tests (worth adding later if the prototype grows).
