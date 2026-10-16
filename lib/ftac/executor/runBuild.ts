import { writeFileSync } from 'node:fs';
import { stale } from '../cli/stale.ts';
import { render } from '../pipeline/render.ts';
import { loadYamlBuild } from '../yaml/loadYamlBuild.ts';

export type BuildResult = { file: string; ok: boolean; message: string };

/**
 * Load one *-pipeline.yaml and either write its output or report whether
 * the checked-in output is current.
 */
export async function runBuild(file: string, check: boolean): Promise<BuildResult> {
    try {
        const spec = loadYamlBuild(file);
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
