import { csvFile } from '../stores/csvFile.ts';
import { lakehouseFiles } from '../stores/lakehouseFiles.ts';
import { lakehouseTable } from '../stores/lakehouseTable.ts';
import { lakehouseTables } from '../stores/lakehouseTables.ts';
import type { Dataset } from '../types.ts';
import { compilePath } from './compilePath.ts';
import { compileText } from './compileText.ts';
import type { Context } from './types.ts';

/** A named dataset from the `datasets:` map. */
export function compileDataset(name: string, ctx: Context): Dataset {
    const d = ctx.datasets[name];
    if (!d) throw new Error(`dataset '${name}' is not defined`);
    if ('csv' in d)
        return csvFile({
            store: lakehouseFiles(compileText(d.csv.lakehouse, ctx, `${name}.csv.lakehouse`)),
            folderPath: compilePath(d.csv.folder, ctx),
            fileName: compilePath(d.csv.file, ctx),
            delimiter: d.csv.delimiter,
            header: d.csv.header,
        });
    if ('table' in d)
        return lakehouseTable({ store: lakehouseTables(compileText(d.table.lakehouse, ctx, `${name}.table.lakehouse`)), schema: compilePath(d.table.schema, ctx), table: compilePath(d.table.table, ctx) });
    throw new Error(`dataset '${name}' must be csv or table`);
}
