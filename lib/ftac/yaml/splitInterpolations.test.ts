import { expect, it } from 'vitest';
import { splitInterpolations } from './splitInterpolations.ts';

it('is one text part without interpolations', () => expect(splitInterpolations('SELECT 1')).toEqual([{ kind: 'text', text: 'SELECT 1' }]));
it('is no parts for empty text', () => expect(splitInterpolations('')).toEqual([]));
it('splits text and interpolations', () =>
    expect(splitInterpolations("a/@{variables('p')}/b@{item()}")).toEqual([
        { kind: 'text', text: 'a/' },
        { kind: 'expr', inner: "variables('p')" },
        { kind: 'text', text: '/b' },
        { kind: 'expr', inner: 'item()' },
    ]));
it('ignores braces inside string literals', () =>
    expect(splitInterpolations("x@{concat('}', '{''')}y")).toEqual([
        { kind: 'text', text: 'x' },
        { kind: 'expr', inner: "concat('}', '{''')" },
        { kind: 'text', text: 'y' },
    ]));
it('counts nested braces', () => expect(splitInterpolations('@{a{b}c}')).toEqual([{ kind: 'expr', inner: 'a{b}c' }]));
it('rejects an unterminated interpolation', () => {
    expect(splitInterpolations('a @{b')).toBeUndefined();
    expect(splitInterpolations("a @{'b}")).toBeUndefined();
});
