import { forEach } from '../../activities/forEach.ts';
import type { Activity } from '../../types.ts';
import { compileCondition } from '../compileCondition.ts';
import { compileSteps } from '../compileSteps.ts';
import { decompileCondition } from '../decompileCondition.ts';
import { isSlot } from '../decompileSlot.ts';
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
            connection: \${{ env.POSTGRES }}
            table:
              schema: public
              table: \${{ item.table_name }}
        sink:
          table: silver_table`,
    exampleContext: {
        env: { POSTGRES: '00000000-0000-0000-0000-000000000000' },
        datasets: { silver_table: { table: { lakehouse: 'slv_lakehouse', schema: 'Sales', table: '${{ item.table_name }}' } } },
    },
    compile: ({ step, ctx, needs, with: w }) =>
        forEach(step.id, { items: compileCondition(String(w.items), ctx), activities: compileSteps(step.steps ?? [], ctx), batchCount: w.batch, sequential: w.sequential }, { needs }),
    decompile: ({ activity: { type, typeProperties: tp }, steps }) => {
        if (type !== 'ForEach' || !isSlot(tp.items) || !tp.items.value.startsWith('@') || !Array.isArray(tp.activities)) return undefined;
        const items = decompileCondition(tp.items.value.slice(1));
        if (items === undefined) return undefined;
        return {
            uses: 'fabric/for-each',
            with: { items, ...(tp.batchCount !== undefined && { batch: tp.batchCount }), ...(tp.isSequential !== undefined && { sequential: tp.isSequential }) },
            steps: steps(tp.activities as Activity[]),
        };
    },
};
