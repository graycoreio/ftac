import type { Dataset, LinkedService, Slot } from '../types.ts';

export type ParquetCompression = 'snappy' | 'gzip' | 'none';

export type ParquetFileSpec = {
    store: LinkedService;
    folderPath: string | Slot;
    fileName: string | Slot;
    compression?: ParquetCompression;
};

/** A Parquet file under a lakehouse's Files. Unlike CSV, it keeps column types. */
export const parquetFile = ({ store, folderPath, fileName, compression = 'snappy' }: ParquetFileSpec): Dataset => ({
    type: 'Parquet',
    typeProperties: {
        location: { type: 'LakehouseLocation', folderPath, fileName },
        compressionCodec: compression,
    },
    schema: [],
    linkedService: store,
    annotations: [],
});
