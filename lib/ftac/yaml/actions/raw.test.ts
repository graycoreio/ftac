import { expect, it } from 'vitest';
import { compileExample } from './compileExample.ts';
import { rawAction as a } from './raw.ts';

it('example passes the activity through with the id and needs applied', () =>
    expect(compileExample(a)).toMatchObject({
        type: 'WebActivity',
        name: 'get_token',
        typeProperties: { method: 'POST' },
        externalReferences: { connection: '00000000-0000-0000-0000-000000000000' },
        dependsOn: [],
    }));
it('applies needs over the raw activity', () =>
    expect(a.compile({ step: { id: 'r' }, ctx: { env: {}, datasets: {} }, needs: ['a'], policy: {} as never, with: { type: 'X', typeProperties: {} } }).dependsOn).toEqual([
        { activity: 'a', dependencyConditions: ['Succeeded'] },
    ]));
