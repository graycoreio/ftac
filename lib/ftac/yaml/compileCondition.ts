import { compileExpression } from './compileExpression.ts';
import { splitTemplate } from './splitTemplate.ts';
import type { Context } from './types.ts';

/** An `if:` value: must be exactly one `${{ }}`. */
export function compileCondition(value: string, ctx: Context): string {
    const parts = splitTemplate(value);
    if (parts.length !== 1 || parts[0].kind !== 'expr') throw new Error(`if: must be a single \${{ }} expression, got: ${value}`);
    const c = compileExpression(parts[0].inner, ctx);
    if (c.sql) throw new Error('sql() is not valid in a condition');
    return c.source;
}
