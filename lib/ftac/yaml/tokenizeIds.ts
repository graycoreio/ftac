import { token } from '../stores/token.ts';

/** Token name to the GUID it stands for, as in the fabric provider's tokens map. */
export type Tokens = Record<string, string>;

export const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** The token name for each GUID, lower-cased. Throws when two names share a GUID, since either could be meant. */
function names(tokens: Tokens): Map<string, string> {
    const byGuid = new Map<string, string>();
    for (const [name, guid] of Object.entries(tokens)) {
        const key = guid.toLowerCase();
        const other = byGuid.get(key);
        if (other !== undefined) throw new Error(`${other} and ${name} are both ${guid}`);
        byGuid.set(key, name);
    }
    return byGuid;
}

/**
 * A definition with every string that is exactly a GUID in `tokens` replaced
 * by its token: the inverse of the fabric provider resolving tokens at apply
 * time. GUIDs inside longer strings, such as SQL, are left alone. `count` is
 * how many strings were replaced.
 */
export function tokenizeIds<T>(definition: T, tokens: Tokens): { definition: T; count: number } {
    const byGuid = names(tokens);
    let count = 0;
    const walk = (v: unknown): unknown => {
        if (typeof v === 'string') {
            const name = byGuid.get(v.toLowerCase());
            if (name === undefined) return v;
            count++;
            return token(name);
        }
        if (Array.isArray(v)) return v.map(walk);
        if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
        return v;
    };
    return { definition: walk(definition) as T, count };
}
