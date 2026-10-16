import { expect, it } from 'vitest';
import { forEach } from './forEach.ts';
import { wait } from './wait.ts';

it('orders batchCount before items, as the portal does', () =>
    expect(Object.keys(forEach('each', { items: 'x', activities: [wait('w', 1)], batchCount: 4 }).typeProperties)).toEqual([
        'batchCount', 'items', 'activities',
    ]));
it('omits batchCount and isSequential unless set', () =>
    expect(Object.keys(forEach('each', { items: 'x', activities: [] }).typeProperties)).toEqual(['items', 'activities']));
it('marks sequential loops', () =>
    expect(forEach('each', { items: 'x', activities: [], sequential: true }).typeProperties.isSequential).toBe(true));
