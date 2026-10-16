import { expect, it } from 'vitest';
import { compileCondition } from './compileCondition.ts';

const ctx = { env: {}, datasets: {} };

it('compiles a lone expression', () => expect(compileCondition('${{ not(steps.c.outputs.exists) }}', ctx)).toBe("not(activity('c').output.exists)"));
it('rejects plain text', () => expect(() => compileCondition('true', ctx)).toThrow(/single/));
it('rejects a mix', () => expect(() => compileCondition('x ${{ y }}', ctx)).toThrow(/single/));
