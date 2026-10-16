import type { SqlBindings } from '../types.ts';

/**
 * Bind $1.. placeholders. Every placeholder must be bound and every binding
 * used, so a renamed placeholder can't slip through.
 */
export function bind(sql: string, bindings: SqlBindings = {}): string {
    const unused = new Set(Object.keys(bindings));
    const out = sql.replace(/\$([1-9]\d*)\b/g, (m) => {
        const key = m as keyof SqlBindings;
        if (!(key in bindings)) throw new Error(`unbound placeholder ${m}`);
        unused.delete(m);
        return bindings[key];
    });
    if (unused.size) throw new Error(`binding never used: ${[...unused].join(', ')}`);
    return out;
}
