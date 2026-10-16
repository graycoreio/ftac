import { expect, it } from 'vitest';
import { registry } from './registry.ts';
import { moduleName, renderActionsDoc } from './renderActionsDoc.ts';

it('maps action names to module names', () => {
    expect(moduleName('fabric/set-variable')).toBe('setVariable');
    expect(moduleName('fabric/copy')).toBe('copy');
});
it('links every action to its page', () => {
    const doc = renderActionsDoc();
    for (const name of registry.keys()) expect(doc).toContain(`- [\`${name}\`](${moduleName(name)}.md): `);
    expect(doc).not.toContain('| ---');
    expect(doc).toMatch(/^# Pre-built actions/);
});
