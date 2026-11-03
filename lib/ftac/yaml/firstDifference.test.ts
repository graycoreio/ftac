import { expect, it } from 'vitest';
import { firstDifference } from './firstDifference.ts';

it('is undefined for equal values, whatever the key order', () => expect(firstDifference({ a: 1, b: [1, { c: 2 }] }, { b: [1, { c: 2 }], a: 1 })).toBeUndefined());
it('treats an undefined key as missing', () => expect(firstDifference({ a: 1, b: undefined }, { a: 1 })).toBeUndefined());
it('names the path of the first difference', () => expect(firstDifference({ a: [{ b: 1 }] }, { a: [{ b: 2 }] })).toBe('a.0.b'));
it('finds a missing array element', () => expect(firstDifference({ a: [1, 2] }, { a: [1] })).toBe('a.1'));
it('tells an array from an object', () => expect(firstDifference({ a: [] }, { a: {} })).toBe('a'));
it('is the empty path when the roots differ', () => expect(firstDifference(1, 2)).toBe(''));
