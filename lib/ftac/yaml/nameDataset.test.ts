import { expect, it } from 'vitest';
import { nameDataset } from './nameDataset.ts';
import type { Context } from './types.ts';

const csv = (file: string, folder = 'f') => ({ csv: { lakehouse: 'brz_lakehouse', folder, file } });
const table = (t: string) => ({ table: { lakehouse: 'slv_lakehouse', schema: 'S', table: t } });

it('names a dataset after its file or table and adds it', () => {
    const ctx: Context = { env: {}, datasets: {} };
    expect(nameDataset(csv('orders.csv'), ctx)).toBe('orders');
    expect(nameDataset(table('Order Lines'), ctx)).toBe('Order_Lines');
    expect(Object.keys(ctx.datasets)).toEqual(['orders', 'Order_Lines']);
});
it('reuses an identical entry, whatever it is called', () => {
    const ctx: Context = { env: {}, datasets: { out: csv('orders.csv') } };
    expect(nameDataset(csv('orders.csv'), ctx)).toBe('out');
    expect(Object.keys(ctx.datasets)).toEqual(['out']);
});
it('suffixes a name a different dataset holds', () => {
    const ctx: Context = { env: {}, datasets: {} };
    nameDataset(csv('orders.csv', 'a'), ctx);
    expect(nameDataset(csv('orders.csv', 'b'), ctx)).toBe('orders_2');
    expect(nameDataset(csv('orders.csv', 'c'), ctx)).toBe('orders_3');
});
it('falls back to the lakehouse when the name is an expression', () =>
    expect(nameDataset(table('${{ item.table_name }}'), { env: {}, datasets: {} })).toBe('slv_lakehouse_table'));
