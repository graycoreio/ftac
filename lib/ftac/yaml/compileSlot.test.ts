import { expect, it } from 'vitest';
import { compileSlot } from './compileSlot.ts';

const ctx = { env: { F: 'Sales/Orders' }, datasets: {} };

it('evaluates a lone expression', () => expect(compileSlot('${{ int(vars.n) }}', ctx)).toEqual({ value: "@int(variables('n'))", type: 'Expression' }));
it('keeps plain text as text', () => expect(compileSlot('Sales/Orders', ctx)).toEqual({ value: 'Sales/Orders', type: 'Expression' }));
it('treats a lone env text macro as text', () => expect(compileSlot('${{ env.F }}', ctx)).toEqual({ value: 'Sales/Orders', type: 'Expression' }));
it('interpolates a mix', () => expect(compileSlot('a/${{ vars.p }}/b', ctx).value).toBe("a/@{variables('p')}/b"));
it('splices sql() without extra braces', () => expect(compileSlot('WHERE d <= ${{ sql(vars.d) }}::date', ctx).value).toBe("WHERE d <= '@{replace(variables('d'), '''', '''''')}'::date"));
it('rejects sql() as a whole value', () => expect(() => compileSlot('${{ sql(vars.d) }}', ctx)).toThrow(/only valid inside text/));
