// Everything the player sees: the header with its counter and timer, the two framed
// pictures with their found-markers, the title / level-select / win / time-up screens.
// Scenes are painted once per level into offscreen canvases (makeSceneCanvas) and then
// blitted each frame, so markers, pulses and shakes draw over a still picture.

import { ACCENT, FOOTER_Y, GOLD, HEADER_H, HINT_COST, INK, LOGICAL_H, LOGICAL_W, MINT, PANEL_LEFT_X, PANEL_RIGHT_X, PANEL_Y, PAPER, SCENE, SKY } from './config.js';
import { LEVELS } from './scenes.js';
import { SCREEN_DONE, SCREEN_LEVELS, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, remaining } from './engine.js';
import { disc, panel, poly, star } from './art.js';

const FONT = 'system-ui, "Segoe UI", Arial, sans-serif';

/** Paint one variant of a level's scene into a fresh 560 x 560 canvas. */
export function makeSceneCanvas(level, rightSide) {
  const c = document.createElement('canvas');
  c.width = SCENE;
  c.height = SCENE;
  const g = c.getContext('2d');
  const variant = rightSide ? new Set(level.differences.map((d) => d.id)) : new Set();
  level.paint(g, variant);
  return c;
}

const artworkCache = new Map();

/** The cached { left, right } canvases for a level, painted on first use. */
export function artworkFor(levelIndex) {
  if (!artworkCache.has(levelIndex)) {
    const level = LEVELS[levelIndex];
    artworkCache.set(levelIndex, { left: makeSceneCanvas(level, false), right: makeSceneCanvas(level, true) });
  }
  return artworkCache.get(levelIndex);
}

// ------------------------------------------------------------------ layout

/** Buttons of the current screen, shared by the renderer and the click handler. */
export function buttonsFor(state) {
  switch (state.screen) {
    case SCREEN_TITLE:
      return [
        { id: 'play', label: '▶  PLAY', x: 490, y: 664, w: 300, h: 60, primary: true },
        { id: 'levels', label: 'Choose level', x: 515, y: 734, w: 250, h: 40 },
      ];
    case SCREEN_LEVELS:
      return [{ id: 'title', label: '←  Back', x: 40, y: 24, w: 130, h: 46 }];
    case SCREEN_PLAY:
      return [
        { id: 'levels', label: '☰ Levels', x: 700, y: FOOTER_Y + 58, w: 150, h: 46 },
        { id: 'hint', label: `💡 Hint (${state.hintsLeft})`, x: 862, y: FOOTER_Y + 58, w: 180, h: 46, enabled: state.hintsLeft > 0 },
        { id: 'restart', label: '↻ Restart', x: 1054, y: FOOTER_Y + 58, w: 186, h: 46 },
      ];
    case SCREEN_WIN:
      return [
        { id: 'next', label: 'Next level ▶', x: 490, y: 548, w: 300, h: 56, primary: true },
        { id: 'replay', label: '↻ Replay', x: 360, y: 616, w: 180, h: 40 },
        { id: 'levels', label: 'Levels', x: 740, y: 616, w: 180, h: 40 },
      ];
    case SCREEN_OVER:
      return [
        { id: 'retry', label: '↻ Try again', x: 490, y: 500, w: 300, h: 56, primary: true },
        { id: 'levels', label: 'Levels', x: 540, y: 568, w: 200, h: 44 },
      ];
    case SCREEN_DONE:
      return [
        { id: 'levels', label: 'Levels', x: 440, y: 560, w: 190, h: 52, primary: true },
        { id: 'title', label: 'Title', x: 650, y: 560, w: 190, h: 52 },
      ];
    default:
      return [];
  }
}

/** The level-select cards: 3 across, 2 down. */
export function levelCardRects() {
  const rects = [];
  for (let i = 0; i < LEVELS.length; i += 1) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    rects.push({ index: i, x: 52 + col * 404, y: 120 + row * 300, w: 376, h: 272 });
  }
  return rects;
}

// ------------------------------------------------------------------ pieces

