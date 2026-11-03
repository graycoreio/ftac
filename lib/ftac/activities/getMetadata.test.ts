import { expect, it } from 'vitest';
import { csvFile } from '../stores/csvFile.ts';
import { lakehouseFiles } from '../stores/lakehouseFiles.ts';
import { lakehouseTable } from '../stores/lakehouseTable.ts';
import { lakehouseTables } from '../stores/lakehouseTables.ts';
import { parquetFile } from '../stores/parquetFile.ts';
import { getMetadata } from './getMetadata.ts';

const store = lakehouseFiles('brz_lakehouse');
const storeSettings = { type: 'LakehouseReadSettings', recursive: true, enablePartitionDiscovery: false };

it('checks existence by default', () => {
    const d = csvFile({ store, folderPath: 'a', fileName: 'b' });
    const a = getMetadata('check', { dataset: d });
    expect(a.typeProperties.fieldList).toEqual(['exists']);
    expect(Object.keys(a.typeProperties)).toEqual(['fieldList', 'datasetSettings', 'storeSettings', 'formatSettings']);
});
it('reads a csv dataset as delimited text', () => {
    const d = csvFile({ store, folderPath: 'a', fileName: 'b' });
    expect(JSON.stringify(getMetadata('check', { dataset: d }).typeProperties)).toBe(
        JSON.stringify({ fieldList: ['exists'], datasetSettings: d, storeSettings, formatSettings: { type: 'DelimitedTextReadSettings' } })
    );
});
it('reads a parquet dataset as parquet', () => {
    const d = parquetFile({ store, folderPath: 'a', fileName: 'b.parquet' });
    const a = getMetadata('check', { dataset: d });
    expect(Object.keys(a.typeProperties)).toEqual(['fieldList', 'datasetSettings', 'storeSettings', 'formatSettings']);
    expect(a.typeProperties.formatSettings).toEqual({ type: 'ParquetReadSettings' });
});
it('omits format settings for a dataset that is not a file format', () => {
    const d = lakehouseTable({ store: lakehouseTables('slv_lakehouse'), schema: 'S', table: 'T' });
    expect(Object.keys(getMetadata('check', { dataset: d }).typeProperties)).toEqual(['fieldList', 'datasetSettings', 'storeSettings']);
});
