import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it, vi } from 'vitest';
import { render } from '../pipeline/render.ts';
import type { Pipeline } from '../types.ts';
import { run } from './run.ts';

const def: Pipeline = { properties: { activities: [] } };
const spec = () => ({ build: () => def, out: join(mkdtempSync(join(tmpdir(), 'builder-')), 'p.json') });

it('writes the file and returns 0', () => {
    const s = spec();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(run(s, [])).toBe(0);
    expect(readFileSync(s.out, 'utf8')).toBe(render(def));
});
it('--check returns 1 when stale and 0 once written', () => {
    const s = spec();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(run(s, ['--check'])).toBe(1);
    run(s, []);
    expect(run(s, ['--check'])).toBe(0);
});
