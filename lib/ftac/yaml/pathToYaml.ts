import { slotToYaml } from './slotToYaml.ts';

/**
 * A name or path as a YAML value: the inverse of compilePath. A plain string
 * stays plain; a slot must need a `${{ }}`, since text without one compiles
 * to a plain string. Undefined when neither holds.
 */
export function pathToYaml(value: unknown): string | undefined {
    if (typeof value === 'string') return value.includes('${{') ? undefined : value;
    const yaml = slotToYaml(value);
    return yaml?.includes('${{') ? yaml : undefined;
}
