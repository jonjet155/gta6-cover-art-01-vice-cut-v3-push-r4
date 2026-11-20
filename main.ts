// VICE CUT push round 4 — "One Photo, One Poster" (Node 22, standard library only).
// The app is this directory's app/ folder: plain static files a desktop browser
// loads offline (app/index.html and its scripts, local OFL fonts, CC0 sample
// photos, no library and no network request). The program hands it in: it copies
// app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun
// library. Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Fail fast with a clear error if the repository layout is wrong (for example
// the program ran from the wrong directory): the grader would otherwise hand
// in an empty app/ and fail the gate with no explanation.
if (!existsSync(join(here, 'app', 'index.html'))) {
  throw new Error(`VICE CUT: app/index.html not found beside main.ts (${here})`);
}
if (!existsSync(join(here, 'vendor', 'makefun-app.ts'))) {
  throw new Error(`VICE CUT: vendor/makefun-app.ts not found beside main.ts (${here})`);
}

// Start from a clean output directory: the grader runs this program twice and
// both runs must write the same bytes, so no stale file from an earlier run
// may survive into either output.
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps: only text_max_bytes shapes the bytes; the others refuse
// an entry the scorer would refuse (more than 4 screenshots or one over 256 KiB;
// more than 993 files in app/ or 48 MiB of app files, in all, or a path under
// app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
// screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
