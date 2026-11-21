# Double Take! — a spot-the-difference hunt

![bounty](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)
![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/konzlodon74-dot/best-spot-the-difference-game-20261121-0451/rank.svg)
![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/konzlodon74-dot/best-spot-the-difference-game-20261121-0451/reward.svg)

An entry for the make.fun bounty [Make the best spot the difference game](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451).

Two pictures that look the same — but aren't. **Double Take!** shows each scene twice,
side by side, with 5–7 sneaky changes hiding in the right-hand picture: a vanished
kettle, a recoloured umbrella, a crab that wasn't there before. Click a difference
(on either picture) before the clock runs out.

## How to play

- **Find** every difference in a level before its timer empties. Found differences get
  a green ring on *both* pictures, and the counter in the header tracks what's left.
- **Wrong clicks cost you**: −30 points and −4 seconds, and the panels shake.
- **Hints** (3 per level) pulse a gold ring around a difference you haven't found,
  for −60 points. Keys: `H` hint, `R` restart, `Esc` back.
- **Score** 100 points per find plus 2 points per second left on the clock. Finish
  with few mistakes and no hints for **3 stars**; stars and unlocks are saved.
- Six levels, 36 differences: Sunny Beach, Cozy Kitchen, Rocket Yard, Garden Party,
  City Street and Underwater Reef — each hand-drawn in code, each harder than the last.

## Running it

The game is plain static files — no build step, no network, no libraries:

- Play locally: `node serve.ts` then open http://localhost:8080
- Or open `game/index.html` in a desktop browser.
- Hand in: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts` copies `game/` and
  `screenshots/` to the output directory and writes `dossier.json`.

## How it's built

Every scene is drawn programmatically on a canvas from a single painter function.
The painter draws the left picture plainly and the right picture with a declared set
of difference ids switched on, so the clickable targets are the *actual* painted
differences by construction — the two panels can never drift apart. Both variants of
every level are verified automatically (draw-op diffing and pixel diffing): every
painted change must land inside its declared region, and nothing outside the regions
may differ.

Layout: `game/src/` holds one module per job — `scenes.js` (the six painters and the
difference lists), `engine.js` (rules, scoring, timer, hints), `render.js` (all
drawing of screens and panels), `art.js` (canvas shape helpers), `audio.js`
(WebAudio bleeps synthesised in code — no audio files), `config.js` (layout and
scoring constants), `shots.js` (the deterministic `?shot=` scenes behind the
screenshots) and `main.js` (input and the frame loop).

## License

MIT — see [LICENSE](LICENSE).
