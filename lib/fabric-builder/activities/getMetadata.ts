import type { Activity, ActivityOptions, Dataset } from '../types.ts';
import { activity } from './activity.ts';
import { policy } from './policy.ts';

export type GetMetadataSpec = { dataset: Dataset; fields?: string[] };

/** Read file metadata (by default, whether a lakehouse file exists). */
export const getMetadata = (name: string, { dataset, fields = ['exists'] }: GetMetadataSpec, opts: ActivityOptions = {}): Activity =>
    activity(
        'GetMetadata',
        name,
        {
            fieldList: fields,
            datasetSettings: dataset,
            storeSettings: { type: 'LakehouseReadSettings', recursive: true, enablePartitionDiscovery: false },
            formatSettings: { type: 'DelimitedTextReadSettings' },
        },
        { policy: policy(), ...opts }
    );
