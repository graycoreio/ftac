import { expect, it } from 'vitest';
import { stepToYaml } from '../stepToYaml.ts';
import { compileExample } from './compileExample.ts';
import { registry } from './registry.ts';

// Each action that reads its JSON back must read its own docs example back.
const readers = [...registry.values()].filter((a) => a.toYaml);

it.each(readers.map((a) => [a.name, a] as const))('%s reads its example back', (name, action) => {
    const ctx = { env: action.exampleContext?.env ?? {}, datasets: action.exampleContext?.datasets ?? {} };
    expect(stepToYaml(compileExample(action), ctx).uses).toBe(name);
});
