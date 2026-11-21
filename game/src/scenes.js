// The six picture pairs of Double Take. Each level paints the same scene twice: the left
// panel with an empty variant set, the right panel with every difference id switched on.
// A difference is a small, deliberate change keyed by its id inside the painter — an object
// missing, a colour swapped, a thing added, a pattern altered — so the declared difference
// list and the pixels can never drift apart. Painters are deterministic: no randomness, no
// clocks, the same op sequence in the same order for both panels except at a difference.

import { blob, circlePath, cloud, disc, ellipsePath, fill, panel, poly, ring, skyGradient, smiley, star, stroke, tri } from './art.js';

/** Deterministic pseudo-random generator (fixed seed) for star fields and the like. */
function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** A crab: oval body, two claws, six little legs, stalk eyes. */
function crab(ctx, x, y, s, colour) {
  ctx.lineWidth = 4 * s;
  ctx.strokeStyle = colour;
  for (const d of [-1, 1]) {
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + d * 16 * s, y + 6 * s);
      ctx.lineTo(x + d * (26 + i * 5) * s, y + (14 + i * 3) * s);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(x + d * 14 * s, y - 6 * s);
    ctx.lineTo(x + d * 26 * s, y - 18 * s);
    ctx.stroke();
    disc(ctx, x + d * 30 * s, y - 20 * s, 8 * s, colour);
  }
  blob(ctx, x, y, 24 * s, 15 * s, colour, '#00000022');
  disc(ctx, x - 8 * s, y - 16 * s, 3.4 * s, '#26324a');
  disc(ctx, x + 8 * s, y - 16 * s, 3.4 * s, '#26324a');
}

/** A five-petalled flower on a stem, for borders and gardens. */
function flower(ctx, x, y, s, petal) {
  ctx.lineWidth = 4 * s;
  ctx.strokeStyle = '#2f9e44';
  ctx.beginPath();
  ctx.moveTo(x, y + 26 * s);
  ctx.quadraticCurveTo(x + 3 * s, y + 10 * s, x, y);
  ctx.stroke();
  poly(ctx, [[x, y + 14 * s], [x - 12 * s, y + 8 * s], [x - 2 * s, y + 20 * s]], '#2f9e44');
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    disc(ctx, x + Math.cos(a) * 9 * s, y + Math.sin(a) * 9 * s, 6.4 * s, petal);
  }
  disc(ctx, x, y, 5.4 * s, '#ffd93b');
}

/** A plump fish facing left, with tail, fin and eye. */
function fish(ctx, x, y, s, colour) {
  tri(ctx, x + 16 * s, y, x + 30 * s, y - 10 * s, x + 30 * s, y + 10 * s, colour, '#00000022');
  blob(ctx, x, y, 20 * s, 11 * s, colour, '#00000022');
  tri(ctx, x - 2 * s, y - 8 * s, x + 6 * s, y - 16 * s, x + 10 * s, y - 6 * s, colour);
  disc(ctx, x - 10 * s, y - 2 * s, 2.6 * s, '#26324a');
}

/** A tuft of seaweed: three wavy blades from a base point. */
function seaweed(ctx, x, y, heights, colour) {
  ctx.lineWidth = 9;
  ctx.strokeStyle = colour;
  ctx.lineCap = 'round';
  heights.forEach((h, i) => {
    const bx = x + (i - 1) * 15;
    ctx.beginPath();
    ctx.moveTo(bx, y);
    ctx.quadraticCurveTo(bx + (i % 2 === 0 ? -12 : 12), y - h * 0.55, bx, y - h);
    ctx.stroke();
  });
  ctx.lineCap = 'butt';
}

