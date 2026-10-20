import type { Part } from './types.ts';

/**
 * Split ADF text into literal text and `@{ }` interpolations, each
 * interpolation's inner being expression source. Braces inside string
 * literals don't count. Undefined when an interpolation is unterminated.
 */
export function splitInterpolations(value: string): Part[] | undefined {
    const parts: Part[] = [];
    let text = '';
    let i = 0;
    while (i < value.length) {
        if (value[i] !== '@' || value[i + 1] !== '{') {
            text += value[i++];
            continue;
        }
        let depth = 1;
        let j = i + 2;
        for (; depth; j++) {
            if (j >= value.length) return undefined;
            if (value[j] === "'") {
                j++;
                while (value[j] !== "'" || value[j + 1] === "'") {
                    if (j >= value.length) return undefined;
                    j += value[j] === "'" ? 2 : 1;
                }
            } else if (value[j] === '{') depth++;
            else if (value[j] === '}') depth--;
        }
        if (text) parts.push({ kind: 'text', text });
        text = '';
        parts.push({ kind: 'expr', inner: value.slice(i + 2, j - 1) });
        i = j;
    }
    if (text) parts.push({ kind: 'text', text });
    return parts;
}
