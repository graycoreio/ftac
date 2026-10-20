import { decompileExpression } from './decompileExpression.ts';
import { splitInterpolations } from './splitInterpolations.ts';

const SQL = /^replace\((.*), '''', ''''''\)$/s;

/**
 * ADF text with `@{ }` interpolations as YAML text with `${{ }}` in it. An
 * interpolation quoted the way sqlLiteral quotes one becomes sql(). The
 * result isn't checked; callers compile it back.
 */
export function decompileTemplate(value: string): string | undefined {
    const parts = splitInterpolations(value);
    if (!parts) return undefined;
    let out = '';
    for (let k = 0; k < parts.length; k++) {
        const p = parts[k];
        if (p.kind === 'text') {
            out += p.text;
            continue;
        }
        const next = parts[k + 1];
        const sql = SQL.exec(p.inner);
        if (sql && out.endsWith("'") && next?.kind === 'text' && next.text.startsWith("'")) {
            const inner = decompileExpression(sql[1]);
            if (inner === undefined) return undefined;
            out = `${out.slice(0, -1)}\${{ sql(${inner}) }}`;
            parts[k + 1] = { kind: 'text', text: next.text.slice(1) };
            continue;
        }
        const inner = decompileExpression(p.inner);
        if (inner === undefined) return undefined;
        out += `\${{ ${inner} }}`;
    }
    return out;
}
