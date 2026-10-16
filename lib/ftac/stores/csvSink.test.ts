import { expect, it } from 'vitest';
import { csvFile } from './csvFile.ts';
import { csvSink } from './csvSink.ts';
import { lakehouseFiles } from './lakehouseFiles.ts';

it('quotes all text by default', () => {
    const d = csvFile({ store: lakehouseFiles('brz_lakehouse'), folderPath: 'a', fileName: 'b' });
    expect(csvSink({ dataset: d }).formatSettings.quoteAllText).toBe(true);
    expect(csvSink({ dataset: d, quoteAll: false }).formatSettings.quoteAllText).toBe(false);
});
