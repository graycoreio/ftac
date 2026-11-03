import { expect, it } from 'vitest';
import { compileCopySink } from './compileCopySink.ts';

const ctx = {
    env: {},
    datasets: {
        f: { csv: { lakehouse: 'brz_lakehouse', folder: 'a', file: 'b.csv' } },
        p: { parquet: { lakehouse: 'brz_lakehouse', folder: 'a', file: 'b.parquet' } },
        t: { table: { lakehouse: 'slv_lakehouse', schema: 'S', table: 'T' } },
    },
};

it('compiles a csv sink, quoting all by default', () => {
    const s = compileCopySink({ csv: 'f' }, ctx, 'c') as any;
    expect(s.type).toBe('DelimitedTextSink');
    expect(s.formatSettings.quoteAllText).toBe(true);
});
it('compiles a parquet sink', () => {
    const s = compileCopySink({ parquet: 'p' }, ctx, 'c') as any;
    expect(s.type).toBe('ParquetSink');
    expect(s.formatSettings).toEqual({ type: 'ParquetWriteSettings' });
    expect(s.datasetSettings.type).toBe('Parquet');
});
it('compiles a table sink with an action', () => expect((compileCopySink({ table: 't', action: 'Append' }, ctx, 'c') as any).tableActionOption).toBe('Append'));
it('rejects an empty sink', () => expect(() => compileCopySink({}, ctx, 'c')).toThrow('c: sink must be csv, parquet, table, or raw'));
