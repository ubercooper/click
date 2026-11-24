// Log — contracts/routes-and-screens.md (Log), data-model.md (LogEntry)
// User text is ALWAYS rendered with textContent (via el()), never innerHTML.
import { el } from '../dom.js';
import { icons } from '../icons.js';
import { formatTimestamp } from '../format.js';
import { MAX_ENTRY_LENGTH } from '../store.js';
import { confirmDialog } from '../components/confirm-dialog.js';

const isSubmitShortcut = (e) => e.key === 'Enter' && (e.metaKey || e.ctrlKey);

function counterText(length) {
  return `${length} / ${MAX_ENTRY_LENGTH}`;
}

function bindCounter(textarea, counter) {
  const sync = () => {
    counter.textContent = counterText(textarea.value.length);
    counter.classList.toggle('is-warning', textarea.value.length >= MAX_ENTRY_LENGTH - 50);
  };
  textarea.addEventListener('input', sync);
  sync();
  return sync;
}

export async function render(root, ctx, { isActive }) {
  const { state, store, assistant } = ctx;
  const entries = new Map(); // id → LogEntry

  root.innerHTML = `
    <section class="screen log" aria-labelledby="log-title">
      <h1 id="log-title" class="screen__title">Your log</h1>
      <p class="screen__lead">Jot down anything. Every entry is saved with the date and time.</p>
      <form class="card composer" novalidate>
        <label for="composer-text" class="field-label">New entry</label>
        <textarea id="composer-text" class="textarea" rows="4" maxlength="${MAX_ENTRY_LENGTH}"
          placeholder="What happened today?" aria-describedby="composer-hint"></textarea>
        <div class="composer__footer">
          <span id="composer-hint" class="hint">Ctrl / ⌘ + Enter to save</span>
          <span class="counter" aria-hidden="true"></span>
          <button type="submit" class="btn btn--primary">${icons.check}<span>Save entry</span></button>
        </div>
      </form>
      <h2 class="section-title" id="entries-title" tabindex="-1">Entries <span class="count-badge">0</span></h2>
      <div class="entries-region" aria-busy="true">
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
    </section>`;

  const composer = root.querySelector('.composer');
  const textarea = composer.querySelector('textarea');
  const submitBtn = composer.querySelector('button[type="submit"]');
  const submitLabel = submitBtn.querySelector('span');
  const syncCounter = bindCounter(textarea, composer.querySelector('.counter'));
  const region = root.querySelector('.entries-region');
  const entriesTitle = root.querySelector('#entries-title');
  const badge = root.querySelector('.count-badge');
  const list = el('ol', { class: 'entry-list', 'aria-labelledby': 'entries-title' });

  assistant.say('log', 'welcome', state.profile ? {} : { code: 'noProfile' });

  // ---------- rendering helpers ----------

  function updateCount() {
    badge.textContent = String(entries.size);
  }

  function showEmpty() {
    region.replaceChildren(
      el(
        'div',
        { class: 'empty-state' },
        el('span', { html: icons.book }),
        el('strong', {}, 'No entries yet'),
        el('p', {}, 'Your first entry is just a few words away.'),
      ),
    );
    assistant.say('log', 'empty');
  }

  function showList() {
    if (list.parentNode !== region) region.replaceChildren(list);
  }

  function viewCard(li, entry) {
    li.classList.remove('is-editing');
    const when = formatTimestamp(entry.createdAt);
    const meta = el(
      'div',
      { class: 'entry__meta' },
      el('time', { datetime: entry.createdAt }, when),
      entry.updatedAt
        ? el('span', { class: 'entry__edited' }, `edited ${formatTimestamp(entry.updatedAt)}`)
        : null,
      el(
        'div',
        { class: 'entry__actions' },
        el(
          'button',
          { type: 'button', class: 'btn btn--ghost btn--small', 'data-action': 'edit', 'aria-label': `Edit entry from ${when}`, html: icons.pencil },
          'Edit',
        ),
        el(
          'button',
          { type: 'button', class: 'btn btn--ghost btn--small', 'data-action': 'delete', 'aria-label': `Delete entry from ${when}`, html: icons.trash },
          'Delete',
        ),
      ),
    );
    li.replaceChildren(el('p', { class: 'entry__text' }, entry.text), meta);
  }

  function entryCard(entry) {
    const li = el('li', { class: 'card entry', dataset: { id: entry.id } });
    viewCard(li, entry);
    return li;
  }

  function editCard(li, entry) {
    li.classList.add('is-editing');
    const fieldId = `edit-${entry.id}`;
    const textareaEl = el('textarea', { id: fieldId, class: 'textarea', rows: 4, maxlength: MAX_ENTRY_LENGTH });
    textareaEl.value = entry.text;
    const counter = el('span', { class: 'counter', 'aria-hidden': 'true' });
    const form = el(
      'form',
      { class: 'entry__edit', novalidate: true },
      el('label', { for: fieldId, class: 'visually-hidden' }, 'Edit entry'),
      textareaEl,
      el(
        'div',
        { class: 'entry__edit-footer' },
        counter,
        el('button', { type: 'button', class: 'btn btn--ghost btn--small', 'data-action': 'cancel-edit' }, 'Cancel'),
        el('button', { type: 'submit', class: 'btn btn--primary btn--small', html: icons.check }, el('span', {}, 'Save')),
      ),
    );
    li.replaceChildren(form);
    bindCounter(textareaEl, counter);
    textareaEl.focus();
    textareaEl.setSelectionRange(textareaEl.value.length, textareaEl.value.length);

    textareaEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit(li);
      } else if (isSubmitShortcut(e)) {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = form.querySelector('button[type="submit"]');
      if (saveBtn.disabled) return;
      saveBtn.disabled = true;
      const result = await store.updateEntry(entry.id, textareaEl.value);
      ctx.showStorageWarningOnce(result);
      if (!isActive()) return;
      saveBtn.disabled = false;

      if (result.ok) {
        entries.set(entry.id, result.data);
        viewCard(li, result.data);
        li.querySelector('[data-action="edit"]').focus();
        assistant.say('log', 'success', { code: 'edited' });
        assistant.react('cheering');
      } else if (result.error.code === 'NOT_FOUND') {
        removeCard(li, entry.id);
        assistant.say('log', 'error', { code: 'NOT_FOUND' });
        assistant.react('thinking');
      } else {
        assistant.say('log', 'error', { code: result.error.code });
        assistant.react('thinking');
        textareaEl.focus();
      }
    });
  }

  function cancelEdit(li) {
    const entry = entries.get(li.dataset.id);
    if (!entry) return;
    viewCard(li, entry);
    li.querySelector('[data-action="edit"]').focus();
  }

  function removeCard(li, id) {
    entries.delete(id);
    li.remove();
    updateCount();
    if (entries.size === 0) showEmpty();
  }

  async function deleteFlow(li) {
    const id = li.dataset.id;
    const confirmed = await confirmDialog({
      title: 'Delete this entry?',
      body: "This can't be undone.",
      confirmLabel: 'Delete',
    });
    if (!confirmed || !isActive()) return;

    const result = await store.deleteEntry(id);
    ctx.showStorageWarningOnce(result);
    if (!isActive()) return;

    if (result.ok || result.error.code === 'NOT_FOUND') {
      removeCard(li, id);
      entriesTitle.focus();
      if (entries.size > 0) {
        if (result.ok) assistant.say('log', 'success', { code: 'deleted' });
        else assistant.say('log', 'error', { code: 'NOT_FOUND' });
      }
    } else {
      assistant.say('log', 'error', { code: result.error.code });
      assistant.react('thinking');
    }
  }

  // ---------- events ----------

  list.addEventListener('click', (e) => {
    const button = e.target.closest('button[data-action]');
    if (!button) return;
    const li = button.closest('li.entry');
    const entry = entries.get(li?.dataset.id);
    if (!entry) return;
    if (button.dataset.action === 'edit') editCard(li, entry);
    else if (button.dataset.action === 'delete') deleteFlow(li);
    else if (button.dataset.action === 'cancel-edit') cancelEdit(li);
  });

  textarea.addEventListener('keydown', (e) => {
    if (isSubmitShortcut(e)) {
      e.preventDefault();
      composer.requestSubmit();
    }
  });

  composer.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitBtn.disabled) return;
    submitBtn.disabled = true;
    submitLabel.textContent = 'Saving…';
    const result = await store.createEntry(textarea.value);
    ctx.showStorageWarningOnce(result);
    if (!isActive()) return;
    submitBtn.disabled = false;
    submitLabel.textContent = 'Save entry';

    if (result.ok) {
      entries.set(result.data.id, result.data);
      showList();
      list.prepend(entryCard(result.data));
      updateCount();
      textarea.value = '';
      syncCounter();
      textarea.focus();
      assistant.say('log', 'success');
      assistant.react('cheering');
    } else {
      assistant.say('log', 'error', { code: result.error.code });
      assistant.react('thinking');
      textarea.focus();
    }
  });

  // ---------- initial load ----------

  const result = await store.listEntries();
  if (!isActive()) return;
  ctx.showStorageWarningOnce(result);
  region.removeAttribute('aria-busy');

  if (!result.ok) {
    region.replaceChildren(el('p', { class: 'card muted' }, "Couldn't load your entries. Try refreshing."));
    assistant.say('any', 'error');
    return;
  }

  const fragment = document.createDocumentFragment();
  for (const entry of result.data) {
    entries.set(entry.id, entry);
    fragment.append(entryCard(entry));
  }
  list.append(fragment);
  updateCount();

  if (entries.size === 0) showEmpty();
  else showList();
}

export function teardown() {}
