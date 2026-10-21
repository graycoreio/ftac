import { datasetToYaml } from './datasetToYaml.ts';
import { pathToYaml } from './pathToYaml.ts';
import { slotToYaml } from './slotToYaml.ts';
import { nameDataset } from './nameDataset.ts';
import type { Context } from './types.ts';

/** The Postgres connection id behind a source's dataset, when it is plain text. */
function connection(src: Record<string, any>): string | undefined {
    const d = src.datasetSettings;
    const c = d?.type === 'PostgreSqlTable' ? d.externalReferences?.connection : undefined;
    return typeof c === 'string' && !c.includes('${{') ? c : undefined;
}

/**
 * A Copy source as a `source:` block: the inverse of compileCopySource.
 * One it doesn't recognise is kept as `raw:`, so the Copy itself still
 * reads as fabric/copy. Lakehouse table datasets are named in the context.
 */
export function copySourceToYaml(source: unknown, ctx: Context): object {
    const src = source as Record<string, any>;
    if (src?.type === 'PostgreSqlSource') {
        const conn = connection(src);
        if (conn !== undefined && src.query !== undefined) {
            const query = slotToYaml(src.query);
            if (query !== undefined)
                return { postgres: { connection: conn, query, ...(src.queryTimeout !== '00:30:00' && { timeout: src.queryTimeout }) } };
        }
        if (conn !== undefined && src.query === undefined) {
            const tp = src.datasetSettings.typeProperties ?? {};
            const schema = pathToYaml(tp.schema);
            const table = pathToYaml(tp.table);
            if (schema !== undefined && table !== undefined)
                return { postgres: { connection: conn, table: { schema, table }, ...(src.queryTimeout !== '02:00:00' && { timeout: src.queryTimeout }) } };
        }
    }
    if (src?.type === 'LakehouseTableSource') {
        const d = datasetToYaml(src.datasetSettings);
        if (d && 'table' in d) return { table: nameDataset(d, ctx) };
    }
    return { raw: source };
}
