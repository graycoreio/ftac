import { compileCondition } from './compileCondition.ts';
import { expressionToYaml } from './expressionToYaml.ts';

/** Expression source as an `if:` or items value, a lone `${{ }}`: the inverse of compileCondition. */
export function conditionToYaml(source: string): string | undefined {
    const inner = expressionToYaml(source);
    if (inner === undefined) return undefined;
    const yaml = `\${{ ${inner} }}`;
    try {
        return compileCondition(yaml, { env: {}, datasets: {} }) === source ? yaml : undefined;
    } catch {
        return undefined;
    }
}
