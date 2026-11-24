# Contract: Fox Assistant

Component: `docs/js/components/assistant.js`. It renders the original cartoon fox (inline SVG) and a speech bubble.

## Interface

| Method | Effect |
|---|---|
| `say(screen, moment, vars?)` | Looks up the message for `screen` + `moment` (falling back to `any` + `moment`), sets the expression, shows the bubble, and announces the text through an `aria-live="polite"` region |
| `react(expression)` | Plays a short animation (bounce for `cheering`, tilt for `thinking`) without changing the text |
| `dismiss()` | Hides the bubble; the fox stays visible |

Speech bubbles hide automatically after a reading time (5–12 s, depending on length; paused while the bubble is hovered or focused) and as soon as the user starts typing on the page, so the fixed-position bubble never stays over page controls. Re-showing happens on the next `say()`.

Tapping or clicking the fox (it is a `<button>` labelled "Ask Fox for help") calls `say(currentScreen, "help")`.

## Required catalog entries (FR-009)

| Screen | Moment | Expression | Example text |
|---|---|---|---|
| dashboard | welcome | happy | "Hi {firstName}! Ready to jot something down today?" / no profile: "Hi friend! I'm Fox. Let's set up your profile first!" |
| dashboard | help | thinking | "This is your home base. Check your profile and your latest log entry here." |
| profile | welcome | happy | "Pick a gender and I'll dream up a name for you!" |
| profile | help | thinking | "Choose Male, Female or Ambiguous, tap Generate as many times as you like, then Save." |
| profile | success | cheering | "Nice to meet you, {firstName}!" |
| profile | error | thinking | "Pick a gender first, then I can find you a name." |
| log | welcome | happy | "What's on your mind?" |
| log | help | thinking | "Type a note and hit Save. You can edit or delete entries any time." |
| log | empty | happy | "No entries yet. Write your first one!" |
| log | success | cheering | "Saved! Great job, {firstName}." |
| log | error | thinking | `EMPTY_TEXT`: "Oops, that entry is empty!" · `TOO_LONG`: "That's a bit long. Keep it under 1,000 characters." · `NOT_FOUND`: "Hmm, I can't find that entry anymore." |
| any | storageWarning | thinking | "Heads up: your browser isn't letting me save, so entries may disappear when you leave." |

`{firstName}` falls back to "friend" when no profile exists. The final wording is open to design polish; the screen/moment pairs above are the contract.
