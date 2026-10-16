import type { Dependency, Needs } from '../types.ts';

/**
 * Expand the `needs` shorthand into dependsOn entries:
 *   'a'                              -> a Succeeded
 *   ['a', 'b']                       -> both Succeeded
 *   { activity: 'a', on: 'Completed' } -> any condition(s)
 */
export function dependsOn(needs?: Needs): Dependency[] {
    if (!needs) return [];
    return [needs].flat().map((n) =>
        typeof n === 'string'
            ? { activity: n, dependencyConditions: ['Succeeded'] }
            : { activity: n.activity, dependencyConditions: [n.on ?? 'Succeeded'].flat() }
    );
}
