import { expect, it } from 'vitest';
import { lakehouseFiles } from './lakehouseFiles.ts';
import { parquetFile } from './parquetFile.ts';

it('builds a snappy Parquet dataset', () => {
    const d = parquetFile({ store: lakehouseFiles('brz_lakehouse'), folderPath: 'a', fileName: 'b.parquet' });
    expect(Object.keys(d)).toEqual(['type', 'typeProperties', 'schema', 'linkedService', 'annotations']);
    expect(d.type).toBe('Parquet');
    expect(d.typeProperties).toEqual({
        location: { type: 'LakehouseLocation', folderPath: 'a', fileName: 'b.parquet' },
        compressionCodec: 'snappy',
    });
});
it('takes another compression codec', () => {
    const d = parquetFile({ store: lakehouseFiles('brz_lakehouse'), folderPath: 'a', fileName: 'b', compression: 'gzip' });
    expect(d.typeProperties.compressionCodec).toBe('gzip');
});
