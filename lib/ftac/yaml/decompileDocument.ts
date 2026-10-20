import type { Pipeline } from '../types.ts';
import { decompileStep } from './decompileStep.ts';
import type { Context, YamlDocument, YamlInput, YamlVar } from './types.ts';

const KNOWN = new Set(['activities', 'parameters', 'variables']);

export type DecompiledDocument = { doc: YamlDocument; warnings: string[] };

/**
 * A pipeline definition as a YAML document: the inverse of compileDocument.
 * Datasets the steps use are collected under datasets:.
 * Properties YAML can't express are dropped with a warning, and every
 * activity kept as fabric/raw is listed in one.
 */
export function decompileDocument(definition: unknown, { name, output }: { name: string; output: string }): DecompiledDocument {
    const props = (definition as Pipeline | undefined)?.properties;
    if (!props || typeof props !== 'object' || !Array.isArray(props.activities)) throw new Error('not a pipeline definition: expected properties.activities to be a list');
    const warnings = Object.keys(props)
        .filter((k) => !KNOWN.has(k))
        .map((k) => `properties.${k} has no YAML equivalent and was dropped`);
    const ctx: Context = { env: {}, datasets: {} };

    // Keys in the order a hand-written document has them; steps is set last.
    const doc = { name, output } as YamlDocument;
    if (props.parameters)
        doc.inputs = Object.fromEntries(
            Object.entries(props.parameters).map(([k, { type, defaultValue }]): [string, YamlInput] => [
                k,
                { type: type as YamlInput['type'], ...(defaultValue !== undefined && { default: defaultValue }) },
            ])
        );
    if (props.variables)
        doc.vars = Object.fromEntries(Object.entries(props.variables).map(([k, v]): [string, YamlVar] => [k, Object.keys(v).length === 1 ? v.type : v]));

    // Steps name the datasets they use, so datasets: is known only once they are read; it still goes before steps.
    const steps = props.activities.map((a) => decompileStep(a, ctx));
    if (Object.keys(ctx.datasets).length) doc.datasets = ctx.datasets;
    doc.steps = steps.map((s) => s.step);
    const raw = steps.flatMap((s) => s.raw);
    const total = steps.reduce((n, s) => n + s.total, 0);
    if (raw.length) warnings.push(`${raw.length} of ${total} activities kept as fabric/raw: ${raw.join(', ')}`);
    warnings.push(...steps.flatMap((s) => s.notes));
    return { doc, warnings };
}
