import { expect, it } from 'vitest';
import { filter } from './filter.ts';

it('wraps items and condition as expressions', () =>
    expect(filter('f', { items: 'a', condition: 'b' }).typeProperties).toEqual({
        items: { value: '@a', type: 'Expression' },
        condition: { value: '@b', type: 'Expression' },
    }));
