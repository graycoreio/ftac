import { expect, it } from 'vitest';
import { compileDataset } from './compileDataset.ts';
import { datasetToYaml } from './datasetToYaml.ts';
import type { YamlDataset } from './types.ts';

const roundTrip = (d: YamlDataset) => datasetToYaml(compileDataset('d', { env: {}, datasets: { d } }));

it('reads a csv back, writing only what differs from the defaults', () => {
    expect(roundTrip({ csv: { lakehouse: 'brz_lakehouse', folder: 'Sales/Orders', file: 'o.csv' } })).toEqual({ csv: { lakehouse: 'brz_lakehouse', folder: 'Sales/Orders', file: 'o.csv' } });
    const d: YamlDataset = { csv: { lakehouse: 'brz_lakehouse', folder: "${{ concat('a/', vars.p) }}", file: 'o.csv', delimiter: '|', header: false } };
    expect(roundTrip(d)).toEqual(d);
});
it('reads a table back, with an expression table name', () => {
    const d: YamlDataset = { table: { lakehouse: 'slv_lakehouse', schema: 'Sales', table: '${{ item.table_name }}' } };
    expect(roundTrip(d)).toEqual(d);
});
it('does not read a lakehouse behind a deployed GUID', () => {
    const json = compileDataset('d', { env: {}, datasets: { d: { table: { lakehouse: 'slv_lakehouse', schema: 'S', table: 'T' } } } });
    json.linkedService!.properties.typeProperties.artifactId = '8f3c2a1e-0000-4000-8000-000000000000';
    expect(datasetToYaml(json)).toBeUndefined();
});
it('does not read other dataset types', () => expect(datasetToYaml({ type: 'PostgreSqlTable', typeProperties: {} })).toBeUndefined());
