import type { UserProperty } from '../types.ts';
import { slotToYaml } from './slotToYaml.ts';

/**
 * userProperties as `labels:`: the inverse of compileStep's labels. {} when
 * there are none. Undefined when YAML can't say them: an empty list (the
 * compiler leaves the key out), a repeated name, or a value that is not a slot.
 */
export function labelsToYaml(props: UserProperty[] | undefined): Record<string, string> | undefined {
    if (props === undefined) return {};
    if (!props.length) return undefined;
    const labels: Record<string, string> = {};
    for (const { name, value } of props) {
        const yaml = slotToYaml(value);
        if (yaml === undefined || name in labels) return undefined;
        labels[name] = yaml;
    }
    return labels;
}
