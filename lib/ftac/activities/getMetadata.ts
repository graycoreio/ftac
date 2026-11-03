import type { Activity, ActivityOptions, Dataset } from '../types.ts';
import { activity } from './activity.ts';
import { policy } from './policy.ts';

export type GetMetadataSpec = { dataset: Dataset; fields?: string[] };

const READ_SETTINGS: Record<string, string> = { DelimitedText: 'DelimitedTextReadSettings', Parquet: 'ParquetReadSettings' };
const formatSettings = (dataset: Dataset) => (READ_SETTINGS[dataset.type] ? { formatSettings: { type: READ_SETTINGS[dataset.type] } } : {});

/** Read file metadata (by default, whether a lakehouse file exists). */
export const getMetadata = (name: string, { dataset, fields = ['exists'] }: GetMetadataSpec, opts: ActivityOptions = {}): Activity =>
    activity(
        'GetMetadata',
        name,
        {
            fieldList: fields,
            datasetSettings: dataset,
            storeSettings: { type: 'LakehouseReadSettings', recursive: true, enablePartitionDiscovery: false },
            ...formatSettings(dataset),
        },
        { policy: policy(), ...opts }
    );
