import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { loadYamlBuild } from './loadYamlBuild.ts';

it('resolves output relative to the file and compiles lazily', () => {
    const dir = mkdtempSync(join(tmpdir(), 'builder-'));
    const f = join(dir, 'x-pipeline.yaml');
    writeFileSync(f, 'name: X\noutput: ../x.json\nsteps:\n  - id: w\n    uses: fabric/wait\n    with: { seconds: 1 }\n');
    const b = loadYamlBuild(f);
    expect(b.out).toBe(join(dir, '..', 'x.json'));
    expect(b.build().properties.activities[0].name).toBe('w');
});
it('rejects a non-mapping document', () => {
    const f = join(mkdtempSync(join(tmpdir(), 'builder-')), 'x-pipeline.yaml');
    writeFileSync(f, '- just\n- a list\n');
    expect(() => loadYamlBuild(f)).toThrow(/not a YAML mapping/);
});
