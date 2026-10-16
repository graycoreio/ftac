import { expect, it } from 'vitest';
import { compileSteps } from './compileSteps.ts';

const ctx = { env: {}, datasets: {} };

it('compiles in order', () =>
    expect(compileSteps([{ id: 'a', uses: 'fabric/wait', with: { seconds: 1 } }, { id: 'b', uses: 'fabric/wait', with: { seconds: 2 } }], ctx).map((a) => a.name)).toEqual(['a', 'b']));
it('rejects a non-list', () => expect(() => compileSteps({} as any, ctx)).toThrow(/must be a list/));
