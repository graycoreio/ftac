import type { Dataset } from '../types.ts';

export type LakehouseTableSinkSpec = { dataset: Dataset; action?: 'OverwriteSchema' | 'Overwrite' | 'Append'; partition?: boolean };

/** A Copy sink that writes a lakehouse table. partition: false leaves out partitionOption, which Fabric then takes as None. */
export const lakehouseTableSink = ({ dataset, action = 'OverwriteSchema', partition = true }: LakehouseTableSinkSpec) => ({
    type: 'LakehouseTableSink',
    tableActionOption: action,
    ...(partition && { partitionOption: 'None' }),
    datasetSettings: dataset,
});
