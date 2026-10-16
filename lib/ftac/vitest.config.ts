// Builder specs and the per-pipeline build specs need no database:
//   npx vitest run --config lib/ftac/vitest.config.ts
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
    test: { root: ROOT, include: ['lib/ftac/**/*.test.ts', 'examples/**/build.test.ts'] },
});
