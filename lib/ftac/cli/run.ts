import { writeFileSync } from 'node:fs';
import { relative } from 'node:path';
import { render } from '../pipeline/render.ts';
import type { Build } from '../types.ts';
import { stale } from './stale.ts';

/**
 * The build CLI: write the JSON, or with --check exit 1 when it is stale.
 * Returns the exit code.
 */
export function run(spec: Build, argv: string[] = process.argv.slice(2)): number {
    const rel = relative(process.cwd(), spec.out) || spec.out;
    if (argv.includes('--check')) {
        const problems = stale(spec);
        for (const p of problems) console.error(`FAIL ${p}`);
        if (!problems.length) console.log(`${rel} is in sync`);
        return problems.length ? 1 : 0;
    }
    writeFileSync(spec.out, render(spec.build()));
    console.log(`wrote ${rel}`);
    return 0;
}
