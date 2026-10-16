import { expect, it } from 'vitest';
import { compileText } from './compileText.ts';

const ctx = { env: { C: 'conn-id', E: '${{ utcNow() }}' }, datasets: {} };

it('passes plain text through', () => expect(compileText('brz_lakehouse', ctx, 'x')).toBe('brz_lakehouse'));
it('expands an env text macro', () => expect(compileText('${{ env.C }}', ctx, 'x')).toBe('conn-id'));
it('rejects an expression', () => expect(() => compileText('${{ env.E }}', ctx, 'connection')).toThrow(/connection must be plain text/));
