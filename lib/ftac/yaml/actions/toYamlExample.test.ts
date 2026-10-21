import { expect, it } from 'vitest';
import { stepToYaml } from '../stepToYaml.ts';
import { compileExample } from './compileExample.ts';
import { rawAction } from './raw.ts';
import { registry } from './registry.ts';

// Each action that reads its JSON back must read its own docs example back, not leave it raw.
// Steps nested in the example may still be raw when their action can't read them back yet.
const readers = [...registry.values()].filter((a) => a.toYaml && a !== rawAction);

it.each(readers.map((a) => [a.name, a] as const))('%s reads its example back', (name, action) => {
    const ctx = { env: action.exampleContext?.env ?? {}, datasets: action.exampleContext?.datasets ?? {} };
    const d = stepToYaml(compileExample(action), ctx);
    expect(d.step.uses).toBe(name);
    expect(d.raw).not.toContain(d.step.id);
});