// ---------------------------------------------------------------- Sunny Beach
function paintBeach(ctx, V) {
  skyGradient(ctx, '#6ec1f5', '#e8f9ff');
  // sun, top-left, with triangular rays and a face
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2;
    const x = 92 + Math.cos(a) * 58;
    const y = 88 + Math.sin(a) * 58;
    tri(ctx, x - 9, y - 9, x + 9, y - 9, x, y + (Math.sin(a) > 0 ? 12 : -12), '#ffcf3f');
  }
  disc(ctx, 92, 88, 40, V.has('sun-colour') ? '#ff9f43' : '#ffd93b', '#e8a100');
  smiley(ctx, 92, 90, 1, '#8a6d00');
  cloud(ctx, 305, 66, 1, '#ffffff');
  cloud(ctx, 462, 118, 0.7, '#ffffff');
  // a gull: two arcs
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#5b7a99';
  ctx.beginPath();
  ctx.arc(196, 148, 12, Math.PI * 1.15, Math.PI * 1.95);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(222, 148, 12, Math.PI * 1.05, Math.PI * 1.85);
  ctx.stroke();
  // sea and sand
  ctx.fillStyle = '#2ea8d8';
  ctx.fillRect(0, 258, 560, 140);
  ctx.fillStyle = '#7ed3f7';
  ctx.fillRect(0, 258, 560, 10);
  for (const [x, y, w] of [[60, 300, 52], [210, 330, 40], [420, 306, 58], [330, 356, 34]]) {
    ctx.fillStyle = '#bdeffc';
    ctx.fillRect(x, y, w, 6);
  }
  ctx.fillStyle = '#f7dc9a';
  ctx.fillRect(0, 398, 560, 162);
  ctx.fillStyle = '#efd188';
  ctx.fillRect(0, 398, 560, 8);
  // palm tree, right side
  ctx.lineWidth = 15;
  ctx.strokeStyle = '#a9743f';
  ctx.beginPath();
  ctx.moveTo(512, 470);
  ctx.quadraticCurveTo(492, 380, 470, 300);
  ctx.stroke();
  ctx.lineWidth = 9;
  ctx.strokeStyle = '#2f9e44';
  for (const [dx, dy] of [[-58, -18], [-30, -34], [8, -38], [44, -22], [58, 6]]) {
    ctx.beginPath();
    ctx.moveTo(470, 300);
    ctx.quadraticCurveTo(470 + dx * 0.6, 300 + dy - 12, 470 + dx, 300 + dy + 14);
    ctx.stroke();
  }
  disc(ctx, 458, 308, 10, '#7a4a21');
  disc(ctx, 480, 312, 9, '#7a4a21');
  // beach umbrella: pole, then a canopy of alternating segments
  ctx.fillStyle = '#c9ced6';
  ctx.fillRect(326, 300, 8, 132);
  const segCols = ['#ffffff', null, '#ffffff', null, '#ffffff', null];
  for (let i = 0; i < 6; i += 1) {
    const a0 = Math.PI + (i * Math.PI) / 6;
    const a1 = Math.PI + ((i + 1) * Math.PI) / 6;
    ctx.beginPath();
    ctx.moveTo(330, 302);
    ctx.arc(330, 302, 96, a0, a1);
    ctx.closePath();
    fill(ctx, segCols[i] === null ? (V.has('umbrella-colour') ? '#9b5de5' : '#ff5964') : '#ffffff');
  }
  ctx.beginPath();
  ctx.arc(330, 302, 96, Math.PI, Math.PI * 2);
  stroke(ctx, '#00000022', 3);
  disc(ctx, 330, 204, 7, '#ffd93b');
  // striped towel on the sand
  panel(ctx, 96, 468, 150, 52, 8, '#ffffff', '#00000022');
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = '#ff5964';
    ctx.fillRect(96, 478 + i * 15, 150, 7);
  }
  // beach ball (missing on the right)
  if (!V.has('ball-missing')) {
    circleClipBall(ctx, 150, 428);
  }
  // sandcastle with a flag (the flag is missing on the right)
  ctx.fillStyle = '#eec25e';
  ctx.fillRect(408, 452, 96, 52);
  ctx.fillRect(400, 428, 26, 76);
  ctx.fillRect(486, 428, 26, 76);
  ctx.fillStyle = '#d9a83f';
  ctx.fillRect(400, 418, 26, 12);
  ctx.fillRect(486, 418, 26, 12);
  ctx.fillRect(446, 470, 20, 34);
  if (!V.has('castle-flag')) {
    ctx.fillStyle = '#8a6d3b';
    ctx.fillRect(453, 362, 4, 58);
    tri(ctx, 457, 362, 457, 380, 483, 371, '#ff5964');
  }
  // bucket and spade
  poly(ctx, [[238, 448], [282, 448], [276, 486], [244, 486]], '#4dabf7', '#00000022');
  ctx.beginPath();
  ctx.arc(260, 448, 22, Math.PI, Math.PI * 2);
  stroke(ctx, '#3574b8', 4);
  ctx.fillStyle = '#ffd93b';
  ctx.fillRect(292, 470, 26, 6);
  tri(ctx, 318, 462, 318, 484, 300, 473, '#ffd93b');
  // starfish and shells
  star(ctx, 84, 506, 20, 9, '#ff9f43', '#d97a1e');
  disc(ctx, 356, 520, 8, '#ffb3c1');
  disc(ctx, 380, 528, 6, '#ffd6dd');
  crab(ctx, 62, 452, 0.9, '#ff7043');
  // the extra crab exists only on the right
  if (V.has('crab-added')) crab(ctx, 258, 512, 0.8, '#ff7043');
}

/** The beach ball: a white disc with three coloured wedges and a highlight. */
function circleClipBall(ctx, x, y) {
  disc(ctx, x, y, 22, '#ffffff', '#00000022');
  ctx.save();
  circlePath(ctx, x, y, 22);
  ctx.clip();
  poly(ctx, [[x, y], [x - 22, y - 14], [x - 6, y - 22]], '#ff5964');
  poly(ctx, [[x, y], [x + 22, y - 12], [x + 8, y - 22]], '#ffd93b');
  poly(ctx, [[x, y], [x + 4, y + 22], [x - 16, y + 18]], '#4dabf7');
  ctx.restore();
  disc(ctx, x - 7, y - 8, 5, '#ffffff');
}

