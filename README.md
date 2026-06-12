# Word Fighter (Wordle Clone)

A small Wordle-like game built with plain HTML, CSS and JavaScript.

**Highlights**

- One-row-at-a-time input: only the active row is editable and receives focus.
- Inputs fill the letter cell entirely for a clean UI.
- Color feedback per cell: green (correct), yellow (present), lightgrey (absent).
- Fetches the word of the day and validates guesses using the `words.dev-apis.com` API.

**Files of interest**

- [index.html](index.html) — minimal page skeleton and game container.
- [style.css](style.css) — layout and styling; inputs now fill `.letter-container` and color rules apply to the container.
- [script.js](script.js) — game logic: active row handling, input navigation, correctness checking, and API calls.

**What I changed recently**

- Restrict input to one row at a time and autofocus the first cell of the active row.
- Ensure each input occupies the full width/height of its parent cell by using `inline-flex` on `.letter-container` and `width:100%/height:100%` on the `input`.
- Make input backgrounds transparent and apply background colors via `.letter-container` state classes so the green/yellow/lightgrey states are visible.

**How to run locally**

1. Open `index.html` in your browser (double-click or serve with a local static server).

   Example using Python's simple server:

```bash
cd /home/mishtickle/repos/wordle
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser
```

2. Type a 5-letter word into the first row; the UI will only allow input on the active row. Correct letters will get colored feedback after filling the row.

**Quick checks**

- Validate `script.js` for syntax:

```bash
node --check script.js
```