import { str } from './str.ts';

/** An activity's output: activity('name').output[.path]. */
export const output = (activity: string, path = ''): string =>
    `activity(${str(activity)}).output${path ? `.${path}` : ''}`;
