import { expect, it } from 'vitest';
import { dependsOn } from './dependsOn.ts';

it('is empty when nothing is needed', () => expect(dependsOn()).toEqual([]));
it('expands a name to Succeeded', () => expect(dependsOn('a')).toEqual([{ activity: 'a', dependencyConditions: ['Succeeded'] }]));
it('expands a list', () => expect(dependsOn(['a', 'b']).map((d) => d.activity)).toEqual(['a', 'b']));
it('accepts explicit conditions', () =>
    expect(dependsOn({ activity: 'a', on: ['Succeeded', 'Skipped'] })).toEqual([
        { activity: 'a', dependencyConditions: ['Succeeded', 'Skipped'] },
    ]));
