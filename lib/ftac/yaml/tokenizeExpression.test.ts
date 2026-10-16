import { expect, it } from 'vitest';
import { tokenizeExpression } from './tokenizeExpression.ts';

it('separates code from string literals', () =>
    expect(tokenizeExpression("concat('a', vars.x)")).toEqual([
        { kind: 'code', text: 'concat(' },
        { kind: 'literal', text: "'a'" },
        { kind: 'code', text: ', vars.x)' },
    ]));
it('keeps doubled quotes inside a literal', () =>
    expect(tokenizeExpression("replace(x, '''', '''''')")).toEqual([
        { kind: 'code', text: 'replace(x, ' },
        { kind: 'literal', text: "''''" },
        { kind: 'code', text: ', ' },
        { kind: 'literal', text: "''''''" },
        { kind: 'code', text: ')' },
    ]));
it('rejects an unterminated literal', () => expect(() => tokenizeExpression("concat('a")).toThrow(/unterminated/));
