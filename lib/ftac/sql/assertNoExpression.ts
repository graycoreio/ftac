/** Any '@' outside the allowed fragments would be read as expression syntax. */
export function assertNoExpression(sql: string, allowed: string[] = []): void {
    const rest = allowed.reduce((q, a) => q.replaceAll(a, ''), sql);
    const at = rest.indexOf('@');
    if (at !== -1)
        throw new Error(`stray '@' would be parsed as an ADF expression near: ${rest.slice(Math.max(0, at - 20), at + 40)}`);
}
