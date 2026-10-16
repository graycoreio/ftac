import type { Condition, Need } from '../types.ts';
import type { YamlNeed } from './types.ts';

const cap = (c: string): Condition => (c[0].toUpperCase() + c.slice(1)) as Condition;

/** `needs:` as the library's Needs: names, or { step, on } for other conditions. */
export function compileNeeds(needs?: YamlNeed | YamlNeed[]): Need[] {
    if (needs === undefined) return [];
    return [needs].flat().map((n) => (typeof n === 'string' ? n : { activity: n.step, on: [n.on].flat().map(cap) }));
}
