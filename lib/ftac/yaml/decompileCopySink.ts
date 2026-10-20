import { decompileDataset } from './decompileDataset.ts';
import { nameDataset } from './nameDataset.ts';
import type { Context } from './types.ts';

/**
 * A Copy sink as a `sink:` block: the inverse of compileCopySink, naming its
 * dataset in the context. One it doesn't recognise is kept as `raw:`.
 */
export function decompileCopySink(sink: unknown, ctx: Context): object {
    const s = sink as Record<string, any>;
    const d = decompileDataset(s?.datasetSettings);
    if (s?.type === 'DelimitedTextSink' && d && 'csv' in d)
        return { csv: nameDataset(d, ctx), ...(s.formatSettings?.quoteAllText === false && { 'quote-all': false }) };
    if (s?.type === 'LakehouseTableSink' && d && 'table' in d)
        return { table: nameDataset(d, ctx), ...(s.tableActionOption !== 'OverwriteSchema' && { action: s.tableActionOption }) };
    return { raw: sink };
}
