import type { Dataset } from '../types.ts';

/** A Copy source that reads a lakehouse table. */
export const lakehouseTableSource = (dataset: Dataset) => ({ type: 'LakehouseTableSource', datasetSettings: dataset });
