import { expect, it } from 'vitest';
import { setVariable } from '../activities/setVariable.ts';
import { wait } from '../activities/wait.ts';
import { pipeline } from './pipeline.ts';

it('expands variable shorthand and orders properties', () =>
    expect(pipeline({ activities: [setVariable('s', 'x', "'1'")], parameters: { p: { type: 'string', defaultValue: '' } }, variables: { x: 'String' } })).toEqual({
        properties: {
            activities: [expect.objectContaining({ name: 's' })],
            parameters: { p: { type: 'string', defaultValue: '' } },
            variables: { x: { type: 'String' } },
        },
    }));

it('omits parameters and variables when absent', () =>
    expect(Object.keys(pipeline({ activities: [wait('w', 1)] }).properties)).toEqual(['activities']));

it('throws with every lint problem', () =>
    expect(() => pipeline({ activities: [wait('w', 1, { needs: 'nope' })], variables: { x: 'String' } })).toThrow(
        /depends on 'nope'[\s\S]*never set/
    ));
