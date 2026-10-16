import { expr } from '../expr/expr.ts';
import type { Activity, ActivityOptions } from '../types.ts';
import { activity } from './activity.ts';

export type FailSpec = { message: string; errorCode: string };

/** Fail the run with a message expression and an error code. */
export const fail = (name: string, { message, errorCode }: FailSpec, opts?: ActivityOptions): Activity =>
    activity('Fail', name, { message: expr(message), errorCode }, opts);
