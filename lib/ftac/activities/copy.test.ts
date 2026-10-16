import { expect, it } from 'vitest';
import { copy } from './copy.ts';
import { policy } from './policy.ts';

it('defaults to the portal policy and no staging', () => {
    const a = copy('c', { source: { type: 'S' }, sink: { type: 'K' } });
    expect(a.policy).toEqual(policy());
    expect(Object.keys(a.typeProperties)).toEqual(['source', 'sink', 'enableStaging']);
});
it('includes a translator when given', () =>
    expect(Object.keys(copy('c', { source: {}, sink: {}, translator: {} }).typeProperties)).toEqual([
        'source', 'sink', 'translator', 'enableStaging',
    ]));
