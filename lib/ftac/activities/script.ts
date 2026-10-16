import type { Activity, ActivityOptions, LinkedService, ScriptBatch } from '../types.ts';
import { activity } from './activity.ts';
import { policy } from './policy.ts';

export type ScriptSpec = { store: LinkedService; scripts: ScriptBatch[]; timeout?: string };

/** Run T-SQL batches inside a warehouse. */
export const script = (name: string, { store, scripts, timeout = '02:00:00' }: ScriptSpec, opts: ActivityOptions = {}): Activity =>
    activity('Script', name, { scripts, scriptBlockExecutionTimeout: timeout }, { linkedService: store, policy: policy(), ...opts });
