import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { runBuild } from './runBuild.ts';

const EXAMPLE = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../../../examples/hello/hello-pipeline.yaml'
);
const tmp = () => mkdtempSync(join(tmpdir(), 'builder-'));

it('reports the example YAML build as in sync', async () =>
    expect(await runBuild(EXAMPLE, true)).toEqual({ file: EXAMPLE, ok: true, message: 'in sync' }));

it('rejects a build file without the expected exports', async () => {
    const f = join(tmp(), 'build.ts');
    writeFileSync(f, 'export const nothing = 1;\n');
    expect(await runBuild(f, true)).toMatchObject({ ok: false, message: 'must export build() and OUT' });
});

it('reports a build that throws', async () => {
    const f = join(tmp(), 'build.ts');
    writeFileSync(f, "export const OUT = '/dev/null'; export function build() { throw new Error('boom'); }\n");
    expect(await runBuild(f, false)).toMatchObject({ ok: false, message: 'boom' });
});
