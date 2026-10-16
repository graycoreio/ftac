import { existsSync, readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { render } from '../pipeline/render.ts';
import type { Build } from '../types.ts';

/** Problems with the checked-in output, for vitest: [] when in sync. */
export function stale({ build, out }: Build): string[] {
    const rel = relative(process.cwd(), out) || out;
    if (!existsSync(out)) return [`${rel} does not exist — run the build`];
    if (readFileSync(out, 'utf8') !== render(build())) return [`${rel} is stale — run the build`];
    return [];
}
