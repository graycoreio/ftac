import type { Activity } from '../types.ts';
import type { DecompileArgs, DecompiledBody } from './actions/types.ts';
import { decompileCondition } from './decompileCondition.ts';
import { isSlot } from './decompileSlot.ts';

/** An IfCondition with no else branch as an `if:` group: the inverse of compileStep's if:. */
export function decompileIfGroup({ activity: { type, typeProperties: tp }, steps }: DecompileArgs): DecompiledBody | undefined {
    if (type !== 'IfCondition' || !isSlot(tp.expression) || !tp.expression.value.startsWith('@')) return undefined;
    if (!Array.isArray(tp.ifTrueActivities) || !Array.isArray(tp.ifFalseActivities)) return undefined;
    if (tp.ifFalseActivities.length) throw new Error('it has an else branch, which an if: group cannot hold');
    const condition = decompileCondition(tp.expression.value.slice(1));
    return condition === undefined ? undefined : { if: condition, steps: steps(tp.ifTrueActivities as Activity[]) };
}
