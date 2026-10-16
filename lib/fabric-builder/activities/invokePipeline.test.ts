import { expect, it } from 'vitest';
import { invokePipeline } from './invokePipeline.ts';

it('matches the portal shape, connection as an external reference', () => {
    const a = invokePipeline('inv', { id: '{{ .pl_x_id }}', connection: 'conn' });
    expect(a.typeProperties).toEqual({
        parameters: {},
        waitOnCompletion: true,
        workspaceId: '{{ .workspace_id }}',
        pipelineId: '{{ .pl_x_id }}',
        operationType: 'InvokeFabricPipeline',
    });
    expect(a.externalReferences).toEqual({ connection: 'conn' });
    expect(Object.keys(a)).toEqual(['type', 'typeProperties', 'externalReferences', 'policy', 'name', 'dependsOn']);
});
