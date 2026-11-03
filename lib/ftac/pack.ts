// `npm run build` here, after tsc has emitted dist/ftac: add what tsc does
// not emit, so dist/ftac is the package that `npm publish` ships.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SRC, '../..');
const OUT = resolve(ROOT, 'dist/ftac');

// The manifest, minus what only the workspace uses. The version and the
// dependency versions stay 0.0.0-PLACEHOLDER; the publish workflow sets
// them from the root package.json.
const { scripts, nx, devDependencies, ...pkg } = JSON.parse(readFileSync(resolve(SRC, 'package.json'), 'utf8'));
writeFileSync(resolve(OUT, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

// The executor registry points at the emitted JavaScript.
const executors = readFileSync(resolve(SRC, 'executors.json'), 'utf8').replaceAll('.ts"', '.js"');
writeFileSync(resolve(OUT, 'executors.json'), executors);

for (const file of ['README.md', 'executor/schema.json', 'executor/toYaml.schema.json', 'yaml/pipeline.schema.json']) {
    mkdirSync(dirname(resolve(OUT, file)), { recursive: true });
    copyFileSync(resolve(SRC, file), resolve(OUT, file));
}
copyFileSync(resolve(ROOT, 'LICENSE'), resolve(OUT, 'LICENSE'));
console.log(`packed ${OUT}`);
