import { expect, it } from 'vitest';
import { assertNoExpression } from './assertNoExpression.ts';

it('passes clean SQL', () => expect(() => assertNoExpression('SELECT 1')).not.toThrow());
it('ignores allowed fragments', () => expect(() => assertNoExpression("x = '@{v}'", ["'@{v}'"])).not.toThrow());
it('fails on a stray @', () => expect(() => assertNoExpression('SELECT @@version')).toThrow(/stray '@'/));
