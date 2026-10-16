import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it, vi } from 'vitest';
import build from './build.ts';

// Run against the examples project.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const context = { root: ROOT, projectName: 'examples', projectsConfigurations: { projects: { examples: { root: 'examples' } } } };

it('succeeds when every build is in sync', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await build({ check: true, pattern: '**/hello/*-pipeline.yaml' }, context)).toEqual({ success: true });
    expect(log).toHaveBeenLastCalledWith('1/1 builds in sync');
});

it('succeeds with nothing to do when no builds match', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(await build({ check: true, pattern: 'nowhere/*.ts' }, context)).toEqual({ success: true });
});
