import { pipeline } from '../pipeline/pipeline.ts';
import type { Parameter, Pipeline, Variable } from '../types.ts';
import { compileSteps } from './compileSteps.ts';
import type { Context, YamlDocument } from './types.ts';

const KNOWN = new Set(['name', 'output', 'inputs', 'vars', 'env', 'datasets', 'steps']);

/** A parsed YAML document as a linted pipeline definition. */
export function compileDocument(doc: YamlDocument): Pipeline {
    for (const k of Object.keys(doc)) if (!KNOWN.has(k)) throw new Error(`unknown top-level key '${k}'`);
    if (!doc.name) throw new Error('name: is required');
    if (!doc.output) throw new Error('output: is required');
    const ctx: Context = { env: doc.env ?? {}, datasets: doc.datasets ?? {} };

    const parameters =
        doc.inputs &&
        Object.fromEntries(
            Object.entries(doc.inputs).map(([k, v]): [string, Parameter] => [k, { type: v.type, ...(v.default !== undefined && { defaultValue: v.default }) }])
        );
    const variables =
        doc.vars && Object.fromEntries(Object.entries(doc.vars).map(([k, v]): [string, Variable] => [k, typeof v === 'string' ? { type: v } : v]));

    return pipeline({ activities: compileSteps(doc.steps, ctx), parameters, variables });
}
