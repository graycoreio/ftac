import { expect, it } from 'vitest';
import { parse } from 'yaml';
import { renderYaml } from './renderYaml.ts';
import type { YamlDocument } from './types.ts';

const doc: YamlDocument = {
    name: 'P',
    output: 'p.json',
    steps: [
        { id: 'a', uses: 'fabric/raw', with: { type: 'X', typeProperties: { q: 'SELECT 1\nFROM t', v: '@x', t: '0.12:00:00' } } },
        { id: 'b', uses: 'fabric/raw', needs: 'a', with: { type: 'Y', typeProperties: {} } },
    ],
};

it('parses back to the same document', () => expect(parse(renderYaml(doc))).toEqual(doc));
it('separates top-level keys and steps with a blank line', () => {
    const text = renderYaml(doc);
    expect(text).toMatch(/^name: P\n\noutput: p.json\n\nsteps:\n  - id: a\n/);
    expect(text).toContain('\n\n  - id: b\n');
});
it('writes multi-line text as a block scalar', () => expect(renderYaml(doc)).toContain('q: |-\n'));

const short: YamlDocument = {
    name: 'P',
    output: 'p.json',
    inputs: { date: { type: 'string', default: '' } },
    vars: { d: 'String' },
    steps: [
        { id: 'w', needs: ['a', 'b'], uses: 'fabric/wait', retry: { count: 1, interval: 300 }, with: { seconds: 1 } },
        { id: 's', uses: 'fabric/set-variable', with: { name: 'd', value: '${{ vars.x }}' } },
        { id: 'n', uses: 'fabric/raw', with: { type: 'X', typeProperties: { a: 'a'.repeat(30), b: 'b'.repeat(30) } } },
    ],
};

it('puts short maps and lists of plain values on one line', () => {
    const text = renderYaml(short);
    expect(text).toContain('  date: { type: string, default: "" }\n');
    expect(text).toContain('    needs: [ a, b ]\n');
    expect(text).toContain('    retry: { count: 1, interval: 300 }\n');
    expect(text).toContain('    with: { seconds: 1 }\n');
    expect(parse(text)).toEqual(short);
});
it('keeps top-level sections, steps, ${{ }} values and long maps in block style', () => {
    const text = renderYaml(short);
    expect(text).toContain('vars:\n  d: String\n');
    expect(text).toContain('steps:\n  - id: w\n');
    expect(text).toContain("    with:\n      name: d\n      value: ${{ vars.x }}\n");
    expect(text).toContain('      typeProperties:\n        a: ');
});
