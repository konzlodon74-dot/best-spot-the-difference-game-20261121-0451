// Tiny WebAudio bleeps, generated in code — no sound files, nothing to load.
// The context is created lazily on the first call (a user gesture in real play),
// and every call is a no-op when audio is unavailable, as in a headless browser.

let ctx = null;

function audioContext() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch {
    return null;
  }
  return ctx;
}

/** One soft sine tone with a quick envelope. */
function tone(freq, start, dur, type = 'sine', gain = 0.12) {
  const ac = audioContext();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  amp.gain.setValueAtTime(0, t0);
  amp.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Two rising notes when a difference is found. */
export function playFound() {
  tone(660, 0, 0.14, 'sine', 0.14);
  tone(990, 0.07, 0.2, 'sine', 0.12);
}

/** A low square buzz for a wrong click. */
export function playMiss() {
  tone(150, 0, 0.18, 'square', 0.06);
}

/** A short tick for buttons and hints. */
export function playClick() {
  tone(440, 0, 0.06, 'triangle', 0.08);
}

/** A little three-note arpeggio when a level is cleared. */
export function playWin() {
  tone(523, 0, 0.16, 'sine', 0.12);
  tone(659, 0.11, 0.16, 'sine', 0.12);
  tone(784, 0.22, 0.26, 'sine', 0.13);
}

/** A descending pair when time runs out. */
export function playOver() {
  tone(392, 0, 0.2, 'sine', 0.11);
  tone(262, 0.16, 0.34, 'sine', 0.11);
}
