import { copyFileSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it, vi } from 'vitest';
import decompile from './decompile.ts';

const HELLO = resolve(dirname(fileURLToPath(import.meta.url)), '../../../examples/hello/hello.json');

/** A workspace with a copy of the example JSON, as the executor context for it. */
function workspace() {
    const root = mkdtempSync(join(tmpdir(), 'decompile-'));
    copyFileSync(HELLO, join(root, 'hello.json'));
    return { root, context: { root } };
}

it('writes the YAML next to each matching JSON', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { root, context } = workspace();
    expect(await decompile({ pattern: '*.json' }, context)).toEqual({ success: true });
    expect(readFileSync(join(root, 'hello-pipeline.yaml'), 'utf8')).toMatch(/^name: hello\n/);
    expect(log).toHaveBeenCalledWith(`ok   hello.json: wrote hello-pipeline.yaml`);
    expect(log).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenLastCalledWith('1/1 pipelines decompiled');
});
it('leaves an existing YAML alone unless forced', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const { root, context } = workspace();
    const yaml = join(root, 'hello-pipeline.yaml');
    writeFileSync(yaml, 'hand-written');
    expect(await decompile({ pattern: '*.json' }, context)).toEqual({ success: false });
    expect(readFileSync(yaml, 'utf8')).toBe('hand-written');
    expect(await decompile({ pattern: '*.json', force: true }, context)).toEqual({ success: true });
    expect(readFileSync(yaml, 'utf8')).toMatch(/^name: hello\n/);
});
it('fails a file that is not a pipeline', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { root, context } = workspace();
    writeFileSync(join(root, 'package.json'), '{}');
    expect(await decompile({ pattern: '*.json' }, context)).toEqual({ success: false });
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/^FAIL package\.json: not a pipeline definition/));
    expect(log).toHaveBeenLastCalledWith('1/2 pipelines decompiled');
});
