import { datasetToYaml } from './datasetToYaml.ts';
import { nameDataset } from './nameDataset.ts';
import type { Context } from './types.ts';

/**
 * A Copy sink as a `sink:` block: the inverse of compileCopySink, naming its
 * dataset in the context. Throws for one it doesn't recognise.
 */
export function copySinkToYaml(sink: unknown, ctx: Context): object {
    const s = sink as Record<string, any>;
    const d = datasetToYaml(s?.datasetSettings);
    if (s?.type === 'DelimitedTextSink' && d && 'csv' in d)
        return { csv: nameDataset(d, ctx), ...(s.formatSettings?.quoteAllText === false && { 'quote-all': false }) };
    if (s?.type === 'LakehouseTableSink' && d && 'table' in d)
        return { table: nameDataset(d, ctx), ...(s.tableActionOption !== 'OverwriteSchema' && { action: s.tableActionOption }) };
    throw new Error(`its ${s?.type ?? 'untyped'} sink is not a lakehouse CSV or table`);
}