function text(ctx, str, x, y, size, colour, align = 'left', weight = 'bold') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = colour;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function drawButton(ctx, b, hover) {
  const enabled = b.enabled !== false;
  ctx.globalAlpha = enabled ? 1 : 0.45;
  panel(ctx, b.x, b.y, b.w, b.h, 14, b.primary ? ACCENT : (hover ? '#42557a' : '#37486b'), b.primary ? '#d63a46' : '#55688f');
  text(ctx, b.label, b.x + b.w / 2, b.y + b.h / 2 + 1, b.primary ? 26 : 20, '#ffffff', 'center');
  ctx.globalAlpha = 1;
}

/** A found-marker: a settling green ring with a white check, at scene coords on a panel. */
function drawMarker(ctx, px, py, d, age) {
  const pop = age < 0.35 ? 0.55 + (age / 0.35) * 0.45 : 1;
  const r = Math.max(15, d.r * 0.72) * pop;
  ctx.save();
  ctx.globalAlpha = 0.22;
  disc(ctx, px + d.x, py + d.y, r, '#2ee66b');
  ctx.restore();
  ctx.beginPath();
  ctx.arc(px + d.x, py + d.y, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#2ee66b';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(px + d.x, py + d.y, r - 4.5, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.4;
  ctx.stroke();
  const s = r / 26;
  ctx.beginPath();
  ctx.moveTo(px + d.x - 9 * s, py + d.y + 0.5);
  ctx.lineTo(px + d.x - 3 * s, py + d.y + 7 * s);
  ctx.lineTo(px + d.x + 10 * s, py + d.y - 7 * s);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4.6 * s;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.lineCap = 'butt';
}

/** A fading red cross where a wrong click landed. */
function drawMiss(ctx, px, py, miss) {
  const a = 1 - miss.age / 0.7;
  const s = 13;
  ctx.save();
  ctx.globalAlpha = Math.max(0, a);
  ctx.strokeStyle = '#ff4757';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(px + miss.x - s, py + miss.y - s);
  ctx.lineTo(px + miss.x + s, py + miss.y + s);
  ctx.moveTo(px + miss.x + s, py + miss.y - s);
  ctx.lineTo(px + miss.x - s, py + miss.y + s);
  ctx.stroke();
  ctx.restore();
  ctx.lineCap = 'butt';
}

/** The pulsing gold rings a hint lays over an unfound difference. */
function drawHintPulse(ctx, px, py, d, age) {
  const wave = (age % 0.8) / 0.8;
  for (const [rr, alpha] of [[d.r + 6 + wave * 16, 0.75 * (1 - wave)], [d.r + 2, 0.95]]) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(px + d.x, py + d.y, rr, 0, Math.PI * 2);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  }
}

/** One framed picture panel with its A/B chip. */
function drawPanel(ctx, img, x, label, shakeX) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  panel(ctx, x - 7 + shakeX, PANEL_Y - 7, SCENE + 14, SCENE + 14, 14, '#ffffff');
  ctx.restore();
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + shakeX, PANEL_Y, SCENE, SCENE);
  ctx.clip();
  ctx.drawImage(img, x + shakeX, PANEL_Y);
  ctx.restore();
  panel(ctx, x + 10 + shakeX, PANEL_Y + 10, 40, 40, 10, INK);
  text(ctx, label, x + 30 + shakeX, PANEL_Y + 31, 24, '#ffffff', 'center');
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ------------------------------------------------------------------ screens

