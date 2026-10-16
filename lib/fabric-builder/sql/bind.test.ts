import { expect, it } from 'vitest';
import { bind } from './bind.ts';

it('binds numbered placeholders', () => expect(bind('WHERE d <= $1::date AND n = $2', { $1: "'x'", $2: '7' })).toBe("WHERE d <= 'x'::date AND n = 7"));
it('does not touch $$ or $10 when only $1 is bound', () => expect(() => bind('$10', { $1: 'a' })).toThrow(/unbound placeholder \$10/));
it('throws on an unbound placeholder', () => expect(() => bind('x = $1', {})).toThrow(/unbound placeholder \$1/));
it('throws on an unused binding', () => expect(() => bind('x = 1', { $1: 'a' })).toThrow(/never used: \$1/));
