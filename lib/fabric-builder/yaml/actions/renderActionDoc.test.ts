import { expect, it } from 'vitest';
import { copyAction } from './copy.ts';
import { prose, renderActionDoc } from './renderActionDoc.ts';
import { waitAction } from './wait.ts';

it('renders title, inputs, rules, example, and context', () => {
    const doc = renderActionDoc(copyAction);
    expect(doc).toMatch(/^# fabric\/copy\n/);
    for (const k of Object.keys(copyAction.inputs)) expect(doc).toContain(`\n## \`with.${k}\`\n\n`);
    expect(doc).not.toContain('| ---');
    expect(doc).toContain('It takes `timeout:`');
    expect(doc).toContain('```yaml\n' + copyAction.example);
    expect(doc).toContain('env:\n  POSTGRES:');
    expect(doc).toContain('datasets:\n  out_file:\n    csv:');
    expect(doc).not.toContain('GENERATED');
    expect(doc).not.toContain('## Compiles to');
});
it('omits the context block when the example needs none', () => {
    const doc = renderActionDoc(waitAction);
    expect(doc).not.toContain('with, elsewhere in the file');
    expect(doc).toContain('It takes no `timeout:` or `retry:`.');
});
it('escapes prose so angle brackets and pipes survive a table cell, and ${{ }} is code', () => {
    expect(prose('steps.<id>.outputs.exists')).toBe('steps.\\<id>.outputs.exists');
    expect(prose('query | table { schema, table }')).toBe('query \\| table { schema, table }');
    expect(prose('A query may embed ${{ sql(expr) }}.')).toBe('A query may embed `${{ sql(expr) }}`.');
    expect(prose('raw <source JSON> or `a | b`')).toBe('raw \\<source JSON> or `a | b`');
    expect(prose('pl_x emits {{ .pl_x_id }}')).toBe('pl_x emits `{{ .pl_x_id }}`');
});