function drawHeader(ctx, state) {
  const level = LEVELS[state.levelIndex];
  panel(ctx, 0, 0, LOGICAL_W, HEADER_H, 0, '#22304d');
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, HEADER_H - 4, LOGICAL_W, 4);
  text(ctx, `LEVEL ${state.levelIndex + 1} · ${level.title}`, 40, 36, 27, '#ffffff');
  // the tagline shares its row with the counter pill: trim it to fit the space left of the pill
  let tag = level.tagline;
  ctx.font = `normal 16.5px ${FONT}`;
  if (ctx.measureText(tag).width > 408) {
    while (tag.length > 4 && ctx.measureText(`${tag}…`).width > 408) tag = tag.slice(0, -1);
    tag = `${tag.trimEnd()}…`;
  }
  text(ctx, tag, 40, 68, 16.5, '#aebad2', 'left', 'normal');
  // the remaining counter, big in the middle
  const left = remaining(state).length;
  panel(ctx, 468, 16, 344, 60, 30, left === 0 ? MINT : GOLD, '#00000033');
  text(ctx, left === 0 ? 'ALL FOUND! 🎉' : `🔍  ${left} TO FIND`, 640, 47, 30, INK, 'center');
  // score and clock, right
  text(ctx, `SCORE ${state.score}`, 1240, 32, 24, '#ffffff', 'right');
  const frac = state.timeTotal > 0 ? state.timeLeft / state.timeTotal : 0;
  panel(ctx, 1010, 52, 230, 16, 8, '#141d31');
  if (frac > 0) panel(ctx, 1010, 52, Math.max(16, 230 * frac), 16, 8, state.timeLeft <= 20 ? ACCENT : MINT);
  text(ctx, `⏱ ${formatTime(state.timeLeft)}`, 960, 60, 22, state.timeLeft <= 20 ? ACCENT : '#ffffff', 'right');
}

function drawFooter(ctx, state) {
  const level = LEVELS[state.levelIndex];
  // progress dots, one per difference
  const total = level.differences.length;
  const startX = 640 - (total * 30 - 14) / 2;
  level.differences.forEach((d, i) => {
    const found = state.found.has(d.id);
    disc(ctx, startX + i * 30, FOOTER_Y + 26, 9, found ? '#2ee66b' : '#4a5a7d', found ? '#1d9e49' : '#63769c');
    if (found) {
      ctx.beginPath();
      ctx.moveTo(startX + i * 30 - 4.4, FOOTER_Y + 26);
      ctx.lineTo(startX + i * 30 - 1.4, FOOTER_Y + 29.4);
      ctx.lineTo(startX + i * 30 + 4.8, FOOTER_Y + 21.4);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.stroke();
    }
  });
  if (state.message && state.messageAge < 6) {
    ctx.save();
    ctx.globalAlpha = state.messageAge > 5 ? 6 - state.messageAge : 1;
    text(ctx, state.message, 40, FOOTER_Y + 84, 21, '#e8eefc', 'left', 'normal');
    ctx.restore();
  }
  text(ctx, `Mistakes: ${state.mistakes}   ·   💡 costs ${HINT_COST} pts`, 40, FOOTER_Y + 26, 17, '#8fa1c2', 'left', 'normal');
}

function drawPlay(ctx, state) {
  const art = artworkFor(state.levelIndex);
  const level = LEVELS[state.levelIndex];
  const shakeX = state.shake > 0 ? Math.sin(state.shake * 55) * 7 * state.shake : 0;
  drawHeader(ctx, state);
  drawPanel(ctx, art.left, PANEL_LEFT_X, 'A', shakeX);
  drawPanel(ctx, art.right, PANEL_RIGHT_X, 'B', shakeX);
  // a swap-arrows badge in the gap between the panels
  disc(ctx, 640, PANEL_Y + SCENE / 2, 25, GOLD, '#d9a406');
  text(ctx, '⇄', 640, PANEL_Y + SCENE / 2 + 2, 26, INK, 'center');
  for (const m of state.markers) {
    const d = level.differences.find((dd) => dd.id === m.id);
    if (!d) continue;
    drawMarker(ctx, PANEL_LEFT_X + shakeX, PANEL_Y, d, m.age);
    drawMarker(ctx, PANEL_RIGHT_X + shakeX, PANEL_Y, d, m.age);
  }
  if (state.hintId) {
    const d = level.differences.find((dd) => dd.id === state.hintId);
    if (d) {
      drawHintPulse(ctx, PANEL_LEFT_X + shakeX, PANEL_Y, d, state.hintAge);
      drawHintPulse(ctx, PANEL_RIGHT_X + shakeX, PANEL_Y, d, state.hintAge);
    }
  }
  for (const miss of state.misses) {
    drawMiss(ctx, PANEL_LEFT_X + shakeX, PANEL_Y, miss);
    drawMiss(ctx, PANEL_RIGHT_X + shakeX, PANEL_Y, miss);
  }
  drawFooter(ctx, state);
}

