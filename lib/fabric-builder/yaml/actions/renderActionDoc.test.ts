import { expect, it } from 'vitest';
import { copyAction } from './copy.ts';
import { renderActionDoc } from './renderActionDoc.ts';
import { waitAction } from './wait.ts';

it('renders title, inputs, rules, example, context, and compiled JSON', () => {
    const doc = renderActionDoc(copyAction);
    expect(doc).toMatch(/^# fabric\/copy\n/);
    for (const k of Object.keys(copyAction.inputs)) expect(doc).toContain(`| \`${k}\` |`);
    expect(doc).toContain('`timeout:` (HH:MM:SS');
    expect(doc).toContain('```yaml\n' + copyAction.example);
    expect(doc).toContain('env:\n  ESG_POSTGRES:');
    expect(doc).toContain('datasets:\n  out_file:\n    csv:');
    expect(doc).toContain('## Compiles to');
    expect(doc).toContain('"type": "Copy"');
});
it('omits the context block when the example needs none', () => {
    const doc = renderActionDoc(waitAction);
    expect(doc).not.toContain('with, elsewhere in the file');
    expect(doc).toContain('Takes no `timeout:` or `retry:`.');
});
