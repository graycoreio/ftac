import { expr } from '../expr/expr.ts';
import type { Activity, ActivityOptions } from '../types.ts';
import { activity } from './activity.ts';

export type FilterSpec = { items: string; condition: string };

/** Keep the items for which the condition holds. */
export const filter = (name: string, { items, condition }: FilterSpec, opts?: ActivityOptions): Activity =>
    activity('Filter', name, { items: expr(items), condition: expr(condition) }, opts);
