import type { Segment } from './types.ts';

/**
 * Split ADF expression source into code and single-quoted string literals,
 * so reference rewriting never touches the inside of a literal.
 */
export function tokenizeExpression(source: string): Segment[] {
    const out: Segment[] = [];
    let code = '';
    let i = 0;
    while (i < source.length) {
        if (source[i] !== "'") {
            code += source[i++];
            continue;
        }
        if (code) out.push({ kind: 'code', text: code });
        code = '';
        let lit = "'";
        let j = i + 1;
        let closed = false;
        while (j < source.length) {
            if (source[j] === "'" && source[j + 1] === "'") {
                lit += "''";
                j += 2;
            } else if (source[j] === "'") {
                lit += "'";
                j++;
                closed = true;
                break;
            } else lit += source[j++];
        }
        if (!closed) throw new Error(`unterminated string literal in expression: ${source}`);
        out.push({ kind: 'literal', text: lit });
        i = j;
    }
    if (code) out.push({ kind: 'code', text: code });
    return out;
}
