import { expect, it } from 'vitest';
import { text } from './text.ts';

it('wraps plain text', () => expect(text('ESG/Finance')).toEqual({ value: 'ESG/Finance', type: 'Expression' }));
it('allows interpolation', () => expect(text("a @{variables('x')} b").value).toContain('@{'));
it('rejects text that would be evaluated whole', () => expect(() => text('@utcNow()')).toThrow(/evaluated/));
