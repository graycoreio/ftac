import { expect, it } from 'vitest';
import { ifCondition } from '../activities/ifCondition.ts';
import { setVariable } from '../activities/setVariable.ts';
import { wait } from '../activities/wait.ts';
import { compileDocument } from './compileDocument.ts';
import { decompileDocument } from './decompileDocument.ts';

const opts = { name: 'P', output: 'p.json' };
const definition = {
    properties: {
        activities: [setVariable('set', 'v', "'x'"), setVariable('set_d', 'd', 'createArray()'), wait('w', 1, { needs: 'set' })],
        parameters: { date: { type: 'string', defaultValue: '' }, n: { type: 'int' } },
        variables: { v: { type: 'String' }, d: { type: 'Array', defaultValue: [] } },
        description: 'dropped',
    },
};

it('turns parameters into inputs and variables into vars', () =>
    expect(decompileDocument(definition, opts).doc).toMatchObject({
        name: 'P',
        output: 'p.json',
        inputs: { date: { type: 'string', default: '' }, n: { type: 'int' } },
        vars: { v: 'String', d: { type: 'Array', defaultValue: [] } },
    }));
it('makes one step per activity, in order', () => expect(decompileDocument(definition, opts).doc.steps.map((s) => s.id)).toEqual(['set', 'set_d', 'w']));
it('warns about dropped properties', () =>
    expect(decompileDocument(definition, opts).warnings).toEqual(['properties.description has no YAML equivalent and was dropped']));
it('reads the activities back as actions', () =>
    expect(decompileDocument(definition, opts).doc.steps.map((s) => s.uses)).toEqual(['fabric/set-variable', 'fabric/set-variable', 'fabric/wait']));
it('counts raw steps nested anywhere', () =>
    expect(decompileDocument({ properties: { activities: [ifCondition('g', 'true', { then: [{ type: 'Web', typeProperties: {}, name: 'call', dependsOn: [] }] })] } }, opts).warnings).toEqual([
        '1 of 2 activities kept as fabric/raw: call',
        'call: no built-in action reads a Web activity',
    ]));
it('omits inputs and vars the definition does not have', () => {
    const { doc } = decompileDocument({ properties: { activities: [wait('w', 1)] } }, opts);
    expect(doc).not.toHaveProperty('inputs');
    expect(doc).not.toHaveProperty('vars');
});
it('compiles back to the expressible part of the definition', () => {
    const { description, ...properties } = definition.properties;
    expect(compileDocument(decompileDocument(definition, opts).doc)).toEqual({ properties });
});
it('rejects JSON that is not a pipeline definition', () => {
    expect(() => decompileDocument([], opts)).toThrow(/not a pipeline definition/);
    expect(() => decompileDocument({ properties: {} }, opts)).toThrow(/not a pipeline definition/);
});
