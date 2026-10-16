import { expect, it } from 'vitest';
import { ifCondition } from './ifCondition.ts';
import { wait } from './wait.ts';

it('builds both branches and carries no policy', () => {
    const a = ifCondition('branch', 'equals(1, 1)', { then: [wait('w', 1)] });
    expect(a.policy).toBeUndefined();
    expect(a.typeProperties.expression).toEqual({ value: '@equals(1, 1)', type: 'Expression' });
    expect(a.typeProperties.ifTrueActivities).toHaveLength(1);
    expect(a.typeProperties.ifFalseActivities).toEqual([]);
});
