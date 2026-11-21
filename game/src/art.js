// Small canvas drawing helpers shared by every scene painter in scenes.js.
// Scenes are flat vector pictures: filled shapes with a soft dark outline, drawn in a
// 560 x 560 box whose top-left corner is the context origin when the painter runs.

/** Set the fill colour and fill the current path. */
export function fill(ctx, colour) {
  ctx.fillStyle = colour;
  ctx.fill();
}

/** Set the stroke colour/width and stroke the current path. */
export function stroke(ctx, colour, width) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.stroke();
}

/** Path of a circle. */
export function circlePath(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

/** A filled circle with an optional outline. */
export function disc(ctx, x, y, r, colour, outline) {
  circlePath(ctx, x, y, r);
  fill(ctx, colour);
  if (outline) stroke(ctx, outline, 3);
}

/** Path of an ellipse. */
export function ellipsePath(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

/** A filled ellipse with an optional outline. */
export function blob(ctx, x, y, rx, ry, colour, outline) {
  ellipsePath(ctx, x, y, rx, ry);
  fill(ctx, colour);
  if (outline) stroke(ctx, outline, 3);
}

/** Path of a rounded rectangle. */
export function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** A filled rounded rectangle with an optional outline. */
export function panel(ctx, x, y, w, h, r, colour, outline) {
  roundRectPath(ctx, x, y, w, h, r);
  fill(ctx, colour);
  if (outline) stroke(ctx, outline, 3);
}

/** Path of a polygon through the given [x, y] points. */
export function polyPath(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
}

/** A filled polygon with an optional outline. */
export function poly(ctx, points, colour, outline) {
  polyPath(ctx, points);
  fill(ctx, colour);
  if (outline) stroke(ctx, outline, 3);
}

/** A filled triangle. */
export function tri(ctx, x1, y1, x2, y2, x3, y3, colour, outline) {
  poly(ctx, [[x1, y1], [x2, y2], [x3, y3]], colour, outline);
}

/** Path of a five-pointed star centred at (x, y). */
export function starPath(ctx, x, y, rOuter, rInner, points = 5, rot = -Math.PI / 2) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = rot + (i * Math.PI) / points;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** A filled star. */
export function star(ctx, x, y, rOuter, rInner, colour, outline, points = 5) {
  starPath(ctx, x, y, rOuter, rInner, points);
  fill(ctx, colour);
  if (outline) stroke(ctx, outline, 3);
}

/** A puffy cloud: three overlapping discs on a flat base, no outline. */
export function cloud(ctx, x, y, s, colour) {
  disc(ctx, x, y, 26 * s, colour);
  disc(ctx, x + 30 * s, y + 4 * s, 20 * s, colour);
  disc(ctx, x - 30 * s, y + 5 * s, 19 * s, colour);
  ctx.fillStyle = colour;
  ctx.fillRect(x - 44 * s, y + 2 * s, 92 * s, 16 * s);
}

/** A simple smiling face: two eyes and an arc mouth, in the given ink colour. */
export function smiley(ctx, x, y, s, ink) {
  disc(ctx, x - 11 * s, y - 4 * s, 3.4 * s, ink);
  disc(ctx, x + 11 * s, y - 4 * s, 3.4 * s, ink);
  ctx.beginPath();
  ctx.arc(x, y + 4 * s, 10 * s, 0.15 * Math.PI, 0.85 * Math.PI);
  stroke(ctx, ink, 3 * s);
}

/** Vertical linear gradient fill of the whole 560 scene box. */
export function skyGradient(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, 560);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 560, 560);
}

/** A ring (stroked circle) used for decorative bubbles and portholes. */
export function ring(ctx, x, y, r, colour, width) {
  circlePath(ctx, x, y, r);
  stroke(ctx, colour, width);
}
