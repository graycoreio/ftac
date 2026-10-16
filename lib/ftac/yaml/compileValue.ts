import { fn } from '../expr/fn.ts';
import { str } from '../expr/str.ts';
import { compileExpression } from './compileExpression.ts';
import { isEnvText } from './isEnvText.ts';
import { splitTemplate } from './splitTemplate.ts';
import type { Context } from './types.ts';

/**
 * A YAML value as ADF expression source (for set-variable): a lone `${{ }}`
 * is its source, plain text is a string literal, a mix is a concat().
 */
export function compileValue(value: string, ctx: Context): string {
    const sources = splitTemplate(value).map((p) => {
        if (p.kind === 'text') return str(p.text);
        const macro = isEnvText(p.inner, ctx);
        if (macro !== undefined) return str(macro);
        const c = compileExpression(p.inner, ctx);
        if (c.sql) throw new Error('sql() is only valid inside text, such as a query');
        return c.source;
    });
    return sources.length === 1 ? sources[0] : fn.concat(...sources);
}
