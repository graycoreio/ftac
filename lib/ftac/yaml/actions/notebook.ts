import { notebook } from '../../activities/notebook.ts';
import { token } from '../../stores/token.ts';
import type { NotebookParam } from '../../types.ts';
import { compileSlot } from '../compileSlot.ts';
import { compileText } from '../compileText.ts';
import { slotToYaml } from '../slotToYaml.ts';
import { tokenName } from '../tokenToYaml.ts';
import type { Action } from './types.ts';

export const notebookAction: Action = {
    name: 'fabric/notebook',
    description: 'Run a notebook in this workspace.',
    inputs: {
        notebook: 'The token name of the notebook; nb_x emits {{ .nb_x_id }}.',
        parameters: 'Map of name to { type: string | int | float | bool, value }. value is text or ${{ }}. Use block style: YAML cannot hold ${{ }} inside { } unquoted.',
    },
    example: `- id: build_file
  uses: fabric/notebook
  with:
    notebook: nb_clean_orders
    parameters:
      period:
        type: string
        value: \${{ env.PERIOD }}
      rows:
        type: int
        value: \${{ int(vars.rows) }}`,
    exampleContext: { env: { PERIOD: "${{ formatDateTime(vars.date_from, 'yyyyMM') }}" } },
    compile: ({ step, ctx, needs, policy, with: w }) => {
        const parameters = Object.fromEntries(
            Object.entries((w.parameters ?? {}) as Record<string, { type: NotebookParam[0]; value: unknown }>).map(([k, p]) => [
                k,
                [p.type, compileSlot(String(p.value), ctx)] as NotebookParam,
            ])
        );
        return notebook(step.id, { id: token(`${compileText(String(w.notebook), ctx, `${step.id}.notebook`)}_id`), parameters }, { needs, policy });
    },
    toYaml: ({ activity: { type, typeProperties: tp } }) => {
        if (type !== 'TridentNotebook') return undefined;
        const name = tokenName(tp.notebookId, 'notebookId');
        const parameters: Record<string, { type: unknown; value: string }> = {};
        for (const [k, p] of Object.entries((tp.parameters ?? {}) as Record<string, { type: unknown; value: unknown }>)) {
            const value = slotToYaml(p?.value);
            if (value === undefined) return undefined;
            parameters[k] = { type: p.type, value };
        }
        return { uses: 'fabric/notebook', with: { notebook: name, ...(Object.keys(parameters).length && { parameters }) } };
    },
};
