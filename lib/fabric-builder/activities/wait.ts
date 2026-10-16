import type { Activity, ActivityOptions } from '../types.ts';
import { activity } from './activity.ts';

/** Pause for a number of seconds. */
export const wait = (name: string, seconds: number, opts?: ActivityOptions): Activity =>
    activity('Wait', name, { waitTimeInSeconds: seconds }, opts);
