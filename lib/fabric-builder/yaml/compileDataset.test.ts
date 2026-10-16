import { expect, it } from 'vitest';
import { compileDataset } from './compileDataset.ts';

const ctx = {
    env: { P: '${{ vars.p }}' },
    datasets: {
        f: { csv: { lakehouse: 'brz_lakehouse', folder: "${{ concat('a/', env.P) }}", file: 'x.csv' } },
        t: { table: { lakehouse: 'slv_lakehouse', schema: 'ESG', table: 'account' } },
    },
};

it('builds a csv dataset with expression and plain paths', () => {
    const d = compileDataset('f', ctx);
    expect(d.type).toBe('DelimitedText');
    expect(d.linkedService?.properties.typeProperties.artifactId).toBe('{{ .brz_lakehouse_id }}');
    expect((d.typeProperties.location as any).folderPath).toEqual({ value: "@concat('a/', variables('p'))", type: 'Expression' });
    expect((d.typeProperties.location as any).fileName).toBe('x.csv');
});
it('builds a table dataset', () => expect(compileDataset('t', ctx).typeProperties).toEqual({ schema: 'ESG', table: 'account' }));
it('rejects an unknown dataset', () => expect(() => compileDataset('nope', ctx)).toThrow(/not defined/));
