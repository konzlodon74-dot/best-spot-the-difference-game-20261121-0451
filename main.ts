// Double Take — hand-in program for the make.fun spot-the-difference bounty.
//
// The game itself is the static site in game/ (open game/index.html in any desktop
// browser; it runs fully offline). This program packages an entry: it copies game/
// and screenshots/ into the output directory and writes dossier.json there with the
// vendored make.fun library, under the scorer's own caps.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Without MAKEFUN_OUTPUT_DIR the output directory is /output, as in the grader.
// Play the game locally with: node serve.ts  (then http://localhost:8080)

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The entry is only complete with its screenshots: they are the judge's first look
// at the game, and the first by name is the cover. Refuse to hand in without them.
const shotsDir = join(here, 'screenshots');
const shots = existsSync(shotsDir) ? readdirSync(shotsDir).filter((f) => /\.(png|jpe?g)$/i.test(f)) : [];
if (shots.length < 3) {
  console.error(`screenshots/ must hold 3 or 4 PNG/JPEG screenshots; found ${shots.length}.`);
  process.exit(1);
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
cpSync(shotsDir, join(out, 'screenshots'), { recursive: true });

// Caps from the competition gate: the dossier text budget shapes the bytes; the rest
// refuse anything the scorer would refuse (over 4 screenshots or one over 256 KiB,
// over 993 files or 48 MiB under game/, a game path over 1000 bytes).
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`Double Take handed in to ${out} (${shots.length} screenshots, dossier ${dossier.length} bytes).`);
