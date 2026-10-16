import { expect, it } from 'vitest';
import { csvFile } from '../stores/csvFile.ts';
import { lakehouseFiles } from '../stores/lakehouseFiles.ts';
import { getMetadata } from './getMetadata.ts';

it('checks existence by default', () => {
    const d = csvFile({ store: lakehouseFiles('brz_lakehouse'), folderPath: 'a', fileName: 'b' });
    const a = getMetadata('check', { dataset: d });
    expect(a.typeProperties.fieldList).toEqual(['exists']);
    expect(Object.keys(a.typeProperties)).toEqual(['fieldList', 'datasetSettings', 'storeSettings', 'formatSettings']);
});
