import type { Pipeline, PipelineSpec, Variable } from '../types.ts';
import { lint } from './lint.ts';

/** Assemble a definition; throws with every lint problem when the graph isn't sound. */
export function pipeline({ activities, parameters, variables }: PipelineSpec): Pipeline {
    const vars =
        variables &&
        Object.fromEntries(Object.entries(variables).map(([k, v]): [string, Variable] => [k, typeof v === 'string' ? { type: v } : v]));
    const problems = lint({ activities, parameters, variables: vars });
    if (problems.length) throw new Error(`pipeline is not sound:\n  ${problems.join('\n  ')}`);
    const properties: Pipeline['properties'] = { activities };
    if (parameters) properties.parameters = parameters;
    if (vars) properties.variables = vars;
    return { properties };
}
