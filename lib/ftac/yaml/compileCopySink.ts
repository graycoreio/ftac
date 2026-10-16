import { csvSink } from '../stores/csvSink.ts';
import { lakehouseTableSink } from '../stores/lakehouseTableSink.ts';
import { compileDataset } from './compileDataset.ts';
import type { Context } from './types.ts';

type Sink = { csv?: string; 'quote-all'?: boolean; table?: string; action?: 'OverwriteSchema' | 'Overwrite' | 'Append'; raw?: object };

/** A Copy `sink:` block, naming a dataset. */
export function compileCopySink(sink: Sink, ctx: Context, id: string): object {
    if (sink.raw) return sink.raw;
    if (sink.csv) return csvSink({ dataset: compileDataset(sink.csv, ctx), quoteAll: sink['quote-all'] });
    if (sink.table) return lakehouseTableSink({ dataset: compileDataset(sink.table, ctx), action: sink.action });
    throw new Error(`${id}: sink must be csv, table, or raw`);
}
