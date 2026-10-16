import type { Activity } from '../types.ts';
import { compileStep } from './compileStep.ts';
import type { Context, YamlStep } from './types.ts';

/** A list of steps, in order. */
export function compileSteps(steps: YamlStep[], ctx: Context): Activity[] {
    if (!Array.isArray(steps)) throw new Error('steps: must be a list');
    return steps.map((s) => compileStep(s, ctx));
}
