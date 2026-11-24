// Fox assistant — contracts/assistant.md, research.md R6.
// An ORIGINAL cartoon fox drawn as inline SVG (not Duolingo's owl or branding).

import { messages, FOX_NAME } from '../data/assistant-messages.js';
import { icons } from '../icons.js';

const INK = '#3B2414';
const CREAM = '#FFF8F0';
const ORANGE = '#FF8A1F';
const BLUSH = '#FF6B6B';

const FOX_SVG = `
<svg class="fox" viewBox="0 0 120 120" aria-hidden="true" focusable="false">
  <ellipse cx="60" cy="115" rx="30" ry="3.5" fill="#000" opacity=".08"/>
  <g class="fox__tail">
    <path d="M74 96 C 92 100, 112 92, 112 70 C 112 60, 106 52, 100 50 C 102 62, 96 76, 74 84 Z" fill="${ORANGE}"/>
    <path d="M100 50 C 106 52, 112 60, 112 70 C 108 66, 104 62, 98 60 C 100 57, 100 53, 100 50 Z" fill="${CREAM}"/>
  </g>
  <g class="fox__body">
    <ellipse cx="60" cy="94" rx="22" ry="19" fill="${ORANGE}"/>
    <path d="M60 78 C 70 82, 74 92, 70 104 C 66 110, 54 110, 50 104 C 46 92, 50 82, 60 78 Z" fill="${CREAM}"/>
    <ellipse cx="50" cy="111" rx="8" ry="4.5" fill="${INK}"/>
    <ellipse cx="70" cy="111" rx="8" ry="4.5" fill="${INK}"/>
  </g>
  <g class="fox__head">
    <path d="M33 46 L35 10 L58 31 Z" fill="${ORANGE}"/>
    <path d="M38 38 L39.5 19 L52 31 Z" fill="${INK}"/>
    <path d="M87 46 L85 10 L62 31 Z" fill="${ORANGE}"/>
    <path d="M82 38 L80.5 19 L68 31 Z" fill="${INK}"/>
    <path d="M26 50 C 26 32, 42 26, 60 26 C 78 26, 94 32, 94 50 C 94 64, 78 76, 60 80 C 42 76, 26 64, 26 50 Z" fill="${ORANGE}"/>
    <path d="M30 56 C 40 54, 52 58, 60 64 C 68 58, 80 54, 90 56 C 86 68, 74 77, 60 80 C 46 77, 34 68, 30 56 Z" fill="${CREAM}"/>
    <g class="fox__face fox__face--happy">
      <circle cx="46" cy="49" r="4.6" fill="${INK}"/>
      <circle cx="74" cy="49" r="4.6" fill="${INK}"/>
      <circle cx="47.6" cy="47.4" r="1.5" fill="#fff"/>
      <circle cx="75.6" cy="47.4" r="1.5" fill="#fff"/>
      <path d="M54 69 Q60 74 66 69" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    <g class="fox__face fox__face--thinking">
      <circle cx="46" cy="48" r="4.6" fill="${INK}"/>
      <circle cx="47.4" cy="46.2" r="1.5" fill="#fff"/>
      <path d="M69 50 L79 49" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M40 39 Q46 35 52 38" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M56 71 Q61 69 66 71" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
    </g>
    <g class="fox__face fox__face--cheering">
      <path d="M41 51 Q46 44 51 51" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <path d="M69 51 Q74 44 79 51" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="38" cy="60" r="4" fill="${BLUSH}" opacity=".45"/>
      <circle cx="82" cy="60" r="4" fill="${BLUSH}" opacity=".45"/>
      <path d="M53 68 Q60 80 67 68 Z" fill="${INK}"/>
      <ellipse cx="60" cy="73.5" rx="3.2" ry="2" fill="${BLUSH}"/>
    </g>
    <ellipse cx="60" cy="64" rx="4.5" ry="3.2" fill="${INK}"/>
  </g>
</svg>`;

const EXPRESSIONS = ['happy', 'thinking', 'cheering'];
const DEFAULT_VARS = { firstName: 'friend', foxName: FOX_NAME };

function findMessage(screen, moment, code) {
  const forScreen = (s) => messages.filter((m) => m.screen === s && m.moment === moment);
  if (code) {
    for (const s of [screen, 'any']) {
      const hit = forScreen(s).find((m) => m.code === code);
      if (hit) return hit;
    }
  }
  for (const s of [screen, 'any']) {
    const hit = forScreen(s).find((m) => !m.code);
    if (hit) return hit;
  }
  return null;
}

