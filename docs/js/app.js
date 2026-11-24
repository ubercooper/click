// App entry: wires store, nav, assistant, and router.
import * as store from './store.js';
import { startRouter } from './router.js';
import { mountNav, setActive } from './components/nav.js';
import { createAssistant } from './components/assistant.js';
import * as dashboard from './screens/dashboard.js';
import * as profile from './screens/profile.js';
import * as log from './screens/log.js';

const state = {
  profile: null, // data-model.md Profile (saved) or null
  flash: null, // one-shot message for the next screen, e.g. 'profileSaved'
};

const assistant = createAssistant({
  getVars: () => ({ firstName: state.profile?.firstName }),
});

let storageWarned = false;

const ctx = {
  state,
  store,
  assistant,
  navigate(route) {
    location.hash = `#/${route}`;
  },
  /** Show the storage warning once per session when a store result isn't persistent. */
  showStorageWarningOnce(result) {
    if (storageWarned || !result || result.persistent !== false) return;
    storageWarned = true;
    // Let the screen's own greeting show first, then warn.
    setTimeout(() => assistant.say('any', 'storageWarning'), 1800);
  },
};

async function init() {
  mountNav(document.getElementById('nav'));
  assistant.mount(document.getElementById('assistant-root'));
  // Once the user starts typing, get the speech bubble out of the way.
  document.getElementById('view').addEventListener('input', () => assistant.dismiss());

  const result = await store.getProfile();
  if (result.ok) state.profile = result.data;
  ctx.showStorageWarningOnce(result);

  startRouter({
    view: document.getElementById('view'),
    routes: { dashboard, profile, log },
    ctx,
    onChange(name) {
      setActive(name);
      assistant.setScreen(name);
    },
  });
}

init();
