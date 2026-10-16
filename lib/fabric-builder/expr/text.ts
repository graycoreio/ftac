import type { Slot } from '../types.ts';

/**
 * Plain text in an Expression slot, with `@{...}` interpolations allowed.
 * Text starting with '@' would be evaluated whole, which is never what a
 * SQL query or a file path means.
 */
export function text(value: string): Slot {
    if (value.startsWith('@')) throw new Error(`text(): value would be evaluated as an expression: ${value.slice(0, 60)}`);
    return { value, type: 'Expression' };
}
