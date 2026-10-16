import { forEach } from '../../activities/forEach.ts';
import { compileCondition } from '../compileCondition.ts';
import { compileSteps } from '../compileSteps.ts';
import type { Action } from './types.ts';

export const forEachAction: Action = {
    name: 'fabric/for-each',
    description: 'Run the nested steps once per item. Inside, refer to the item as ${{ item.field }}.',
    inputs: {
        items: 'A ${{ }} that evaluates to an array, typically steps.<lookup>.outputs.value.',
        batch: 'How many items run at once. Omit for the Fabric default.',
        sequential: 'true to run one at a time. Default false.',
    },
    steps: 'required',
    policy: false,
    example: `- id: each_table
  uses: fabric/for-each
  with:
    items: \${{ steps.list_tables.outputs.value }}
    batch: 4
  steps:
    - id: load_table
      uses: fabric/copy
      with:
        source:
          postgres:
            connection: \${{ env.ESG_POSTGRES }}
            table:
              schema: cw_titan
              table: \${{ item.table_name }}
        sink:
          table: silver_table`,
    exampleContext: {
        env: { ESG_POSTGRES: '7c5329e4-58a9-4317-9d4d-63460450abe9' },
        datasets: { silver_table: { table: { lakehouse: 'slv_lakehouse', schema: 'ESG', table: '${{ item.table_name }}' } } },
    },
    compile: ({ step, ctx, needs, with: w }) =>
        forEach(step.id, { items: compileCondition(String(w.items), ctx), activities: compileSteps(step.steps ?? [], ctx), batchCount: w.batch, sequential: w.sequential }, { needs }),
};