// ---------------------------------------------------------------- Cozy Kitchen
function paintKitchen(ctx, V) {
  ctx.fillStyle = '#ffe8d6';
  ctx.fillRect(0, 0, 560, 440);
  ctx.fillStyle = '#c68b59';
  ctx.fillRect(0, 440, 560, 120);
  ctx.strokeStyle = '#a9743f';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 466 + i * 24);
    ctx.lineTo(560, 466 + i * 24);
    ctx.stroke();
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 428, 560, 12);
  // window with curtains (curtain colour differs)
  panel(ctx, 218, 52, 150, 168, 6, '#bdeffc', '#8a5a2b');
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(288, 52, 6, 168);
  ctx.fillRect(218, 132, 150, 6);
  disc(ctx, 258, 92, 15, '#ffd93b');
  cloud(ctx, 322, 96, 0.42, '#ffffff');
  const curtain = V.has('curtain-colour') ? '#ff8fab' : '#35d0ba';
  for (const cx of [226, 330]) {
    ctx.beginPath();
    ctx.moveTo(cx, 52);
    ctx.quadraticCurveTo(cx + 15, 120, cx + 4, 220);
    ctx.lineTo(cx + 30, 220);
    ctx.quadraticCurveTo(cx + 26, 120, cx + 30, 52);
    ctx.closePath();
    fill(ctx, curtain);
  }
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(210, 44, 166, 10);
  // wall clock (the hands tell a different time on the right)
  disc(ctx, 105, 105, 40, '#ffffff', '#8a5a2b');
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    disc(ctx, 105 + Math.cos(a) * 31, 105 + Math.sin(a) * 31, i % 3 === 0 ? 3 : 1.8, '#8a5a2b');
  }
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#26324a';
  ctx.beginPath();
  ctx.moveTo(105, 105);
  if (V.has('clock-hands')) ctx.lineTo(105, 128); else ctx.lineTo(126, 105);
  ctx.stroke();
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(105, 105);
  ctx.lineTo(105, 78);
  ctx.stroke();
  disc(ctx, 105, 105, 4, '#ff5964');
  // top cabinets, right
  panel(ctx, 398, 48, 132, 84, 6, '#f4a261', '#c97b3f');
  ctx.fillStyle = '#c97b3f';
  ctx.fillRect(461, 48, 5, 84);
  disc(ctx, 448, 92, 5, '#8a5a2b');
  disc(ctx, 480, 92, 5, '#8a5a2b');
  // rail with hanging pans, left
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(36, 176, 140, 6);
  for (const px of [62, 118]) {
    ctx.fillStyle = '#5b7a99';
    ctx.fillRect(px + 8, 182, 4, 14);
    disc(ctx, px + 10, 216, 20, '#748cab', '#4a6076');
    ctx.fillStyle = '#748cab';
    ctx.fillRect(px + 6, 190, 8, 10);
  }
  // counter across, with a stove and pot on the left stretch
  panel(ctx, 40, 300, 480, 26, 4, '#8a5a2b', '#6f4520');
  ctx.fillStyle = '#6f4520';
  ctx.fillRect(40, 326, 480, 102);
  for (const dx of [120, 300, 440]) {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(dx, 340, 60, 74);
    disc(ctx, dx + 30, 356, 4, '#ffd93b');
  }
  disc(ctx, 92, 292, 17, '#26324a');
  disc(ctx, 148, 292, 13, '#26324a');
  panel(ctx, 84, 236, 92, 52, 10, '#748cab', '#4a6076');
  ctx.fillStyle = '#4a6076';
  ctx.fillRect(76, 226, 108, 14);
  disc(ctx, 130, 233, 6, '#26324a');
  ctx.lineWidth = 3.4;
  ctx.strokeStyle = '#bdeffc';
  for (const sx of [108, 130, 152]) {
    ctx.beginPath();
    ctx.moveTo(sx, 214);
    ctx.quadraticCurveTo(sx - 6, 200, sx, 188);
    ctx.stroke();
  }
  // kettle on the counter (missing on the right)
  if (!V.has('kettle-missing')) {
    blob(ctx, 432, 278, 30, 24, '#e63946', '#9d2430');
    tri(ctx, 404, 272, 392, 258, 406, 258, '#e63946');
    ctx.beginPath();
    ctx.arc(432, 258, 15, Math.PI, Math.PI * 2);
    stroke(ctx, '#9d2430', 5);
    disc(ctx, 432, 252, 5, '#26324a');
  }
  // a mug that only exists on the right
  if (V.has('mug-added')) {
    panel(ctx, 316, 262, 28, 34, 5, '#ffd93b', '#d9a406');
    ctx.beginPath();
    ctx.arc(350, 279, 10, -Math.PI / 2, Math.PI / 2);
    stroke(ctx, '#d9a406', 5);
  }
  // plant on the counter, right end
  poly(ctx, [[486, 300], [514, 300], [508, 272], [492, 272]], '#e76f51', '#b34a2e');
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#2f9e44';
  for (const a of [-0.7, -0.2, 0.35]) {
    ctx.beginPath();
    ctx.moveTo(500, 274);
    ctx.quadraticCurveTo(500 + Math.sin(a) * 22, 250, 500 + Math.sin(a) * 34, 238 + Math.abs(a) * 12);
    ctx.stroke();
  }
  disc(ctx, 500, 240, 7, '#ff8fab', '#d95d82');
  // table with a fruit bowl (three apples on the left, two on the right)
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(118, 402, 220, 14);
  ctx.fillRect(132, 416, 12, 62);
  ctx.fillRect(312, 416, 12, 62);
  blob(ctx, 226, 388, 52, 16, '#4dabf7', '#3574b8');
  disc(ctx, 200, 372, 15, '#e63946', '#9d2430');
  disc(ctx, 228, 366, 15, '#ff9f43', '#d97a1e');
  if (!V.has('fruit-count')) disc(ctx, 252, 374, 15, '#2f9e44', '#1f7030');
  // rug and cat (the cat's tail curls up on the left, lies flat on the right)
  blob(ctx, 436, 486, 96, 30, '#ffb3c1', '#e58aa0');
  ctx.lineWidth = 11;
  ctx.strokeStyle = '#f4a261';
  ctx.beginPath();
  if (V.has('cat-tail')) {
    ctx.moveTo(478, 452);
    ctx.quadraticCurveTo(512, 470, 524, 452);
  } else {
    ctx.moveTo(478, 452);
    ctx.quadraticCurveTo(508, 424, 496, 398);
  }
  ctx.stroke();
  blob(ctx, 428, 452, 44, 26, '#f4a261', '#d98a45');
  disc(ctx, 392, 430, 21, '#f4a261', '#d98a45');
  tri(ctx, 376, 418, 382, 402, 392, 414, '#f4a261');
  tri(ctx, 398, 414, 408, 402, 412, 418, '#f4a261');
  disc(ctx, 385, 428, 3, '#26324a');
  disc(ctx, 399, 428, 3, '#26324a');
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = '#26324a';
  ctx.beginPath();
  ctx.arc(392, 436, 6, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
}

