import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { stale } from '../cli/stale.ts';
import { render } from '../pipeline/render.ts';
import type { Build } from '../types.ts';
import { loadYamlBuild } from '../yaml/loadYamlBuild.ts';

export type BuildResult = { file: string; ok: boolean; message: string };

/**
 * Load one build, a build.ts (its main() is inert when imported) or a
 * *-pipeline.yaml, and either write its output or report whether the
 * checked-in output is current.
 */
export async function runBuild(file: string, check: boolean): Promise<BuildResult> {
    try {
        const spec = file.endsWith('.yaml') || file.endsWith('.yml') ? loadYamlBuild(file) : await importBuild(file);
        if (check) {
            const problems = stale(spec);
            return { file, ok: !problems.length, message: problems[0] ?? 'in sync' };
        }
        writeFileSync(spec.out, render(spec.build()));
        return { file, ok: true, message: `wrote ${spec.out}` };
    } catch (e) {
        return { file, ok: false, message: e instanceof Error ? e.message : String(e) };
    }
}

async function importBuild(file: string): Promise<Build> {
    const mod = (await import(pathToFileURL(file).href)) as Partial<Build & { OUT: string }>;
    if (typeof mod.build !== 'function' || typeof mod.OUT !== 'string') throw new Error('must export build() and OUT');
    return { build: mod.build, out: mod.OUT };
}
