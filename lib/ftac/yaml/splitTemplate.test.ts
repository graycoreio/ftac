import { expect, it } from 'vitest';
import { splitTemplate } from './splitTemplate.ts';

it('returns plain text as one part', () => expect(splitTemplate('a/b')).toEqual([{ kind: 'text', text: 'a/b' }]));
it('returns a lone expression as one part, trimmed', () => expect(splitTemplate('${{  vars.x }}')).toEqual([{ kind: 'expr', inner: 'vars.x' }]));
it('interleaves text and expressions', () =>
    expect(splitTemplate('a ${{ x }} b ${{ y }}')).toEqual([
        { kind: 'text', text: 'a ' },
        { kind: 'expr', inner: 'x' },
        { kind: 'text', text: ' b ' },
        { kind: 'expr', inner: 'y' },
    ]));
it('rejects an unterminated ${{', () => expect(() => splitTemplate('a ${{ x')).toThrow(/unterminated/));
