// `npx nx run docs:actions`: render the action reference from the registry
// into docs/reference/actions/ for the site. The directory is gitignored; `dev` and
// `build` run this first, so the pages are never edited by hand.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { actionDocs } from '../lib/ftac/yaml/actions/actionDocs.ts';
import { registry } from '../lib/ftac/yaml/actions/registry.ts';
import { moduleName } from '../lib/ftac/yaml/actions/renderActionsDoc.ts';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), 'reference/actions');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
// The page's one-line description, used for the <meta> and OpenGraph description.
const descriptions = new Map([...registry.values()].map((a) => [`${moduleName(a.name)}.md`, a.description]));
descriptions.set('index.md', 'The pre-built uses: targets a FTAC pipeline step can run.');
const docs = actionDocs();
for (const [name, content] of docs) {
    const description = JSON.stringify(descriptions.get(name) ?? '');
    writeFileSync(resolve(OUT, name), `---\neditLink: false\ndescription: ${description}\n---\n\n${content}`);
}
console.log(`wrote ${docs.size} pages to ${OUT}`);
