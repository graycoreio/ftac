import { WORKSPACE_ID } from '../stores/token.ts';
import type { Activity, ActivityOptions, Slot } from '../types.ts';
import { activity } from './activity.ts';
import { policy } from './policy.ts';

export type InvokePipelineSpec = { id: string | Slot; connection: string; parameters?: Record<string, unknown>; waitOnCompletion?: boolean };

/** Invoke another pipeline in this workspace through a Fabric Data Pipelines connection. id is a token or an expression slot. */
export const invokePipeline = (name: string, { id, connection, parameters = {}, waitOnCompletion = true }: InvokePipelineSpec, opts: ActivityOptions = {}): Activity =>
    activity(
        'InvokePipeline',
        name,
        { parameters, waitOnCompletion, workspaceId: WORKSPACE_ID, pipelineId: id, operationType: 'InvokeFabricPipeline' },
        { externalReferences: { connection }, policy: policy(), ...opts }
    );
