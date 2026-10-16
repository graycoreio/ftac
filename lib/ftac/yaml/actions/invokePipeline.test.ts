import { expect, it } from 'vitest';
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