// ---------------------------------------------------------------- Rocket Yard
function paintRocket(ctx, V) {
  skyGradient(ctx, '#1d2b64', '#51427f');
  const rnd = lcg(20261121);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 52; i += 1) {
    const x = Math.floor(rnd() * 540) + 10;
    const y = Math.floor(rnd() * 380) + 8;
    const r = rnd() * 1.9 + 0.7;
    ctx.globalAlpha = 0.45 + rnd() * 0.55;
    disc(ctx, x, y, r, '#ffffff');
  }
  ctx.globalAlpha = 1;
  // a little three-star cluster (one star is missing on the right)
  star(ctx, 176, 58, 11, 4.6, '#ffe066', undefined, 4);
  star(ctx, 210, 86, 9, 3.8, '#ffe066', undefined, 4);
  if (!V.has('star-missing')) star(ctx, 148, 112, 9, 3.8, '#ffe066', undefined, 4);
  // crescent moon with a crater (the crater is gone on the right)
  disc(ctx, 88, 88, 37, '#f4f1de', '#d8d2b8');
  disc(ctx, 112, 74, 30, '#232c68');
  if (!V.has('moon-crater')) disc(ctx, 72, 104, 8, '#ddd6ba');
  disc(ctx, 92, 66, 5, '#ddd6ba');
  // satellite, top right (one solar panel is missing on the right)
  panel(ctx, 452, 82, 40, 26, 4, '#c9ced6', '#8f97a3');
  disc(ctx, 472, 95, 6, '#ffd93b');
  panel(ctx, 408, 86, 38, 18, 2, '#4dabf7', '#3574b8');
  if (!V.has('panel-missing')) panel(ctx, 498, 86, 38, 18, 2, '#4dabf7', '#3574b8');
  ctx.strokeStyle = '#8f97a3';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(472, 108);
  ctx.lineTo(458, 126);
  ctx.stroke();
  disc(ctx, 456, 129, 4, '#ff5964');
  // distant hills and the launch pad
  poly(ctx, [[0, 470], [90, 420], [190, 470]], '#2e2a55');
  poly(ctx, [[370, 470], [470, 414], [560, 470]], '#2e2a55');
  ctx.fillStyle = '#241f47';
  ctx.fillRect(0, 470, 560, 90);
  blob(ctx, 280, 492, 190, 26, '#3d3668');
  // the rocket: fins, body, a stripe band (its colour differs), window, nose
  tri(ctx, 232, 470, 232, 372, 196, 470, '#e63946', '#9d2430');
  tri(ctx, 328, 470, 328, 372, 364, 470, '#e63946', '#9d2430');
  panel(ctx, 238, 168, 84, 302, 40, '#f8f9fa', '#b9c0c9');
  poly(ctx, [[238, 178], [322, 178], [280, 84]], '#e63946', '#9d2430');
  ctx.fillStyle = V.has('rocket-stripe') ? '#35d0ba' : '#ff5964';
  ctx.fillRect(238, 284, 84, 30);
  disc(ctx, 280, 226, 21, '#8ecae6', '#5b7a99');
  disc(ctx, 273, 219, 6, '#e8f9ff');
  ctx.fillStyle = '#ffd93b';
  ctx.fillRect(238, 330, 84, 10);
  ctx.fillStyle = '#343a40';
  ctx.fillRect(262, 470, 36, 12);
  // flag on a pole (its emblem differs: a star on the left, a disc on the right)
  ctx.fillStyle = '#c9ced6';
  ctx.fillRect(402, 128, 5, 150);
  panel(ctx, 407, 128, 62, 40, 3, '#4dabf7', '#3574b8');
  if (V.has('flag-emblem')) disc(ctx, 438, 148, 10, '#ffd93b');
  else star(ctx, 438, 148, 12, 5, '#ffd93b');
  // control tower, right
  panel(ctx, 470, 330, 66, 140, 4, '#5b7a99', '#41597a');
  panel(ctx, 462, 306, 82, 30, 4, '#748cab', '#41597a');
  ctx.fillStyle = '#ffd93b';
  ctx.fillRect(472, 314, 14, 14);
  ctx.fillRect(494, 314, 14, 14);
  ctx.fillRect(516, 314, 12, 14);
  disc(ctx, 503, 296, 6, '#ff5964');
  // astronaut, left (the visor's tint differs)
  blob(ctx, 140, 448, 34, 12, '#00000033');
  panel(ctx, 112, 384, 56, 66, 16, '#f8f9fa', '#b9c0c9');
  panel(ctx, 96, 392, 18, 44, 8, '#e9ecef', '#b9c0c9');
  ctx.fillStyle = '#ff5964';
  ctx.fillRect(112, 404, 56, 10);
  disc(ctx, 140, 356, 30, '#f8f9fa', '#b9c0c9');
  blob(ctx, 140, 358, 22, 17, V.has('visor-colour') ? '#8ecae6' : '#ffd93b', '#8f97a3');
  disc(ctx, 133, 352, 5, '#ffffff');
  panel(ctx, 118, 448, 16, 26, 6, '#e9ecef', '#b9c0c9');
  panel(ctx, 148, 448, 16, 26, 6, '#e9ecef', '#b9c0c9');
  // crates and an alien sprout
  panel(ctx, 44, 428, 40, 40, 3, '#8a5a2b', '#6f4520');
  panel(ctx, 66, 402, 34, 34, 3, '#a9743f', '#6f4520');
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#7bd88f';
  for (const a of [-0.6, 0, 0.6]) {
    ctx.beginPath();
    ctx.moveTo(516, 500);
    ctx.quadraticCurveTo(516 + Math.sin(a) * 16, 478, 516 + Math.sin(a) * 26, 462);
    ctx.stroke();
    disc(ctx, 516 + Math.sin(a) * 26, 460, 6, '#c77dff');
  }
}

