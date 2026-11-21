// The still scenes behind ?shot=title|levels|play|win, used to take the entry's
// screenshots: each stages the real game state (a level under way with two finds
// already marked, a level-select with stars banked, a win screen) so the picture
// is exactly what a player would see, and the same query always stages the same frame.

import { SCREEN_LEVELS, finishLevel, startLevel } from './engine.js';
import { LEVELS } from './scenes.js';

/** Mark a difference as found with a settled (fully grown) marker, as if clicked a while ago. */
function stageFound(state, diff) {
  state.found.add(diff.id);
  state.markers.push({ id: diff.id, age: 10 });
}

/**
 * Put `state` into the named shot scene. `levelParam` (from ?level=) picks the level
 * for the play scene and defaults to the Rocket Yard. Unknown names stage the title.
 */
export function stageShot(state, name, levelParam) {
  if (name === 'levels') {
    state.stars[0] = 3;
    state.stars[1] = 2;
    state.unlocked = 3;
    state.totalScore = 1240;
    state.screen = SCREEN_LEVELS;
    return;
  }
  if (name === 'play') {
    const index = Math.max(0, Math.min(LEVELS.length - 1, (levelParam | 0) || 0));
    startLevel(state, index === 0 ? 2 : index);
    const diffs = LEVELS[state.levelIndex].differences;
    stageFound(state, diffs[0]);
    stageFound(state, diffs[2]);
    state.score = 235;
    state.mistakes = 1;
    state.timeLeft = Math.round(state.timeTotal * 0.62);
    state.message = `${diffs[2].label}! ${diffs.length - 2} to go.`;
    state.messageAge = 1;
    return;
  }
  if (name === 'win') {
    startLevel(state, 1);
    const level = LEVELS[1];
    for (const d of level.differences) stageFound(state, d);
    state.score = level.differences.length * 100;
    state.mistakes = 1;
    state.hintsUsed = 0;
    state.timeLeft = 47;
    finishLevel(state);
    return;
  }
  // 'title' and anything else: the title screen as created.
}
