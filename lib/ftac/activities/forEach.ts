import { expr } from '../expr/expr.ts';
import type { Activity, ActivityOptions } from '../types.ts';
import { activity } from './activity.ts';

export type ForEachSpec = { items: string; activities: Activity[]; batchCount?: number; sequential?: boolean };

/** Run the inner activities once per item, batchCount at a time. */
export const forEach = (name: string, { items, activities, batchCount, sequential = false }: ForEachSpec, opts?: ActivityOptions): Activity =>
    activity(
        'ForEach',
        name,
        { ...(batchCount && { batchCount }), ...(sequential && { isSequential: true }), items: expr(items), activities },
        opts
    );
