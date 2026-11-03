import type { Activity } from '../types.ts';
import type { ToYamlArgs, ToYamlBody } from './actions/types.ts';
import { conditionToYaml } from './conditionToYaml.ts';
import { isSlot } from './slotToYaml.ts';

/** An IfCondition with no else branch as an `if:` group: the inverse of compileStep's if:. */
export function ifGroupToYaml({ activity: { type, typeProperties: tp }, steps }: ToYamlArgs): ToYamlBody | undefined {
    if (type !== 'IfCondition' || !isSlot(tp.expression) || !tp.expression.value.startsWith('@')) return undefined;
    if (!Array.isArray(tp.ifTrueActivities) || !Array.isArray(tp.ifFalseActivities)) return undefined;
    if (tp.ifFalseActivities.length) throw new Error('it has an else branch, which an if: group cannot hold');
    const condition = conditionToYaml(tp.expression.value.slice(1));
    return condition === undefined ? undefined : { if: condition, steps: steps(tp.ifTrueActivities as Activity[]) };
}
