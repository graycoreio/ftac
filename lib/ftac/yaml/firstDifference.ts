/**
 * Where two JSON values first differ, as a dotted path ('' is the root), or
 * undefined when they are the same. Key order is ignored, and a key set to
 * undefined is the same as a missing one, as JSON.stringify sees them.
 */
export function firstDifference(a: unknown, b: unknown, path = ''): string | undefined {
    if (a === b) return undefined;
    if (a && b && typeof a === 'object' && typeof b === 'object' && Array.isArray(a) === Array.isArray(b)) {
        const x = a as Record<string, unknown>;
        const y = b as Record<string, unknown>;
        for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
            const d = firstDifference(x[k], y[k], path ? `${path}.${k}` : k);
            if (d !== undefined) return d;
        }
        return undefined;
    }
    return path;
}
