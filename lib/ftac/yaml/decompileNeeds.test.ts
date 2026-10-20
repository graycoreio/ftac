import { expect, it } from 'vitest';
import { dependsOn } from '../activities/dependsOn.ts';
import type { Dependency } from '../types.ts';
import { compileNeeds } from './compileNeeds.ts';
import { decompileNeeds } from './decompileNeeds.ts';

const deps: Dependency[] = [
    { activity: 'a', dependencyConditions: ['Succeeded'] },
    { activity: 'b', dependencyConditions: ['Failed'] },
    { activity: 'c', dependencyConditions: ['Succeeded', 'Skipped'] },
];

it('is undefined with no dependencies', () => expect(decompileNeeds([])).toBeUndefined());
it('is a lone name for one success dependency', () => expect(decompileNeeds([deps[0]])).toBe('a'));
it('spells other conditions as { step, on }', () =>
    expect(decompileNeeds(deps)).toEqual(['a', { step: 'b', on: 'failed' }, { step: 'c', on: ['succeeded', 'skipped'] }]));
it('compiles back to the same dependsOn', () => expect(dependsOn(compileNeeds(decompileNeeds(deps)))).toEqual(deps));
