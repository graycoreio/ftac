import { expect, it } from 'vitest';
import { decompileExpression } from './decompileExpression.ts';

it('gives the inside of a ${{ }}', () => expect(decompileExpression("int(variables('n'))")).toBe('int(vars.n)'));
it('passes native ADF through', () => expect(decompileExpression('pipeline().RunId')).toBe('pipeline().RunId'));
it('rejects a }} that would end the template', () => expect(decompileExpression(`json('{"a":{"b":1}}')`)).toBeUndefined());
it('rejects padding the template would trim', () => expect(decompileExpression(' utcNow()')).toBeUndefined());
it('rejects an empty expression', () => expect(decompileExpression('')).toBeUndefined());
it('rejects a leading sql( the compiler would take as the special form', () => expect(decompileExpression("sql('x')")).toBeUndefined());
it('rejects an unterminated literal', () => expect(decompileExpression("concat('a")).toBeUndefined());
