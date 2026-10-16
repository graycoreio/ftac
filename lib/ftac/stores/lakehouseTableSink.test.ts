import { expect, it } from 'vitest';
import { lakehouseTable } from './lakehouseTable.ts';
import { lakehouseTableSink } from './lakehouseTableSink.ts';
import { lakehouseTables } from './lakehouseTables.ts';

it('overwrites schema by default', () => {
    const d = lakehouseTable({ store: lakehouseTables('slv_lakehouse'), schema: 'S', table: 'T' });
    expect(lakehouseTableSink({ dataset: d }).tableActionOption).toBe('OverwriteSchema');
});
