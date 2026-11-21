// Layout, palette and scoring constants for Double Take, a spot-the-difference game.
// Everything is drawn on one canvas of LOGICAL_W x LOGICAL_H; the page scales it to fit.

export const LOGICAL_W = 1280;
export const LOGICAL_H = 800;

/** The two picture panels: square scenes of SCENE px, side by side under the header. */
export const SCENE = 560;
export const PANEL_Y = 108;
export const PANEL_LEFT_X = 40;
export const PANEL_RIGHT_X = 680;
export const PANEL_GAP_CENTRE = (PANEL_LEFT_X + SCENE + PANEL_RIGHT_X) / 2;

/** Header band height; the footer strip below the panels carries messages and dots. */
export const HEADER_H = 92;
export const FOOTER_Y = PANEL_Y + SCENE + 16;

/** Colours of the chrome around the pictures (the scenes bring their own palettes). */
export const INK = '#26324a';
export const PAPER = '#fdf6e3';
export const PAGE_BG = '#2b3a55';
export const ACCENT = '#ff5964';
export const GOLD = '#ffc53d';
export const MINT = '#35d0ba';
export const SKY = '#8ecae6';

/** Scoring: a find pays FIND_POINTS, a miss costs points and seconds, a hint costs points. */
export const FIND_POINTS = 100;
export const MISS_POINTS = 30;
export const MISS_SECONDS = 4;
export const HINT_COST = 60;
export const HINTS_PER_LEVEL = 3;
export const TIME_BONUS_PER_SECOND = 2;

/** Star awards on the win screen, from the level's mistakes and hints used. */
export function starsFor(mistakes, hintsUsed) {
  if (mistakes <= 1 && hintsUsed === 0) return 3;
  if (mistakes <= 3 && hintsUsed <= 1) return 2;
  return 1;
}
