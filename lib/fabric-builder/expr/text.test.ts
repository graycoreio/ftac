import { expect, it } from 'vitest';
import { text } from './text.ts';

it('wraps plain text', () => expect(text('Sales/Orders')).toEqual({ value: 'Sales/Orders', type: 'Expression' }));
it('allows interpolation', () => expect(text("a @{variables('x')} b").value).toContain('@{'));
it('rejects text that would be evaluated whole', () => expect(() => text('@utcNow()')).toThrow(/evaluated/));