// ---------------------------------------------------------------- Garden Party
function paintGarden(ctx, V) {
  skyGradient(ctx, '#8ecae6', '#eafcff');
  disc(ctx, 486, 74, 34, '#ffd93b', '#e8a100');
  smiley(ctx, 486, 76, 0.9, '#8a6d00');
  cloud(ctx, 130, 62, 0.9, '#ffffff');
  cloud(ctx, 320, 108, 0.6, '#ffffff');
  // lawn and a flowerbed strip at the front
  ctx.fillStyle = '#69b764';
  ctx.fillRect(0, 300, 560, 260);
  ctx.fillStyle = '#57a653';
  ctx.fillRect(0, 300, 560, 12);
  // fence behind the lawn
  ctx.fillStyle = '#e9d8a6';
  ctx.fillRect(0, 262, 560, 12);
  for (let x = 8; x < 560; x += 42) {
    poly(ctx, [[x, 300], [x, 238], [x + 13, 226], [x + 26, 238], [x + 26, 300]], '#f4e9c8', '#d9c48d');
  }
  ctx.fillStyle = '#e9d8a6';
  ctx.fillRect(0, 282, 560, 9);
  // bunting strung across the top: a sagging string with flags (one flag differs)
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#8a5a2b';
  ctx.beginPath();
  ctx.moveTo(16, 34);
  ctx.quadraticCurveTo(280, 108, 544, 28);
  ctx.stroke();
  const flagCols = ['#ff5964', '#ffd93b', '#4dabf7', '#35d0ba', '#ff9f43', '#9b5de5', '#ff5964'];
  for (let i = 0; i < 7; i += 1) {
    const t = 0.08 + i * 0.14;
    const x = (1 - t) * (1 - t) * 16 + 2 * (1 - t) * t * 280 + t * t * 544;
    const y = (1 - t) * (1 - t) * 34 + 2 * (1 - t) * t * 108 + t * t * 28;
    const col = i === 2 && V.has('bunting-colour') ? '#ffd93b' : flagCols[i];
    tri(ctx, x - 15, y, x + 15, y - 3, x, y + 34, i === 2 && !V.has('bunting-colour') ? '#ff5964' : col, '#00000022');
  }
  // apple tree, left (one apple is missing on the right)
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(94, 220, 20, 96);
  disc(ctx, 104, 168, 62, '#2f9e44');
  disc(ctx, 58, 196, 40, '#37b24d');
  disc(ctx, 150, 196, 40, '#37b24d');
  disc(ctx, 84, 128, 34, '#37b24d');
  disc(ctx, 128, 130, 30, '#2f9e44');
  for (const [ax, ay] of [[76, 160], [118, 186], [140, 150], [96, 208], [60, 196]]) {
    disc(ctx, ax, ay, 9, '#e63946', '#9d2430');
  }
  if (!V.has('apple-missing')) disc(ctx, 152, 118, 9, '#e63946', '#9d2430');
  // birdhouse on a pole (its doorway is painted over on the right)
  ctx.fillStyle = '#8a5a2b';
  ctx.fillRect(474, 316, 8, 74);
  panel(ctx, 446, 246, 64, 58, 4, '#4dabf7', '#3574b8');
  tri(ctx, 438, 248, 518, 248, 478, 214, '#e63946', '#9d2430');
  if (V.has('birdhouse-door')) disc(ctx, 478, 278, 11, '#4dabf7');
  else disc(ctx, 478, 278, 11, '#26324a');
  disc(ctx, 478, 296, 3.4, '#8a5a2b');
  // picnic blanket (its colour differs) with plates and a jug
  poly(ctx, [[238, 402], [428, 402], [452, 492], [214, 492]], V.has('blanket-colour') ? '#4dabf7' : '#ff5964', '#00000022');
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 4; i += 1) ctx.fillRect(238 + i * 4, 402 + i * 22, 214 - i * 8, 6);
  ctx.globalAlpha = 1;
  disc(ctx, 282, 428, 17, '#ffffff', '#c9ced6');
  disc(ctx, 380, 430, 17, '#ffffff', '#c9ced6');
  tri(ctx, 268, 424, 282, 414, 292, 428, '#ffd93b');
  tri(ctx, 368, 428, 384, 416, 392, 430, '#ffd93b');
  panel(ctx, 318, 436, 26, 34, 6, '#ffe066', '#d9a406');
  ctx.fillStyle = '#d9a406';
  ctx.fillRect(326, 428, 10, 10);
  // watering can, left of the blanket
  blob(ctx, 120, 452, 34, 22, '#35d0ba', '#23a08d');
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#23a08d';
  ctx.beginPath();
  ctx.moveTo(88, 444);
  ctx.lineTo(62, 428);
  ctx.stroke();
  disc(ctx, 58, 426, 9, '#23a08d');
  ctx.beginPath();
  ctx.arc(138, 436, 14, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // a butterfly that only exists on the right
  if (V.has('butterfly-added')) {
    blob(ctx, 420, 228, 13, 9, '#c77dff', '#9b5de5');
    blob(ctx, 442, 228, 13, 9, '#c77dff', '#9b5de5');
    blob(ctx, 431, 240, 5, 12, '#26324a');
    disc(ctx, 431, 226, 4.4, '#26324a');
  }
  // flower row along the front (the middle flower's colour differs)
  const petalCols = ['#ff8fab', '#c77dff', '#ff8fab', '#ffd93b', '#ff8fab', '#c77dff', '#ff8fab', '#ffd93b', '#c77dff', '#ff8fab', '#c77dff'];
  for (let i = 0; i < 11; i += 1) {
    const x = 34 + i * 50;
    const col = i === 3 ? (V.has('flower-colour') ? '#ffffff' : '#ffd93b') : petalCols[i];
    flower(ctx, x, 512, 0.9, col);
  }
}

