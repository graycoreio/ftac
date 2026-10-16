import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { render } from '../pipeline/render.ts';
import type { Pipeline } from '../types.ts';
import { stale } from './stale.ts';

const def: Pipeline = { properties: { activities: [] } };
const build = () => def;
const out = () => join(mkdtempSync(join(tmpdir(), 'builder-')), 'p.json');

it('reports a missing file', () => expect(stale({ build, out: out() })).toEqual([expect.stringMatching(/does not exist/)]));
it('reports a stale file', () => {
    const o = out();
    writeFileSync(o, '{}');
    expect(stale({ build, out: o })).toEqual([expect.stringMatching(/is stale/)]);
});
it('is empty when in sync', () => {
    const o = out();
    writeFileSync(o, render(def));
    expect(stale({ build, out: o })).toEqual([]);
});
