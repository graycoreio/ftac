import { readFileSync } from 'node:fs';
import type { SqlBindings } from '../types.ts';
import { assertNoExpression } from './assertNoExpression.ts';
import { bind } from './bind.ts';
import { stripHeader } from './stripHeader.ts';

/** Read a SQL file, strip its header, bind placeholders, and reject stray '@'. */
export function loadSql(path: string, bindings: SqlBindings = {}): string {
    const sql = bind(stripHeader(readFileSync(path, 'utf8')), bindings);
    assertNoExpression(sql, Object.values(bindings));
    return sql;
}
