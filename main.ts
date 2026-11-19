// Palm Cover Studio — a gta6-cover-art-01 entry (Node 22, standard library only).
// The app is this directory's app/ folder: plain static files a desktop browser
// loads offline (app/index.html and its ES modules, vendored OFL fonts, no library
// and no network request). It is a neon-sunset cover maker with six poster layouts
// (Vice Grid, Hero + Three, Full Bleed, Nine Panel, Tilted Snapshots, Story Stack),
// five colour grades, Anton title lettering with a Pacifico script subtitle, and
// PNG export in 1080 x 1080, 1080 x 1350 and 1920 x 1080. This program hands it in:
// it copies app/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored make.fun
// library. Put your 3 or 4 PNG or JPEG screenshots in screenshots/ (the first by
// name is the cover) and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Palm Cover Studio's own art: every line of app/src/cover.js, app/src/main.js and
// app/src/shots.js was written for this entry; the two sample photos (app/samples/)
// were made for make.fun with an image model and are free to use.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
// Palm Cover Studio ships its app as plain static files: refuse to hand in a
// repository that lost its entry point instead of writing an empty dossier.
if (!existsSync(join(here, 'app', 'index.html'))) throw new Error('app/index.html is missing');
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files in app/ or 48 MiB of app
// files, in all, or a path under app/ over 1000 bytes: app/ counts beside /output's own 1000-entry cap, its
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
