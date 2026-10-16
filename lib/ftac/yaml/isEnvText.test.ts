import { expect, it } from 'vitest';
import { isEnvText } from './isEnvText.ts';

const ctx = { env: { A: 'plain', B: '${{ utcNow() }}' }, datasets: {} };

it('returns the text of a plain env value', () => expect(isEnvText('env.A', ctx)).toBe('plain'));
it('is undefined for an expression env value', () => expect(isEnvText('env.B', ctx)).toBeUndefined());
it('is undefined for anything else', () => expect(isEnvText("concat(env.A, 'x')", ctx)).toBeUndefined());
it('throws for an unknown env', () => expect(() => isEnvText('env.NOPE', ctx)).toThrow(/not defined/));
