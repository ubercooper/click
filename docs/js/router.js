// Hash router — contracts/routes-and-screens.md, Constitution V.
// Screens are modules exporting `render(root, ctx, { isActive })` and optional `teardown()`.

const parse = (hash) => (hash.match(/^#\/?([\w-]*)/) ?? [])[1] ?? '';

export function startRouter({ view, routes, ctx, defaultRoute = 'dashboard', onChange }) {
  let current = null;
  let token = 0;
  let firstRender = true;

  async function handle() {
    const name = parse(location.hash);
    if (!Object.hasOwn(routes, name)) {
      location.replace(`#/${defaultRoute}`); // fires hashchange → handle() again
      return;
    }

    try {
      current?.screen.teardown?.();
    } catch (err) {
      console.error('[router] teardown failed', err);
    }

    const myToken = ++token;
    const isActive = () => myToken === token;
    const host = document.createElement('div');
    host.className = 'screen-host';
    view.replaceChildren(host);
    current = { name, screen: routes[name] };
    onChange?.(name);

    if (!firstRender) {
      view.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
    firstRender = false;

    try {
      await routes[name].render(host, ctx, { isActive });
    } catch (err) {
      console.error(`[router] render "${name}" failed`, err);
      if (isActive()) {
        host.innerHTML = '<p class="card">Something went wrong loading this page. Try refreshing.</p>';
      }
    }
  }

  window.addEventListener('hashchange', handle);
  handle();

  return { current: () => current?.name ?? null };
}
