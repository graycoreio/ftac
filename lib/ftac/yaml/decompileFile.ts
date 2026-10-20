import { readFileSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { parse } from 'yaml';
import type { Pipeline } from '../types.ts';
import { compileDocument } from './compileDocument.ts';
import { decompileDocument } from './decompileDocument.ts';
import { firstDifference } from './firstDifference.ts';
import { renderYaml } from './renderYaml.ts';
import type { YamlDocument } from './types.ts';

export type Decompiled = { yaml: string; out: string; warnings: string[] };

/** The part of a definition YAML can express: what the YAML must compile back to. */
const expressible = ({ properties: { activities, parameters, variables } }: Pipeline): Pipeline => ({
    properties: { activities, ...(parameters && { parameters }), ...(variables && { variables }) },
});

/**
 * A pipeline JSON as *-pipeline.yaml text, by default next to it as
 * <name>-pipeline.yaml. The text is parsed and compiled again, and must
 * give the same definition, key order aside. Nothing is written.
 */
export function decompileFile(path: string, out = join(dirname(path), `${basename(path, '.json')}-pipeline.yaml`)): Decompiled {
    const definition = JSON.parse(readFileSync(path, 'utf8'));
    const name = typeof definition?.name === 'string' ? definition.name : basename(path, '.json');
    const output = relative(dirname(out), path).replaceAll('\\', '/');
    const { doc, warnings } = decompileDocument(definition, { name, output });
    const yaml = renderYaml(doc);

    let compiled: Pipeline;
    try {
        compiled = compileDocument(parse(yaml) as YamlDocument);
    } catch (e) {
        throw new Error(`${path}: the YAML does not compile: ${e instanceof Error ? e.message : String(e)}`);
    }
    const diff = firstDifference(compiled, expressible(definition));
    if (diff !== undefined) throw new Error(`${path}: the YAML compiles to a different pipeline, first at ${diff || 'the root'}`);
    return { yaml, out, warnings };
}
