import type { Dataset, LinkedService, Slot } from '../types.ts';

export type CsvFileSpec = {
    store: LinkedService;
    folderPath: string | Slot;
    fileName: string | Slot;
    delimiter?: string;
    header?: boolean;
};

/** A delimited file under a lakehouse's Files. */
export const csvFile = ({ store, folderPath, fileName, delimiter = ',', header = true }: CsvFileSpec): Dataset => ({
    type: 'DelimitedText',
    typeProperties: {
        location: { type: 'LakehouseLocation', folderPath, fileName },
        columnDelimiter: delimiter,
        escapeChar: '"',
        firstRowAsHeader: header,
        quoteChar: '"',
    },
    schema: [],
    linkedService: store,
    annotations: [],
});
