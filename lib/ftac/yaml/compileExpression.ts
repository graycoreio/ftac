import { sqlLiteral } from '../expr/sqlLiteral.ts';
import { rewriteRefs } from './rewriteRefs.ts';
import type { Context } from './types.ts';

export type Compiled = { source: string; sql: boolean };

/**
 * The inside of one `${{ }}` as ADF source. `sql(x)` is a special form:
 * x spliced into SQL text as an escaped, quoted literal.
 */
export function compileExpression(inner: string, ctx: Context): Compiled {
    const sql = /^sql\((.*)\)$/s.exec(inner.trim());
    if (sql) return { source: sqlLiteral(rewriteRefs(sql[1].trim(), ctx)), sql: true };
    return { source: rewriteRefs(inner.trim(), ctx), sql: false };
}
