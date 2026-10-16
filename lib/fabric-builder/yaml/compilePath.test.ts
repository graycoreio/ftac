import { expect, it } from 'vitest';
import { compilePath } from './compilePath.ts';

const ctx = { env: {}, datasets: {} };

it('keeps a plain name as a string', () => expect(compilePath('account', ctx)).toBe('account'));
it('compiles an expression into a slot', () => expect(compilePath('${{ item.table_name }}', ctx)).toEqual({ value: '@item().table_name', type: 'Expression' }));
