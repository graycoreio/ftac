import type { Part } from './types.ts';

/** Split a YAML value into text and `${{ ... }}` parts. */
export function splitTemplate(value: string): Part[] {
    const parts: Part[] = [];
    const re = /\$\{\{(.*?)\}\}/gs;
    let last = 0;
    for (const m of value.matchAll(re)) {
        if (m.index > last) parts.push({ kind: 'text', text: value.slice(last, m.index) });
        parts.push({ kind: 'expr', inner: m[1].trim() });
        last = m.index + m[0].length;
    }
    if (last < value.length) parts.push({ kind: 'text', text: value.slice(last) });
    if (value.includes('${{') && !parts.some((p) => p.kind === 'expr'))
        throw new Error(`unterminated \${{ in: ${value}`);
    return parts;
}
