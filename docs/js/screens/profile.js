// Profile — contracts/routes-and-screens.md (Profile), data-model.md (Profile + draft)
import { icons } from '../icons.js';
import { generateName, fullName } from '../names.js';
import { GENDERS } from '../store.js';

const LABEL = { male: 'Male', female: 'Female', ambiguous: 'Ambiguous' };

export async function render(root, ctx) {
  const { state, store, assistant } = ctx;
  const saved = state.profile;

  // In-memory draft; discarded when leaving without saving (FR-005).
  const draft = {
    gender: saved?.gender ?? null,
    firstName: null,
    lastName: null,
    previousFullName: saved ? fullName(saved) : null,
  };

  root.innerHTML = `
    <section class="screen profile" aria-labelledby="profile-title">
      <h1 id="profile-title" class="screen__title">Your profile</h1>
      <p class="screen__lead">Pick a gender, then roll a random name until you love it.</p>
      <form class="card profile-form" novalidate>
        <fieldset class="choices">
          <legend class="field-label">Gender</legend>
          ${GENDERS.map(
            (g) => `
            <label class="choice">
              <input class="visually-hidden" type="radio" name="gender" value="${g}" />
              ${icons[g]}
              <span>${LABEL[g]}</span>
            </label>`,
          ).join('')}
        </fieldset>
        <div class="name-card" aria-live="polite">
          <span class="name-card__eyebrow"></span>
          <span class="name-card__name"></span>
        </div>
        <div class="button-row">
          <button type="button" class="btn btn--fox" data-action="generate">${icons.dice}<span>Generate name</span></button>
          <button type="submit" class="btn btn--primary" data-action="save" disabled>${icons.check}<span>Save profile</span></button>
        </div>
      </form>
    </section>`;

  const form = root.querySelector('form');
  const radios = [...form.querySelectorAll('input[name="gender"]')];
  const card = form.querySelector('.name-card');
  const eyebrow = form.querySelector('.name-card__eyebrow');
  const nameEl = form.querySelector('.name-card__name');
  const generateBtn = form.querySelector('[data-action="generate"]');
  const saveBtn = form.querySelector('[data-action="save"]');
  const saveLabel = saveBtn.querySelector('span');

  const hasDraftName = () => Boolean(draft.firstName && draft.lastName);

  function update({ animate = false } = {}) {
    radios.forEach((r) => {
      r.checked = r.value === draft.gender;
    });
    generateBtn.setAttribute('aria-disabled', String(!draft.gender));
    saveBtn.disabled = !hasDraftName();

    card.classList.remove('is-new');
    if (hasDraftName()) {
      card.classList.add('has-name');
      eyebrow.textContent = 'How about…';
      nameEl.textContent = fullName(draft);
      nameEl.classList.remove('is-placeholder');
      if (animate) {
        void card.offsetWidth;
        card.classList.add('is-new');
      }
    } else if (saved && draft.gender === saved.gender) {
      card.classList.add('has-name');
      eyebrow.textContent = 'Current name';
      nameEl.textContent = fullName(saved);
      nameEl.classList.remove('is-placeholder');
    } else {
      card.classList.remove('has-name');
      eyebrow.textContent = '';
      nameEl.textContent = draft.gender ? 'Tap “Generate name” to get a name' : 'Your name will appear here';
      nameEl.classList.add('is-placeholder');
    }
  }

  form.addEventListener('change', (event) => {
    if (event.target.name !== 'gender') return;
    draft.gender = event.target.value;
    draft.firstName = null; // changing gender clears the generated name
    draft.lastName = null;
    update();
  });

  generateBtn.addEventListener('click', () => {
    if (!draft.gender) {
      assistant.say('profile', 'error');
      assistant.react('thinking');
      radios[0].focus();
      return;
    }
    const name = generateName(draft.gender, draft.previousFullName);
    draft.firstName = name.firstName;
    draft.lastName = name.lastName;
    draft.previousFullName = fullName(name);
    update({ animate: true });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!hasDraftName() || saveBtn.dataset.busy) return;

    saveBtn.dataset.busy = 'true';
    saveBtn.disabled = true;
    saveLabel.textContent = 'Saving…';

    const result = await store.saveProfile({
      gender: draft.gender,
      firstName: draft.firstName,
      lastName: draft.lastName,
    });
    ctx.showStorageWarningOnce(result);

    delete saveBtn.dataset.busy;
    saveLabel.textContent = 'Save profile';

    if (result.ok) {
      state.profile = result.data;
      state.flash = 'profileSaved'; // dashboard shows the fox's celebration
      assistant.react('cheering');
      ctx.navigate('dashboard');
    } else {
      saveBtn.disabled = !hasDraftName();
      assistant.say(result.error.code === 'INVALID_PROFILE' ? 'profile' : 'any', 'error');
      assistant.react('thinking');
    }
  });

  update();
  assistant.say('profile', 'welcome');
}

export function teardown() {
  // Draft lives in render()'s closure and is dropped with the DOM (FR-005).
}
