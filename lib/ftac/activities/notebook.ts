import { WORKSPACE_ID } from '../stores/token.ts';
import type { Activity, ActivityOptions, NotebookParam } from '../types.ts';
import { activity } from './activity.ts';
import { policy } from './policy.ts';

export type NotebookSpec = { id: string; parameters?: Record<string, NotebookParam> };

/** Run a notebook with typed parameters: { name: ['int', expr(...)] }. */
export const notebook = (name: string, { id, parameters = {} }: NotebookSpec, opts: ActivityOptions = {}): Activity =>
    activity(
        'TridentNotebook',
        name,
        {
            notebookId: id,
            workspaceId: WORKSPACE_ID,
            parameters: Object.fromEntries(Object.entries(parameters).map(([k, [type, value]]) => [k, { value, type }])),
        },
        { policy: policy(), ...opts }
    );
