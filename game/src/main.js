// Boot: size the canvas to the window (letterboxed, logical 1280 x 800), wire mouse
// and keyboard input to the engine, run the frame loop, and stage a ?shot= scene
// instead of the title screen when the page is opened for a screenshot.

import { LOGICAL_H, LOGICAL_W, PANEL_LEFT_X, PANEL_RIGHT_X, PANEL_Y, SCENE } from './config.js';
import { SCREEN_LEVELS, SCREEN_PLAY, SCREEN_TITLE, clickScene, createGame, startLevel, tick, useHint } from './engine.js';
import { LEVELS } from './scenes.js';
import { buttonsFor, levelCardRects, render } from './render.js';
import { stageShot } from './shots.js';
import { playClick, playFound, playMiss, playOver, playWin } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

let storage = null;
try {
  storage = window.localStorage;
} catch {
  storage = null;
}
const state = createGame(storage);

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
if (shotName) stageShot(state, shotName, Number(params.get('level') || '0'));

let view = { scale: 1, ox: 0, oy: 0, dpr: 1 };

function resize() {
  view.dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(window.innerWidth * view.dpr);
  canvas.height = Math.round(window.innerHeight * view.dpr);
  view.scale = Math.min(canvas.width / LOGICAL_W, canvas.height / LOGICAL_H);
  view.ox = (canvas.width - LOGICAL_W * view.scale) / 2;
  view.oy = (canvas.height - LOGICAL_H * view.scale) / 2;
}
window.addEventListener('resize', resize);
resize();

/** Convert a pointer event to logical game coordinates. */
function toLogical(event) {
  const rect = canvas.getBoundingClientRect();
  const px = ((event.clientX - rect.left) / rect.width) * canvas.width;
  const py = ((event.clientY - rect.top) / rect.height) * canvas.height;
  return { x: (px - view.ox) / view.scale, y: (py - view.oy) / view.scale };
}

let hoverId = null;

/** The first level with no stars yet, or level 0 when all are starred. */
function firstUnfinished() {
  const i = state.stars.findIndex((s) => s === 0);
  return i === -1 ? 0 : i;
}

/** Run a button's action by id. */
function activate(id) {
  switch (id) {
    case 'play':
      startLevel(state, firstUnfinished());
      break;
    case 'levels':
      state.screen = SCREEN_LEVELS;
      break;
    case 'title':
      state.screen = SCREEN_TITLE;
      break;
    case 'next':
      startLevel(state, Math.min(state.levelIndex + 1, LEVELS.length - 1));
      break;
    case 'replay':
    case 'retry':
    case 'restart':
      startLevel(state, state.levelIndex);
      break;
    case 'hint':
      useHint(state);
      break;
    default:
      break;
  }
  playClick();
}

/** Play the sound an engine event calls for, once. */
function consumeEvent() {
  const ev = state.lastEvent;
  if (!ev) return;
  state.lastEvent = null;
  if (ev === 'found') playFound();
  else if (ev === 'miss') playMiss();
  else if (ev === 'win') playWin();
  else if (ev === 'over') playOver();
  else if (ev === 'hint') playClick();
}

canvas.addEventListener('pointermove', (event) => {
  const p = toLogical(event);
  const hit = buttonsFor(state).find((b) => b.enabled !== false && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
  hoverId = hit ? hit.id : null;
  canvas.style.cursor = hit || state.screen === SCREEN_PLAY ? 'pointer' : 'default';
});

canvas.addEventListener('pointerdown', (event) => {
  const p = toLogical(event);
  const button = buttonsFor(state).find((b) => b.enabled !== false && p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h);
  if (button) {
    activate(button.id);
    consumeEvent();
    return;
  }
  if (state.screen === SCREEN_LEVELS) {
    for (const card of levelCardRects()) {
      if (card.index < state.unlocked && p.x >= card.x && p.x <= card.x + card.w && p.y >= card.y && p.y <= card.y + card.h) {
        startLevel(state, card.index);
        playClick();
        return;
      }
    }
    return;
  }
  if (state.screen === SCREEN_PLAY) {
    for (const panelX of [PANEL_LEFT_X, PANEL_RIGHT_X]) {
      if (p.x >= panelX && p.x <= panelX + SCENE && p.y >= PANEL_Y && p.y <= PANEL_Y + SCENE) {
        clickScene(state, p.x - panelX, p.y - PANEL_Y);
        consumeEvent();
        announce();
        return;
      }
    }
  }
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (state.screen === SCREEN_PLAY) state.screen = SCREEN_LEVELS;
    else if (state.screen === SCREEN_LEVELS) state.screen = SCREEN_TITLE;
  } else if (state.screen === SCREEN_PLAY && (event.key === 'h' || event.key === 'H')) {
    useHint(state);
    consumeEvent();
  } else if (state.screen === SCREEN_PLAY && (event.key === 'r' || event.key === 'R')) {
    startLevel(state, state.levelIndex);
  } else if (state.screen === SCREEN_TITLE && (event.key === 'Enter' || event.key === ' ')) {
    activate('play');
  }
});

/** Keep the hidden status line truthful for screen readers. */
function announce() {
  status.textContent = state.message || document.title;
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!shotName) {
    tick(state, dt);
    consumeEvent();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#1b2740';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(view.scale, 0, 0, view.scale, view.ox, view.oy);
  render(ctx, state, hoverId);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
announce();
