// Fox assistant message catalog — contracts/assistant.md, data-model.md (Assistant Message).
// Each entry: { screen, moment, expression, text, code? }
//   screen:     'dashboard' | 'profile' | 'log' | 'any'
//   moment:     'welcome' | 'help' | 'success' | 'error' | 'empty' | 'storageWarning'
//   expression: 'happy' | 'thinking' | 'cheering'
//   text:       string or string[] (variant picked at random); supports {firstName} and {foxName}
//   code:       optional variant key (e.g. an error code, or 'noProfile')

/** Placeholder until the design team names the fox (research.md R6). */
export const FOX_NAME = 'Fox';

export const messages = [
  // ----- Dashboard -----
  {
    screen: 'dashboard',
    moment: 'welcome',
    code: 'noProfile',
    expression: 'happy',
    text: "Hi friend! I'm {foxName}. Let's set up your profile first!",
  },
  {
    screen: 'dashboard',
    moment: 'welcome',
    expression: 'happy',
    text: [
      'Hi {firstName}! Ready to jot something down today?',
      "Welcome back, {firstName}! What's new?",
      'Good to see you, {firstName}!',
    ],
  },
  {
    screen: 'dashboard',
    moment: 'help',
    expression: 'thinking',
    text: 'This is your home base. Check your profile and your latest log entry here.',
  },

  // ----- Profile -----
  {
    screen: 'profile',
    moment: 'welcome',
    expression: 'happy',
    text: ["Pick a gender and I'll dream up a name for you!", "Let's find you a name! Pick a gender to start."],
  },
  {
    screen: 'profile',
    moment: 'help',
    expression: 'thinking',
    text: 'Choose Male, Female or Ambiguous, tap Generate as many times as you like, then Save.',
  },
  {
    screen: 'profile',
    moment: 'success',
    expression: 'cheering',
    text: ['Nice to meet you, {firstName}!', '{firstName}! What a great name!', 'Welcome aboard, {firstName}!'],
  },
  {
    screen: 'profile',
    moment: 'error',
    expression: 'thinking',
    text: 'Pick a gender first, then I can find you a name.',
  },

  // ----- Log -----
  {
    screen: 'log',
    moment: 'welcome',
    code: 'noProfile',
    expression: 'happy',
    text: 'Hi friend! Write anything you like. Tip: set up your profile so I know what to call you.',
  },
  {
    screen: 'log',
    moment: 'welcome',
    expression: 'happy',
    text: ["What's on your mind, {firstName}?", 'Ready when you are, {firstName}. What happened today?'],
  },
  {
    screen: 'log',
    moment: 'help',
    expression: 'thinking',
    text: 'Type a note and hit Save. You can edit or delete entries any time.',
  },
  {
    screen: 'log',
    moment: 'empty',
    expression: 'happy',
    text: 'No entries yet. Write your first one!',
  },
  {
    screen: 'log',
    moment: 'success',
    expression: 'cheering',
    text: ['Saved! Great job, {firstName}.', 'Got it! Nice entry, {firstName}.', 'All saved, {firstName}!'],
  },
  {
    screen: 'log',
    moment: 'success',
    code: 'edited',
    expression: 'cheering',
    text: ['Updated! Looking good.', 'Changes saved!'],
  },
  {
    screen: 'log',
    moment: 'success',
    code: 'deleted',
    expression: 'happy',
    text: 'Entry deleted.',
  },
  { screen: 'log', moment: 'error', code: 'EMPTY_TEXT', expression: 'thinking', text: 'Oops, that entry is empty!' },
  {
    screen: 'log',
    moment: 'error',
    code: 'TOO_LONG',
    expression: 'thinking',
    text: "That's a bit long. Keep it under 1,000 characters.",
  },
  {
    screen: 'log',
    moment: 'error',
    code: 'NOT_FOUND',
    expression: 'thinking',
    text: "Hmm, I can't find that entry anymore.",
  },

  // ----- Anywhere -----
  {
    screen: 'any',
    moment: 'storageWarning',
    expression: 'thinking',
    text: "Heads up: your browser isn't letting me save, so entries may disappear when you leave.",
  },
  {
    screen: 'any',
    moment: 'error',
    expression: 'thinking',
    text: 'Something went wrong there. Please try again.',
  },
];
