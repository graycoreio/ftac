import { expect, it } from 'vitest';
import { lakehouseTable } from './lakehouseTable.ts';
import { lakehouseTables } from './lakehouseTables.ts';

it('builds a lakehouse table dataset', () =>
    expect(lakehouseTable({ store: lakehouseTables('slv_lakehouse'), schema: 'ESG', table: 'account' }).typeProperties).toEqual({
        schema: 'ESG',
        table: 'account',
    }));
