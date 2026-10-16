import type { Slot } from '../types.ts';
import { compileSlot } from './compileSlot.ts';
import type { Context } from './types.ts';

/** A name or path that Fabric takes as a plain string or an expression slot: plain stays plain. */
export const compilePath = (value: string, ctx: Context): string | Slot => (value.includes('${{') ? compileSlot(value, ctx) : value);
