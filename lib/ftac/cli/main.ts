import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Build } from '../types.ts';
import { run } from './run.ts';

/**
 * Call at the bottom of a build file. Runs the CLI only when that file is
 * executed directly, so vitest can import build() without side effects.
 */
export function main(metaUrl: string, spec: Build): void {
    const invoked = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(metaUrl);
    if (invoked) process.exit(run(spec));
}
