import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { render } from '../pipeline/render.ts';
import { fileToYaml } from './fileToYaml.ts';
import { loadYamlBuild } from './loadYamlBuild.ts';

// The example's committed output stands in for a pipeline exported from Fabric.
const HELLO = resolve(dirname(fileURLToPath(import.meta.url)), '../../../examples/hello/hello.json');
const FAILURES = resolve(dirname(fileURLToPath(import.meta.url)), '../../../examples/to-yaml-failures');
const tmp = () => mkdtempSync(join(tmpdir(), 'to-yaml-'));

it('converts the example JSON to YAML that builds the identical file', () => {
    const dir = tmp();
    const json = join(dir, 'hello.json');
    copyFileSync(HELLO, json);
    const { yaml, out, warnings } = fileToYaml(json);
    expect(out).toBe(join(dir, 'hello-pipeline.yaml'));
    expect(warnings).toEqual([]);
    writeFileSync(out, yaml);
    expect(render(loadYamlBuild(out).build())).toBe(readFileSync(HELLO, 'utf8'));
});
it('carries the example inputs, vars, datasets and needs over as YAML', () => {
    const { yaml } = fileToYaml(HELLO, join(tmp(), 'x-pipeline.yaml'));
    expect(yaml).toMatch(/^name: hello\n\noutput: \S+hello\.json\n\ninputs:\n {2}date: \{ type: string, default: "" \}\n\nvars:\n {2}date: String\n\ndatasets:\n {2}hello:\n {4}csv:\n/);
    expect(yaml).toContain('  - id: load\n    needs: set_date\n    uses: fabric/copy\n    timeout: 01:00:00\n    retry: { count: 1, interval: 300 }\n');
    expect(yaml).toContain('      sink: { csv: hello }\n');
    expect(yaml).not.toContain('fabric/raw');
});
it('points output: at the JSON from wherever the YAML goes', () => {
    const out = join(tmp(), 'pipelines', 'hello-pipeline.yaml');
    mkdirSync(dirname(out));
    writeFileSync(out, fileToYaml(HELLO, out).yaml);
    expect(loadYamlBuild(out).out).toBe(resolve(HELLO));
});
it("names the pipeline after the JSON's own name when it has one", () => {
    const json = join(tmp(), 'p.json');
    writeFileSync(json, JSON.stringify({ name: 'Orders', properties: { activities: [] } }));
    expect(fileToYaml(json).yaml).toMatch(/^name: Orders\n/);
});
it('reports a definition the compiler rejects', () => {
    const json = join(tmp(), 'p.json');
    writeFileSync(json, JSON.stringify({ properties: { activities: [], variables: { v: { type: 'String' } } } }));
    expect(() => fileToYaml(json)).toThrow(/the YAML does not compile: pipeline is not sound:\n {2}variable 'v' is never set/);
});
it('rejects a definition exported after deployment, with a GUID where a token belongs', () =>
    expect(() => fileToYaml(join(FAILURES, 'deployed-guid.json'), join(tmp(), 'x-pipeline.yaml'))).toThrow(
        'run_report: cannot be written as YAML: fabric/notebook: notebookId is "5a0b77c2-1d2e-4f30-9a8b-0c1d2e3f4a5b", not a {{ .<name>_id }} token; map the GUID to a token name in a tokens file'
    ));
it('reads the GUIDs in a tokens map back as the names they stand for', () => {
    const json = join(tmp(), 'p.json');
    const deployed = readFileSync(join(FAILURES, 'deployed-guid.json'), 'utf8').replace('{{ .workspace_id }}', '3F2A1B0C-9D8E-4F7A-8B6C-5D4E3F2A1B0C');
    writeFileSync(json, deployed);
    const tokens = { workspace_id: '3f2a1b0c-9d8e-4f7a-8b6c-5d4e3f2a1b0c', nb_report_id: '5a0b77c2-1d2e-4f30-9a8b-0c1d2e3f4a5b' };
    const { yaml, warnings } = fileToYaml(json, undefined, tokens);
    expect(yaml).toContain('    with: { notebook: nb_report }\n');
    expect(warnings).toEqual(['replaced 2 GUIDs with tokens; the next build writes the tokens in their place']);
});
it('rejects an activity that differs from what its action writes, saying where', () =>
    expect(() => fileToYaml(join(FAILURES, 'activity-differs.json'), join(tmp(), 'x-pipeline.yaml'))).toThrow(
        'settle: cannot be written as YAML: fabric/wait differs at description'
    ));