// ---------------------------------------------------------------- City Street
function paintCity(ctx, V) {
  skyGradient(ctx, '#a8d8f0', '#f2fbff');
  disc(ctx, 70, 64, 30, '#ffd93b', '#e8a100');
  cloud(ctx, 330, 58, 0.8, '#ffffff');
  // a small cloud that is missing on the right
  if (!V.has('cloud-missing')) cloud(ctx, 178, 118, 0.55, '#ffffff');
  // buildings: left tower, mid block with the shop, right tower
  panel(ctx, 28, 128, 142, 342, 4, '#f4a261', '#c97b3f');
  panel(ctx, 192, 196, 176, 274, 4, '#e9c46a', '#c2a154');
  panel(ctx, 388, 96, 148, 374, 4, '#8ecae6', '#5b93b8');
  for (const [bx, by, bw, cols, rows] of [[44, 148, 24, 4, 6], [404, 116, 24, 4, 8], [208, 216, 24, 5, 4]]) {
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const wx = bx + c * 30;
        const wy = by + r * 38;
        if (bx === 44 && r === 0 && c === 1) continue; // the special window, drawn below
        ctx.fillStyle = (r * 7 + c * 3 + (bx === 404 ? 1 : 0)) % 4 === 0 ? '#ffe9a8' : '#5b7a99';
        ctx.fillRect(wx, wy, bw, 24);
      }
    }
  }
  // one window of the left tower: lit on the left, dark on the right
  ctx.fillStyle = V.has('window-lit') ? '#5b7a99' : '#ffd93b';
  ctx.fillRect(74, 148, 24, 24);
  ctx.strokeStyle = '#c97b3f';
  ctx.lineWidth = 2;
  ctx.strokeRect(74, 148, 24, 24);
  // shop awning in the mid block (its colour differs) and a door
  const awningColour = V.has('awning-colour') ? '#35d0ba' : '#ff5964';
  for (let i = 0; i < 6; i += 1) {
    poly(ctx, [[204 + i * 25, 330], [229 + i * 25, 330], [234 + i * 25, 352], [199 + i * 25, 352]], i % 2 === 0 ? awningColour : '#ffffff');
  }
  panel(ctx, 250, 366, 52, 104, 4, '#8a5a2b', '#6f4520');
  disc(ctx, 292, 420, 4, '#ffd93b');
  panel(ctx, 316, 372, 40, 62, 3, '#bdeffc', '#8a5a2b');
  // road and pavement
  ctx.fillStyle = '#9aa5b1';
  ctx.fillRect(0, 470, 560, 90);
  ctx.fillStyle = '#c9ced6';
  ctx.fillRect(0, 470, 560, 12);
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(28 + i * 112, 522, 62, 12);
  }
  // a car on the road (its colour differs)
  panel(ctx, 246, 452, 168, 40, 12, V.has('car-colour') ? '#ffd93b' : '#4dabf7', '#00000022');
  panel(ctx, 282, 424, 96, 34, 12, V.has('car-colour') ? '#ffd93b' : '#4dabf7', '#00000022');
  panel(ctx, 296, 430, 30, 22, 5, '#bdeffc');
  panel(ctx, 334, 430, 30, 22, 5, '#bdeffc');
  disc(ctx, 282, 494, 17, '#343a40', '#14171a');
  disc(ctx, 378, 494, 17, '#343a40', '#14171a');
  disc(ctx, 282, 494, 7, '#c9ced6');
  disc(ctx, 378, 494, 7, '#c9ced6');
  disc(ctx, 410, 466, 5, '#ffe066');
  // street lamp, left
  ctx.fillStyle = '#41597a';
  ctx.fillRect(36, 300, 7, 172);
  ctx.fillRect(36, 300, 34, 7);
  disc(ctx, 74, 310, 9, '#ffe066', '#d9a406');
  // traffic light, right (a different lamp glows)
  ctx.fillStyle = '#41597a';
  ctx.fillRect(492, 268, 7, 202);
  panel(ctx, 478, 176, 36, 96, 8, '#343a40', '#14171a');
  disc(ctx, 496, 198, 11, V.has('traffic-light') ? '#ff5964' : '#7a2e35');
  disc(ctx, 496, 224, 11, '#8a6d3b');
  disc(ctx, 496, 250, 11, V.has('traffic-light') ? '#1f7030' : '#35d06a');
  // mailbox with a flag (up on the left, down on the right)
  panel(ctx, 470, 402, 56, 42, 6, '#e63946', '#9d2430');
  ctx.fillStyle = '#9d2430';
  ctx.fillRect(492, 444, 10, 28);
  if (V.has('mailbox-flag')) {
    ctx.fillStyle = '#ffd93b';
    ctx.fillRect(520, 424, 8, 22);
    ctx.fillRect(520, 424, 18, 9);
  } else {
    ctx.fillStyle = '#ffd93b';
    ctx.fillRect(520, 380, 8, 24);
    ctx.fillRect(520, 380, 18, 9);
  }
  // a cat sitting by the shop door
  blob(ctx, 226, 452, 16, 11, '#5b7a99', '#41597a');
  disc(ctx, 214, 440, 10, '#5b7a99', '#41597a');
  tri(ctx, 206, 434, 209, 424, 215, 432, '#5b7a99');
  tri(ctx, 217, 432, 223, 424, 225, 434, '#5b7a99');
  disc(ctx, 211, 439, 1.8, '#14171a');
  disc(ctx, 218, 439, 1.8, '#14171a');
}

