import { expect, it } from 'vitest';
import { compileStep } from '../compileStep.ts';
import { stepToYaml } from '../stepToYaml.ts';
import type { YamlStep } from '../types.ts';
import { compileExample } from './compileExample.ts';
import { notebookAction as a } from './notebook.ts';

it('example compiles to a TridentNotebook with a token id and typed parameters', () =>
    expect(compileExample(a)).toMatchObject({
        type: 'TridentNotebook',
        name: 'build_file',
        typeProperties: {
            notebookId: '{{ .nb_clean_orders_id }}',
            workspaceId: '{{ .workspace_id }}',
            parameters: {
                period: { value: { value: "@formatDateTime(variables('date_from'), 'yyyyMM')" }, type: 'string' },
                rows: { value: { value: "@int(variables('rows'))" }, type: 'int' },
            },
        },
    }));
it('rejects an expression as the notebook name', () =>
    expect(() => a.compile({ step: { id: 'n' }, ctx: { env: {}, datasets: {} }, needs: [], policy: {} as never, with: { notebook: '${{ vars.x }}' } })).toThrow(/plain text/));

const ctx = { env: {}, datasets: {} };

it('reads a notebook back with its typed parameters', () => {
    const step: YamlStep = {
        id: 'nb',
        uses: 'fabric/notebook',
        retry: { count: 2 },
        with: { notebook: 'nb_clean_orders', parameters: { period: { type: 'string', value: '${{ vars.period }}' }, rows: { type: 'int', value: '10' } } },
    };
    expect(stepToYaml(compileStep(step, ctx), ctx).step).toEqual(step);
});
it('stays raw with a deployed GUID for the notebook id', () => {
    const act = compileStep({ id: 'nb', uses: 'fabric/notebook', with: { notebook: 'nb_x' } }, ctx);
    expect(stepToYaml({ ...act, typeProperties: { ...act.typeProperties, notebookId: '5a0b77c2-1d2e-4f30-9a8b-0c1d2e3f4a5b' } }, ctx).notes).toEqual([
        'nb: fabric/notebook: notebookId is "5a0b77c2-1d2e-4f30-9a8b-0c1d2e3f4a5b", not a {{ .<name>_id }} token',
    ]);
});
