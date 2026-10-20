import { expect, it } from 'vitest';
import { compileExample } from './compileExample.ts';
import { setVariableAction as a } from './setVariable.ts';

const args = (w: Record<string, unknown>) => ({ step: { id: 's' }, ctx: { env: {}, datasets: {} }, needs: ['prev'], policy: {} as never, with: w });

it('example compiles to a SetVariable with the parameter-or-default expression', () =>
    expect(compileExample(a)).toMatchObject({
        type: 'SetVariable',
        name: 'set_date',
        typeProperties: { variableName: 'date', value: { value: '@if(empty(pipeline().parameters.date), utcNow(), pipeline().parameters.date)' } },
    }));
it('quotes plain text values', () => expect(a.compile(args({ name: 'x', value: '-1' })).typeProperties.value).toEqual({ value: "@'-1'", type: 'Expression' }));
it('carries needs and the light policy', () =>
    expect(a.compile(args({ name: 'x', value: '1' }))).toMatchObject({ policy: { secureInput: false, secureOutput: false }, dependsOn: [{ activity: 'prev' }] }));
it('takes no policy', () => expect(a.policy).toBe(false));

it('reads a SetVariable back, its value as YAML', () =>
    expect(
        a.decompile!({
            activity: { type: 'SetVariable', typeProperties: { variableName: 'x', value: { value: "@concat('a-', pipeline().parameters.p)", type: 'Expression' } }, name: 's', dependsOn: [] },
            ctx: { env: {}, datasets: {} },
            steps: () => [],
        })
    ).toEqual({ uses: 'fabric/set-variable', with: { name: 'x', value: 'a-${{ inputs.p }}' } }));
