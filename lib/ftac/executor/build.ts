// nx executor: compile every *-pipeline.yaml under the project.
//   nx run examples:build             write each pipeline JSON
//   nx run examples:check             check=true, exit 1 if any is stale
import { relative } from 'node:path';
import { findBuilds } from './findBuilds.ts';
import { type ExecutorContext, projectRoot } from './projectRoot.ts';
import { runBuild } from './runBuild.ts';

export type BuildOptions = { check?: boolean; pattern?: string };

export default async function build(options: BuildOptions, context: ExecutorContext): Promise<{ success: boolean }> {
    const check = options.check ?? false;
    const builds = findBuilds(projectRoot(context), options.pattern ?? '**/*-pipeline.yaml');

    let failed = 0;
    for (const file of builds) {
        const r = await runBuild(file, check);
        if (!r.ok) failed++;
        console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${relative(context.root, file)}: ${r.message}`);
    }
    console.log(`${builds.length - failed}/${builds.length} builds ${check ? 'in sync' : 'written'}`);
    return { success: failed === 0 };
}
