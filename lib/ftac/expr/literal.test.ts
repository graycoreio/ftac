import { expect, it } from 'vitest';
import { literal } from './literal.ts';

it('wraps plain text', () => expect(literal('SELECT 1')).toEqual({ value: 'SELECT 1', type: 'Expression' }));
it('rejects interpolation', () => expect(() => literal("a @{variables('x')}")).toThrow(/interpolation/));
it('rejects a leading @', () => expect(() => literal('@x')).toThrow());