function drawTitle(ctx, state) {
  const g = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
  g.addColorStop(0, '#31456b');
  g.addColorStop(1, '#22304d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  text(ctx, 'DOUBLE', 640, 108, 92, '#ffffff', 'center', '900');
  text(ctx, 'TAKE!', 640, 196, 92, GOLD, 'center', '900');
  text(ctx, 'a spot-the-difference hunt', 640, 258, 26, SKY, 'center', 'normal');
  // a live demo pair: the first level, both variants, with two finds already marked
  const art = artworkFor(0);
  const level = LEVELS[0];
  const dw = 300;
  const dy = 306;
  for (const [img, x, label] of [[art.left, 100, 'A'], [art.right, 840, 'B']]) {
    panel(ctx, x - 5, dy - 5, dw + 10, dw + 10, 12, '#ffffff');
    ctx.drawImage(img, x, dy, dw, dw);
    panel(ctx, x + 8, dy + 8, 34, 34, 9, INK);
    text(ctx, label, x + 25, dy + 26, 21, '#ffffff', 'center');
  }
  const scale = dw / SCENE;
  for (const idx of [0, 2]) {
    const d = level.differences[idx];
    const fake = { ...d, x: d.x * scale, y: d.y * scale, r: d.r * scale + 8 };
    drawMarker(ctx, 100, dy, fake, 10);
    drawMarker(ctx, 840, dy, fake, 10);
  }
  panel(ctx, 508, dy + 112, 264, 52, 26, GOLD, '#00000033');
  text(ctx, `🔍 ${level.differences.length - 2} TO FIND`, 640, dy + 139, 24, INK, 'center');
  text(ctx, 'Two pictures. A handful of sneaky changes. Click a difference in either picture to mark it on both.', 640, 640, 19, '#c7d2e8', 'center', 'normal');
  if (state.totalScore > 0) text(ctx, `Total score so far: ${state.totalScore}`, 640, 790, 16, '#8fa1c2', 'center', 'normal');
}

function drawLevels(ctx, state) {
  panel(ctx, 0, 0, LOGICAL_W, HEADER_H, 0, '#22304d');
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, HEADER_H - 4, LOGICAL_W, 4);
  text(ctx, 'Choose a level', 200, 47, 30, '#ffffff');
  text(ctx, `Total score: ${state.totalScore}`, 1240, 47, 22, GOLD, 'right');
  for (const card of levelCardRects()) {
    const level = LEVELS[card.index];
    const locked = card.index >= state.unlocked;
    panel(ctx, card.x, card.y, card.w, card.h, 16, locked ? '#31405e' : '#f7f3e8', '#141d31');
    const art = artworkFor(card.index);
    ctx.save();
    ctx.beginPath();
    ctx.rect(card.x + 10, card.y + 10, card.w - 20, 168);
    ctx.clip();
    ctx.globalAlpha = locked ? 0.35 : 1;
    ctx.drawImage(art.left, 0, 120, SCENE, 260, card.x + 10, card.y + 10, card.w - 20, 168);
    ctx.restore();
    ctx.globalAlpha = 1;
    text(ctx, `${card.index + 1}. ${level.title}`, card.x + 18, card.y + 204, 23, locked ? '#8fa1c2' : INK);
    text(ctx, `${level.differences.length} differences · ${formatTime(level.timeLimit)}`, card.x + 18, card.y + 234, 16.5, locked ? '#71809c' : '#66738c', 'left', 'normal');
    if (locked) {
      text(ctx, '🔒', card.x + card.w - 42, card.y + 210, 30, '#ffffff', 'center');
      text(ctx, 'Finish the level before to unlock', card.x + card.w - 18, card.y + 258, 13.5, '#8fa1c2', 'right', 'normal');
    } else {
      for (let s = 0; s < 3; s += 1) {
        star(ctx, card.x + card.w - 96 + s * 36, card.y + 216, 15, 6.6, s < state.stars[card.index] ? GOLD : '#c3cadb', '#00000022');
      }
    }
  }
}

