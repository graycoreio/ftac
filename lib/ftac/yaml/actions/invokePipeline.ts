import { invokePipeline } from '../../activities/invokePipeline.ts';
import { token } from '../../stores/token.ts';
import { compileSlot } from '../compileSlot.ts';
import { compileText } from '../compileText.ts';
import type { Action } from './types.ts';

export const invokePipelineAction: Action = {
    name: 'fabric/invoke-pipeline',
    description: 'Invoke another pipeline in this workspace. Steps with no needs: between them run in parallel.',
    inputs: {
        pipeline: 'The token name of the pipeline (pl_x emits {{ .pl_x_id }}), or a ${{ }} that evaluates to its id, such as ${{ item.id }} inside a for-each.',
        connection: 'The Fabric Data Pipelines connection the invoke goes through.',
        parameters: 'Map of the child pipeline\'s parameter names to values; a value is text or ${{ }}. Omitted parameters take the child\'s defaults.',
        wait: 'Wait for the child to finish, so its failure fails this step. Default true.',
    },
    example: `- id: run_load
  uses: fabric/invoke-pipeline
  timeout: 02:00:00
  with:
    pipeline: pl_load_orders
    connection: \${{ env.PIPELINES }}
    parameters:
      processing_date_from: \${{ inputs.date_from }}`,
    exampleContext: { env: { PIPELINES: '00000000-0000-0000-0000-000000000000' } },
    compile: ({ step, ctx, needs, policy, with: w }) => {
        const parameters = Object.fromEntries(Object.entries((w.parameters ?? {}) as Record<string, unknown>).map(([k, v]) => [k, compileSlot(String(v), ctx)]));
        return invokePipeline(
            step.id,
            {
                id: String(w.pipeline).includes('${{') ? compileSlot(String(w.pipeline), ctx) : token(`${compileText(String(w.pipeline), ctx, `${step.id}.pipeline`)}_id`),
                connection: compileText(String(w.connection), ctx, `${step.id}.connection`),
                parameters,
                waitOnCompletion: w.wait === undefined ? true : Boolean(w.wait),
            },
            { needs, policy }
        );
    },
};
