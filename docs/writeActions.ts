// `npx nx run docs:actions`: render the action reference from the registry
// into docs/reference/actions/ for the site. The directory is gitignored; `dev` and
// `build` run this first, so the pages are never edited by hand.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { actionDocs } from '../lib/ftac/yaml/actions/actionDocs.ts';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), 'reference/actions');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const docs = actionDocs();
for (const [name, content] of docs) writeFileSync(resolve(OUT, name), `---\neditLink: false\n---\n\n${content}`);
console.log(`wrote ${docs.size} pages to ${OUT}`);
