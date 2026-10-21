import { resolve } from 'node:path';

/** The part of the nx executor context the executors read. */
export type ExecutorContext = { root: string; projectName?: string; projectsConfigurations?: { projects: Record<string, { root: string }> } };

/** The absolute root of the project the target runs for; the workspace root when it can't be found. */
export const projectRoot = (context: ExecutorContext): string =>
    resolve(context.root, context.projectsConfigurations?.projects[context.projectName ?? '']?.root ?? '.');
