import type { Activity, ActivityOptions, Dataset } from '../types.ts';
import { activity } from './activity.ts';
import { policy } from './policy.ts';

export type LookupSpec = { source: object; dataset: Dataset; firstRowOnly?: boolean };

/** Read rows into the activity output for later expressions. */
export const lookup = (name: string, { source, dataset, firstRowOnly = false }: LookupSpec, opts: ActivityOptions = {}): Activity =>
    activity('Lookup', name, { source, datasetSettings: dataset, firstRowOnly }, { policy: policy(), ...opts });
