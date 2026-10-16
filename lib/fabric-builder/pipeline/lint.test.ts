import { expect, it } from 'vitest';
import { forEach } from '../activities/forEach.ts';
import { setVariable } from '../activities/setVariable.ts';
import { wait } from '../activities/wait.ts';
import { lint } from './lint.ts';

const vars = { x: { type: 'String' as const } };

it('accepts a sound graph', () =>
    expect(lint({ activities: [wait('a', 1), setVariable('b', 'x', "activity('a').output", { needs: 'a' })], variables: vars })).toEqual([]));

it('flags duplicate names, including across scopes', () =>
    expect(lint({ activities: [wait('a', 1), forEach('e', { items: 'x', activities: [wait('a', 1)] })] })).toContainEqual(
        expect.stringMatching(/duplicate activity name 'a'/)
    ));

it('flags a dependency on an activity outside the scope', () =>
    expect(lint({ activities: [wait('a', 1), forEach('e', { items: 'x', activities: [wait('b', 1, { needs: 'a' })] })] })).toContainEqual(
        expect.stringMatching(/\/e\/b: depends on 'a', not in this scope/)
    ));

it('flags undeclared variables, parameters, and activities', () => {
    const problems = lint({
        activities: [setVariable('s', 'y', "concat(variables('v'), pipeline().parameters.p, activity('ghost').output)")],
    });
    expect(problems).toEqual(
        expect.arrayContaining([
            "variables('v') is not declared",
            'pipeline().parameters.p is not declared',
            "activity('ghost') does not exist",
        ])
    );
});

it('flags a declared variable that nothing sets', () =>
    expect(lint({ activities: [wait('a', 1)], variables: vars })).toEqual(["variable 'x' is never set"]));
