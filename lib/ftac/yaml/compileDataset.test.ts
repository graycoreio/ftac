import { expect, it } from 'vitest';
import { compileDataset } from './compileDataset.ts';

const ctx = {
    env: { P: '${{ vars.p }}' },
    datasets: {
        f: { csv: { lakehouse: 'brz_lakehouse', folder: "${{ concat('a/', env.P) }}", file: 'x.csv' } },
        p: { parquet: { lakehouse: 'brz_lakehouse', folder: "${{ concat('a/', env.P) }}", file: 'x.parquet' } },
        z: { parquet: { lakehouse: 'brz_lakehouse', folder: 'a', file: 'x.parquet', compression: 'none' as const } },
        t: { table: { lakehouse: 'slv_lakehouse', schema: 'Sales', table: 'orders' } },
    },
};

it('builds a csv dataset with expression and plain paths', () => {
    const d = compileDataset('f', ctx);
    expect(d.type).toBe('DelimitedText');
    expect(d.linkedService?.properties.typeProperties.artifactId).toBe('{{ .brz_lakehouse_id }}');
    expect((d.typeProperties.location as any).folderPath).toEqual({ value: "@concat('a/', variables('p'))", type: 'Expression' });
    expect((d.typeProperties.location as any).fileName).toBe('x.csv');
});
it('builds a snappy parquet dataset with expression and plain paths', () => {
    const d = compileDataset('p', ctx);
    expect(d.type).toBe('Parquet');
    expect(d.linkedService?.properties.typeProperties.artifactId).toBe('{{ .brz_lakehouse_id }}');
    expect((d.typeProperties.location as any).folderPath).toEqual({ value: "@concat('a/', variables('p'))", type: 'Expression' });
    expect((d.typeProperties.location as any).fileName).toBe('x.parquet');
    expect(d.typeProperties.compressionCodec).toBe('snappy');
});
it('passes a parquet compression through', () => expect(compileDataset('z', ctx).typeProperties.compressionCodec).toBe('none'));
it('builds a table dataset', () => expect(compileDataset('t', ctx).typeProperties).toEqual({ schema: 'Sales', table: 'orders' }));
it('rejects an unknown dataset', () => expect(() => compileDataset('nope', ctx)).toThrow(/not defined/));
it('names every dataset kind when the shape is unknown', () =>
    expect(() => compileDataset('bad', { ...ctx, datasets: { bad: {} as any } })).toThrow("dataset 'bad' must be csv, parquet or table"));
