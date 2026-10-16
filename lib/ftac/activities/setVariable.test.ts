import { expect, it } from 'vitest';
import { setVariable } from './setVariable.ts';

it('sets a variable with the light policy', () =>
    expect(setVariable('set_x', 'x', "'1'", { needs: 'a' })).toEqual({
        type: 'SetVariable',
        typeProperties: { variableName: 'x', value: { value: "@'1'", type: 'Expression' } },
        policy: { secureInput: false, secureOutput: false },
        name: 'set_x',
        dependsOn: [{ activity: 'a', dependencyConditions: ['Succeeded'] }],
    }));
