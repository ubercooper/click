# Click

A clickable UI prototype: set up a profile with a random name, keep a timestamped log, and get help from Fox, a friendly cartoon assistant. The look is playful and inspired by Duolingo; the fox is an original character.

- **Dashboard** (`#/dashboard`): greeting, your profile, and a summary of your log
- **Profile** (`#/profile`): pick Male / Female / Ambiguous and generate a random name
- **Log** (`#/log`): add, view, edit, and delete timestamped entries

Everything runs in the browser. Data is kept in `localStorage` on your device; there is no backend and no account.

## Run locally

The site lives in `docs/` and is plain HTML/CSS/ES modules, with no build step. Any static server works. To mimic GitHub Pages' sub-path:

```bash
mkdir -p /tmp/pages && ln -sfn "$PWD/docs" /tmp/pages/click
python3 -m http.server 8000 --directory /tmp/pages
# open http://localhost:8000/click/
```

(`python3 -m http.server 8000 --directory docs` also works, at `http://localhost:8000/`.)

## Deploy (GitHub Pages)

1. Push to `main`.
2. In the repo, open **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, then branch `main` and folder `/docs`.
3. Open the published URL and run the smoke checks (scenarios 1, 5, 6, and 18) in `specs/001-profile-log-dashboard/quickstart.md`.

## Project layout

```text
docs/                 # the published site
  index.html          # app shell
  css/                # tokens, base, screens
  js/
    app.js            # entry: store + nav + assistant + router
    router.js         # hash routing
    store.js          # async localStorage "API" (the only code touching storage)
    names.js          # random name generator
    data/             # bundled name lists, fox message catalog
    components/       # fox assistant, nav, confirm dialog
    screens/          # dashboard, profile, log
specs/                # Spec Kit feature specs, plans, and tasks
.specify/             # Spec Kit config and constitution
```

## Customizing

- **Fox's name**: change `FOX_NAME` in `docs/js/data/assistant-messages.js`.
- **Fox's lines**: edit the message catalog in the same file.
- **Names**: edit `docs/js/data/names.js`.
- **Colors and fonts**: edit `docs/css/tokens.css`.
