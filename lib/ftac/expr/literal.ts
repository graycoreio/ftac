import type { Slot } from '../types.ts';
import { text } from './text.ts';

/** Plain text with no interpolation at all (Script batches, messages). */
export function literal(value: string): Slot {
    const slot = text(value);
    if (value.includes('@{')) throw new Error(`literal(): value contains an @{ } interpolation: ${value.slice(0, 60)}`);
    return slot;
}
