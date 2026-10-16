import type { Dataset, LinkedService, Slot } from '../types.ts';

export type LakehouseTableSpec = { store: LinkedService; schema: string | Slot; table: string | Slot };

/** A table in a lakehouse. */
export const lakehouseTable = ({ store, schema, table }: LakehouseTableSpec): Dataset => ({
    type: 'LakehouseTable',
    typeProperties: { schema, table },
    schema: [],
    linkedService: store,
    annotations: [],
});
