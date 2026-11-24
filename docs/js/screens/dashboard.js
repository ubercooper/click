// Dashboard — contracts/routes-and-screens.md (Dashboard)
import { el } from '../dom.js';
import { icons } from '../icons.js';
import { formatTimestamp, truncate } from '../format.js';

const GENDER_LABEL = { male: 'Male', female: 'Female', ambiguous: 'Ambiguous' };

export async function render(root, ctx, { isActive }) {
  const { state, store, assistant } = ctx;
  const profile = state.profile;

  const title = el('h1', { class: 'screen__title', id: 'dash-title' }, profile ? `Hi, ${profile.firstName}!` : 'Welcome!');
  const lead = el(
    'p',
    { class: 'screen__lead' },
    profile ? "Here's what's happening today." : "Let's get you set up. It only takes a few seconds.",
  );
  const logCard = el(
    'article',
    { class: 'card dash-card', 'aria-busy': 'true', 'aria-label': 'Your log' },
    el('div', { class: 'skeleton skeleton--title' }),
    el('div', { class: 'skeleton skeleton--line' }),
    el('div', { class: 'skeleton skeleton--line skeleton--short' }),
  );

  root.append(
    el(
      'section',
      { class: 'screen dashboard', 'aria-labelledby': 'dash-title' },
      title,
      lead,
      el('div', { class: 'dash-grid' }, profileCard(profile), logCard),
    ),
  );

  // Fox: celebrate a just-saved profile, otherwise greet.
  if (state.flash === 'profileSaved') {
    state.flash = null;
    assistant.say('profile', 'success');
    assistant.react('cheering');
  } else {
    assistant.say('dashboard', 'welcome', profile ? {} : { code: 'noProfile' });
  }

  const result = await store.getStats();
  if (!isActive()) return;
  ctx.showStorageWarningOnce(result);
  logCard.replaceChildren(...logCardContent(result));
  logCard.removeAttribute('aria-busy');
}

function profileCard(profile) {
  if (!profile) {
    return el(
      'article',
      { class: 'card dash-card dash-card--setup', 'aria-labelledby': 'dash-profile-title' },
      el('h2', { id: 'dash-profile-title' }, 'Your profile'),
      el('p', {}, 'Pick a gender and get a fun random name.'),
      el('a', { class: 'btn btn--fox btn--large', href: '#/profile', html: icons.user }, 'Set up your profile'),
    );
  }
  return el(
    'article',
    { class: 'card dash-card', 'aria-labelledby': 'dash-profile-title' },
    el('h2', { id: 'dash-profile-title' }, 'Your profile'),
    el('p', { class: 'dash-name' }, `${profile.firstName} ${profile.lastName}`),
    el('span', { class: 'chip', html: icons[profile.gender] }, GENDER_LABEL[profile.gender]),
    el('a', { class: 'btn btn--ghost', href: '#/profile', html: icons.pencil }, 'Edit profile'),
  );
}

function logCardContent(result) {
  const heading = el('h2', {}, 'Your log');
  const cta = el('a', { class: 'btn btn--primary', href: '#/log', html: icons.pen }, 'Write a log entry');

  if (!result.ok) {
    return [heading, el('p', { class: 'muted' }, "Couldn't load your log right now."), cta];
  }

  const { count, latest } = result.data;
  const countEl = el(
    'p',
    { class: 'dash-count' },
    String(count),
    ' ',
    el('small', {}, count === 1 ? 'entry' : 'entries'),
  );

  if (!latest) {
    return [heading, countEl, el('p', { class: 'muted' }, 'No entries yet'), cta];
  }

  const preview = el(
    'blockquote',
    { class: 'dash-preview' },
    el('span', {}, truncate(latest.text, 120)),
    el('time', { datetime: latest.createdAt }, formatTimestamp(latest.createdAt)),
  );
  return [heading, countEl, el('p', { class: 'muted' }, 'Latest entry'), preview, cta];
}

export function teardown() {}
