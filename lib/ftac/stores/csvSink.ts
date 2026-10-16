import type { Dataset } from '../types.ts';

export type CsvSinkSpec = { dataset: Dataset; quoteAll?: boolean };

/** A Copy sink that writes a delimited file. quoteAll keeps leading zeros for consumers that honour quoting. */
export const csvSink = ({ dataset, quoteAll = true }: CsvSinkSpec) => ({
    type: 'DelimitedTextSink',
    storeSettings: { type: 'LakehouseWriteSettings', copyBehavior: 'FlattenHierarchy' },
    formatSettings: { type: 'DelimitedTextWriteSettings', fileExtension: '.csv', quoteAllText: quoteAll },
    datasetSettings: dataset,
});
