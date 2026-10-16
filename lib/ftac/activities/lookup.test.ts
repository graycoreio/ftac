import { expect, it } from 'vitest';
import { lakehouseTable } from '../stores/lakehouseTable.ts';
import { lakehouseTables } from '../stores/lakehouseTables.ts';
import { lookup } from './lookup.ts';

it('returns all rows by default', () => {
    const d = lakehouseTable({ store: lakehouseTables('brz_lakehouse'), schema: 'S', table: 'T' });
    expect(lookup('l', { source: { type: 'LakehouseTableSource' }, dataset: d }).typeProperties).toEqual({
        source: { type: 'LakehouseTableSource' },
        datasetSettings: d,
        firstRowOnly: false,
    });
});
