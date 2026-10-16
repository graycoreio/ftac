import { expect, it } from 'vitest';
import { fn } from './fn.ts';
import { str } from './str.ts';

it('renders any function by name', () => expect(fn.utcNow()).toBe('utcNow()'));
it('splices arguments verbatim, comma separated', () =>
    expect(fn.addToTime('x', -1, str('Month'))).toBe("addToTime(x, -1, 'Month')"));
it('nests', () => expect(fn.not(fn.empty('a'))).toBe('not(empty(a))'));
