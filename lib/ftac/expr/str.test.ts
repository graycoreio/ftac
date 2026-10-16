import { expect, it } from 'vitest';
import { str } from './str.ts';

it('quotes a string literal', () => expect(str('yyyyMM')).toBe("'yyyyMM'"));
it('doubles embedded single quotes', () => expect(str("O'Brien")).toBe("'O''Brien'"));
it('stringifies numbers', () => expect(str(5)).toBe("'5'"));
