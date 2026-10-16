import { expr } from '../expr/expr.ts';
import type { Activity, ActivityOptions } from '../types.ts';
import { activity } from './activity.ts';

export type Branches = { then?: Activity[]; else?: Activity[] };

/** Run one of two activity lists depending on a boolean expression. */
export const ifCondition = (name: string, condition: string, { then = [], else: otherwise = [] }: Branches, opts?: ActivityOptions): Activity =>
    activity('IfCondition', name, { expression: expr(condition), ifTrueActivities: then, ifFalseActivities: otherwise }, opts);
