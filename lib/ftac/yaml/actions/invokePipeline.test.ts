import { expect, it } from 'vitest';
import { compileStep } from '../compileStep.ts';
import { stepToYaml } from '../stepToYaml.ts';
import type { YamlStep } from '../types.ts';
import { compileExample } from './compileExample.ts';
import { invokePipelineAction as a } from './invokePipeline.ts';

const ctx = { env: {}, datasets: {} };
const compile = (w: Record<string, unknown>) => a.compile({ step: { id: 'inv' }, ctx, needs: [], policy: {} as never, with: w });

it('example compiles to an InvokePipeline with a token id, the env connection, and a parameter expression', () =>
    expect(compileExample(a)).toMatchObject({
        type: 'InvokePipeline',
        name: 'run_load',
        typeProperties: {
            pipelineId: '{{ .pl_load_orders_id }}',
            workspaceId: '{{ .workspace_id }}',
            waitOnCompletion: true,
            operationType: 'InvokeFabricPipeline',
            parameters: { processing_date_from: { value: '@pipeline().parameters.date_from', type: 'Expression' } },
        },
        externalReferences: { connection: '00000000-0000-0000-0000-000000000000' },
        policy: { timeout: '0.02:00:00' },
    }));
it('defaults to no parameters and waiting', () =>
    expect(compile({ pipeline: 'pl_x', connection: 'c' }).typeProperties).toMatchObject({ parameters: {}, waitOnCompletion: true }));
it('wait: false fires and forgets', () => expect(compile({ pipeline: 'pl_x', connection: 'c', wait: false }).typeProperties.waitOnCompletion).toBe(false));
it('takes an expression as the pipeline id, for a for-each item', () =>
    expect(compile({ pipeline: '${{ item.id }}', connection: 'c' }).typeProperties.pipelineId).toEqual({ value: '@item().id', type: 'Expression' }));

const roundTrip = (step: YamlStep) => stepToYaml(compileStep(step, ctx), ctx).step;

it('reads an InvokePipeline back with its parameters', () => {
    const step: YamlStep = {
        id: 'run',
        uses: 'fabric/invoke-pipeline',
        timeout: '02:00:00',
        with: { pipeline: 'pl_load_orders', connection: 'c', parameters: { from: '${{ inputs.date_from }}', kind: 'full' }, wait: false },
    };
    expect(roundTrip(step)).toEqual(step);
});
it('reads an expression pipeline id back', () => {
    const step: YamlStep = { id: 'run', uses: 'fabric/invoke-pipeline', with: { pipeline: '${{ item.id }}', connection: 'c' } };
    expect(roundTrip(step)).toEqual(step);
});
it('stays raw with a deployed GUID for the pipeline id', () => {
    const act = compile({ pipeline: 'pl_x', connection: 'c' });
    expect(stepToYaml({ ...act, typeProperties: { ...act.typeProperties, pipelineId: '5a0b77c2-1d2e-4f30-9a8b-0c1d2e3f4a5b' } }, ctx).notes).toEqual([
        'inv: fabric/invoke-pipeline: pipelineId is "5a0b77c2-1d2e-4f30-9a8b-0c1d2e3f4a5b", not a {{ .<name>_id }} token',
    ]);
});
