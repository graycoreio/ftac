import { copyFileSync, existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it, vi } from 'vitest';
import toYaml from './toYaml.ts';

const EXAMPLES = resolve(dirname(fileURLToPath(import.meta.url)), '../../../examples');
const HELLO = join(EXAMPLES, 'hello/hello.json');
const failure = (name: string) => join(EXAMPLES, 'to-yaml-failures', name);

/** A workspace with copies of the given pipeline JSON (by default the example), as the executor context for it. */
function workspace(files = [HELLO]) {
    const root = mkdtempSync(join(tmpdir(), 'to-yaml-'));
    for (const f of files) copyFileSync(f, join(root, basename(f)));
    return { root, context: { root } };
}

it('writes the YAML next to each matching JSON', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { root, context } = workspace();
    expect(await toYaml({ pattern: '*.json' }, context)).toEqual({ success: true });
    expect(readFileSync(join(root, 'hello-pipeline.yaml'), 'utf8')).toMatch(/^name: hello\n/);
    expect(log).toHaveBeenCalledWith(`ok   hello.json: wrote hello-pipeline.yaml`);
    expect(log).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenLastCalledWith('1/1 pipelines converted to YAML');
});
it('leaves an existing YAML alone unless forced', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const { root, context } = workspace();
    const yaml = join(root, 'hello-pipeline.yaml');
    writeFileSync(yaml, 'hand-written');
    expect(await toYaml({ pattern: '*.json' }, context)).toEqual({ success: false });
    expect(readFileSync(yaml, 'utf8')).toBe('hand-written');
    expect(await toYaml({ pattern: '*.json', force: true }, context)).toEqual({ success: true });
    expect(readFileSync(yaml, 'utf8')).toMatch(/^name: hello\n/);
});
it('fails a file that is not a pipeline', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { root, context } = workspace();
    writeFileSync(join(root, 'package.json'), '{}');
    expect(await toYaml({ pattern: '*.json' }, context)).toEqual({ success: false });
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/^FAIL package\.json: not a pipeline definition/));
    expect(log).toHaveBeenLastCalledWith('1/2 pipelines converted to YAML');
});
it('fails a pipeline with an activity no action reads, writing nothing', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { root, context } = workspace([failure('unsupported-activity.json')]);
    expect(await toYaml({ pattern: '*.json' }, context)).toEqual({ success: false });
    expect(existsSync(join(root, 'unsupported-activity-pipeline.yaml'))).toBe(false);
    expect(log).toHaveBeenCalledWith('FAIL unsupported-activity.json: call: cannot be written as YAML: no built-in action reads a WebActivity activity');
});
it('converts the other pipelines when one fails', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { root, context } = workspace([HELLO, failure('unsupported-activity.json')]);
    expect(await toYaml({ pattern: '*.json' }, context)).toEqual({ success: false });
    expect(readFileSync(join(root, 'hello-pipeline.yaml'), 'utf8')).toMatch(/^name: hello\n/);
    expect(existsSync(join(root, 'unsupported-activity-pipeline.yaml'))).toBe(false);
    expect(log).toHaveBeenCalledWith('ok   hello.json: wrote hello-pipeline.yaml');
    expect(log).toHaveBeenCalledWith(expect.stringMatching(/^FAIL unsupported-activity\.json: /));
    expect(log).toHaveBeenLastCalledWith('1/2 pipelines converted to YAML');
});
it.each([
    ['copy-source.json', 'load: cannot be written as YAML: fabric/copy: its SqlServerSource source is not a Postgres query or table, or a lakehouse table'],
    ['copy-sink.json', 'load: cannot be written as YAML: fabric/copy: its ParquetSink sink is not a lakehouse CSV or table'],
])('fails %s, a Copy no store reads, writing nothing', async (file, reason) => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { root, context } = workspace([failure(file)]);
    expect(await toYaml({ pattern: '*.json' }, context)).toEqual({ success: false });
    expect(existsSync(join(root, file.replace('.json', '-pipeline.yaml')))).toBe(false);
    expect(log).toHaveBeenCalledWith(`FAIL ${file}: ${reason}`);
});
it('names the nested activity no action reads, not the step around it', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { context } = workspace([failure('nested-activity.json')]);
    expect(await toYaml({ pattern: '*.json' }, context)).toEqual({ success: false });
    expect(log).toHaveBeenCalledWith('FAIL nested-activity.json: call: cannot be written as YAML: no built-in action reads a WebActivity activity');
});
it('leaves an existing YAML alone when forced but the pipeline cannot be converted', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const { root, context } = workspace([failure('unsupported-activity.json')]);
    const yaml = join(root, 'unsupported-activity-pipeline.yaml');
    writeFileSync(yaml, 'hand-written');
    expect(await toYaml({ pattern: '*.json', force: true }, context)).toEqual({ success: false });
    expect(readFileSync(yaml, 'utf8')).toBe('hand-written');
});
it('warns only about dropped properties', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    log.mockClear();
    const { context } = workspace([failure('dropped-property.json')]);
    expect(await toYaml({ pattern: '*.json' }, context)).toEqual({ success: true });
    expect(log.mock.calls).toEqual([
        ['ok   dropped-property.json: wrote dropped-property-pipeline.yaml'],
        ['     properties.description has no YAML equivalent and was dropped'],
        ['1/1 pipelines converted to YAML'],
    ]);
});