const pickText = (text) => (Array.isArray(text) ? text[Math.floor(Math.random() * text.length)] : text);

function fill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? DEFAULT_VARS[key] ?? '');
}

export function createAssistant({ getVars = () => ({}) } = {}) {
  let rootEl;
  let bubbleEl;
  let textEl;
  let liveEl;
  let foxBtn;
  let currentScreen = 'dashboard';
  let announceTimer;
  let hideTimer;
  let hideDueIn = 0;
  let hideStartedAt = 0;

  // Bubbles hide on their own after enough time to read them, so they never
  // permanently cover page controls. Hovering or focusing the bubble pauses this.
  const readingTime = (text) => Math.min(12000, Math.max(5000, text.length * 70));

  function startHideTimer(ms) {
    clearTimeout(hideTimer);
    hideDueIn = ms;
    hideStartedAt = Date.now();
    hideTimer = setTimeout(dismiss, ms);
  }

  function pauseHideTimer() {
    if (!hideTimer) return;
    clearTimeout(hideTimer);
    hideTimer = null;
    hideDueIn = Math.max(1500, hideDueIn - (Date.now() - hideStartedAt));
  }

  function resumeHideTimer() {
    if (!bubbleEl.hidden && !hideTimer) startHideTimer(hideDueIn);
  }

  function setExpression(expression) {
    if (!EXPRESSIONS.includes(expression)) return;
    rootEl.dataset.expression = expression;
  }

  function show(text) {
    textEl.textContent = text;
    bubbleEl.hidden = false;
    bubbleEl.classList.remove('is-entering');
    void bubbleEl.offsetWidth; // restart the pop-in animation
    bubbleEl.classList.add('is-entering');
    // Clear then set so repeated messages are re-announced by screen readers.
    liveEl.textContent = '';
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => {
      liveEl.textContent = text;
    }, 60);
    startHideTimer(readingTime(text));
  }

  /** Show the catalog message for screen + moment. `vars.code` selects a variant. */
  function say(screen, moment, vars = {}) {
    if (!rootEl) return null;
    const message = findMessage(screen, moment, vars.code);
    if (!message) return null;
    const merged = { ...getVars(), ...vars };
    const text = fill(pickText(message.text), merged);
    setExpression(message.expression);
    show(text);
    return text;
  }

  /** Play a short animation for the expression (does not change the text). */
  function react(expression) {
    if (!rootEl) return;
    setExpression(expression);
    foxBtn.classList.remove(...EXPRESSIONS.map((e) => `is-${e}`));
    void foxBtn.offsetWidth;
    foxBtn.classList.add(`is-${expression}`);
  }

  function dismiss() {
    if (!bubbleEl) return;
    clearTimeout(hideTimer);
    hideTimer = null;
    bubbleEl.hidden = true;
  }

  function setScreen(screen) {
    currentScreen = screen;
  }

  function mount(container) {
    container.innerHTML = `
      <div class="assistant" data-expression="happy">
        <div class="assistant__bubble" hidden>
          <p class="assistant__text"></p>
          <button type="button" class="assistant__close" aria-label="Dismiss message">${icons.close}</button>
        </div>
        <button type="button" class="assistant__fox" aria-label="Ask ${FOX_NAME} for help">${FOX_SVG}</button>
        <p class="visually-hidden" role="status" aria-live="polite"></p>
      </div>`;
    rootEl = container.querySelector('.assistant');
    bubbleEl = rootEl.querySelector('.assistant__bubble');
    textEl = rootEl.querySelector('.assistant__text');
    liveEl = rootEl.querySelector('[role="status"]');
    foxBtn = rootEl.querySelector('.assistant__fox');

    foxBtn.addEventListener('click', () => {
      say(currentScreen, 'help');
      react('thinking');
    });
    foxBtn.addEventListener('animationend', (event) => {
      if (event.target === foxBtn) foxBtn.classList.remove(...EXPRESSIONS.map((e) => `is-${e}`));
    });
    rootEl.querySelector('.assistant__close').addEventListener('click', () => {
      dismiss();
      foxBtn.focus();
    });
    bubbleEl.addEventListener('animationend', () => bubbleEl.classList.remove('is-entering'));
    bubbleEl.addEventListener('pointerenter', pauseHideTimer);
    bubbleEl.addEventListener('pointerleave', resumeHideTimer);
    bubbleEl.addEventListener('focusin', pauseHideTimer);
    bubbleEl.addEventListener('focusout', resumeHideTimer);
  }

  return { mount, say, react, dismiss, setScreen };
}
