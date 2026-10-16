import { expect, it } from 'vitest';
import { compileStep } from './compileStep.ts';

const ctx = { env: { NB: 'nb_x' }, datasets: { f: { csv: { lakehouse: 'brz_lakehouse', folder: 'a', file: 'b.csv' } } } };

it('compiles set-variable with needs', () =>
    expect(compileStep({ id: 's', uses: 'fabric/set-variable', needs: 'a', with: { name: 'x', value: '-1' } }, ctx)).toMatchObject({
        type: 'SetVariable',
        typeProperties: { variableName: 'x', value: { value: "@'-1'" } },
        dependsOn: [{ activity: 'a', dependencyConditions: ['Succeeded'] }],
    }));
it('compiles get-metadata with a policy', () =>
    expect(compileStep({ id: 'g', uses: 'fabric/get-metadata', timeout: '01:00:00', with: { dataset: 'f' } }, ctx)).toMatchObject({
        type: 'GetMetadata',
        policy: { timeout: '0.01:00:00' },
    }));
it('compiles an if: group as an IfCondition with no else', () => {
    const a = compileStep({ id: 'g', if: '${{ vars.b }}', steps: [{ id: 'w', uses: 'fabric/wait', with: { seconds: 1 } }] }, ctx);
    expect(a.type).toBe('IfCondition');
    expect(a.typeProperties.expression).toEqual({ value: "@variables('b')", type: 'Expression' });
    expect((a.typeProperties.ifTrueActivities as any[]).map((x) => x.name)).toEqual(['w']);
    expect(a.typeProperties.ifFalseActivities).toEqual([]);
});
it('compiles a notebook with typed parameters and a token id', () =>
    expect(compileStep({ id: 'n', uses: 'fabric/notebook', with: { notebook: '${{ env.NB }}', parameters: { k: { type: 'int', value: '${{ int(vars.v) }}' } } } }, ctx).typeProperties).toMatchObject({
        notebookId: '{{ .nb_x_id }}',
        parameters: { k: { value: { value: "@int(variables('v'))" }, type: 'int' } },
    }));
it('compiles for-each with nested steps', () =>
    expect(compileStep({ id: 'e', uses: 'fabric/for-each', with: { items: '${{ steps.l.outputs.value }}', batch: 4 }, steps: [{ id: 'w', uses: 'fabric/wait', with: { seconds: 1 } }] }, ctx).typeProperties).toMatchObject({
        batchCount: 4,
        items: { value: "@activity('l').output.value" },
    }));
it('compiles raw with the id and needs applied', () =>
    expect(compileStep({ id: 'r', uses: 'fabric/raw', needs: 'a', with: { type: 'WebActivity', typeProperties: { method: 'GET' } } }, ctx)).toMatchObject({
        type: 'WebActivity',
        name: 'r',
        dependsOn: [{ activity: 'a' }],
    }));
it('rejects if: on a lone activity', () => expect(() => compileStep({ id: 's', uses: 'fabric/wait', if: '${{ x }}', with: { seconds: 1 } }, ctx)).toThrow(/must have nested steps/));
it('rejects unknown keys and unknown uses', () => {
    expect(() => compileStep({ id: 's', uses: 'fabric/wait', with: { seconds: 1 }, bogus: 1 } as any, ctx)).toThrow(/unknown key 'bogus'/);
    expect(() => compileStep({ id: 's', uses: 'teleport' }, ctx)).toThrow(/unknown uses: 'teleport'. Built-in actions: fabric\/set-variable/);
});
it('rejects timeout on set-variable', () => expect(() => compileStep({ id: 's', uses: 'fabric/set-variable', timeout: '00:01:00', with: { name: 'x', value: '1' } }, ctx)).toThrow(/has no timeout/));

it('labels: become userProperties, last, with expressions evaluated', () =>
    expect(compileStep({ id: 'w', uses: 'fabric/wait', with: { seconds: 1 }, labels: { report: '${{ item.name }}', kind: 'eom' } }, ctx)).toMatchObject({
        userProperties: [
            { name: 'report', value: { value: '@item().name', type: 'Expression' } },
            { name: 'kind', value: { value: 'eom', type: 'Expression' } },
        ],
    }));
