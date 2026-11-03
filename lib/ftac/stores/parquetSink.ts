import type { Dataset } from '../types.ts';

export type ParquetSinkSpec = { dataset: Dataset };

/** A Copy sink that writes a Parquet file, keeping the source column types. */
export const parquetSink = ({ dataset }: ParquetSinkSpec) => ({
    type: 'ParquetSink',
    storeSettings: { type: 'LakehouseWriteSettings', copyBehavior: 'FlattenHierarchy' },
    formatSettings: { type: 'ParquetWriteSettings' },
    datasetSettings: dataset,
});
