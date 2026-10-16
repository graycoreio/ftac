import { expr } from '../expr/expr.ts';
import type { Activity, ActivityOptions } from '../types.ts';
import { activity } from './activity.ts';

const LIGHT_POLICY = { secureInput: false, secureOutput: false };

/** Set a pipeline variable to an expression. */
export const setVariable = (name: string, variable: string, source: string, opts: ActivityOptions = {}): Activity =>
    activity('SetVariable', name, { variableName: variable, value: expr(source) }, { policy: LIGHT_POLICY, ...opts });
