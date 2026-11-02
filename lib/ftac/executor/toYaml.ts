// nx executor: write a *-pipeline.yaml next to each pipeline JSON.
//   nx run examples:to-yaml --pattern 'legacy/*.json'
//   nx run examples:to-yaml --pattern 'legacy/*.json' --force
//   nx run examples:to-yaml --pattern 'legacy/*.json' --tokens tokens.yaml
import { existsSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileToYaml } from '../yaml/fileToYaml.ts';
import { loadTokens } from '../yaml/loadTokens.ts';
import type { Tokens } from '../yaml/tokenizeIds.ts';
import { findBuilds } from './findBuilds.ts';
import { type ExecutorContext, projectRoot } from './projectRoot.ts';

export type ToYamlOptions = { pattern: string; force?: boolean; tokens?: string };

export default async function toYaml(options: ToYamlOptions, context: ExecutorContext): Promise<{ success: boolean }> {
    const root = projectRoot(context);
    const rel = (p: string) => relative(context.root, p);

    let tokens: Tokens = {};
    if (options.tokens !== undefined) {
        const path = resolve(root, options.tokens);
        try {
            tokens = loadTokens(path);
        } catch (e) {
            console.log(`FAIL ${rel(path)}: ${e instanceof Error ? e.message : String(e)}`);
            return { success: false };
        }
    }

    const files = findBuilds(root, options.pattern);

    let failed = 0;
    for (const file of files) {
        try {
            const { yaml, out, warnings } = fileToYaml(file, undefined, tokens);
            if (existsSync(out) && !options.force) throw new Error(`${rel(out)} exists; pass --force to overwrite it`);
            writeFileSync(out, yaml);
            console.log(`ok   ${rel(file)}: wrote ${rel(out)}`);
            for (const w of warnings) console.log(`     ${w}`);
        } catch (e) {
            failed++;
            console.log(`FAIL ${rel(file)}: ${e instanceof Error ? e.message : String(e)}`);
        }
    }
    console.log(`${files.length - failed}/${files.length} pipelines converted to YAML`);
    return { success: failed === 0 };
}
