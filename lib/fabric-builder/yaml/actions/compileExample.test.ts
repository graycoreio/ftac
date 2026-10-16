import { expect, it } from 'vitest';
import { compileExample } from './compileExample.ts';
import { registry } from './registry.ts';
import { waitAction } from './wait.ts';

it('compiles every registered example to an activity named by its step id', () => {
    for (const a of registry.values()) {
        const act = compileExample(a);
        expect(act.name).toMatch(/^\w+$/);
        expect(act.type).toMatch(/^\w+$/);
    }
});
it('rejects an example that is not exactly one step', () =>
    expect(() => compileExample({ ...waitAction, example: '- id: a\n  uses: fabric/wait\n  with: { seconds: 1 }\n- id: b\n  uses: fabric/wait\n  with: { seconds: 1 }' })).toThrow(
        /exactly one step/
    ));
