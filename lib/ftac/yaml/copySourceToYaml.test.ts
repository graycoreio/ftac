import { expect, it } from 'vitest';
import { compileCopySource } from './compileCopySource.ts';
import { copySourceToYaml } from './copySourceToYaml.ts';
import type { Context } from './types.ts';

const empty = (): Context => ({ env: {}, datasets: {} });
const roundTrip = (src: object) => copySourceToYaml(compileCopySource(src, empty(), 'c'), empty());

it('reads a postgres query back, with sql() and a non-default timeout', () => {
    const src = { postgres: { connection: 'c0', query: 'SELECT 1\nWHERE d = ${{ sql(vars.d) }}', timeout: '01:00:00' } };
    expect(roundTrip(src)).toEqual(src);
});
it('reads a postgres table back', () => {
    const src = { postgres: { connection: 'c0', table: { schema: 'public', table: '${{ item.t }}' } } };
    expect(roundTrip(src)).toEqual(src);
});
it('reads a lakehouse table source back as a named dataset', () => {
    const ctx = empty();
    const json = compileCopySource({ table: 'x' }, { env: {}, datasets: { x: { table: { lakehouse: 'slv_lakehouse', schema: 'S', table: 'Orders' } } } }, 'c');
    expect(copySourceToYaml(json, ctx)).toEqual({ table: 'Orders' });
    expect(ctx.datasets).toEqual({ Orders: { table: { lakehouse: 'slv_lakehouse', schema: 'S', table: 'Orders' } } });
});
it('keeps any other source as raw', () => {
    const src = { type: 'SqlServerSource', sqlReaderQuery: 'SELECT 1' };
    expect(copySourceToYaml(src, empty())).toEqual({ raw: src });
});
