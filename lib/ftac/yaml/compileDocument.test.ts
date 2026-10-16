import { expect, it } from 'vitest';
import { compileDocument } from './compileDocument.ts';

const doc = {
    name: 'P',
    output: 'p.json',
    inputs: { d: { type: 'string' as const, default: '' } },
    vars: { x: 'String' as const },
    steps: [{ id: 's', uses: 'fabric/set-variable', with: { name: 'x', value: '${{ inputs.d }}' } }],
};

it('compiles inputs, vars, and steps into a linted pipeline', () =>
    expect(compileDocument(doc)).toEqual({
        properties: {
            activities: [expect.objectContaining({ name: 's' })],
            parameters: { d: { type: 'string', defaultValue: '' } },
            variables: { x: { type: 'String' } },
        },
    }));
it('surfaces lint problems', () =>
    expect(() => compileDocument({ ...doc, steps: [{ id: 's', uses: 'fabric/set-variable', with: { name: 'x', value: '${{ inputs.nope }}' } }] })).toThrow(/parameters.nope is not declared/));
it('rejects unknown top-level keys and missing output', () => {
    expect(() => compileDocument({ ...doc, jobs: {} } as any)).toThrow(/unknown top-level key 'jobs'/);
    expect(() => compileDocument({ ...doc, output: '' })).toThrow(/output: is required/);
});
