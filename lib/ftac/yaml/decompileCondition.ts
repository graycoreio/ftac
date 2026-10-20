import { compileCondition } from './compileCondition.ts';
import { decompileExpression } from './decompileExpression.ts';

/** Expression source as an `if:` or items value, a lone `${{ }}`: the inverse of compileCondition. */
export function decompileCondition(source: string): string | undefined {
    const inner = decompileExpression(source);
    if (inner === undefined) return undefined;
    const yaml = `\${{ ${inner} }}`;
    try {
        return compileCondition(yaml, { env: {}, datasets: {} }) === source ? yaml : undefined;
    } catch {
        return undefined;
    }
}
