import { expect, it } from 'vitest';
import { csvFile } from './csvFile.ts';
import { lakehouseFiles } from './lakehouseFiles.ts';

it('builds a quoted, headed CSV dataset', () => {
    const d = csvFile({ store: lakehouseFiles('brz_lakehouse'), folderPath: 'a', fileName: 'b.csv' });
    expect(Object.keys(d)).toEqual(['type', 'typeProperties', 'schema', 'linkedService', 'annotations']);
    expect(d.typeProperties).toEqual({
        location: { type: 'LakehouseLocation', folderPath: 'a', fileName: 'b.csv' },
        columnDelimiter: ',',
        escapeChar: '"',
        firstRowAsHeader: true,
        quoteChar: '"',
    });
});
