<!--
Sync Impact Report
- Version change: (unfilled template) → 1.0.0
- Modified principles: all placeholders replaced (initial ratification)
  - I. Static-Only, GitHub Pages Hosted
  - II. Prototype Over Production
  - III. Mock Data, No Backend
  - IV. Zero-Build by Default
  - V. Navigable & Shareable
- Added sections: Technical Constraints; Development Workflow; Governance
- Removed sections: none
- Templates: plan/spec/tasks templates read this file at runtime; no template edits required
- Deferred TODOs: none
-->
# Click Constitution

## Core Principles

### I. Static-Only, GitHub Pages Hosted

The prototype MUST run as a purely static site served by GitHub Pages. Output is limited to
HTML, CSS, JavaScript, and static assets (images, fonts, JSON). No server-side code, server
rendering, serverless functions, or runtime environment variables are permitted.

Rationale: GitHub Pages serves static files only; anything else will not deploy.

### II. Prototype Over Production

This is a clickable UI prototype for demonstrating and validating flows, not production
software. Speed of iteration and visual fidelity of the flows take priority over robustness,
scalability, exhaustive error handling, and automated test coverage. Automated tests are
OPTIONAL and MUST NOT block delivery. Every screen and interaction defined in a spec MUST be
reachable and clickable.

Rationale: The value of a prototype is fast feedback on UX; production rigor slows that down.

### III. Mock Data, No Backend

All data MUST come from local mock sources (JSON or JS modules committed to the repo). Forms
and actions MUST simulate outcomes (success, error, loading, empty states) client-side without
persisting to any external service. Secrets, API keys, and real user data MUST NOT be committed
or required. Any state persistence MUST be limited to in-memory or `localStorage`.  API calls to update and fetch user enter data should leverage local storage.

Rationale: Public static hosting cannot protect secrets, and prototypes must work offline and
deterministically for demos.

### IV. Zero-Build by Default

The default stack is plain HTML, CSS, and ES-module JavaScript with no build step. Third-party
libraries SHOULD be loaded from a pinned-version CDN. A build tool (e.g., Vite) MAY be adopted
only if a plan justifies it, and its output MUST be a static folder deployable to Pages
(`/docs` on `main` or a GitHub Actions Pages workflow).

Rationale: No build step means the repo is the site—fewer moving parts and instant previews.

### V. Navigable & Shareable

Routing MUST be hash-based (e.g., `#/dashboard`) so every screen is deep-linkable and survives
refresh on GitHub Pages without 404 workarounds. All asset and link paths MUST be relative so
the site works under the `/<repo-name>/` sub-path. Layouts MUST be usable at desktop and phone
widths.

Rationale: Stakeholders review prototypes by sharing links, often on mobile.

## Technical Constraints

- Hosting: GitHub Pages (public static hosting); no custom server configuration available.
- Languages: HTML5, CSS, modern JavaScript (ES2020+) targeting current evergreen browsers.
- Dependencies: minimal; each added library MUST be justified in the feature plan.
- Local preview: any static file server (e.g., `python3 -m http.server`) MUST be sufficient to
  run the prototype.
- Accessibility: use semantic HTML and keyboard-reachable interactive elements as a baseline.

## Development Workflow

- Features follow the Spec Kit flow: specify → (clarify) → plan → tasks → implement.
- Keep each feature spec small (roughly 3–5 screens); expand via additional features rather
  than one large spec.
- Each feature is complete when all its screens are reachable via clicks, its mock states are
  demonstrable, and it works when served from a sub-path locally.
- Deployment is via push to `main`; the Pages site MUST be verified after each merge.

## Governance

This constitution supersedes other practices for this project. Plans MUST include a
Constitution Check confirming compliance with Principles I–V; any deviation (e.g., adding a
build step or a library) MUST be justified in the plan's complexity tracking.

Amendments are made via `/speckit-constitution`, recorded with a version bump:
MAJOR for removing or redefining principles, MINOR for adding principles or sections or
materially expanding guidance, PATCH for clarifications and wording.

**Version**: 1.0.0 | **Ratified**: 2026-11-23 | **Last Amended**: 2026-11-23
