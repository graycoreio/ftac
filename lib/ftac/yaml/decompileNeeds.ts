import type { Dependency } from '../types.ts';
import type { YamlNeed } from './types.ts';

type On = Extract<YamlNeed, { on: unknown }>['on'];

/** dependsOn as `needs:`: a name when it waits for success, { step, on } otherwise. The inverse of compileNeeds. */
export function decompileNeeds(deps: Dependency[] = []): YamlNeed | YamlNeed[] | undefined {
    const needs = deps.map((d): YamlNeed => {
        const on = d.dependencyConditions.map((c) => c.toLowerCase()) as Extract<On, unknown[]>;
        if (on.length === 1 && on[0] === 'succeeded') return d.activity;
        return { step: d.activity, on: on.length === 1 ? on[0] : on };
    });
    return needs.length > 1 ? needs : needs[0];
}
