import { policy } from '../activities/policy.ts';
import type { Policy } from '../types.ts';
import type { YamlStep } from './types.ts';

/** timeout (HH:MM:SS or D.HH:MM:SS) and retry { count, interval } as an activity policy. */
export function compilePolicy(step: YamlStep): Policy {
    const over: Partial<Policy> = {};
    if (step.timeout !== undefined) {
        if (/^\d+:\d{2}:\d{2}$/.test(step.timeout)) over.timeout = `0.${step.timeout}`;
        else if (/^\d+\.\d{2}:\d{2}:\d{2}$/.test(step.timeout)) over.timeout = step.timeout;
        else throw new Error(`${step.id}: timeout must be HH:MM:SS or D.HH:MM:SS, got ${step.timeout}`);
    }
    if (step.retry) {
        if (step.retry.count !== undefined) over.retry = step.retry.count;
        if (step.retry.interval !== undefined) over.retryIntervalInSeconds = step.retry.interval;
    }
    return policy(over);
}
