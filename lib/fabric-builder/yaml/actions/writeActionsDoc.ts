// `npx nx run fabric-builder:docs`: write README.md and one <module>.md per
// action from the registry, or with --check exit 1 if any is stale.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { registry } from './registry.ts';
import { renderActionDoc } from './renderActionDoc.ts';
import { moduleName, renderActionsDoc } from './renderActionsDoc.ts';

const DIR = dirname(fileURLToPath(import.meta.url));

/** Every generated doc: path -> content. */
export function actionDocs(): Map<string, string> {
    const docs = new Map<string, string>([[resolve(DIR, 'README.md'), renderActionsDoc()]]);
    for (const a of registry.values()) docs.set(resolve(DIR, `${moduleName(a.name)}.md`), renderActionDoc(a));
    return docs;
}

/** Problems with the checked-in docs: [] when all are in sync. */
export function staleActionsDoc(): string[] {
    const problems: string[] = [];
    for (const [path, content] of actionDocs()) {
        const rel = `yaml/actions/${path.slice(DIR.length + 1)}`;
        if (!existsSync(path)) problems.push(`${rel} does not exist — run \`npx nx run fabric-builder:docs\``);
        else if (readFileSync(path, 'utf8') !== content) problems.push(`${rel} is stale — run \`npx nx run fabric-builder:docs\``);
    }
    return problems;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    if (process.argv.includes('--check')) {
        const problems = staleActionsDoc();
        for (const p of problems) console.error(`FAIL ${p}`);
        process.exit(problems.length ? 1 : 0);
    }
    for (const [path, content] of actionDocs()) writeFileSync(path, content);
    console.log(`wrote ${actionDocs().size} docs under ${DIR}`);
}
