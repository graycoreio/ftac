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

it('rejects a file that is not a YAML mapping', async () => {
    const f = join(tmp(), 'list-pipeline.yaml');
    writeFileSync(f, '- not\n- a pipeline\n');
    expect(await runBuild(f, true)).toMatchObject({ ok: false, message: `${f}: not a YAML mapping` });
});

it('reports a pipeline that fails to compile', async () => {
    const f = join(tmp(), 'bad-pipeline.yaml');
    writeFileSync(f, 'name: Bad\noutput: bad.json\nsteps:\n  - id: a\n    uses: fabric/nope\n');
    expect(await runBuild(f, false)).toMatchObject({ ok: false, message: expect.stringContaining("a: unknown uses: 'fabric/nope'") });
});
