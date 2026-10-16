import type { Dataset } from '../types.ts';

export type LakehouseTableSinkSpec = { dataset: Dataset; action?: 'OverwriteSchema' | 'Overwrite' | 'Append' };

/** A Copy sink that writes a lakehouse table. */
export const lakehouseTableSink = ({ dataset, action = 'OverwriteSchema' }: LakehouseTableSinkSpec) => ({
    type: 'LakehouseTableSink',
    tableActionOption: action,
    partitionOption: 'None',
    datasetSettings: dataset,
});
