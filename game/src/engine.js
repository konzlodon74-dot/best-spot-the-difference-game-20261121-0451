// The game state machine for Double Take: screens, level progress, click judging,
// the countdown, hints, scoring and persistent stars. Pure logic — no DOM, no canvas —
// so the same code the page runs can be exercised headlessly.

import { FIND_POINTS, HINT_COST, HINTS_PER_LEVEL, MISS_POINTS, MISS_SECONDS, TIME_BONUS_PER_SECOND, starsFor } from './config.js';
import { LEVELS } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_LEVELS = 'levels';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_OVER = 'over';
export const SCREEN_DONE = 'done';

const SAVE_KEY = 'doubletake-progress-v1';

/** A fresh game state; `storage` is anything with getItem/setItem (or null). */
export function createGame(storage) {
  const state = {
    screen: SCREEN_TITLE,
    storage: storage || null,
    stars: LEVELS.map(() => 0),
    unlocked: 1,
    totalScore: 0,
    levelIndex: 0,
    found: new Set(),
    mistakes: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintsUsed: 0,
    score: 0,
    timeLeft: 0,
    timeTotal: 0,
    markers: [], // { id, age } — one per found difference, age drives the ring animation
    misses: [], // { x, y, age } — fading red crosses at wrong clicks, in scene coords
    hintId: null,
    hintAge: 0,
    shake: 0,
    message: '',
    messageAge: 0,
    lastEvent: null, // 'found' | 'miss' | 'win' | 'over' | 'hint' — main.js plays the sound
    finishedBonus: 0,
  };
  loadProgress(state);
  return state;
}

/** Read saved stars/unlocks/total from storage, tolerating anything malformed. */
export function loadProgress(state) {
  if (!state.storage) return;
  try {
    const raw = state.storage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.stars)) {
      data.stars.forEach((s, i) => {
        if (i < LEVELS.length && typeof s === 'number') state.stars[i] = Math.max(0, Math.min(3, s | 0));
      });
    }
    if (typeof data.unlocked === 'number') state.unlocked = Math.max(1, Math.min(LEVELS.length, data.unlocked | 0));
    if (typeof data.totalScore === 'number') state.totalScore = Math.max(0, data.totalScore | 0);
  } catch {
    /* a corrupt save is just a fresh start */
  }
}

/** Persist stars/unlocks/total. */
export function saveProgress(state) {
  if (!state.storage) return;
  try {
    state.storage.setItem(SAVE_KEY, JSON.stringify({ stars: state.stars, unlocked: state.unlocked, totalScore: state.totalScore }));
  } catch {
    /* storage may be unavailable (private mode); the game plays on regardless */
  }
}

/** Begin (or restart) level `index`: fresh finds, full clock, full hints. */
export function startLevel(state, index) {
  const level = LEVELS[index];
  state.levelIndex = index;
  state.found = new Set();
  state.mistakes = 0;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.hintsUsed = 0;
  state.score = 0;
  state.timeTotal = level.timeLimit;
  state.timeLeft = level.timeLimit;
  state.markers = [];
  state.misses = [];
  state.hintId = null;
  state.hintAge = 0;
  state.shake = 0;
  state.finishedBonus = 0;
  state.screen = SCREEN_PLAY;
  setMessage(state, `Find ${level.differences.length} differences!`);
}

/** Show a transient footer message. */
export function setMessage(state, text) {
  state.message = text;
  state.messageAge = 0;
}

/** Differences of the current level not yet found. */
export function remaining(state) {
  return LEVELS[state.levelIndex].differences.filter((d) => !state.found.has(d.id));
}

/**
 * Judge a click at scene coords (x, y) during play. Returns 'found', 'already' or 'miss'.
 * A click within a difference's radius finds it (whichever panel was clicked — the
 * coordinates are the same). A miss costs points and seconds and shakes the panels.
 */
export function clickScene(state, x, y) {
  if (state.screen !== SCREEN_PLAY) return 'ignored';
  for (const d of LEVELS[state.levelIndex].differences) {
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) {
      if (state.found.has(d.id)) {
        setMessage(state, 'Already found that one!');
        return 'already';
      }
      state.found.add(d.id);
      state.markers.push({ id: d.id, age: 0 });
      state.score += FIND_POINTS;
      state.lastEvent = 'found';
      if (state.hintId === d.id) state.hintId = null;
      const left = remaining(state).length;
      if (left === 0) {
        finishLevel(state);
      } else {
        setMessage(state, `${d.label}! ${left} to go.`);
      }
      return 'found';
    }
  }
  state.mistakes += 1;
  state.score = Math.max(0, state.score - MISS_POINTS);
  state.timeLeft = Math.max(0, state.timeLeft - MISS_SECONDS);
  state.misses.push({ x, y, age: 0 });
  state.shake = 0.32;
  state.lastEvent = 'miss';
  setMessage(state, `Not there! −${MISS_POINTS} points, −${MISS_SECONDS}s.`);
  return 'miss';
}

/** Spend a hint: pulse the ring around a random unfound difference. */
export function useHint(state) {
  if (state.screen !== SCREEN_PLAY) return null;
  const pool = remaining(state);
  if (pool.length === 0) return null;
  if (state.hintsLeft <= 0) {
    setMessage(state, 'No hints left!');
    return null;
  }
  state.hintsLeft -= 1;
  state.hintsUsed += 1;
  state.score = Math.max(0, state.score - HINT_COST);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  state.hintId = pick.id;
  state.hintAge = 0;
  state.lastEvent = 'hint';
  setMessage(state, `Hint: look near here… (−${HINT_COST} points)`);
  return pick;
}

/** All differences found: bank the time bonus, award stars, unlock the next level. */
export function finishLevel(state) {
  state.finishedBonus = Math.round(state.timeLeft) * TIME_BONUS_PER_SECOND;
  state.score += state.finishedBonus;
  state.totalScore += state.score;
  const earned = starsFor(state.mistakes, state.hintsUsed);
  if (earned > state.stars[state.levelIndex]) state.stars[state.levelIndex] = earned;
  if (state.levelIndex + 1 < LEVELS.length) {
    state.unlocked = Math.max(state.unlocked, state.levelIndex + 2);
  }
  saveProgress(state);
  state.screen = state.levelIndex + 1 >= LEVELS.length ? SCREEN_DONE : SCREEN_WIN;
  state.lastEvent = 'win';
  setMessage(state, 'Level complete!');
}

/** Advance the clock and the transient animations; ends the level when time runs out. */
export function tick(state, dt) {
  for (const m of state.markers) m.age += dt;
  for (const m of state.misses) m.age += dt;
  state.misses = state.misses.filter((m) => m.age < 0.7);
  if (state.shake > 0) state.shake = Math.max(0, state.shake - dt);
  if (state.messageAge < 10) state.messageAge += dt;
  if (state.hintId !== null) {
    state.hintAge += dt;
    if (state.hintAge > 2.4) state.hintId = null;
  }
  if (state.screen === SCREEN_PLAY) {
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = SCREEN_OVER;
      state.lastEvent = 'over';
      setMessage(state, "Time's up!");
    }
  }
}
