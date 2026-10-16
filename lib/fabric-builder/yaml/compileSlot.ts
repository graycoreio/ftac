import { expr } from '../expr/expr.ts';
import { text } from '../expr/text.ts';
import type { Slot } from '../types.ts';
import { compileExpression } from './compileExpression.ts';
import { isEnvText } from './isEnvText.ts';
import { splitTemplate } from './splitTemplate.ts';
import type { Context } from './types.ts';

/**
 * A YAML value as a definition slot: a lone `${{ }}` is evaluated, plain
 * text is text, and a mix is text with `@{ }` interpolations.
 */
export function compileSlot(value: string, ctx: Context): Slot {
    const parts = splitTemplate(value);
    if (parts.length === 1 && parts[0].kind === 'expr') {
        const macro = isEnvText(parts[0].inner, ctx);
        if (macro !== undefined) return text(macro);
        const c = compileExpression(parts[0].inner, ctx);
        if (c.sql) throw new Error('sql() is only valid inside text, such as a query');
        return expr(c.source);
    }
    return text(
        parts
            .map((p) => {
                if (p.kind === 'text') return p.text;
                const macro = isEnvText(p.inner, ctx);
                if (macro !== undefined) return macro;
                const c = compileExpression(p.inner, ctx);
                return c.sql ? c.source : `@{${c.source}}`;
            })
            .join('')
    );
}
