import { expect, it } from 'vitest';
import { compileCopySink } from './compileCopySink.ts';
import { decompileCopySink } from './decompileCopySink.ts';
import type { Context } from './types.ts';

const datasets = { f: { csv: { lakehouse: 'brz_lakehouse', folder: 'a', file: 'out.csv' } }, t: { table: { lakehouse: 'slv_lakehouse', schema: 'S', table: 'T' } } };
const read = (sink: object) => {
    const ctx: Context = { env: {}, datasets: {} };
    return { sink: decompileCopySink(compileCopySink(sink, { env: {}, datasets }, 'c'), ctx), datasets: ctx.datasets };
};

it('reads a csv sink back, quote-all only when off', () => {
    expect(read({ csv: 'f' })).toEqual({ sink: { csv: 'out' }, datasets: { out: datasets.f } });
    expect(read({ csv: 'f', 'quote-all': false }).sink).toEqual({ csv: 'out', 'quote-all': false });
});
it('reads a table sink back, action only when not the default', () => {
    expect(read({ table: 't' }).sink).toEqual({ table: 'T' });
    expect(read({ table: 't', action: 'Append' }).sink).toEqual({ table: 'T', action: 'Append' });
});
it('keeps any other sink as raw, naming no dataset', () => {
    const sink = { type: 'ParquetSink' };
    expect(read({ raw: sink })).toEqual({ sink: { raw: sink }, datasets: {} });
});
