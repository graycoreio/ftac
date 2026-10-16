import { parse } from 'yaml';
import type { Activity } from '../../types.ts';
import { compileStep } from '../compileStep.ts';
import type { Context, YamlStep } from '../types.ts';
import type { Action } from './types.ts';

/** Parse an action's example (one YAML step) and compile it with its example context. */
export function compileExample(action: Action): Activity {
    const steps = parse(action.example) as unknown;
    if (!Array.isArray(steps) || steps.length !== 1) throw new Error(`${action.name}: example must be a YAML list with exactly one step`);
    const ctx: Context = { env: action.exampleContext?.env ?? {}, datasets: action.exampleContext?.datasets ?? {} };
    return compileStep(steps[0] as YamlStep, ctx);
}
