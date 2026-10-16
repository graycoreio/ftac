import { expect, it } from 'vitest';
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
