import { globSync } from 'node:fs';
import { resolve } from 'node:path';

/** Absolute paths of every pipeline file under `root` matching `pattern`, sorted. */
export const findBuilds = (root: string, pattern: string): string[] =>
    globSync(pattern, { cwd: root, exclude: (p: string) => p.includes('node_modules') })
        .sort()
        .map((p) => resolve(root, p));