// ---------------------------------------------------------------- Underwater Reef
function paintReef(ctx, V) {
  skyGradient(ctx, '#1b7fc1', '#0a4d8c');
  // shafts of light from the surface
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = '#ffffff';
  poly(ctx, [[70, 0], [130, 0], [190, 560], [110, 560]]);
  poly(ctx, [[250, 0], [300, 0], [390, 560], [320, 560]]);
  poly(ctx, [[430, 0], [470, 0], [520, 560], [470, 560]]);
  ctx.globalAlpha = 1;
  // sandy floor with pebbles
  ctx.fillStyle = '#d9c98f';
  ctx.fillRect(0, 492, 560, 68);
  ctx.fillStyle = '#c9b678';
  for (const [x, y, r] of [[60, 522, 7], [180, 536, 5], [330, 524, 8], [470, 538, 5], [520, 518, 6]]) disc(ctx, x, y, r, '#c9b678');
  // the turtle (its shell spots change colour on the right)
  blob(ctx, 152, 176, 58, 40, '#43aa8b', '#2c6e57');
  for (const [sx, sy, sr] of [[128, 162, 12], [162, 158, 10], [146, 188, 11], [176, 182, 8]]) {
    disc(ctx, sx, sy, sr, V.has('turtle-shell') ? '#ffd93b' : '#2f7d5f');
  }
  disc(ctx, 216, 168, 17, '#43aa8b', '#2c6e57');
  disc(ctx, 221, 164, 3, '#0b2a3c');
  blob(ctx, 116, 138, 20, 9, '#43aa8b', '#2c6e57');
  blob(ctx, 120, 216, 20, 9, '#43aa8b', '#2c6e57');
  // a school of fish (one fish is missing on the right)
  fish(ctx, 330, 108, 1, '#ffd93b');
  fish(ctx, 428, 118, 0.9, '#ff9f43');
  if (!V.has('fish-missing')) fish(ctx, 384, 148, 1.05, '#ff8fab');
  fish(ctx, 470, 168, 0.85, '#ffd93b');
  fish(ctx, 322, 168, 0.8, '#4dabf7');
  // coral garden, left bottom: pink branches and orange tubes
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#ff8fab';
  ctx.lineCap = 'round';
  for (const [bx, h, lean] of [[52, 74, -14], [78, 96, 6], [104, 66, 16]]) {
    ctx.beginPath();
    ctx.moveTo(bx, 500);
    ctx.quadraticCurveTo(bx + lean * 0.4, 500 - h * 0.6, bx + lean, 500 - h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + lean * 0.5, 500 - h * 0.55);
    ctx.lineTo(bx + lean * 0.5 + 16, 500 - h * 0.55 - 18);
    ctx.stroke();
  }
  for (let i = 0; i < 4; i += 1) {
    panel(ctx, 128 + i * 17, 452 - (i % 2) * 14, 13, 48 + (i % 2) * 14, 5, '#ff9f43', '#d97a1e');
  }
  ctx.lineCap = 'butt';
  // treasure chest (open with gold on the left, shut on the right)
  panel(ctx, 246, 452, 108, 52, 6, '#8a5a2b', '#6f4520');
  ctx.fillStyle = '#ffd93b';
  ctx.fillRect(292, 452, 16, 52);
  if (V.has('chest-lid')) {
    panel(ctx, 246, 428, 108, 28, 8, '#a9743f', '#6f4520');
    ctx.fillStyle = '#ffd93b';
    ctx.fillRect(292, 428, 16, 28);
  } else {
    poly(ctx, [[246, 452], [232, 402], [262, 392], [278, 442]], '#a9743f', '#6f4520');
    disc(ctx, 282, 436, 13, '#ffd93b');
    disc(ctx, 306, 428, 11, '#ffd93b');
    disc(ctx, 262, 444, 10, '#ffe066');
    disc(ctx, 330, 442, 9, '#ffd93b');
  }
  disc(ctx, 300, 470, 8, '#ffd93b', '#d9a406');
  // a starfish on the sand (its colour differs)
  star(ctx, 208, 500, 21, 10, V.has('starfish-colour') ? '#ff5964' : '#ff9f43', '#00000022');
  // the octopus (its spots are missing on the right)
  ctx.lineWidth = 13;
  ctx.strokeStyle = '#9b5de5';
  ctx.lineCap = 'round';
  for (const dx of [-38, -14, 12, 36]) {
    ctx.beginPath();
    ctx.moveTo(470 + dx, 396);
    ctx.quadraticCurveTo(470 + dx * 1.25, 424, 470 + dx * 1.45, 410 + Math.abs(dx) / 3);
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
  blob(ctx, 470, 356, 46, 42, '#9b5de5', '#7439b8');
  if (!V.has('octopus-spots')) {
    disc(ctx, 452, 340, 7, '#e0c3fc');
    disc(ctx, 486, 330, 6, '#e0c3fc');
    disc(ctx, 470, 366, 5.4, '#e0c3fc');
  }
  disc(ctx, 456, 356, 5, '#1d1033');
  disc(ctx, 484, 356, 5, '#1d1033');
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1d1033';
  ctx.beginPath();
  ctx.arc(470, 366, 9, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();
  // rising bubbles near the chest, and an extra cluster that only exists on the right
  for (const [bx, by, br] of [[356, 396, 6], [368, 368, 4.6], [352, 342, 3.6], [364, 316, 2.8]]) ring(ctx, bx, by, br, '#bdeffc', 2);
  if (V.has('bubbles-added')) {
    for (const [bx, by, br] of [[84, 330, 7], [98, 304, 5.4], [80, 282, 4.2], [94, 258, 3.2]]) ring(ctx, bx, by, br, '#bdeffc', 2);
  }
  // seaweed beds (the right-hand tuft is shorter on the right)
  seaweed(ctx, 36, 500, [70, 96, 58], '#2f9e44');
  seaweed(ctx, 404, 504, [54, 78, 44], '#37b24d');
  seaweed(ctx, 528, 504, V.has('seaweed-height') ? [40, 56, 34] : [96, 122, 84], '#2f9e44');
  // an old anchor half-buried, front right
  ctx.lineWidth = 9;
  ctx.strokeStyle = '#748cab';
  ctx.beginPath();
  ctx.moveTo(452, 470);
  ctx.lineTo(452, 528);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(452, 516, 24, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  disc(ctx, 452, 464, 8, '#748cab');
  ctx.fillStyle = '#748cab';
  ctx.fillRect(428, 486, 48, 8);
}

/** The level list, in play order: painter, declared differences, time budget.
 *  Each difference carries its click circle (x, y, r) and, where the painted change
 *  sprawls wider than the circle, a `region` bounding box the change stays inside —
 *  the verification harness checks the pixels against exactly these boxes. */
export const LEVELS = [
  {
    id: 'beach', title: 'Sunny Beach', tagline: 'Umbrellas, castles and one very sneaky crab.', timeLimit: 120,
    paint: paintBeach,
    differences: [
      { id: 'sun-colour', x: 92, y: 88, r: 44, label: 'The sun changed colour' },
      { id: 'umbrella-colour', x: 330, y: 262, r: 40, region: [232, 202, 428, 306], label: 'The umbrella changed colour' },
      { id: 'ball-missing', x: 150, y: 428, r: 28, label: 'The beach ball vanished' },
      { id: 'castle-flag', x: 462, y: 372, r: 26, region: [448, 356, 488, 426], label: 'The castle lost its flag' },
      { id: 'crab-added', x: 258, y: 508, r: 28, region: [224, 484, 292, 536], label: 'A second crab showed up' },
    ],
  },
  {
    id: 'kitchen', title: 'Cozy Kitchen', tagline: 'Something in this kitchen is not where it should be.', timeLimit: 135,
    paint: paintKitchen,
    differences: [
      { id: 'clock-hands', x: 105, y: 105, r: 42, label: 'The clock tells another time' },
      { id: 'curtain-colour', x: 243, y: 128, r: 30, region: [220, 46, 366, 226], label: 'The curtains changed colour' },
      { id: 'kettle-missing', x: 432, y: 272, r: 32, region: [384, 234, 466, 306], label: 'The kettle vanished' },
      { id: 'mug-added', x: 334, y: 280, r: 24, region: [310, 256, 366, 304], label: 'A mug appeared on the counter' },
      { id: 'fruit-count', x: 250, y: 370, r: 26, region: [222, 342, 290, 398], label: 'One apple is missing' },
      { id: 'cat-tail', x: 500, y: 428, r: 30, region: [468, 390, 532, 472], label: "The cat's tail moved" },
    ],
  },
  {
    id: 'rocket', title: 'Rocket Yard', tagline: 'Countdown paused: the launch pad has been tampered with.', timeLimit: 150,
    paint: paintRocket,
    differences: [
      { id: 'moon-crater', x: 74, y: 102, r: 20, label: 'A moon crater vanished' },
      { id: 'star-missing', x: 148, y: 112, r: 20, label: 'One star went out' },
      { id: 'rocket-stripe', x: 280, y: 299, r: 32, region: [236, 282, 324, 316], label: "The rocket's stripe changed colour" },
      { id: 'flag-emblem', x: 438, y: 148, r: 24, label: 'The flag emblem changed' },
      { id: 'panel-missing', x: 517, y: 95, r: 26, region: [494, 82, 540, 108], label: 'The satellite lost a panel' },
      { id: 'visor-colour', x: 140, y: 357, r: 28, region: [106, 323, 174, 390], label: "The astronaut's visor changed tint" },
    ],
  },
  {
    id: 'garden', title: 'Garden Party', tagline: 'The picnic is set, but the garden is playing tricks.', timeLimit: 150,
    paint: paintGarden,
    differences: [
      { id: 'bunting-colour', x: 206, y: 82, r: 24, region: [186, 58, 226, 106], label: 'One bunting flag changed colour' },
      { id: 'apple-missing', x: 152, y: 118, r: 20, label: 'An apple fell off the tree' },
      { id: 'birdhouse-door', x: 478, y: 278, r: 20, label: 'The birdhouse door was painted over' },
      { id: 'blanket-colour', x: 330, y: 446, r: 36, region: [212, 400, 454, 494], label: 'The picnic blanket changed colour' },
      { id: 'flower-colour', x: 184, y: 510, r: 22, label: 'One flower changed colour' },
      { id: 'butterfly-added', x: 431, y: 233, r: 26, label: 'A butterfly arrived' },
    ],
  },
  {
    id: 'city', title: 'City Street', tagline: 'Rush hour: the street keeps changing when you blink.', timeLimit: 165,
    paint: paintCity,
    differences: [
      { id: 'cloud-missing', x: 178, y: 112, r: 32, region: [126, 94, 230, 140], label: 'A cloud drifted away' },
      { id: 'window-lit', x: 86, y: 160, r: 20, label: 'A window light went out' },
      { id: 'awning-colour', x: 279, y: 341, r: 30, region: [197, 328, 361, 354], label: 'The shop awning changed colour' },
      { id: 'traffic-light', x: 496, y: 224, r: 30, region: [482, 184, 510, 264], label: 'The traffic light changed' },
      { id: 'car-colour', x: 330, y: 458, r: 36, region: [242, 420, 418, 506], label: 'The car changed colour' },
      { id: 'mailbox-flag', x: 529, y: 413, r: 24, region: [514, 374, 544, 452], label: 'The mailbox flag flipped' },
    ],
  },
  {
    id: 'reef', title: 'Underwater Reef', tagline: 'Seven little secrets hide among the coral.', timeLimit: 180,
    paint: paintReef,
    differences: [
      { id: 'turtle-shell', x: 150, y: 172, r: 38, region: [110, 142, 192, 204], label: "The turtle's shell spots changed colour" },
      { id: 'fish-missing', x: 384, y: 148, r: 24, region: [358, 122, 418, 174], label: 'One fish left the school' },
      { id: 'octopus-spots', x: 468, y: 346, r: 32, label: 'The octopus lost its spots' },
      { id: 'chest-lid', x: 292, y: 424, r: 40, region: [226, 386, 362, 460], label: 'The treasure chest was shut' },
      { id: 'bubbles-added', x: 88, y: 296, r: 26, region: [70, 248, 108, 342], label: 'A new stream of bubbles appeared' },
      { id: 'starfish-colour', x: 208, y: 500, r: 22, label: 'The starfish changed colour' },
      { id: 'seaweed-height', x: 526, y: 428, r: 34, region: [496, 368, 558, 508], label: 'The tall seaweed was trimmed' },
    ],
  },
];
