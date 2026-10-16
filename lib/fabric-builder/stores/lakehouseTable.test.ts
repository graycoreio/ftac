import { expect, it } from 'vitest';
import { lakehouseTable } from './lakehouseTable.ts';
import { lakehouseTables } from './lakehouseTables.ts';

it('builds a lakehouse table dataset', () =>
    expect(lakehouseTable({ store: lakehouseTables('slv_lakehouse'), schema: 'Sales', table: 'orders' }).typeProperties).toEqual({
        schema: 'Sales',
        table: 'orders',
    }));
