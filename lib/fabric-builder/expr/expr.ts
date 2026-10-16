import type { Slot } from '../types.ts';

/** An evaluated expression in a definition slot. */
export const expr = (source: string): Slot => ({ value: `@${source}`, type: 'Expression' });
