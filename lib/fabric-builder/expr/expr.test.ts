import { expect, it } from 'vitest';
import { expr } from './expr.ts';

it('wraps source as an evaluated expression slot', () =>
    expect(expr('utcNow()')).toEqual({ value: '@utcNow()', type: 'Expression' }));
