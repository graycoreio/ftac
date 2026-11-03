import { expect, it } from 'vitest';
import { expressionToYaml } from './expressionToYaml.ts';

it('gives the inside of a ${{ }}', () => expect(expressionToYaml("int(variables('n'))")).toBe('int(vars.n)'));
it('passes native ADF through', () => expect(expressionToYaml('pipeline().RunId')).toBe('pipeline().RunId'));
it('rejects a }} that would end the template', () => expect(expressionToYaml(`json('{"a":{"b":1}}')`)).toBeUndefined());
it('rejects padding the template would trim', () => expect(expressionToYaml(' utcNow()')).toBeUndefined());
it('rejects an empty expression', () => expect(expressionToYaml('')).toBeUndefined());
it('rejects a leading sql( the compiler would take as the special form', () => expect(expressionToYaml("sql('x')")).toBeUndefined());
it('rejects an unterminated literal', () => expect(expressionToYaml("concat('a")).toBeUndefined());
