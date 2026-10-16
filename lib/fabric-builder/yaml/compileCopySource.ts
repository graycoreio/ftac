import { lakehouseTableSource } from '../stores/lakehouseTableSource.ts';
import { postgresQuery } from '../stores/postgresQuery.ts';
import { postgresTable } from '../stores/postgresTable.ts';
import { compileDataset } from './compileDataset.ts';
import { compilePath } from './compilePath.ts';
import { compileSlot } from './compileSlot.ts';
import { compileText } from './compileText.ts';
import type { Context } from './types.ts';

type Postgres = { connection: string; query?: string; table?: { schema: string; table: string }; timeout?: string };
type Source = { postgres?: Postgres; table?: string; raw?: object };

/** A Copy `source:` block. */
export function compileCopySource(src: Source, ctx: Context, id: string): object {
    if (src.raw) return src.raw;
    if (src.postgres) {
        const connection = compileText(src.postgres.connection, ctx, `${id}.source.postgres.connection`);
        if (src.postgres.query !== undefined) {
            const q = compileSlot(src.postgres.query.trim().replace(/;$/, ''), ctx);
            return postgresQuery({ connection, query: q.value, timeout: src.postgres.timeout });
        }
        if (src.postgres.table)
            return postgresTable({
                connection,
                schema: compilePath(src.postgres.table.schema, ctx),
                table: compilePath(src.postgres.table.table, ctx),
                timeout: src.postgres.timeout,
            });
        throw new Error(`${id}: postgres source needs query or table`);
    }
    if (src.table) return lakehouseTableSource(compileDataset(src.table, ctx));
    throw new Error(`${id}: source must be postgres, table, or raw`);
}