function drawOverlayPanel(ctx, w, h) {
  ctx.fillStyle = 'rgba(16,22,38,0.72)';
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  panel(ctx, (LOGICAL_W - w) / 2, (LOGICAL_H - h) / 2, w, h, 22, PAPER, '#141d31');
}

function drawStarsRow(ctx, cx, cy, earned, big = 44) {
  for (let s = 0; s < 3; s += 1) {
    star(ctx, cx + (s - 1) * (big * 1.5), cy, big * 0.62, big * 0.28, s < earned ? GOLD : '#d5dae6', '#00000022');
  }
}

function drawWin(ctx, state) {
  drawPlay(ctx, state);
  drawOverlayPanel(ctx, 620, 520);
  const level = LEVELS[state.levelIndex];
  const earned = state.stars[state.levelIndex];
  text(ctx, 'LEVEL COMPLETE!', 640, 218, 40, INK, 'center', '900');
  text(ctx, level.title, 640, 258, 20, '#66738c', 'center', 'normal');
  drawStarsRow(ctx, 640, 316, earned);
  const lines = [
    [`${level.differences.length} differences found`, `${level.differences.length * 100}`],
    ['Time bonus', `${state.finishedBonus}`],
    [`Mistakes: ${state.mistakes} · Hints used: ${state.hintsUsed}`, ''],
    ['Level score', `${state.score}`],
    ['Total score', `${state.totalScore}`],
  ];
  lines.forEach(([label, value], i) => {
    text(ctx, label, 400, 386 + i * 34, 20, INK, 'left', i >= 3 ? 'bold' : 'normal');
    text(ctx, value, 880, 386 + i * 34, 20, INK, 'right');
  });
}

function drawDone(ctx, state) {
  drawLevels(ctx, state);
  drawOverlayPanel(ctx, 640, 430);
  text(ctx, '🏆 YOU FOUND THEM ALL!', 640, 258, 36, INK, 'center', '900');
  text(ctx, 'Every level cleared. The pictures can rest… until the next hunt.', 640, 306, 19, '#66738c', 'center', 'normal');
  const totalStars = state.stars.reduce((a, b) => a + b, 0);
  drawStarsRow(ctx, 640, 372, Math.min(3, Math.round(totalStars / LEVELS.length)));
  text(ctx, `${totalStars} of ${LEVELS.length * 3} stars · Total score ${state.totalScore}`, 640, 436, 22, INK, 'center');
  text(ctx, 'Replay any level from the level select to chase the missing stars.', 640, 486, 16.5, '#66738c', 'center', 'normal');
}

function drawOver(ctx, state) {
  drawPlay(ctx, state);
  drawOverlayPanel(ctx, 560, 440);
  const level = LEVELS[state.levelIndex];
  text(ctx, "⏰ TIME'S UP!", 640, 268, 40, ACCENT, 'center', '900');
  text(ctx, `You found ${state.found.size} of ${level.differences.length} differences in ${level.title}.`, 640, 324, 20, INK, 'center', 'normal');
  text(ctx, 'The rest are still hiding — one more try?', 640, 360, 18, '#66738c', 'center', 'normal');
}

/** Draw the whole game for the current state. `hoverId` highlights a hovered button. */
export function render(ctx, state, hoverId = null) {
  ctx.fillStyle = '#2b3a55';
  ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
  switch (state.screen) {
    case SCREEN_TITLE:
      drawTitle(ctx, state);
      break;
    case SCREEN_LEVELS:
      drawLevels(ctx, state);
      break;
    case SCREEN_PLAY:
      drawPlay(ctx, state);
      break;
    case SCREEN_WIN:
      drawWin(ctx, state);
      break;
    case SCREEN_OVER:
      drawOver(ctx, state);
      break;
    case SCREEN_DONE:
      drawDone(ctx, state);
      break;
    default:
      drawTitle(ctx, state);
  }
  for (const b of buttonsFor(state)) drawButton(ctx, b, hoverId === b.id);
}
