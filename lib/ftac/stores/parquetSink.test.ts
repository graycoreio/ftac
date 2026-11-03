import { expect, it } from 'vitest';
import { lakehouseFiles } from './lakehouseFiles.ts';
import { parquetFile } from './parquetFile.ts';
import { parquetSink } from './parquetSink.ts';

it('writes a Parquet file in portal key order', () => {
    const d = parquetFile({ store: lakehouseFiles('brz_lakehouse'), folderPath: 'a', fileName: 'b.parquet' });
    const s = parquetSink({ dataset: d });
    expect(Object.keys(s)).toEqual(['type', 'storeSettings', 'formatSettings', 'datasetSettings']);
    expect(s).toEqual({
        type: 'ParquetSink',
        storeSettings: { type: 'LakehouseWriteSettings', copyBehavior: 'FlattenHierarchy' },
        formatSettings: { type: 'ParquetWriteSettings' },
        datasetSettings: d,
    });
});
