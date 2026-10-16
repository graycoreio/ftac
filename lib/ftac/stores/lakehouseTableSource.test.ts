import { expect, it } from 'vitest';
import { lakehouseTable } from './lakehouseTable.ts';
import { lakehouseTableSource } from './lakehouseTableSource.ts';
import { lakehouseTables } from './lakehouseTables.ts';

it('wraps a dataset as a source', () => {
    const d = lakehouseTable({ store: lakehouseTables('brz_lakehouse'), schema: 'S', table: 'T' });
    expect(lakehouseTableSource(d)).toEqual({ type: 'LakehouseTableSource', datasetSettings: d });
});
