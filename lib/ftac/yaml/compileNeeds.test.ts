import { expect, it } from 'vitest';
import { compileNeeds } from './compileNeeds.ts';

it('is empty when absent', () => expect(compileNeeds()).toEqual([]));
it('passes names through', () => expect(compileNeeds(['a', 'b'])).toEqual(['a', 'b']));
it('maps step/on to activity/on with capitalised conditions', () =>
    expect(compileNeeds({ step: 'a', on: ['completed', 'skipped'] })).toEqual([{ activity: 'a', on: ['Completed', 'Skipped'] }]));
