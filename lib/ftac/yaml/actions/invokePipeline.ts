import { invokePipeline } from '../../activities/invokePipeline.ts';
import { token } from '../../stores/token.ts';
import { compileSlot } from '../compileSlot.ts';
import { compileText } from '../compileText.ts';
import { slotToYaml, isSlot } from '../slotToYaml.ts';
import { tokenName } from '../tokenToYaml.ts';
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
    toYaml: ({ activity: { type, typeProperties: tp, externalReferences } }) => {
        if (type !== 'InvokePipeline' || typeof externalReferences?.connection !== 'string') return undefined;
        // An expression id must hold a ${{ }}: without one the compiler takes the value as a token name.
        const pipeline = isSlot(tp.pipelineId) ? slotToYaml(tp.pipelineId) : tokenName(tp.pipelineId, 'pipelineId');
        if (pipeline === undefined || (isSlot(tp.pipelineId) && !pipeline.includes('${{'))) return undefined;
        const parameters: Record<string, string> = {};
        for (const [k, v] of Object.entries((tp.parameters ?? {}) as Record<string, unknown>)) {
            const yaml = slotToYaml(v);
            if (yaml === undefined) return undefined;
            parameters[k] = yaml;
        }
        return {
            uses: 'fabric/invoke-pipeline',
            with: {
                pipeline,
                connection: externalReferences.connection,
                ...(Object.keys(parameters).length && { parameters }),
                ...(tp.waitOnCompletion === false && { wait: false }),
            },
        };
    },
};
