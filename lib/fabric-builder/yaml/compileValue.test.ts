import { expect, it } from 'vitest';
import { compileValue } from './compileValue.ts';

const ctx = { env: { F: 'Sales/Orders' }, datasets: {} };

it('returns a lone expression as source', () => expect(compileValue('${{ string(vars.n) }}', ctx)).toBe("string(variables('n'))"));
it('quotes plain text', () => expect(compileValue('-1', ctx)).toBe("'-1'"));
it('quotes an env text macro', () => expect(compileValue('${{ env.F }}', ctx)).toBe("'Sales/Orders'"));
it('concats a mix', () => expect(compileValue('a-${{ vars.x }}', ctx)).toBe("concat('a-', variables('x'))"));
