import { expect, it } from 'vitest';
import { output } from './output.ts';

it('references an activity output', () => expect(output('check')).toBe("activity('check').output"));
it('appends a path', () => expect(output('copy', 'rowsCopied')).toBe("activity('copy').output.rowsCopied"));
