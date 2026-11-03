import type { Slot } from '../types.ts';
import { compileSlot } from './compileSlot.ts';
import { expressionToYaml } from './expressionToYaml.ts';
import { templateToYaml } from './templateToYaml.ts';
import { firstDifference } from './firstDifference.ts';

/** Whether a value is exactly a definition slot, { value, type: 'Expression' }. */
export const isSlot = (v: unknown): v is Slot =>
    !!v && typeof v === 'object' && Object.keys(v).length === 2 && typeof (v as Slot).value === 'string' && (v as Slot).type === 'Expression';

/**
 * A definition slot as a YAML value: the inverse of compileSlot. `@expr` is
 * a lone `${{ }}`, and text keeps its `@{ }` interpolations as `${{ }}`.
 * Undefined when no YAML value compiles to exactly this slot.
 */
export function slotToYaml(slot: unknown): string | undefined {
    if (!isSlot(slot)) return undefined;
    const v = slot.value;
    // An @@ escape or a value that is all interpolation is text the compiler never writes; `${{ @x }}` would compile to it but misread it.
    if (v.startsWith('@@') || v.startsWith('@{')) return undefined;
    const inner = v.startsWith('@') ? expressionToYaml(v.slice(1)) : undefined;
    const yaml = !v.startsWith('@') ? templateToYaml(v) : inner === undefined ? undefined : `\${{ ${inner} }}`;
    if (yaml === undefined) return undefined;
    try {
        return firstDifference(compileSlot(yaml, { env: {}, datasets: {} }), slot) === undefined ? yaml : undefined;
    } catch {
        return undefined;
    }
}
