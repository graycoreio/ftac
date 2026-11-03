import { refsToYaml } from './refsToYaml.ts';
import { rewriteRefs } from './rewriteRefs.ts';

/**
 * ADF expression source as the inside of a `${{ }}`: the inverse of
 * compileExpression, sql() aside. Undefined when no `${{ }}` compiles back
 * to exactly the source: a `}}` would end the template early, padding would
 * be trimmed, and a leading sql( would be taken as the special form. Source
 * starting with '@' is the tail of an @@ escape, text rather than an expression.
 */
export function expressionToYaml(source: string): string | undefined {
    const inner = refsToYaml(source);
    if (!inner || inner !== inner.trim() || inner.startsWith('@') || inner.includes('}}') || inner.includes('${{') || /^sql\(/.test(inner)) return undefined;
    try {
        return rewriteRefs(inner, { env: {}, datasets: {} }) === source ? inner : undefined;
    } catch {
        return undefined;
    }
}
